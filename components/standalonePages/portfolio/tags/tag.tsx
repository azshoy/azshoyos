import styles from "@/components/standalonePages/portfolio/items/items.module.css";
import {useEffect, useMemo, useState} from "react";
import {useSearchInput} from "@/components/standalonePages/portfolio/searchbar/searchbar";
import {cls} from "@/util/misc";
import {emitSignal} from "@/components/standalonePages/portfolio/signals";


type TagProps = {
  tag: string,
  target: string
}

const checkSelected = (s: string, t: string) => {
  const raw = " " + s.replaceAll("/", " ").toLowerCase() + " "
  const tag = " " + t.replaceAll(" ", "_").toLowerCase() + " "
  return raw.includes(tag)
}

export const Tag = ({tag, target}:TagProps) => {

  const search = useSearchInput(target, true)
  const [selected, setSelected] = useState(checkSelected(search.raw, tag))
  useEffect(() => {
    setSelected(checkSelected(search.raw, tag))
  }, [search.timestamp, search.raw, tag])
  const onTagClick = (e:React.MouseEvent, s:boolean) => {
    e.preventDefault()
    e.stopPropagation()
    if (!s) {
      emitSignal(target + 'AddTag', {value: tag.replaceAll(" ", "_")})
    } else {
      emitSignal(target + 'RemoveTag', {value: tag.replaceAll(" ", "_")})
    }
  }
  return <div onClickCapture={(e) => onTagClick(e, selected)} className={cls(styles.tag, selected ? styles.selectedTag : "")}>{tag}</div>
}