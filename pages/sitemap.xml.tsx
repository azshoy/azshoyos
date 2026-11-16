import {GetServerSideProps} from "next";
import {fetchProjects} from "@/components/standalonePages/portfolio/data/projects";
import {fetchPeople} from "@/components/standalonePages/portfolio/data/people";
import {absoluteUrl} from "@/util/seo";
import {sendText} from "@/util/plainText";


const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const [projects, people] = await Promise.all([fetchProjects(), fetchPeople()])
  const paths = [
    "/",
    "/portfolio",
    "/portfolio/projects",
    ...Object.keys(projects).map((id) => `/portfolio/projects/${id}`),
    "/portfolio/people",
    ...Object.keys(people).map((id) => `/portfolio/people/${id}`),
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${escape(absoluteUrl(p))}</loc></url>`).join("\n")}
</urlset>
`
  return sendText(ctx, "application/xml; charset=utf-8", xml, Object.keys(projects).length === 0)
}

const Sitemap = () => null
export default Sitemap
