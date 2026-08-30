import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemDetail} from "@/components/standalonePages/portfolioPro/itemDetail";
import {fetchProjects} from "@/components/standalonePages/portfolio/data/projects";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {GetStaticPaths, GetStaticProps} from "next";


type Props = {projects: ItemDict, selection: string}

const ProProject = ({projects, selection}: Props) => {
  const item = projects[selection]
  return (
    <ProLayout active={'projects'} title={item ? `${item.title} · az.sh` : "Project · az.sh"}>
      <ItemDetail items={projects} id={selection} target={'projects'}/>
    </ProLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: Object.keys(await fetchProjects()).map((selection) => ({params: {selection}})),
  // An entry added after the last build renders on first request instead of 404ing.
  fallback: 'blocking',
})

export const getStaticProps: GetStaticProps<Props> = async ({params}) => ({
  props: {projects: await fetchProjects(), selection: String(params?.selection ?? "")},
  revalidate: 300,
})

export default ProProject
