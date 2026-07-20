import mainStyles from '@/components/standalonePages/portfolio/portfolio.module.css'
import styles from '@/components/standalonePages/portfolio/searchbar/search.module.css'
import {ChangeEvent, useEffect, useId, useState} from "react";
import {PortfolioPageTarget} from "@/components/standalonePages/portfolio/types";
import {emitSignal, useConnectedSignal} from "@/components/standalonePages/portfolio/signals";
import { cls } from "@/util/misc";

type SearchbarParam = {
  target?: PortfolioPageTarget
  keywords?: string[]
}

export const Searchbar = ({
  keywords = [],
  target,
}:SearchbarParam) => {
  const id = useId()
  const [hasInput, setHasInput] = useState<boolean>(false)
  const [preVal, setPreVal] = useState<string>("")
  const onInput = (e:ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const words = value.split(" ")
    setHasInput(words[words.length-1].trim() !== "")
    if (words.length > 1) setPreVal(words.slice(0, words.length-1).join(" "))
    if (typeof target == 'undefined') return
    emitSignal(target + 'SearchUpdated', {value: e.target.value})
  }
  const finalizeSearch = () => {
    if (typeof target == 'undefined') return
    emitSignal(target + 'SearchFinalized')
  }
  return (
    <div className={cls(mainStyles.searchbar, styles.searchbar)}>
      <div>
        <input placeholder={'Search'} onChange={(e) => onInput(e)} list={id+"-suggestions"} onKeyDown={event => {
            if (event.key === 'Enter') {
              finalizeSearch()
            }
          }}/>
        <img src={'/portfolio/icons/search.svg'} onClick={() => finalizeSearch()}/>
      </div>
      <datalist id={id+"-suggestions"}>
        {hasInput ? keywords.map((k) => <option key={k} value={preVal + (preVal ? " " : "") + k}/>) : null}
      </datalist>
    </div>
  )
}

export const useSearchInput = (target: PortfolioPageTarget) => {
  const [searchInput, setSearchInput] = useState<{words: string[][], timestamp: number, finalized: boolean}>({words: [], timestamp: 0, finalized: true})
  const update = useConnectedSignal<{value: string}>(target + 'SearchUpdated')
  const finalized = useConnectedSignal<{value: string}>(target + 'SearchFinalized')
  useEffect(() => {
    const v = update.output?.value
    if (typeof v !== 'undefined'){
      const timer = setTimeout(() => {
        const ands = v.trim().replace(/\/\s+/g, "/").replace(/\s+\//g, "/").split(" ")
        const words = ands.map((s) => s.split("/"))
        //console.log(words)
        setSearchInput({words: words, timestamp: update.fired, finalized: finalized.fired >= update.fired})
      }, 500)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [update.fired, update.output, finalized.fired])
  return searchInput
}