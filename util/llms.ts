import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {absoluteUrl, org} from "@/util/seo";


// llms.txt (https://llmstxt.org): a Markdown digest of the site for AI
// assistants. The short form links out; the full form inlines each case study.

// Image tokens ({% name %}) only make sense on the page.
const cleanBody = (text: string) => text
  .split("\n")
  .filter((l) => !/^\s*\{%.*%\}\s*$/.test(l))
  .join("\n")
  .replace(/\n{3,}/g, "\n\n")
  .trim()

export const llmsText = (projects: ItemDict, people: ItemDict, full: boolean) => {
  const out: string[] = [
    `# ${org.name}`,
    "",
    `> ${org.summary}`,
    "",
    `Website: ${absoluteUrl("/portfolio")}. Contact: ${org.email}, ${org.telephone}. Based in Finland, working with clients in Finland, the EU and further afield.`,
    "",
    "## Services",
    "",
    ...org.services.map((s) => `- ${s}`),
    "",
    "## Case studies",
    "",
  ]
  Object.values(projects).forEach((p) => {
    const url = absoluteUrl(`/portfolio/projects/${p.id}`)
    if (full) {
      out.push(`### ${p.title}`, "", `Source: ${url}`, "")
      if (p.subtitle) out.push(`_${p.subtitle}_`, "")
      if (p.description) out.push(p.description, "")
      if (p.mainText) out.push(cleanBody(p.mainText), "")
    } else {
      out.push(`- [${p.title}](${url}): ${p.description ?? p.subtitle ?? ""}`)
    }
  })
  if (!full) out.push("")
  out.push("## People", "")
  Object.values(people).forEach((p) => {
    out.push(`- [${p.title}](${absoluteUrl(`/portfolio/people/${p.id}`)}): ${[p.subtitle, p.description].filter(Boolean).join(". ")}`)
  })
  out.push("")
  if (!full) {
    out.push("## Optional", "", `- [Full text of every case study](${absoluteUrl("/llms-full.txt")})`, "")
  }
  return out.join("\n")
}
