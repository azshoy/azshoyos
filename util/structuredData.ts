import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {asPerson} from "@/components/standalonePages/portfolioPro/personSections";
import {portfolioAPIURL} from "@/components/standalonePages/portfolio/data/dataManager";
import {absoluteUrl, org, services, siteUrl} from "@/util/site";
import {itemPath, RelatedItem, Target} from "@/util/portfolio";


// schema.org JSON-LD. Each page emits one @graph whose nodes point at each
// other by @id: WebSite and Organization are defined once (in full on the home
// pages, as references elsewhere), and every page is a WebPage that is part of
// the WebSite, with a breadcrumb and a main entity.

type Node = {[key: string]: unknown}
type Item = ItemDict[string]

const ids = {
  org: `${siteUrl}/#organization`,
  website: `${siteUrl}/#website`,
  // The home URL is "https://azsh.fi"; its fragments get the slash like #website.
  page: (url: string) => `${url === siteUrl ? `${siteUrl}/` : url}#webpage`,
  breadcrumb: (url: string) => `${url}#breadcrumb`,
  person: (url: string) => `${url}#person`,
  article: (url: string) => `${url}#article`,
}
const ref = (id: string) => ({"@id": id})

export const organizationNode = (): Node => ({
  "@type": "Organization",
  "@id": ids.org,
  name: org.name,
  legalName: org.legalName,
  alternateName: ["azsh", "az.sh Oy"],
  url: siteUrl,
  logo: {"@type": "ImageObject", url: absoluteUrl(org.logo), width: 512, height: 512},
  image: absoluteUrl(org.ogImage),
  description: `${org.summary} ${org.howWeWork}`,
  slogan: org.tagline,
  foundingDate: org.foundingDate,
  identifier: {"@type": "PropertyValue", propertyID: "Y-tunnus (Finnish business ID)", value: org.businessId},
  email: org.email,
  telephone: org.telephone,
  address: {"@type": "PostalAddress", ...org.address},
  location: org.locations.map((name) => ({"@type": "Place", name: `${name}, Finland`})),
  areaServed: [{"@type": "Country", name: "Finland"}, {"@type": "Place", name: "European Union"}],
  sameAs: [org.github],
  knowsAbout: services.map((s) => s.name),
  makesOffer: services.map((s) => ({
    "@type": "Offer",
    itemOffered: {"@type": "Service", name: s.name, description: s.detail, provider: ref(ids.org)},
  })),
})

const websiteNode = (): Node => ({
  "@type": "WebSite",
  "@id": ids.website,
  url: siteUrl,
  name: org.name,
  alternateName: ["azsh", "azsh.fi"],
  description: org.summary,
  inLanguage: "en",
  publisher: ref(ids.org),
})

// Pages other than the two home pages carry a short Organization node so a
// crawler that only reads one page still knows whose page it is.
const orgStub = (): Node => ({"@type": "Organization", "@id": ids.org, name: org.name, legalName: org.legalName, url: siteUrl})

const crumbs = (url: string, trail: {name: string, path: string}[]): Node => ({
  "@type": "BreadcrumbList",
  "@id": ids.breadcrumb(url),
  itemListElement: trail.map((c, i) => ({"@type": "ListItem", position: i + 1, name: c.name, item: absoluteUrl(c.path)})),
})

const page = (type: string, url: string, title: string, description: string | undefined, extra: Node = {}): Node => ({
  "@type": type,
  "@id": ids.page(url),
  url,
  name: title,
  description,
  inLanguage: "en",
  isPartOf: ref(ids.website),
  about: ref(ids.org),
  ...extra,
})

const graph = (...nodes: Node[]) => ({"@context": "https://schema.org", "@graph": nodes})

const portfolioCrumb = {name: "Portfolio", path: "/portfolio"}
const listCrumb = (target: Target) => ({name: target === 'projects' ? "Projects" : "People", path: `/portfolio/${target}`})

// Images from the API are paths; Google wants raster images, so SVGs are skipped.
const rasterImage = (src?: string | null) => {
  if (!src || /\.svg(\?|$)/i.test(src) || /\/null$/.test(src)) return undefined
  return /^https?:\/\//.test(src) ? src : `${portfolioAPIURL}${src}`
}

