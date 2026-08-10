import {ItemDict, ListItem} from "@/components/standalonePages/portfolio/types";


export const portfolioAPIURL = process.env.NEXT_PUBLIC_PORTFOLIO_API_URL ?? "http://127.0.0.1:4000"

export const withIdsAndKeywords = <T extends object>(list: (ListItem & T)[]) => {
  const idd: ItemDict = {}
  const ids:string[] = []
  list.forEach((i, index) => {
    let id = i.title.toLowerCase()
    while (ids.includes(id)) {
      id += "_"
    }
    ids.push(id)
    idd[id] = {...i, id: id, keywords: getKeyWords(i)}
  })
  return idd
}

export const getKeyWords = (p:ListItem) => {
  const pwordsLow:string[] = []
  const pwords: string[] = []
  Object.keys(p.tags).forEach((tg) => {
    getNonConflictingWords(pwordsLow, pwords, p.tags[tg], false, true)
  })
  getNonConflictingWords(pwordsLow, pwords, p.title)
  getNonConflictingWords(pwordsLow, pwords, p.subtitle)
  getWordsFromSentences(pwordsLow, pwords, p.description)
  getNonConflictingWords(pwordsLow, pwords, p.title.split(" "))
  getNonConflictingWords(pwordsLow, pwords, p.subtitle?.split(" "))
  return pwordsLow
}

const filtered = ["and", "a", "an", "with", "of", "for", ""]
const getWordsFromSentences = (a: string[], l: string[], b:string | undefined, allLower=false) => {
  if (!b) return
  const w = b.split(" ")
  w.forEach((s) => {
    const ss = s.split("'")[0].replace(/[^a-zA-Z0-9 ]/g, "")
    const ssl = ss.toLowerCase()
    if (!(filtered.includes(ssl)) && !(a.includes(ssl))){
      a.push(ssl)
      l.push(allLower ? ssl : ss)
    }
  })
  return
}
const getNonConflictingWords = (a: string[], l: string[], b:string | string[] | undefined, allLower=false, replaceSpace=false) => {
  if (!b) return
  if (typeof b !== "string") {
    b.forEach((bs) => {
      getNonConflictingWords(a, l, bs, allLower, replaceSpace)
    })
    return
  }
  const c = replaceSpace ? b.replaceAll(" ", "_") : b
  const w = c.toLowerCase()
  if (!(a.includes(w))){
    a.push(w)

    l.push((allLower ? w : c))
  }
}

export const getKeywordOptionsForSearch = (dict: ItemDict, preList: string[] = []) => {
  const unique = [...preList].map((s) => s.toLowerCase())
  const keywords:string[] = [...preList]
  Object.values(dict).forEach((li) => {
    Object.keys(li.tags).forEach((tg) => {
      getNonConflictingWords(unique, keywords, li.tags[tg], false, true)
    })
    getNonConflictingWords(unique, keywords, li.title)
    getNonConflictingWords(unique, keywords, li.subtitle)
    getNonConflictingWords(unique, keywords, li.subtitle?.split(" "))
  })
  return keywords.sort()
}
