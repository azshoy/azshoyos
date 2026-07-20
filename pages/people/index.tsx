import "@/globalStyles/global.css";
import portfolioStyles from '@/components/standalonePages/portfolio/portfolio.module.css'
import BigTabLayout from "@/components/layouts/layout_bigtabs";
import Projects from "@/pages/projects";
import {PortfolioPage} from "@/components/standalonePages/portfolio/types";
import { Tab } from "@/components/standalonePages/portfolio/tabs";
import {ItemListGetter} from "@/components/standalonePages/portfolio/items/selector";
import {usePeople} from "@/components/standalonePages/portfolio/data/people";


export const People:PortfolioPage = () => {
  const tabs = {people: People.tab, projects: Projects.tab}
  return (
    <BigTabLayout active={'people'} components={tabs}/>
  );
}
People.config = {
  header: 'People',
  icon: 'null',
  styleClass: portfolioStyles.green,
  data: usePeople,
  target: 'people'
}
People.tab = {
  styling: Tab.styling(People.config),
  active: <Tab.active config={People.config}><ItemListGetter dictGetter={People.config.data} target={People.config.target}/></Tab.active>,
  inactive: <Tab.inactive config={People.config}></Tab.inactive>,
  staticContent: {
    before: <Tab.header config={People.config}/>
  }
}

export default People