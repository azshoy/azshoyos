import {ItemDict, ListItem} from "@/components/standalonePages/portfolio/types";
import {getKeyWords, portfolioAPIURL} from "@/components/standalonePages/portfolio/data/dataManager";
import {useEffect, useState} from "react";


type Person = ListItem & PersonData

export const usePeople =  () => {
  const [ppl, setPpl] = useState<ItemDict>({})
  useEffect(() => {
    fetch(`${portfolioAPIURL}/people`).then((response) => {
      if (response.ok) {
        response.json().then((d) => {
          if ("people" in d) {
            setPpl(personsToListItem(d.people as PersonData[]))
          }
        })
      }
    })
  }, []);
  return ppl
}


// Server-side twin of usePeople, for getStaticProps. See fetchProjects.
export const fetchPeople = async ():Promise<ItemDict> => {
  try {
    const response = await fetch(`${portfolioAPIURL}/people`)
    if (!response.ok) return {}
    const d = await response.json()
    return "people" in d ? personsToListItem(d.people as PersonData[]) : {}
  } catch {
    return {}
  }
}


const personsToListItem = (ppl: PersonData[]) => {
  const listItems:ItemDict = {}
  ppl.forEach((p) => {
    listItems[p.id] = {
      ...p,
      keywords: [],
      title: p.displayName,
      alternateTitle: p.alternateName,
      description: p.shortPitch || p.pitch,
      mainText: p.pitch,
      subtitle: p.jobTitle,
      icon: `${portfolioAPIURL}${p.photo}`,
    }
    listItems[p.id].keywords = getKeyWords(listItems[p.id])
  })
  return listItems
}

type Education = {
  institute: string,
  degree: string,
  year: string,
  graduated: boolean
}
export type TagInput = {[key: string]: string[]}

export type PersonData = {
  jobTitle: string,
  displayName: string,
  alternateName: string | null,
  firstName: string,
  lastName: string,
  nickname: string | null,
  photo: string,
  languages: string[],
  contact: {
    location: string[] | null
    email: string | null
    phone: string | null
  },
  links: {url: string, text: string, icon: string | null, primary: boolean}[],
  pitch: string,
  shortPitch: string | null,
  education: Education[],
  projects: {
    //id: IdentifiersOfList<typeof projectList, 'title'>
    inactive?: boolean
  }[],
  id: string
  tags: TagInput
  availability: number
}
