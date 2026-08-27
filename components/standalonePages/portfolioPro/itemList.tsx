import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {Avatar} from "@/components/standalonePages/portfolioPro/avatar";
import {TagList} from "@/components/standalonePages/portfolioPro/tags";
import {ItemDict, IDdAndKeyWorded} from "@/components/standalonePages/portfolio/types";
import {portfolioAPIURL} from "@/components/standalonePages/portfolio/data/dataManager";
import {cls} from "@/util/misc";
import Link from "next/link";
import {useMemo, useState} from "react";


type ItemListProps = {
  items: ItemDict
  target: 'projects' | 'people'
  title: string
  lede: string
}

// A project's first screenshot doubles as its card cover. The image map comes
// back key-sorted from the API, so the lead image is taken from the order the
// write-up places them in. Text-only entries keep the plain card.
const coverImage = (item: IDdAndKeyWorded) => {
  const images = item.mainTextImages ?? {}
  const token = item.mainText?.match(/\{%\s*[^%]+?\s*%\}/)?.[0]
  const src = (token && images[token]) || Object.values(images)[0]
  if (!src) return undefined
  return src.startsWith("http") ? src : `${portfolioAPIURL}${src}`
}

export const ItemList = ({items, target, title, lede}: ItemListProps) => {
  const [query, setQuery] = useState("")
  const all = useMemo(() => Object.values(items), [items])
  const showFilter = target === 'people'

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

      {showFilter ? (
        <div className={styles.toolbar}>
          <input
            className={styles.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Filter ${target}…`}
            aria-label={`Filter ${target}`}
            disabled={all.length === 0}
          />
          <span className={styles.count}>{all.length > 0 ? `${shown.length} of ${all.length}` : "\u00a0"}</span>
        </div>
      ) : null}

      {all.length === 0 ? (
        <div className={styles.loadingGrid} aria-label={`Loading ${target}`}>
          {[0, 1, 2].map((n) => (
            <div className={cls(styles.loadingCard, target === 'projects' ? styles.loadingCardProject : '')} key={n}/>
          ))}
        </div>
      ) : null}
      {all.length > 0 && shown.length === 0 ? <p className={styles.empty}>Nothing matches “{query}”.</p> : null}

      <div className={styles.grid} aria-live={"polite"}>
        {shown.map((item) => (
          <Link className={styles.card} key={item.id} href={`/portfolio/${target}/${item.id}`}>
            {target === 'projects' ? (
              <div className={styles.cardCover}>
                {coverImage(item) ? (
                  <img className={styles.cardCoverImage} src={coverImage(item)} alt="" loading="lazy"/>
                ) : (
                  <div className={styles.cardCoverFallback}>
                    <Avatar src={item.icon} name={item.title} size={'lg'} kind={'project'}/>
                  </div>
                )}
              </div>
            ) : null}
            <div className={styles.cardHead}>
              <Avatar src={item.icon} name={item.title} size={target === 'people' ? 'md' : 'sm'} kind={target === 'people' ? 'person' : 'project'}/>
              <div>
                <div className={styles.cardTitle}>{item.title}</div>
                {item.subtitle ? <div className={styles.cardSubtitle}>{item.subtitle}</div> : null}
              </div>
            </div>
            {item.description ? <p className={styles.cardBody}>{item.description}</p> : null}
            <TagList tags={item.tags} limit={3}/>
          </Link>
        ))}
      </div>
    </>
  )
}
