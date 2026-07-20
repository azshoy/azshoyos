import styles from "./app.module.css";
import Projects from "@/pages/projects";
import {BigTabProgram} from "@/components/layouts/layout_bigtabs";
import People from "@/pages/people";


const PortfolioPeopleApp = () => {
  const tabs = {people: People.tab, projects: Projects.tab}
  return (
    <BigTabProgram active={'people'} components={tabs}/>
  );
}
const PortfolioProjectsApp = () => {
  const tabs = {people: People.tab, projects: Projects.tab}
  return (
    <BigTabProgram active={'projects'} components={tabs}/>
  );
}

export const PortfolioPeople = {
  name: "People",
  app: <PortfolioPeopleApp/>
}
export const PortfolioProjects = {
  name: "Projects",
  app: <PortfolioProjectsApp/>
}