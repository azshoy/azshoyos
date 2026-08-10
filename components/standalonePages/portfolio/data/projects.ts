import {ItemDict, ListItem} from "@/components/standalonePages/portfolio/types";
import {
  getKeyWords,
  portfolioAPIURL,
  withIdsAndKeywords
} from "@/components/standalonePages/portfolio/data/dataManager";
import {useEffect, useState} from "react";
import {PersonData, TagInput} from "@/components/standalonePages/portfolio/data/people";

export type ProjectSpecific = object
type Project = ListItem & ProjectSpecific

export const useProjects =  () => {
  const [proj, setProj] = useState<ItemDict>({})
  useEffect(() => {
    fetch(`${portfolioAPIURL}/projects`).then((response) => {
      if (response.ok) {
        response.json().then((d) => {
          if ("projects" in d) {
            setProj(projectsToListItem(d.projects as ProjectData[]))
          }
        })
      }
    })
  }, []);
  return proj
}


const projectsToListItem = (ppl: ProjectData[]) => {
  const listItems:ItemDict = {}
  ppl.forEach((p) => {
    listItems[p.id] = {
      ...p,
      keywords: [],
      title: p.displayName,
      alternateTitle: null,
      icon: `${portfolioAPIURL}${p.icon}`,
      mainTextImages: p.images
    }
    listItems[p.id].keywords = getKeyWords(listItems[p.id])
  })
  return listItems
}


export type ProjectData = {
  displayName: string,
  subtitle: string,
  icon: string,
  links: {url: string, text: string, icon: string | null, primary: boolean}[],
  description: string,
  mainText: string,
  images: {[key: string]: string}
  id: string
  tags: {[key: string]: string[]}
}