import {textRoute, NoPage} from "@/util/textRoute";
import {absoluteUrl} from "@/util/site";
import {itemPath} from "@/util/portfolio";


const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export const getServerSideProps = textRoute("application/xml; charset=utf-8", ({projects, people}) => {
  const paths = [
    "/",
    "/portfolio",
    "/portfolio/projects",
    ...Object.values(projects).map((p) => itemPath('projects', p)),
    "/portfolio/people",
    ...Object.values(people).map((p) => itemPath('people', p)),
  ]
  return {body: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${escape(absoluteUrl(p))}</loc></url>`).join("\n")}
</urlset>
`}
})

export default NoPage
