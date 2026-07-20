import styles from "@/components/standalonePages/portfolio/wordbyword/wbw.module.css";
import {CSSProperties} from "react";


type WordByWordProps = {
  lines: string[],
  delay: number,
  startDelay: number,
}
export const WordByWord = ({
  lines,
  delay,
  startDelay
}:WordByWordProps) => {
  let index = 0
  return lines.map((l,i) => {
    const words = l.replaceAll(" ", "| ").split("|")
    index += words.length + (i > 0 ? 2 : 0)
    return [
      i > 0 ? <br key={"br" + (index - words.length).toString()}/> : null,
      ...words.map((w, j) => {
        return <span className={styles.wbw} key={index - words.length + j} style={{"--wordDuration": delay*2, "--wordDelay": (index - words.length + j) * delay + startDelay} as CSSProperties}>{w}</span>
      })
    ]
  })
}