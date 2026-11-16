import {textRoute, NoPage} from "@/util/textRoute";
import {personMarkdown, projectMarkdown} from "@/util/markdown";
import {itemPath, projectsOf, resolveItem, teamOf} from "@/util/portfolio";
import {absoluteUrl} from "@/util/site";


// The Markdown twin of a portfolio page. Reached through rewrites in
// next.config.ts: /portfolio/projects/<slug>.md, or the HTML URL requested
// with "Accept: text/markdown".
export const getServerSideProps = textRoute("text/markdown; charset=utf-8", ({projects, people}, {target, slug}) => {
  if (target === 'projects') {
    const {item} = resolveItem(projects, slug)
    return item ? {body: projectMarkdown(item, teamOf(item.id, people)), canonical: absoluteUrl(itemPath('projects', item))} : null
  }
  if (target === 'people') {
    const {item} = resolveItem(people, slug)
    return item ? {body: personMarkdown(item, projectsOf(item, projects)), canonical: absoluteUrl(itemPath('people', item))} : null
  }
  return null
})

export default NoPage
