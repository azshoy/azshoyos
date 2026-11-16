import {GetServerSideProps} from "next";
import {fetchProjects} from "@/components/standalonePages/portfolio/data/projects";
import {fetchPeople} from "@/components/standalonePages/portfolio/data/people";
import {llmsText} from "@/util/llms";
import {sendText} from "@/util/plainText";


export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const [projects, people] = await Promise.all([fetchProjects(), fetchPeople()])
  return sendText(ctx, "text/plain; charset=utf-8", llmsText(projects, people, false), Object.keys(projects).length === 0)
}

const Llms = () => null
export default Llms
