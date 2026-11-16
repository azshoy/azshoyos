import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {Landing, ServiceProof} from "@/components/standalonePages/portfolioPro/landing";
import {GetStaticProps} from "next";
import {itemPath, loadPortfolio} from "@/util/portfolio";
import {portfolioGraph} from "@/util/structuredData";
import {org, services} from "@/util/site";


type Props = {projectCount: number, peopleCount: number, services: ServiceProof[]}

const title = "Portfolio: case studies and team · az.sh"
const description = "az.sh is a software engineering and design consultancy from Oulu and Helsinki, Finland. "
  + "Case studies in Web3, fullstack, cloud, QA and design, and the people who did the work."

const ProLanding = ({projectCount, peopleCount, services}: Props) => (
  <ProLayout title={title} description={description} jsonLd={portfolioGraph(title, description)} markdownPath={"/portfolio.md"}>
    <Landing projectCount={projectCount} peopleCount={peopleCount} services={services} howWeWork={org.howWeWork}/>
  </ProLayout>
)

export const getStaticProps: GetStaticProps<Props> = async () => {
  const {projects, people} = await loadPortfolio()
  // Each service links to the case study that proves it; one whose case study
  // is missing from the API links to the team instead.
  const withProof: ServiceProof[] = services.map((s): ServiceProof => {
    const project = "project" in s.evidence ? projects[s.evidence.project] : undefined
    const proof = project ? {label: `Case study: ${project.title}`, href: itemPath('projects', project), external: false}
      : "url" in s.evidence ? {label: "This site's source code", href: s.evidence.url, external: true}
      : {label: "The team", href: "/portfolio/people", external: false}
    // Two services can share a case study; screen readers list links by name, so each gets its own.
    const ariaLabel = `${proof.label} (evidence for ${s.name})`
    return {name: s.name, proof: {...proof, ariaLabel}, detail: `${s.detail.charAt(0).toUpperCase()}${s.detail.slice(1)}.`}
  })
  return {
    props: {projectCount: Object.keys(projects).length, peopleCount: Object.keys(people).length, services: withProof},
    revalidate: 300,
  }
}

export default ProLanding
