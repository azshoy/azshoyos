import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemList} from "@/components/standalonePages/portfolioPro/itemList";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {GetStaticProps} from "next";
import {loadPortfolio} from "@/util/portfolio";
import {listGraph} from "@/util/structuredData";


const title = "Case studies: Web3, fullstack, cloud and QA · az.sh"
const description = "Engagements by az.sh, a Finnish software consultancy, written up in enough detail "
  + "to judge the engineering behind them: architecture, scale, incidents and outcomes."
const lede = "Selected engagements, written up in enough detail to judge the engineering behind them."

const ProProjects = ({projects}: {projects: ItemDict}) => (
  <ProLayout
    active={'projects'}
    title={title}
    description={description}
    jsonLd={listGraph('projects', projects, title, description)}
    markdownPath={"/portfolio/projects.md"}
  >
    <ItemList items={projects} target={'projects'} title={"Projects"} lede={lede}/>
  </ProLayout>
)

export const getStaticProps: GetStaticProps = async () => ({
  props: {projects: (await loadPortfolio()).projects},
  revalidate: 300,
})

export default ProProjects
