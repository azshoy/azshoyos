import styles from '@/components/standalonePages/portfolio/portfolio.module.css'
import {PortfolioPageConfig} from "@/components/standalonePages/portfolio/types";
import {ReactNode} from "react";
import {TabComponentStyling} from "@/components/layouts/layout_bigtabs";
import {Searchbar} from "@/components/standalonePages/portfolio/searchbar/searchbar";
import {getKeywordOptionsForSearch} from "@/components/standalonePages/portfolio/data/dataManager";
import { SelectedItem } from "./items/selected";



type TabProps = {
  children: ReactNode
  config: PortfolioPageConfig
}
type InactiveTabProps = {
  children?: ReactNode
  config: TabProps['config']
}
type Tabs = {
  (p:TabProps): ReactNode
  active: (p:TabProps) => ReactNode
  inactive: (p: InactiveTabProps) => ReactNode
  header: (p: {config: TabProps['config']}) => ReactNode
  styling: (c: TabProps['config']) => TabComponentStyling
}
export const Tab:Tabs = ({children, config}) => {
  return (
    <div className={styles.tab}>
      <div className={styles.tabContent}>
        {children}
      </div>
    </div>
  );
}
Tab.active = ({children, config}) => {
  return (
    <Tab config={config}>
      <SelectedItem data={config.data()} target={config.target}/>
      <Searchbar keywords={getKeywordOptionsForSearch(config.data())} target={config.target}/>
      <div className={styles.scrollbox}>
        {children}
      </div>
    </Tab>
  );
}
Tab.inactive = ({children, config}) => {
  return (
    <Tab config={config}>
      {children}
    </Tab>
  );
}
Tab.header = ({config}) => {
  return (
    <div className={styles.header}>
      {config.header}
    </div>
  );
}
Tab.styling = (config) => ({
  styleModule: styles,
  styleClass: config.styleClass,
})

