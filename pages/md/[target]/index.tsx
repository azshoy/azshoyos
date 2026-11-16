import {textRoute, NoPage} from "@/util/textRoute";
import {listMarkdown, llmsTxt} from "@/util/markdown";
import {absoluteUrl} from "@/util/site";


// Markdown twins of the pages that are not a single item, reached through
// middleware.ts: /index.md and /portfolio.md (the site index, same as
// llms.txt), /portfolio/projects.md and /portfolio/people.md.
const canonical: {[target: string]: string} = {
  home: "/", portfolio: "/portfolio", projects: "/portfolio/projects", people: "/portfolio/people",
}

export const getServerSideProps = textRoute("text/markdown; charset=utf-8", (data, {target}) => {
  if (!(target in canonical)) return null
  const body = target === 'projects' || target === 'people' ? listMarkdown(target, data) : llmsTxt(data)
  return {body, canonical: absoluteUrl(canonical[target])}
})

export default NoPage
