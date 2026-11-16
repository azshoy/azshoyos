import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {Landing} from "@/components/standalonePages/portfolioPro/landing";
import {GetStaticProps} from "next";
import {loadPortfolio} from "@/util/portfolio";
import {portfolioGraph} from "@/util/structuredData";


type Props = {projectCount: number, peopleCount: number}

const title = "Portfolio: case studies and team · az.sh"
const description = "az.sh is a software engineering and design consultancy from Oulu and Helsinki, Finland. "
  + "Case studies in Web3, fullstack, cloud, QA and design, and the people who did the work."

const ProLanding = ({projectCount, peopleCount}: Props) => (
  <ProLayout title={title} description={description} jsonLd={portfolioGraph(title, description)} markdownPath={"/llms.txt"}>
    <Landing projectCount={projectCount} peopleCount={peopleCount}/>
  </ProLayout>
)

export const getStaticProps: GetStaticProps<Props> = async () => {
  const {projects, people} = await loadPortfolio()
  return {
    props: {projectCount: Object.keys(projects).length, peopleCount: Object.keys(people).length},
    revalidate: 300,
  }
}

export default ProLanding
