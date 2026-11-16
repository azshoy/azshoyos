import {IDdAndKeyWorded, ItemDict} from "@/components/standalonePages/portfolio/types";
import {asPerson} from "@/components/standalonePages/portfolioPro/personSections";
import {portfolioAPIURL} from "@/components/standalonePages/portfolio/data/dataManager";


// The one public address. az.sh is the brand, but the az.sh domain does not
// serve this site, so every canonical, sitemap entry and structured-data id
// points here.
export const siteUrl = "https://azsh.fi"

export const absoluteUrl = (path: string) => `${siteUrl}${path === "/" ? "" : path}`

export const org = {
  name: "az.sh",
  alternateName: ["azsh", "az.sh software"],
  email: "contact@azsh.fi",
  telephone: "+358 44 055 4838",
  summary: "az.sh is a Finnish software engineering and design team. We build and run software end to end: architecture, implementation, infrastructure and design.",
  // Kept in line with the service lines in azsh-leads/config.toml, which carry the proof for each.
  services: [
    "Web3 and DeFi protocol engineering: smart contracts, vaults, audits and operations",
    "Fullstack product development: Go, TypeScript, Next.js and React",
    "Cloud platforms and DevOps: Kubernetes, Pulumi, infrastructure as code",
    "Embedded systems: C/C++, VHDL and Yocto on Xilinx/AMD hardware",
    "Test automation and quality assurance: Playwright, CI quality gates",
    "Brand, UI and UX design",
    "Game development in Godot",
  ],
}

const orgId = `${siteUrl}/#organization`

export const organizationLd = () => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": orgId,
  name: org.name,
  alternateName: org.alternateName,
  url: siteUrl,
  logo: `${siteUrl}/icons/start.svg`,
  description: org.summary,
  email: org.email,
  telephone: org.telephone,
  address: {"@type": "PostalAddress", addressCountry: "FI"},
  areaServed: ["FI", "EU", "Worldwide"],
  knowsAbout: org.services,
  makesOffer: org.services.map((s) => ({"@type": "Offer", itemOffered: {"@type": "Service", name: s}})),
})

const personUrl = (id: string) => absoluteUrl(`/portfolio/people/${id}`)
const projectUrl = (id: string) => absoluteUrl(`/portfolio/projects/${id}`)

// Project images come from the API as paths; icons are already absolute.
const apiAsset = (src?: string) => !src ? undefined : /^https?:\/\//.test(src) ? src : `${portfolioAPIURL}${src}`

const allTags = (item: IDdAndKeyWorded) => Object.values(item.tags ?? {}).flat().filter(Boolean)

export const personLd = (item: IDdAndKeyWorded, related: {id: string, title: string}[]) => {
  const p = asPerson(item)
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${personUrl(item.id)}#person`,
    name: item.title,
    alternateName: item.alternateTitle ?? undefined,
    jobTitle: item.subtitle ?? undefined,
    description: item.description,
    image: item.icon,
    url: personUrl(item.id),
    worksFor: {"@id": orgId},
    knowsAbout: allTags(item),
    knowsLanguage: p?.languages,
    sameAs: (p?.links ?? []).map((l) => l.url).filter((u) => /^https?:\/\//.test(u)),
    subjectOf: related.map((r) => ({"@type": "CreativeWork", name: r.title, url: projectUrl(r.id)})),
  }
}

export const projectLd = (item: IDdAndKeyWorded, team: {id: string, title: string}[]) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "@id": `${projectUrl(item.id)}#article`,
  headline: item.title,
  alternativeHeadline: item.subtitle ?? undefined,
  description: item.description,
  url: projectUrl(item.id),
  image: apiAsset(Object.values(item.mainTextImages ?? {})[0]) ?? item.icon,
  keywords: allTags(item).join(", "),
  publisher: {"@id": orgId},
  author: team.length > 0
    ? team.map((t) => ({"@type": "Person", name: t.title, url: personUrl(t.id)}))
    : {"@id": orgId},
})

export const itemListLd = (items: ItemDict, target: 'projects' | 'people') => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  itemListElement: Object.values(items).map((it, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: it.title,
    url: target === 'people' ? personUrl(it.id) : projectUrl(it.id),
  })),
})

// For <script type="application/ld+json">: "<" is escaped so text from the API
// cannot close the script tag.
export const ldJson = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c")
