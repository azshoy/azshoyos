import {cls} from "@/util/misc";
import mainStyles from "@/components/standalonePages/portfolio/portfolio.module.css";
import styles from "@/components/standalonePages/portfolio/items/items.module.css";
import {
  IDdAndKeyWorded,
  ItemDict,
  ListItem,
  PortfolioSpecifiedData
} from "@/components/standalonePages/portfolio/types";
import {useRouter} from "next/router";
import {ReactNode, useEffect, useMemo, useState} from "react";
import {portfolioAPIURL} from "@/components/standalonePages/portfolio/data/dataManager";
import {Tag} from "@/components/standalonePages/portfolio/tags/tag";



type SelectedItemProps = {
  data: ItemDict
  target: string
}
type Sel<T> = undefined | null | keyof T
type SelHist<T> = [Sel<T>,Sel<T>,Sel<T>]

export const SelectedItem = ({
  data,
  target
}:SelectedItemProps) => {
  const router = useRouter()
  const [selections, setSelections] = useState<SelHist<typeof data>>([undefined, undefined, undefined])
  const [firstLoad, setFirstLoad] = useState(true)
  const [fullyOpen, setFullyOpen] = useState<boolean>(false)

  useEffect(() => {
    if (data) {
      const selParam = Array.isArray(router.query.selection) ? router.query.selection[0] : router.query.selection
      const selected: Sel<typeof data> = selParam && selParam != "?" ? selParam in data ? selParam : null : undefined
      if (selected != selections[0]) {
        setFullyOpen(firstLoad && router.pathname.includes("[selection]"))
        if (firstLoad) setFirstLoad(false)
        console.log(router.pathname, router.asPath, router.basePath, router.route)
        setSelections([selected, selections[0], selected == selections[1] ? undefined : selections[1]])
        console.log(Date.now(), selected, selections[0], selected == selections[1] ? undefined : selections[1])
      }
    }
  }, [selections, router.query.selection, data, firstLoad])

  useEffect(() => {
    console.log("???", fullyOpen)
  }, [fullyOpen])

  const closeItem = () => {
    router.push({pathname: router.pathname, query: {selection: "?"}}, "/" + target + "/", {shallow: true}).then()
  }
  const fullOpen = () => {
    setFullyOpen(true)
  }

  return (
    <div className={cls(styles.fullItemRow, selections[0] ? styles.visible : typeof selections[0] == 'undefined' ? styles.hidden : styles.small, fullyOpen ? styles.fullOpen : '')}>
      {
        selections.map((s, i) =>
          s ?
            <Slide key={s} show={i == 0}>
              <FullItem data={data[s]} target={target} closeItem={closeItem} fullOpen={fullOpen}/>
            </Slide>
            : i < 2 && typeof s !== 'undefined' ?
              <Slide key={'notFound'} show={i == 0}>
                <div className={styles.notFoundText}>
                  {`Could not find ${router.query.selection} from ${target}. :(`}
                </div>
              </Slide>
              : null
        )
      }
    </div>
  )
}

type SlideProps = {
  show: boolean,
  children: ReactNode,
}
const Slide = ({
  show,
  children
}:SlideProps) => {
  const [state, setState] = useState<"show" | "hide" | "disable">(show ? "show" : "disable")
  useEffect(() => {
    console.log("showStateChanged")
    if (!show){
      setState("hide")
      const timer = setTimeout(() => {
        setState('disable')
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setState('show')
    }
  }, [show])
  const statestyle = {
    "show": styles.visible,
    "hide": styles.hidden,
    "disable": styles.disabled
  }[state]
  return (
    <div className={cls(styles.slide, statestyle)}>
      {children}
    </div>
  )
}

type FullItemProps = {
  data: IDdAndKeyWorded & PortfolioSpecifiedData,
  target: string,
  closeItem: CallableFunction,
  fullOpen: CallableFunction
}

const FullItem = ({
  data,
  target,
  closeItem,
  fullOpen,
}:FullItemProps) => {
  const router = useRouter()
  return (
    <div className={cls(mainStyles.container, styles.fullItem)}>
      <div className={styles.buttons}>
        <div className={styles.itemButtonClose} onClick={() => closeItem()}></div>
      </div>
      <div className={styles.content}>
        <div className={cls(styles.icon, styles.subcontainer)}><img src={data.icon} alt={`Picture of ${data.title}`}/></div>
        <div className={styles.info}>
          <div className={styles.title}>{data.title}</div>
          {data.subtitle ? <div className={styles.subtitle}>{data.subtitle}</div> : null}
          {data.mainText ? <div className={styles.description}>{handleMainText(data.mainText, data.mainTextImages)}</div> : null}
          {data.links.map((l, i) =>
            <div key={i.toString()} className={styles.url}><a href={l.url} target={'_blank'}>{l.icon ? <img src={l.icon.startsWith("/") ? `${portfolioAPIURL}${l.icon}` : l.icon} alt={''}/> : null}{l.text}</a></div>
          )}

          <div className={styles.taglist}>
          {["skills", "stack", "interests"].map((tt) => {
            return data.tags[tt] && data.tags[tt].length > 0 ? [
              <div className={styles.tagHead} key={tt}>{tt}</div>,
              ...(data.tags[tt].map((t) => <Tag key={t} tag={t} target={target}/>))
            ] : null
          })}
          </div>
        </div>
      </div>
      <div className={styles.expandButton} onClick={() => fullOpen()}>
        <img src={"/portfolio/icons/expand.svg"} alt={"expand"}/>
      </div>
    </div>
  )

}


export const handleMainText = (txt:string, images: {[key: string]: string} = {}) => {
  const txtContent: ReactNode[] = []
  txt.split("\n").forEach((s, i) => {
    if (i > 0) txtContent.push(<br key={i}/>)
    txtContent.push(fillInImages(s, images))
  })
  return txtContent
}
export const fillInImages = (txt: string, images: {[key: string]: string} = {}) => {
  const textcontent:ReactNode[] = []
  txt.split("{% ").forEach((s:string) => {
    const pt = s.split(" %}")
    if (pt.length == 2) {
      const k = "{% " + pt[0] + " %}"
      if (k in images){
        textcontent.push(<img className={styles.maintextImage} key={pt[0]} src={`${portfolioAPIURL}${images[k]}`} alt={pt[0]}/>)
      }
      textcontent.push(pt[1])
    } else {
      textcontent.push(s)
    }
  })
  return textcontent
}