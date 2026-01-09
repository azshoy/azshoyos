import styles from "../program.module.css";
import {readableFiles} from "@/components/Program/DocumentReader/ReadableFiles";


export type DocumentReaderTypes = {
  windowComponent: typeof DocumentReader
  parameters: DocumentReaderProps
}

export type DocumentReaderProps = {
  file?: string[] | string
}
export const DocumentReader = ({
  file = []
}:DocumentReaderProps) => {
  return (
    <div className={styles.document}>
      {getContents(Array.isArray(file) ? file : [file])}
    </div>
  )
}

const getContents = (parameters:string[])=> {
  const content = []
  for (let p = 0; p < parameters.length; p++){
    content.push(<div key={p}>{getContent(parameters[p])}</div>)
  }
  return content
}
const getContent = (parameter:string)=> {
  const content = readableFiles[parameter]
  return (typeof content != 'undefined') ? content : parameter

}

