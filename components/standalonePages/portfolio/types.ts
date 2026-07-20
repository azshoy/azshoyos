import {BigLayoutPage} from "@/components/layouts/layout_bigtabs";
import {azColorBase} from "@/util/types";
import {ReactNode} from "react";
import {ProjectSpecific} from "@/components/standalonePages/portfolio/data/projects";
import {PersonData, TagInput} from "@/components/standalonePages/portfolio/data/people";

export type PortfolioPageTarget = string | 'people' | 'projects'

export type PortfolioPageConfig = {
  header: ReactNode,
  icon: string,
  styleClass: string
  data: () => ItemDict
  target: PortfolioPageTarget
}

type Tags = {
  field: 'UI design' | 'software' | 'hardware',
  speciality: 'frontend' | 'backend' | 'design' | 'architecture',
  stack: 'JavaScript' | 'TypeScript' | 'React',
  misc: string
}


type Tag = Tags['field'] | Tags['speciality'] | Tags['stack'] | Tags['misc']

export type ListItem = {
  title: string,
  alternateTitle: string | null,
  subtitle?: string
  icon: string
  description?: string
  mainText?: string
  mainTextImages?: {[key: string]: string}
  tags: TagInput
  links: {url: string, text: string, icon: string | null}[]
}

// Typing to get project / person identifiers
type ListElem<T extends object[]> = T[number];
type ListKey<T extends object[]> = keyof ListElem<T>
type ListKeyList<T extends object[]> = [ListKey<T>, ListKey<T>]
export type IdentifiersOfList<T extends object[], K extends ListKey<T> | ListKeyList<T>> = (
  K extends ListKey<T> ?
    ListElem<T>[K]
    : K extends ListKeyList<T> ?
      ListElem<T>[K[0]] extends string ?
        ListElem<T>[K[1]] extends string ?
          `${ListElem<T>[K[0]]} ${ListElem<T>[K[1]]}` :
      never : never : never
  )


export type IDdAndKeyWorded = ListItem & {
  id: string,
  keywords: string[]
}
export type PortfolioSpecifiedData = PersonData | ProjectSpecific
export type ItemDict = {[key: string]: IDdAndKeyWorded & PortfolioSpecifiedData}

export type PortfolioPage = BigLayoutPage & {config: PortfolioPageConfig}