import {ContentImage, Readable, readableFiles} from "@/components/azshoyos/Program/DocumentReader/ReadableFiles";
import styles from "../program.module.css";
import {CSSProperties, useEffect, useRef, useState} from "react";
import {apps} from "@/components/azshoyos/Program/AppWindow/apps/apps";

export type AppWindowTypes = {
  windowComponent: typeof AppWindow
  parameters: AppWindowProps
}

export type AppWindowProps = {
  appId: keyof typeof apps
}
export const AppWindow = ({
  appId,
}:AppWindowProps) => {
  const windowRef = useRef<HTMLDivElement | null>(null)
  const [windowSize, setWindowSize] = useState<{x: number, y: number} | undefined>(undefined)

  const onResize = (entries:ResizeObserverEntry[]) => {
    entries.forEach((e) => {
      setWindowSize({x: e.contentRect.width, y: e.contentRect.height})
    })
  }
  useEffect(() => {
    const resizeObserver = new ResizeObserver(onResize);
    if (windowRef && windowRef.current){
      resizeObserver.observe(windowRef.current);
    }
    return () => {
      if (windowRef && windowRef.current) {
        resizeObserver.unobserve(windowRef.current)
      }
    }
  }, [windowRef])

  return (
    <div ref={windowRef} className={styles.app} style={typeof windowSize != "undefined" ? {"--window-x": `${windowSize.x}px`, "--window-y": `${windowSize.y}px`} as CSSProperties : {}}>
      {apps[appId].app}
    </div>
  )
}
