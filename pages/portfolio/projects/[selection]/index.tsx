import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemDetail} from "@/components/standalonePages/portfolioPro/itemDetail";
import {useProjects} from "@/components/standalonePages/portfolio/data/projects";
import {useRouter} from "next/router";


const ProProject = () => {
  const projects = useProjects()
  const router = useRouter()
  const selection = Array.isArray(router.query.selection) ? router.query.selection[0] : router.query.selection
  const item = selection ? projects[selection] : undefined

  return (
    <ProLayout active={'projects'} title={item ? `${item.title} — az.sh` : "Project — az.sh"}>
      <ItemDetail items={projects} id={selection ?? ""} target={'projects'}/>
    </ProLayout>
  )
}

export default ProProject
