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
  const [inputValue, setInputValue] = useState<string>("")
  const [resended, setResended] = useState(0)
  const resend = useConnectedSignal<object>(target + 'resendSearchValue')
  useEffect(() => {
    if (resend.fired != resended) {
      setResended(resend.fired)
      emitSignal(target + 'SearchUpdated', {value: inputValue})
    }
  }, [resend.fired, inputValue])

  const [tagAdded, setTagAdded] = useState(0)
  const addTag = useConnectedSignal<{value: string}>(target + 'AddTag')

  useEffect(() => {
    if (addTag.fired != tagAdded && addTag.output?.value) {
      setTagAdded(addTag.fired)
      if (inputValue != "") {
        updateInputValue(inputValue + " / " + addTag.output.value)
      } else {
        updateInputValue(addTag.output.value)
      }
    }
  }, [addTag.fired, addTag.output?.value, tagAdded, inputValue])

  const [tagRemoved, setTagRemoved] = useState(0)
  const removeTag = useConnectedSignal<{value: string}>(target + 'RemoveTag')


  useEffect(() => {
    if (removeTag.fired != tagRemoved && removeTag.output?.value) {
      setTagRemoved(removeTag.fired)
      if (inputValue.includes(" / " + removeTag.output.value)) {
        updateInputValue(inputValue.replace(" / " + removeTag.output.value, ""))
      } else if (inputValue.includes(" " + removeTag.output.value)) {
        updateInputValue(inputValue.replace(" " + removeTag.output.value, ""))
      } else if (inputValue.includes(removeTag.output.value)) {
        updateInputValue(inputValue.replace(removeTag.output.value, ""))
      }

    }
  }, [removeTag.fired, removeTag.output?.value, tagRemoved, inputValue])

  const onInput = (e:ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value != inputValue) updateInputValue(value, false)
  }
  const updateInputValue = (value: string, finalize = true) => {
    setInputValue(value)
    const words = value.split(" ")
    setHasInput(words[words.length-1].trim() !== "")
    if (words.length > 1) {
      setPreVal(words.slice(0, words.length-1).join(" "))
    } else {
      setPreVal("")
    }
    if (typeof target == 'undefined') return
    emitSignal(target + 'SearchUpdated', {value: value})
    if (finalize) finalizeSearch()
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
          }} value={inputValue}/>
        <img src={'/portfolio/icons/search.svg'} alt={'Search'} onClick={() => finalizeSearch()}/>
      </div>
      <datalist id={id+"-suggestions"}>
        {hasInput ? keywords.map((k) => <option key={k} value={preVal + (preVal ? " " : "") + k}/>) : null}
      </datalist>
    </div>
  )
}

export const useSearchInput = (target: PortfolioPageTarget, callOnInit=false) => {
  const [searchInput, setSearchInput] = useState<{words: string[][], timestamp: number, finalized: boolean, raw: string}>({words: [], timestamp: 0, finalized: true, raw: ""})
  const update = useConnectedSignal<{value: string}>(target + 'SearchUpdated')
  const finalized = useConnectedSignal<{value: string}>(target + 'SearchFinalized')
  useEffect(() => {
    if (callOnInit) {
      emitSignal(target + 'resendSearchValue')
    }
  }, [])
  useEffect(() => {
    const v = update.output?.value
    if (typeof v !== 'undefined' && v != searchInput.raw){
      const timer = setTimeout(() => {
        const ands = v.trim().replace(/\/\s+/g, "/").replace(/\s+\//g, "/").split(" ")
        const words = ands.map((s) => s.split("/"))
        //console.log(words)
        setSearchInput({words: words, timestamp: update.fired, finalized: finalized.fired >= update.fired, raw: v})
      }, 500)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [update.fired, update.output, finalized.fired, searchInput.raw])
  return searchInput
}