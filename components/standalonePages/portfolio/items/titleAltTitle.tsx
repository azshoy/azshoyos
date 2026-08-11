import mainStyles from "@/components/standalonePages/portfolio/portfolio.module.css";
import styles from "@/components/standalonePages/portfolio/items/items.module.css";

type TitleAltTitleProps = {
  title: string,
  altTitle?: string | null
}

export const TitleAltTitle = ({
  title,
  altTitle
}:TitleAltTitleProps) => {
  if (!altTitle) return (
    <div className={styles.title}>{title}</div>
  )
  return (
    <div className={styles.titleAltTitle}>
      <div className={styles.title}>{title}</div>
      <div className={styles.altTitle}>{altTitle}</div>
    </div>
  )
}

