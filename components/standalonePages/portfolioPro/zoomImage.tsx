import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {useEffect, useState} from "react";
import {createPortal} from "react-dom";


type ZoomImageProps = {
  src: string
  alt: string
  caption?: string
}

export const ZoomImage = ({src, alt, caption}: ZoomImageProps) => {
  const [zoomed, setZoomed] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!zoomed) return
    const close = (e: KeyboardEvent) => {if (e.key == "Escape") setZoomed(false)}
    window.addEventListener("keydown", close)
    return () => window.removeEventListener("keydown", close)
  }, [zoomed])

  return (
    <figure className={styles.figure}>
      <img
        className={styles.figureImage}
        src={src}
        alt={alt}
        loading="lazy"
        onClick={() => setZoomed(true)}
      />
      {caption ? <figcaption className={styles.figureCaption}>{caption}</figcaption> : null}
      {zoomed && mounted ? createPortal(
        <div className={styles.zoom} onClick={() => setZoomed(false)}>
          <img className={styles.zoomImage} src={src} alt={alt}/>
        </div>,
        document.body
      ) : null}
    </figure>
  )
}