const allTags = (item: Item) => Object.values(item.tags ?? {}).flat().filter(Boolean)

export const homeGraph = (title: string, description: string, caseStudies: Item[]) => {
  const url = absoluteUrl("/")
  return graph(
    websiteNode(),
    {...organizationNode(), subjectOf: caseStudies.map((c) => ref(ids.article(absoluteUrl(itemPath('projects', c)))))},
    page("WebPage", url, title, description, {mainEntity: ref(ids.org)}),
  )
}

export const portfolioGraph = (title: string, description: string) => {
  const url = absoluteUrl("/portfolio")
  return graph(
    websiteNode(),
    organizationNode(),
    page("CollectionPage", url, title, description, {breadcrumb: ref(ids.breadcrumb(url)), mainEntity: ref(ids.org)}),
    crumbs(url, [portfolioCrumb]),
  )
}

export const listGraph = (target: Target, items: ItemDict, title: string, description: string) => {
  const url = absoluteUrl(`/portfolio/${target}`)
  return graph(
    websiteNode(),
    orgStub(),
    page("CollectionPage", url, title, description, {
      breadcrumb: ref(ids.breadcrumb(url)),
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: Object.keys(items).length,
        itemListElement: Object.values(items).map((it, i) => {
          const itemUrl = absoluteUrl(itemPath(target, it))
          return {
            "@type": "ListItem", position: i + 1, name: it.title, url: itemUrl,
            item: ref(target === 'people' ? ids.person(itemUrl) : ids.article(itemUrl)),
          }
        }),
      },
    }),
    crumbs(url, [portfolioCrumb, listCrumb(target)]),
  )
}

export const personGraph = (item: Item, description: string) => {
  const url = absoluteUrl(itemPath('people', item))
  const p = asPerson(item)
  return graph(
    websiteNode(),
    orgStub(),
    page("ProfilePage", url, `${item.title} · az.sh`, description, {
      breadcrumb: ref(ids.breadcrumb(url)),
      mainEntity: ref(ids.person(url)),
    }),
    {
      "@type": "Person",
      "@id": ids.person(url),
      name: item.title,
      alternateName: item.alternateTitle ?? undefined,
      givenName: p?.firstName,
      familyName: p?.lastName,
      jobTitle: item.subtitle ?? undefined,
      description,
      image: rasterImage(item.icon),
      url,
      worksFor: ref(ids.org),
      workLocation: (p?.contact?.location ?? []).map((name) => ({"@type": "Place", name: `${name}, Finland`})),
      knowsAbout: allTags(item),
      knowsLanguage: p?.languages,
      sameAs: (p?.links ?? []).map((l) => l.url).filter((u) => /^https?:\/\//.test(u)),
    },
    crumbs(url, [portfolioCrumb, listCrumb('people'), {name: item.title, path: itemPath('people', item)}]),
  )
}

export const projectGraph = (item: Item, description: string, team: RelatedItem[]) => {
  const url = absoluteUrl(itemPath('projects', item))
  const image = Object.values(item.mainTextImages ?? {}).map(rasterImage).find(Boolean) ?? rasterImage(item.icon)
  return graph(
    websiteNode(),
    orgStub(),
    page("WebPage", url, `${item.title} · az.sh`, description, {
      breadcrumb: ref(ids.breadcrumb(url)),
      mainEntity: ref(ids.article(url)),
      primaryImageOfPage: image,
    }),
    {
      "@type": "Article",
      "@id": ids.article(url),
      headline: item.title,
      alternativeHeadline: item.subtitle ?? undefined,
      description: item.description,
      url,
      mainEntityOfPage: ref(ids.page(url)),
      image: image ?? absoluteUrl(org.ogImage),
      keywords: allTags(item).join(", "),
      inLanguage: "en",
      // The company wrote the case study; the team did the work.
      author: ref(ids.org),
      publisher: ref(ids.org),
      contributor: team.map((t) => {
        const personUrl = absoluteUrl(t.href)
        return {"@type": "Person", "@id": ids.person(personUrl), name: t.title, url: personUrl}
      }),
    },
    crumbs(url, [portfolioCrumb, listCrumb('projects'), {name: item.title, path: itemPath('projects', item)}]),
  )
}
