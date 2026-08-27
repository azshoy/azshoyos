import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {cls} from "@/util/misc";
import {useState} from "react";


type AvatarProps = {
  src?: string
  name: string
  large?: boolean
}

// The API hands out a generic placeholder for items without artwork, and people
// without a photo end up with a ".../undefined" URL. Both become initials.
const isPlaceholder = (src?: string) =>
  !src || src.endsWith("undefined") || src.endsWith("null") || src.endsWith("/default.svg")

const initials = (name: string) => name
  .split(" ")
  .filter((w) => /[a-zA-Z0-9]/.test(w[0] ?? ""))
  .slice(0, 2)
  .map((w) => w[0])
  .join("")

export const Avatar = ({src, name, large}: AvatarProps) => {
  const [failed, setFailed] = useState(false)
  const size = cls(styles.avatar, large ? styles.avatarLarge : '')

  if (failed || isPlaceholder(src)) {
    return (
      <div className={cls(size, styles.avatarFallback)} aria-hidden={true}>
        {initials(name)}
      </div>
    )
  }
  return (
    <img
      className={size}
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
