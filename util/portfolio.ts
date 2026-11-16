import {PHASE_PRODUCTION_BUILD} from "next/constants";
import {fetchProjects} from "@/components/standalonePages/portfolio/data/projects";
import {fetchPeople} from "@/components/standalonePages/portfolio/data/people";
import {IDdAndKeyWorded, ItemDict} from "@/components/standalonePages/portfolio/types";
import {asPerson} from "@/components/standalonePages/portfolioPro/personSections";
import {slugOf} from "@/util/slug";


// Server-side access to the portfolio API for pages, sitemap, llms.txt and the
// Markdown routes, plus the URL scheme they all share.

export type Target = 'projects' | 'people'

export type Portfolio = {projects: ItemDict, people: ItemDict}

const isEmpty = ({projects, people}: Portfolio) =>
  Object.keys(projects).length === 0 || Object.keys(people).length === 0

const fetchBoth = async (): Promise<Portfolio> => {
  const [projects, people] = await Promise.all([fetchProjects(), fetchPeople()])
  return {projects, people}
}

// fetchProjects/fetchPeople return {} when the API is down. What happens then
// depends on where we are:
// - `next dev`: render empty, so the desktop works without the API.
// - `next build`: retry once (the API may be cold). A production deploy on
//   Vercel then fails rather than ship an empty portfolio, and the previous
//   deployment stays live. Other builds (local, CI, previews) go on empty.
// - production runtime (ISR revalidation, text routes): throw, so Next keeps
//   serving the last good page and the text routes answer 503.
export const loadPortfolio = async (): Promise<Portfolio> => {
  let data = await fetchBoth()
  if (!isEmpty(data) || process.env.NODE_ENV !== "production") return data
  if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) {
    await new Promise((r) => setTimeout(r, 3000))
    data = await fetchBoth()
    if (isEmpty(data) && process.env.VERCEL_ENV === "production") {
      throw new Error(`Portfolio API at ${process.env.NEXT_PUBLIC_PORTFOLIO_API_URL} returned no data; refusing to deploy an empty portfolio`)
    }
    return data
  }
  throw new Error("Portfolio API returned no data; keeping the cached version")
}

export {slugify, slugOf} from "@/util/slug";

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
// JSON-LD, llms.txt). For people this comes from the bio (`pitch`), not the
// playful one-liner the cards show, skipping opening sentences that are a
// quote or too short to say anything on their own ("Generalman Jantunen kind
// of a guy.").
export const summaryOf = (item: ItemDict[string], sentences = 2) => {
  const pitch = asPerson(item)?.pitch
  if (!pitch) return item.description ?? item.subtitle ?? ""
  const all = pitch.replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+["”]?/g) ?? [pitch]
  const informative = (s: string) => !/^\s*["“]/.test(s) && s.trim().split(" ").length >= 7
  const start = Math.max(0, all.findIndex(informative))
  return all.slice(start, start + sentences).join(" ").trim()
}
