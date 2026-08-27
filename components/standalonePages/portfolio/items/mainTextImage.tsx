import styles from "@/components/standalonePages/portfolio/items/items.module.css";
import {useEffect, useState} from "react";
import {createPortal} from "react-dom";


type MainTextImageProps = {
  src: string
  alt: string
}

export const MainTextImage = ({src, alt}:MainTextImageProps) => {
  const [zoomed, setZoomed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!zoomed) return
    const close = (e:KeyboardEvent) => {if (e.key == "Escape") setZoomed(false)}
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [zoomed])

  return (
    <>
      <img
        className={styles.mainTextImage}
        src={src}
        alt={alt}
        onClick={() => setZoomed(true)}
      />
      {zoomed && mounted ? createPortal(
        <div className={styles.imageZoom} onClick={() => setZoomed(false)}>
          <img className={styles.imageZoomImage} src={src} alt={alt}/>
        </div>,
        document.body
      ) : null}
    </>
  )
}
