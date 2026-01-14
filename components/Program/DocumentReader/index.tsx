import {ContentImage, Readable, readableFiles} from "@/components/Program/DocumentReader/ReadableFiles";
import styles from "../program.module.css";
import {useRef} from "react";

export type DocumentReaderTypes = {
  windowComponent: typeof DocumentReader
  parameters: DocumentReaderProps
}

export type DocumentReaderProps = {
  file?: string[] | string
  downloadable?: boolean
  filename: string
}
export const DocumentReader = ({
  file = [],
  downloadable = false,
  filename,
}:DocumentReaderProps) => {
  const container = useRef<HTMLDivElement>(null)

  const downloadContent = () => {
    if (container && container.current) {
      const content:string[] = []
      for (const child of container.current.children) {
        content.push(child.innerHTML.replaceAll("&lt;", "<").replaceAll("&gt;", ">"))
      }
      const link = document.createElement("a");
      const f = new Blob(content, { type: 'text/plain' });
      link.href = URL.createObjectURL(f);
      link.download = filename;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }
  return (
    <div className={styles.document}>
      {downloadable ?
        <div className={styles.toolbar}>
          <div className={styles.spacer}></div>
          <div className={styles.toolbarButton} onClick={() => downloadContent()}>
            Transfer File <img src={'/icons/download.svg'} alt={''} className={[styles.icon, styles.unhidden].join(" ")}/><img src={'/icons/download_hover.svg'} alt={''} className={[styles.icon, styles.hidden].join(" ")}/> <span className={styles.faded}>(Download)</span>
          </div>
        </div>: null
      }
      <div className={styles.container} ref={container}>
        {getContents(Array.isArray(file) ? file : [file])}
      </div>
    </div>
  )
}

const getContents = (parameters:string[])=> {
  const content = []
  for (let p = 0; p < parameters.length; p++){
    content.push(getContent(parameters[p], p))
  }
  return content
}
const getContent = (parameter:string, p:number)=> {
  const content = readableFiles[parameter]
  if (!content) return <div key={p} className={styles.content}>{parameter}</div>
  return (
    <div key={p} className={getClassName(content.type)}>
      {content.type == "image" ? getImage(content.content) : content.content}
    </div>
  )
}
const getImage = (ci:ContentImage) => {
 return (
  <div className={styles.imageHolder}>
    <img src={ci.src} alt={ci.alt ?? ""}/>
  </div>
 )
}
const getClassName = (t: Readable['type']) => {
  switch (t) {
    case "json":
    case "python":
      return [styles.content, styles.code].join(" ")
    default:
      return styles.content
  }
}

