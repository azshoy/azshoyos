import {PHASE_PRODUCTION_BUILD} from "next/constants";
import {fetchProjects} from "@/components/standalonePages/portfolio/data/projects";
import {fetchPeople} from "@/components/standalonePages/portfolio/data/people";
import {IDdAndKeyWorded, ItemDict} from "@/components/standalonePages/portfolio/types";
import {asPerson} from "@/components/standalonePages/portfolioPro/personSections";


// Server-side access to the portfolio API for pages, sitemap, llms.txt and the
// Markdown routes, plus the URL scheme they all share.

export type Target = 'projects' | 'people'

export type Portfolio = {projects: ItemDict, people: ItemDict}

// fetchProjects/fetchPeople return {} when the API is down. At build time that
// is allowed, so a cold API cannot fail a deploy. On an ISR revalidation it
// throws instead: Next then keeps serving the last good page rather than
// replacing it with an empty one.
export const loadPortfolio = async (): Promise<Portfolio> => {
  const [projects, people] = await Promise.all([fetchProjects(), fetchPeople()])
  const empty = Object.keys(projects).length === 0 || Object.keys(people).length === 0
  if (empty && process.env.NEXT_PHASE !== PHASE_PRODUCTION_BUILD) {
    throw new Error("Portfolio API returned no data; keeping the cached version")
  }
  return {projects, people}
}

export const hasData = ({projects, people}: Portfolio) =>
  Object.keys(projects).length > 0 && Object.keys(people).length > 0

// Readable ASCII URL segment from a title: "Aleksi Seppänen" -> "aleksi-seppanen".
export const slugify = (text: string) => text
  .normalize("NFKD")
  .replace(/[̀-ͯ]/g, "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "")

// The API may one day carry its own slug; until then it comes from the title.
export const slugOf = (item: {title: string, slug?: string}) => item.slug ?? slugify(item.title)

export const itemPath = (target: Target, item: {title: string, slug?: string}) =>
  `/portfolio/${target}/${encodeURIComponent(slugOf(item))}`

// Resolves a URL segment to an item. `redirect` is set when the segment is an
// old API-id URL (e.g. /portfolio/people/AleksiSeppnen), so the page can 308
// it to the readable one.
export const resolveItem = (items: ItemDict, segment: string): {item?: ItemDict[string], redirect?: string} => {
  const bySlug = Object.values(items).find((it) => slugOf(it) === segment)
  if (bySlug) return {item: bySlug}
  return items[segment] ? {item: items[segment], redirect: slugOf(items[segment])} : {}
}

export type RelatedItem = {
  id: string
  title: string
  subtitle: string | null
  icon: string
  href: string
}

const related = (target: Target, it: IDdAndKeyWorded): RelatedItem => ({
  id: it.id, title: it.title, subtitle: it.subtitle ?? null, icon: it.icon, href: itemPath(target, it),
})

// The link between people and projects lives on the person entry.
const projectRefs = (person: object) =>
  ((asPerson(person)?.projects ?? []) as {id?: string}[]).map((r) => r.id).filter((id): id is string => !!id)

export const projectsOf = (person: object, projects: ItemDict): RelatedItem[] =>
  projectRefs(person).map((id) => projects[id]).filter(Boolean).map((p) => related('projects', p))

export const teamOf = (projectId: string, people: ItemDict): RelatedItem[] =>
  Object.values(people).filter((p) => projectRefs(p).includes(projectId)).map((p) => related('people', p))

// A plain, factual summary for machine-readable text (meta descriptions,
// JSON-LD, llms.txt). For people this is the first sentences of the bio
// (`pitch`), not the playful one-liner the cards show.
export const summaryOf = (item: ItemDict[string], sentences = 2) => {
  const pitch = asPerson(item)?.pitch
  if (!pitch) return item.description ?? item.subtitle ?? ""
  const parts = pitch.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+["”]?/g) ?? [pitch]
  return parts.slice(0, sentences).join(" ").trim()
}
