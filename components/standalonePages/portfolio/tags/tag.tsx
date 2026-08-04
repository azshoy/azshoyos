import styles from "@/components/standalonePages/portfolio/items/items.module.css";
import {useEffect, useMemo, useState} from "react";
import {useSearchInput} from "@/components/standalonePages/portfolio/searchbar/searchbar";
import {cls} from "@/util/misc";
import {emitSignal} from "@/components/standalonePages/portfolio/signals";


type TagProps = {
  tag: string,
  target: string
}

export const Tag = ({tag, target}:TagProps) => {

  const search = useSearchInput(target)
  const [selected, setSelected] = useState(false)
  useEffect(() => {
    const raw = " " + search.raw.replaceAll("/", " ").toLowerCase() + " "
    const t = " " + tag.toLowerCase() + " "
    setSelected(raw.includes(t))
  }, [search.timestamp, search.raw, tag])
  const onTagClick = (s:boolean) => {
    if (!s) {
      emitSignal(target + 'AddTag', {value: tag})
    } else {
      emitSignal(target + 'RemoveTag', {value: tag})
    }
  }
  return <div onClick={() => onTagClick(selected)} className={cls(styles.tag, selected ? styles.selectedTag : "")}>{tag}</div>
}