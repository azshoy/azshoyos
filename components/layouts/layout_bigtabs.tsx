import styles from '@/globalStyles/bigtab.module.css'

import {Scaler} from "@/components/layouts/components/scaler";
import {Header} from "@/components/layouts/components/header";

import {ReactNode, useEffect, useRef, useState} from "react";
import {cls} from "@/util/misc";
import {useRouter} from "next/router";
import {emitSignal, useConnectedSignal} from "@/components/standalonePages/portfolio/signals";

export type BigLayoutPage = {(): ReactNode, tab: TabComponents}

export type TabComponentStyling = {styleModule?: Record<string, string>, styleClass: string}
type TabComponents = {
  styling?: TabComponentStyling
  active: ReactNode,
  inactive: ReactNode,
  staticContent?: {
    before?: ReactNode
    after?: ReactNode
  }
}
type BigTapLayoutProps<T extends string> = {
  active: T
  components: {
    [K in T]: TabComponents
  }
  reRoute?: boolean
}

export const BigTabLayout = <T extends string>({active:initialActive, components}:BigTapLayoutProps<T>) => {
  const [active, setActive] = useState<T>(initialActive)
  const router = useRouter()
  const switchTab = (p:T) => {
    const sel = Array.isArray(router.query.selection) ? router.query.selection[0] : router.query.selection
    router.push({pathname: router.pathname, query: {selection: "?"}}, "/" + p + "", {shallow: true}).then()
    setActive(p)

  }
  return (
    <>
      <Header headerProps={{title: `${active}.az.sh`}} layoutDefault={{description: `az.sh - ${active} portal`}}/>
      <Scaler className={styles.main}>
        {Object.entries(components).map(([k, c]) =>
          <TabComponent key={k} isActive={active == k} {...(c as TabComponents)} activate={() => switchTab(k as T)}/>
        )}
      </Scaler>
    </>
  );
}

export const BigTabProgram = <T extends string>({active:initialActive, components}:BigTapLayoutProps<T>) => {
  const [active, setActive] = useState<T>(initialActive)
  const switchTab = (p:T) => {
    setActive(p)
  }
  return (
    <div className={styles.programMain}>
      {Object.entries(components).map(([k, c]) =>
        <TabComponent key={k} isActive={active == k} {...(c as TabComponents)} activate={() => switchTab(k as T)}/>
      )}
    </div>
  );
}

type TabComponentProps = {
  isActive: boolean,
  activate: CallableFunction
} & TabComponents

const TabComponent = ({
  isActive,
  active,
  activate,
  inactive,
  staticContent,
  styling,
}:TabComponentProps) => {
  const styleModule = styling?.styleModule || {}
  const [animating, setAnimating] = useState<boolean>(false)
  const [firstLoad, setFirstLoad] = useState<boolean>(true)
  const [disable, setDisable] = useState<boolean>(false)
  useEffect(()=> {
    if (!firstLoad) setAnimating(true)
    if (!isActive){
      const timer = setTimeout(() => setDisable(true), 2000)
      return () => clearTimeout(timer)
    } else {
      setDisable(false)
    }
  }, [isActive, firstLoad])
  useEffect(()=> {
    if (animating){
      const timer = setTimeout(() => setAnimating(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [animating])
  const onClick = (a:boolean) => {
    if (!a) return
    emitSignal('tabChanged', {})
    setFirstLoad(false)
    activate()
  }
  const ref = useRef<HTMLDivElement>(null)
  const scroll = useConnectedSignal("scrollToTop")
  useEffect(() => {
    if (ref.current && scroll.fired) {
      console.log("scrolling")
      ref.current.scrollTo({top: 0, behavior: "smooth"})
    }
  }, [ref, scroll.fired])
  return (
    <div className={cls(styles.mainTab, styling?.styleClass, styleModule.mainTab, firstLoad ? cls(styles.firstLoad, styleModule.firstLoad) : undefined, animating ? cls(styles.animating, styleModule.animating) : undefined, isActive ? cls(styles.active, styleModule.active) : cls(styles.inactive, styleModule.inactive))} onClick={() => onClick(!isActive)}>
      {staticContent?.before ? <div className={cls(styles.static, styleModule.static)}>{staticContent.before}</div> : null}
      <div className={cls(styles.dynamicContent, styleModule.dynamicContent)}>
        <div ref={ref} className={cls(styles.activeTab, styleModule.activeTab)} style={disable ? {display: 'none'} : {}}>
          {active}
        </div>
        <div className={cls(styles.inactiveTab, styleModule.inactiveTab)}>
          {inactive}
        </div>
      </div>
      {staticContent?.after ? <div className={cls(styles.static, styleModule.static)}>{staticContent.after}</div> : null}
    </div>
  )
}


export default BigTabLayout

