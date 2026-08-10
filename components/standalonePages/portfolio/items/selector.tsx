import mainStyles from '@/components/standalonePages/portfolio/portfolio.module.css'
import styles from '@/components/standalonePages/portfolio/items/items.module.css'
import {CSSProperties, useEffect, useMemo, useState} from "react";
import {
  IDdAndKeyWorded,
  ItemDict,
  ListItem,
  PortfolioPageTarget,
  PortfolioSpecifiedData
} from "@/components/standalonePages/portfolio/types";
import {cls} from "@/util/misc";
import {emitSignal, useConnectedSignal} from "@/components/standalonePages/portfolio/signals";
import {useSearchInput} from "@/components/standalonePages/portfolio/searchbar/searchbar";
import {WordByWord} from "@/components/standalonePages/portfolio/wordbyword/wordByWord";
import {useRouter} from "next/router";
import {fillInImages} from "@/components/standalonePages/portfolio/items/selected";
import * as sea from "node:sea";
import {Tag} from "@/components/standalonePages/portfolio/tags/tag";


type ItemListProps = {
  list: {values: (IDdAndKeyWorded & PortfolioSpecifiedData)[], found: number}
  target?: PortfolioPageTarget
}
type ItemListGetterProps = {
  dictGetter: () => ItemDict,
  target?: PortfolioPageTarget
}

const useFilteredItemlist = (target:PortfolioPageTarget, dict:ItemDict):ItemListProps['list'] => {
  const search = useSearchInput(target)
  const unfilteredList = Object.values(dict)
  const list = useMemo(() => {
    return unfilteredList.filter((li) => {
      if (search.words.length == 0) return true
      for (let a = 0; a < search.words.length; a++) {
        const orRes = (() => {
          const ors = search.words[a]
          for (let s = 0; s < ors.length; s++) {
            const w = ors[s].toLowerCase()
            if (li.keywords.includes(w)) return true
            if (!search.finalized && a == search.words.length - 1 && s == ors.length - 1) {
              for (let k = 0; k < li.keywords.length; k++) {
                if (li.keywords[k].startsWith(w)) return true
              }
            }
          }
          return false
        })()
        if (!orRes) return false
      }
      return true
    })
  }, [dict, search.timestamp, search.words, search.finalized])
  return {values: list.length > 0 ? list : unfilteredList, found: list.length}
}

export const ItemListGetter = ({
  dictGetter,
  target = 'any'
}:ItemListGetterProps) => {
  const dict = dictGetter()
  const list = useFilteredItemlist(target, dict)
  return <ItemList list={list} target={target}/>
}

export const ItemList = ({
  list,
  target = 'any'
}:ItemListProps) => {
  const [selected, setSelected] = useState<string | null>(null)
  const router = useRouter()
  const [skipAnim, setSkipAnim] = useState<boolean>()
  const search = useSearchInput(target)
  useConnectedSignal('tabChanged', () => onTabChange())
  useEffect(() => {
    if (selected && list.values.findIndex((i) => i.id == selected) == -1) {
      setSelected(null)
    } else {

      emitSignal("scrollToTop")
    }
  }, [selected, list])
  useEffect(() => {
    const selParam = Array.isArray(router.query.selection) ? router.query.selection[0] : router.query.selection
    if (selParam) setSelected(selParam)
  }, [router.query.selection, list])
  useEffect(() => {
    if (search.timestamp != 0) setSkipAnim(true)
  }, [search.timestamp])

  const onTabChange = () => {
    selectItem(null)
    setSkipAnim(false)
  }

  const selectItem = (s: string | null, c?:string | null) => {
    if (s != c) {
      if (s) router.push({
        pathname: router.pathname,
        query: {selection: encodeURI(s)}
      }, "/" + target + "/" + encodeURI(s), {shallow: true}).then()
      emitSignal(target + 'Select', {value: selected})
    }
  }

  return (
    <div className={cls(styles.itemList, skipAnim ? styles.skipAnim : "")}>
      <div className={cls(styles.notFound, list.values.length > 0 && list.found == 0 ? styles.notFoundVisible : "")}>
        {list.values.length > 0 && list.found == 0 ?
          <WordByWord delay={0.08} startDelay={0.5} lines={["Sorry, we didn't find anything matching your search.|||", "Showing everything else instead|.||.||."]}/>
        : null}
      </div>
      {
        list.values.map((i, index) =>
          <ItemSelector key={i.id} {...i} target={target} index={index} isSelected={selected==i.id} onSelect={() => selectItem(i.id, selected)}/>
        )
      }
      <div className={styles.dummy}></div>
      <div className={styles.dummy}></div>
      <div className={styles.dummy}></div>
    </div>
  )
}

type ItemSelectorProps = ListItem & {
  index: number
  isSelected: boolean
  onSelect: CallableFunction
  target: string
}


const ItemSelector = ({
  title,
  subtitle,
  icon,
  description,
  tags,
  index,
  isSelected,
  onSelect,
  target,
}:ItemSelectorProps) => {
  return (
    <div className={cls(mainStyles.container, mainStyles.itemSelector, styles.itemSelector, isSelected ? styles.selected : "")} style={{'--index': index} as CSSProperties} onClick={() => onSelect()}>
      <div className={styles.content}>
      <div className={styles.title}>{title}</div>
      <div className={cls(styles.icon, styles.subcontainer)}>
        <img src={icon} alt={`Picture of ${title}`}/>
        <div className={styles.imageHolder}>
          <img src={icon} alt={``}/>
        </div>
      </div>
      {subtitle ? <div className={styles.subtitle}>{subtitle}</div> : null}
      {description ? <div className={styles.description}>{fillInImages(description)}</div> : null}
      <div className={styles.taglist}>
        {["skills", "stack", "interests"].map((tt) => tags[tt] && tags[tt].length > 0 ? tags[tt].map((t) => <Tag key={t} tag={t} target={target}/>) : null)}
      </div>
        </div>
    </div>
  )
}


