import styles from "@/components/standalonePages/portfolioPro/pro.module.css";


type TagListProps = {
  tags: {[key: string]: string[]}
  limit?: number
}

export const flattenTags = (tags: {[key: string]: string[]}) =>
  Object.values(tags ?? {}).flat()

export const TagList = ({tags, limit}: TagListProps) => {
  const all = flattenTags(tags)
  if (all.length === 0) return null
  const shown = limit ? all.slice(0, limit) : all
  const rest = all.length - shown.length

  return (
    <div className={styles.tags}>
      {shown.map((t) => <span className={styles.tag} key={t}>{t}</span>)}
      {rest > 0 ? <span className={styles.tagMore}>+{rest}</span> : null}
    </div>
  )
}
