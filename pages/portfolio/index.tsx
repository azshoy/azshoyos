import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {Landing} from "@/components/standalonePages/portfolioPro/landing";
import {fetchProjects} from "@/components/standalonePages/portfolio/data/projects";
import {fetchPeople} from "@/components/standalonePages/portfolio/data/people";
import {GetStaticProps} from "next";


type Props = {projectCount: number, peopleCount: number}

const ProLanding = ({projectCount, peopleCount}: Props) => (
  <ProLayout
    title={"az.sh · engineering and design"}
    description={"We build and run software end to end: architecture, implementation, infrastructure and design."}
  >
    <Landing projectCount={projectCount} peopleCount={peopleCount}/>
  </ProLayout>
)

export const getStaticProps: GetStaticProps<Props> = async () => {
  const [projects, people] = await Promise.all([fetchProjects(), fetchPeople()])
  return {
    props: {projectCount: Object.keys(projects).length, peopleCount: Object.keys(people).length},
    revalidate: 300,
  }
}

export default ProLanding
