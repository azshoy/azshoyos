import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemList} from "@/components/standalonePages/portfolioPro/itemList";
import {useProjects} from "@/components/standalonePages/portfolio/data/projects";


const ProProjects = () => {
  const projects = useProjects()
  return (
    <ProLayout active={'projects'} title={"Projects — az.sh"}>
      <ItemList
        items={projects}
        target={'projects'}
        title={"Projects"}
        lede={"Selected engagements, written up in enough detail to judge the engineering behind them."}
      />
    </ProLayout>
  )
}

export default ProProjects
