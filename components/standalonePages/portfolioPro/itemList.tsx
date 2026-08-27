import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {Avatar} from "@/components/standalonePages/portfolioPro/avatar";
import {TagList} from "@/components/standalonePages/portfolioPro/tags";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import Link from "next/link";
import {useMemo, useState} from "react";


type ItemListProps = {
  items: ItemDict
  target: 'projects' | 'people'
  title: string
  lede: string
}

export const ItemList = ({items, target, title, lede}: ItemListProps) => {
  const [query, setQuery] = useState("")
  const all = useMemo(() => Object.values(items), [items])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return all
    return all.filter((i) => i.keywords.some((k) => k.includes(q)))
  }, [all, query])

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageLede}>{lede}</p>
      </div>

      <div className={styles.toolbar}>
        <input
          className={styles.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Filter ${target}…`}
          aria-label={`Filter ${target}`}
        />
        <span className={styles.count}>{shown.length} of {all.length}</span>
      </div>

      {all.length === 0 ? <p className={styles.empty}>Loading…</p> : null}
      {all.length > 0 && shown.length === 0 ? <p className={styles.empty}>Nothing matches “{query}”.</p> : null}

      <div className={styles.grid}>
        {shown.map((item) => (
          <Link className={styles.card} key={item.id} href={`/portfolio/${target}/${item.id}`}>
            <div className={styles.cardHead}>
              <Avatar src={item.icon} name={item.title}/>
              <div>
                <div className={styles.cardTitle}>{item.title}</div>
                {item.subtitle ? <div className={styles.cardSubtitle}>{item.subtitle}</div> : null}
              </div>
            </div>
            {item.description ? <p className={styles.cardBody}>{item.description}</p> : null}
            <TagList tags={item.tags} limit={5}/>
          </Link>
        ))}
      </div>
    </>
  )
}
