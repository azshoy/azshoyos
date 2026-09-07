import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {Avatar} from "@/components/standalonePages/portfolioPro/avatar";
import {TagList} from "@/components/standalonePages/portfolioPro/tags";
import {ItemDict, IDdAndKeyWorded} from "@/components/standalonePages/portfolio/types";
import {portfolioAPIURL} from "@/components/standalonePages/portfolio/data/dataManager";
import {cls} from "@/util/misc";
import Image from "next/image";
import Link from "next/link";
import {useRouter} from "next/router";
import {CSSProperties, useEffect, useMemo, useRef, useState} from "react";


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
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [tag, setTag] = useState("")
  const all = useMemo(() => Object.values(items), [items])
  // Tag filters arrive in the URL, so a filtered list stays shareable and the
  // back button undoes a tag click. The box itself is free text as before.
  const urlTag = typeof router.query.tag === 'string' ? router.query.tag : ""
  const [filterOpen, setFilterOpen] = useState(false)
  useEffect(() => {
    setTag(urlTag)
    setQuery(urlTag)
    if (urlTag) setFilterOpen(true)
  }, [urlTag])

  const searchRef = useRef<HTMLInputElement>(null)

  const clearFilter = () => {
    setQuery("")
    if (tag) router.replace({query: {}}, undefined, {shallow: true, scroll: false})
    searchRef.current?.focus()
  }

  const selectTag = (value: string) => {
    const next = value === tag ? "" : value
    router.push(next ? {query: {tag: next}} : {query: {}}, undefined, {shallow: true, scroll: false})
  }

  // Projects have no filter box of their own, but a tag arriving from a detail
  // page needs somewhere to show up and be cleared. Once opened it stays, so
  // emptying the box does not pull the input out from under the cursor.
  const showFilter = target === 'people' || filterOpen


  // One placeholder per expected card: nine people, three case studies.
  const placeholders = target === 'people' ? 9 : 3

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return all
    // Tag keywords are stored with underscores for spaces, so "Smart contract
    // architecture" has to be matched in both forms.
    const underscored = q.replace(/\s+/g, "_")
    return all.filter((i) => i.keywords.some((k) => k.includes(q) || k.includes(underscored)))
  }, [all, query])

  return (
    <>
      <div className={styles.pageHead}>
        <h1 className={styles.pageTitle}>{title}</h1>
        <p className={styles.pageLede}>{lede}</p>
      </div>

      {showFilter ? (
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <input
              className={styles.search}
              ref={searchRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                if (tag) router.replace({query: {}}, undefined, {shallow: true, scroll: false})
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape' && query) clearFilter()
              }}
              placeholder={`Filter ${target}…`}
              aria-label={`Filter ${target}`}
              disabled={all.length === 0}
            />
            <button
              className={cls(styles.searchClear, query ? styles.searchClearShown : undefined)}
              type={"button"}
              onClick={clearFilter}
              aria-label={"Clear filter"}
              tabIndex={query ? 0 : -1}
              aria-hidden={!query}
            >
              <svg viewBox={"0 0 16 16"} aria-hidden={true} fill={"none"} stroke={"currentColor"} strokeWidth={1.6} strokeLinecap={"round"}>
                <path d={"M4.5 4.5l7 7M11.5 4.5l-7 7"}/>
              </svg>
            </button>
          </div>
          <span className={styles.count}>{all.length > 0 ? `${shown.length} of ${all.length}` : "\u00a0"}</span>
        </div>
      ) : null}

      {all.length === 0 ? (
        <div className={styles.loadingGrid} aria-label={`Loading ${target}`}>
          {Array.from({length: placeholders}).map((_, n) => (
            <div className={cls(styles.loadingCard, target === 'projects' ? styles.loadingCardProject : '')} key={n}/>
          ))}
        </div>
      ) : null}
      {all.length > 0 && shown.length === 0 ? <p className={styles.empty}>Nothing matches “{query}”.</p> : null}

      <div className={styles.grid} aria-live={"polite"}>
        {shown.map((item, n) => (
          // Cards cascade in on mount, the way they did when the list was
          // fetched in the browser. Filtering only remounts what actually
          // changed, so surviving cards sit still.
          <div className={styles.card} key={item.id} style={{'--index': n} as CSSProperties}>
            {target === 'projects' ? (
              <div className={styles.cardCover}>
                {coverImage(item) ? (
                  // Vector covers skip the optimizer, which refuses SVG.
                  coverImage(item)!.split("?")[0].endsWith(".svg") ? (
                    <img className={styles.cardCoverImage} src={coverImage(item)} alt="" loading="lazy"/>
                  ) : (
                    <Image
                      className={styles.cardCoverImage}
                      src={coverImage(item)!}
                      alt=""
                      fill={true}
                      sizes={"(max-width: 40rem) 100vw, 21rem"}
                      loading="lazy"
                    />
                  )
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
                <div className={styles.cardTitle}>
                  <Link className={styles.cardLink} href={`/portfolio/${target}/${item.id}`}>{item.title}</Link>
                </div>
                {item.subtitle ? <div className={styles.cardSubtitle}>{item.subtitle}</div> : null}
              </div>
            </div>
            {item.description ? <p className={styles.cardBody}>{item.description}</p> : null}
            <TagList tags={item.tags} limit={3} onSelect={selectTag} active={tag}/>
          </div>
        ))}
      </div>
    </>
  )
}
