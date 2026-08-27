import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {ZoomImage} from "@/components/standalonePages/portfolioPro/zoomImage";
import {portfolioAPIURL} from "@/components/standalonePages/portfolio/data/dataManager";
import {ReactNode} from "react";


type MainTextProps = {
  text: string
  images?: {[key: string]: string}
  lede?: boolean
}

const imageToken = /^\{%\s*([^%]+?)\s*%\}$/
const partHeading = /^PART\s+\d+\s*·/i
// Section headings are written in caps in the project data ("SCOPE", "3 · CORRECTNESS...").
const isSectionHeading = (line: string) =>
  line.length < 70 && /[A-Z]/.test(line) && line === line.toUpperCase() && !/[.?!]$/.test(line)

// The API returns image paths relative to its own origin.
const absolute = (src: string) => src.startsWith("http") ? src : `${portfolioAPIURL}${src}`

// A line of "·"-separated figures (the SCALE sections) reads better as a strip
// of numbers than as a sentence. Anything less regular stays a paragraph.
const statParts = (line: string) => {
  const parts = line.replace(/\.$/, "").split("·").map((p) => p.trim()).filter(Boolean)
  if (parts.length < 3) return undefined
  const stats = parts.map((part) => {
    const m = part.match(/^(\S+)\s+(.+)$/)
    return m && /\d/.test(m[1]) ? {value: m[1], label: m[2]} : {value: "", label: part}
  })
  return stats.every((st) => st.value) ? stats : undefined
}

const humanize = (key: string) => {
  const words = key.replace(/[_-]+/g, " ").trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export const MainText = ({text, images = {}, lede}: MainTextProps) => {
  const blocks: ReactNode[] = []
  let paragraph = 0

  text.split("\n").forEach((raw, i) => {
    const line = raw.trim()
    if (!line) return

    const img = line.match(imageToken)
    if (img) {
      const key = `{% ${img[1]} %}`
      const src = images[key] ?? images[img[1]]
      if (src) blocks.push(<ZoomImage key={i} src={absolute(src)} alt={humanize(img[1])} caption={humanize(img[1])}/>)
      return
    }

    if (partHeading.test(line)) {
      blocks.push(<h2 className={styles.partHeading} key={i}>{line.replace(partHeading, "").trim()}</h2>)
      return
    }

    if (isSectionHeading(line)) {
      blocks.push(<h3 className={styles.sectionHeading} key={i}>{line}</h3>)
      return
    }

    const stats = line.includes("·") ? statParts(line) : undefined
    if (stats) {
      blocks.push(
        <div className={styles.statStrip} key={i}>
          {stats.map((st) => (
            <div key={st.label}>
              <span className={styles.statValue}>{st.value}</span>
              <span className={styles.statLabel}>{st.label}</span>
            </div>
          ))}
        </div>
      )
      return
    }

    paragraph += 1
    const first = lede && paragraph === 1
    blocks.push(<p className={first ? styles.lede : styles.paragraph} key={i}>{line}</p>)
  })

  return <>{blocks}</>
}
