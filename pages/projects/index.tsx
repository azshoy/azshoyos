import "@/globalStyles/global.css";
import portfolioStyles from '@/components/standalonePages/portfolio/portfolio.module.css'
import BigTabLayout from "@/components/layouts/layout_bigtabs";
import People from "@/pages/people";
import {PortfolioPage} from "@/components/standalonePages/portfolio/types";
import { Tab } from "@/components/standalonePages/portfolio/tabs";
import {ItemListGetter} from "@/components/standalonePages/portfolio/items/selector";
import {useProjects} from "@/components/standalonePages/portfolio/data/projects";


const Projects:PortfolioPage = () => {
  const tabs = {people: People.tab, projects: Projects.tab}
  return (
    <BigTabLayout active={'projects'} components={tabs}/>
  );
}
Projects.config = {
  header: 'Projects',
  icon: 'null',
  styleClass: portfolioStyles.purple,
  data: useProjects,
  target: "projects"
}
Projects.tab = {
  styling: Tab.styling(Projects.config),
  active: <Tab.active config={Projects.config}><ItemListGetter dictGetter={Projects.config.data} target={Projects.config.target}/></Tab.active>,
  inactive: <Tab.inactive config={Projects.config}></Tab.inactive>,
  staticContent: {
    before: <Tab.header config={Projects.config}/>
  }
}

export default Projects