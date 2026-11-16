import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemDetail} from "@/components/standalonePages/portfolioPro/itemDetail";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {GetStaticPaths, GetStaticProps} from "next";
import {hasData, itemPath, loadPortfolio, RelatedItem, resolveItem, slugOf, teamOf} from "@/util/portfolio";
import {projectGraph} from "@/util/structuredData";
import {portfolioAPIURL} from "@/components/standalonePages/portfolio/data/dataManager";


// `selection` is the URL slug; `id` is the API id the components key on.
type Props = {projects: ItemDict, id: string, team: RelatedItem[]}

// A raster image for link previews, if the case study has one.
const previewImage = (images: {[key: string]: string} = {}) => {
  const src = Object.values(images).find((s) => /\.(png|jpe?g|webp)$/i.test(s))
  return src ? (/^https?:\/\//.test(src) ? src : `${portfolioAPIURL}${src}`) : undefined
}

const ProProject = ({projects, id, team}: Props) => {
  const item = projects[id]
  const description = item?.description ?? ""
  return (
    <ProLayout
      active={'projects'}
      title={item ? `${item.title} · az.sh` : "Project · az.sh"}
      description={description}
      jsonLd={item ? projectGraph(item, description, team) : undefined}
      markdownPath={item ? `${itemPath('projects', item)}.md` : undefined}
      image={item ? previewImage(item.mainTextImages) : undefined}
    >
      <ItemDetail items={projects} id={id} target={'projects'} team={team}/>
    </ProLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const {projects} = await loadPortfolio()
  return {paths: Object.values(projects).map((p) => ({params: {selection: slugOf(p)}})), fallback: 'blocking'}
}

export const getStaticProps: GetStaticProps<Props> = async ({params}) => {
  const data = await loadPortfolio()
  const {item, redirect} = resolveItem(data.projects, String(params?.selection ?? ""))
  // Old API-id URLs move to the readable slug for good.
  if (redirect && item) return {redirect: {destination: itemPath('projects', item), permanent: true}, revalidate: 300}
  // A real 404 for unknown slugs, unless the build ran with the API down.
  if (!item) return hasData(data) ? {notFound: true, revalidate: 300} : {props: {projects: {}, id: "", team: []}, revalidate: 60}
  return {props: {projects: data.projects, id: item.id, team: teamOf(item.id, data.people)}, revalidate: 300}
}

export default ProProject
