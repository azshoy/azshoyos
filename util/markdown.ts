import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {imageToken, isSectionHeading, listParts, partHeading} from "@/components/standalonePages/portfolioPro/mainText";
import {portfolioAPIURL} from "@/components/standalonePages/portfolio/data/dataManager";
import {asPerson} from "@/components/standalonePages/portfolioPro/personSections";
import {absoluteUrl, org, Service, services} from "@/util/site";
import {itemPath, Portfolio, RelatedItem, summaryOf, teamOf} from "@/util/portfolio";


// Markdown for AI assistants and coding agents: /llms.txt (https://llmstxt.org),
// /llms-full.txt, and a .md twin of every portfolio page. Same facts as the
// HTML pages, without the markup.

type Item = ItemDict[string]

// Titles and one-liners go inside list items and link text.
const inline = (text: string) => text.replace(/\s+/g, " ").replace(/([\[\]])/g, "\\$1").trim()
const sentenceCase = (line: string) => line.charAt(0) + line.slice(1).toLowerCase()
const asset = (src: string) => /^https?:\/\//.test(src) ? src : `${portfolioAPIURL}${src}`

// The case-study text format (see mainText.tsx) rendered as Markdown.
const bodyMarkdown = (text: string, images: {[key: string]: string} = {}, top = 2) => {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
  const hasParts = lines.some((l) => partHeading.test(l))
  const h = (level: number) => "#".repeat(Math.min(level, 6))
  return lines.map((line) => {
    const img = line.match(imageToken)
    if (img) {
      const src = images[`{% ${img[1]} %}`] ?? images[img[1]]
      return src ? `![${inline(img[1].replace(/[_-]+/g, " "))}](${asset(src)})` : ""
    }
    if (partHeading.test(line)) return `${h(top)} ${sentenceCase(line.replace(partHeading, "").trim())}`
    if (isSectionHeading(line)) return `${h(hasParts ? top + 1 : top)} ${sentenceCase(line)}`
    const items = line.includes("·") ? listParts(line) : undefined
    if (items) return items.map((i) => `- ${i}`).join("\n")
    return line
  }).filter(Boolean).join("\n\n")
}

const link = (title: string, path: string) => `[${inline(title)}](${absoluteUrl(path)})`

const serviceLine = (s: Service, {projects}: Portfolio) => {
  const proof = "project" in s.evidence ? projects[s.evidence.project] : undefined
  const where = proof ? link(proof.title, itemPath('projects', proof))
    : "url" in s.evidence ? `[${s.evidence.url.replace(/^https:\/\//, "")}](${s.evidence.url})`
    : link("the team", "/portfolio/people")
  return `- **${s.name}**: ${s.detail}. See ${where}.`
}

const header = (data: Portfolio) => [
  `# ${org.name}`,
  "",
  `> ${org.summary}`,
  "",
  org.howWeWork,
  "",
  `- Company: ${org.legalName}, business ID (Y-tunnus) ${org.businessId}, founded ${org.foundingDate}, ${org.address.addressLocality}, Finland`,
  `- Website: ${absoluteUrl("/")} (the brand is az.sh; the website is azsh.fi)`,
  `- Contact: ${org.email}, ${org.telephone}`,
  `- Team: ${Object.keys(data.people).length} engineers and designers in ${org.locations.join(" and ")}`,
  `- Source code of this site: ${org.repository}`,
  `- Generated from the live portfolio on ${new Date().toISOString().slice(0, 10)}`,
  "",
  "## Services",
  "",
  ...services.map((s) => serviceLine(s, data)),
  "",
]

const personLine = (p: Item) =>
  `- ${link(p.title, `${itemPath('people', p)}.md`)}: ${inline([p.subtitle, summaryOf(p, 1)].filter(Boolean).join(". "))}`

export const llmsTxt = (data: Portfolio) => [
  ...header(data),
  "## Case studies",
  "",
  ...Object.values(data.projects).map((p) =>
    `- ${link(p.title, `${itemPath('projects', p)}.md`)}: ${inline(p.description ?? p.subtitle ?? "")}`),
  "",
  "## People",
  "",
  ...Object.values(data.people).map(personLine),
  "",
  "## Optional",
  "",
  `- ${link("Full text of every case study", "/llms-full.txt")}: one file, for loading into a context window`,
  `- ${link("Portfolio", "/portfolio")}: the same content as HTML`,
  "",
].join("\n")

export const llmsFullTxt = (data: Portfolio) => [
  ...header(data),
  "## Case studies",
  "",
  ...Object.values(data.projects).map((p) => projectMarkdown(p, teamOf(p.id, data.people), 3)),
  "## People",
  "",
  ...Object.values(data.people).map(personLine),
  "",
].join("\n")

const footer = (path: string) => [
  "",
  "---",
  "",
  `${org.legalName} · ${org.email} · ${org.telephone} · HTML version: ${absoluteUrl(path)} · Site index: ${absoluteUrl("/llms.txt")}`,
  "",
]

export const projectMarkdown = (p: Item, team: RelatedItem[], level = 1) => {
  const h = "#".repeat(level)
  const path = itemPath('projects', p)
  return [
    `${h} ${p.title}`,
    "",
    p.subtitle ? `_${inline(p.subtitle)}_` : "",
    "",
    p.description ? `> ${inline(p.description)}` : "",
    "",
    team.length ? `Team: ${team.map((t) => link(t.title, t.href)).join(", ")}` : "",
    `Tags: ${Object.values(p.tags ?? {}).flat().join(", ")}`,
    `Source: ${absoluteUrl(path)}`,
    "",
    p.mainText ? bodyMarkdown(p.mainText, p.mainTextImages, level + 1) : "",
    "",
    ...(level === 1 ? footer(path) : []),
  ].filter((l, i, all) => l !== "" || all[i - 1] !== "").join("\n")
}

export const personMarkdown = (p: Item, worksOn: RelatedItem[]) => {
  const person = asPerson(p)
  const path = itemPath('people', p)
  return [
    `# ${p.title}`,
    "",
    `_${inline([p.subtitle, "az.sh"].filter(Boolean).join(" · "))}_`,
    "",
    person?.pitch ?? p.description ?? "",
    "",
    person?.contact?.location?.length ? `- Based in: ${person.contact.location.join(", ")}, Finland` : "",
    person?.languages?.length ? `- Languages: ${person.languages.join(", ")}` : "",
    `- Skills: ${Object.values(p.tags ?? {}).flat().join(", ")}`,
    ...(person?.education ?? []).map((e) => `- Education: ${[e.degree, e.institute, e.year].filter(Boolean).join(", ")}${e.graduated ? "" : " (in progress)"}`),
    ...(p.links ?? []).map((l) => `- ${inline(l.text || l.url)}: ${l.url}`),
    "",
    worksOn.length ? "## Case studies\n\n" + worksOn.map((r) => `- ${link(r.title, r.href)}`).join("\n") : "",
    ...footer(path),
  ].filter((l, i, all) => l !== "" || all[i - 1] !== "").join("\n")
}

