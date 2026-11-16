import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemDetail, RelatedItem} from "@/components/standalonePages/portfolioPro/itemDetail";
import {fetchProjects} from "@/components/standalonePages/portfolio/data/projects";
import {fetchPeople} from "@/components/standalonePages/portfolio/data/people";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {asPerson} from "@/components/standalonePages/portfolioPro/personSections";
import {GetStaticPaths, GetStaticProps} from "next";
import {projectLd} from "@/util/seo";


type Props = {projects: ItemDict, selection: string, team: RelatedItem[]}

const ProProject = ({projects, selection, team}: Props) => {
  const item = projects[selection]
  return (
    <ProLayout
      active={'projects'}
      title={item ? `${item.title} · az.sh` : "Project · az.sh"}
      description={item?.description}
      jsonLd={item ? [projectLd(item, team)] : []}
    >
      <ItemDetail items={projects} id={selection} target={'projects'} team={team}/>
    </ProLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: Object.keys(await fetchProjects()).map((selection) => ({params: {selection}})),
  fallback: 'blocking',
})

export const getStaticProps: GetStaticProps<Props> = async ({params}) => {
  const [projects, people] = await Promise.all([fetchProjects(), fetchPeople()])
  const selection = String(params?.selection ?? "")
  // A real 404 for unknown ids. Skipped when the list came back empty, which
  // means the API was unreachable, so a cold API cannot 404 a real project.
  if (Object.keys(projects).length > 0 && !projects[selection]) return {notFound: true, revalidate: 300}

  // Only people carry the link, so the project's team is found by inverting it.
  const team: RelatedItem[] = Object.values(people)
    .filter((p) => ((asPerson(p)?.projects ?? []) as {id?: string}[]).some((r) => r.id === selection))
    .map((p) => ({id: p.id, title: p.title, subtitle: p.subtitle ?? null, icon: p.icon}))

  return {props: {projects, selection, team}, revalidate: 300}
}

export default ProProject
