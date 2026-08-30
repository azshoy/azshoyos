import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemList} from "@/components/standalonePages/portfolioPro/itemList";
import {fetchProjects} from "@/components/standalonePages/portfolio/data/projects";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {GetStaticProps} from "next";


const ProProjects = ({projects}: {projects: ItemDict}) => (
  <ProLayout
    active={'projects'}
    title={"Projects · az.sh"}
    description={"Selected engagements, written up in enough detail to judge the engineering behind them."}
  >
    <ItemList
      items={projects}
      target={'projects'}
      title={"Projects"}
      lede={"Selected engagements, written up in enough detail to judge the engineering behind them."}
    />
  </ProLayout>
)

export const getStaticProps: GetStaticProps = async () => ({
  props: {projects: await fetchProjects()},
  revalidate: 300,
})

export default ProProjects
