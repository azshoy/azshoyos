import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {cls} from "@/util/misc";
import {useState} from "react";


export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl'
export type AvatarKind = 'person' | 'project'

type AvatarProps = {
  src?: string
  name: string
  size?: AvatarSize
  kind?: AvatarKind
}

// The API hands out a generic placeholder for items without artwork, and people
// without a photo end up with a ".../undefined" URL. Both fall back to a glyph.
const isPlaceholder = (src?: string) =>
  !src || src.endsWith("undefined") || src.endsWith("null")
  || src.endsWith("/default.svg") || src.endsWith("/default-person.svg")

const sizeClass: Record<AvatarSize, string> = {
  sm: '',
  md: styles.avatarMd,
  lg: styles.avatarLg,
  xl: styles.avatarXl,
}

const PersonGlyph = () => (
  <svg className={styles.avatarGlyph} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden={true}>
    <circle cx="12" cy="9" r="3.6"/>
    <path d="M4.9 20a7.1 7.1 0 0 1 14.2 0"/>
  </svg>
)

const ProjectGlyph = () => (
  <svg className={styles.avatarGlyph} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" aria-hidden={true}>
    <rect x="8.4" y="3.6" width="12" height="12" rx="2.2"/>
    <path d="M15.6 20.4h-9a3 3 0 0 1-3-3v-9"/>
  </svg>
)

export const Avatar = ({src, name, size = 'sm', kind = 'project'}: AvatarProps) => {
  const [failed, setFailed] = useState(false)
  // Chrome paints the scanlines it has so far stretched to the whole box, so a
  // half-downloaded portrait shows up squashed. Hold the photo back until it is
  // decoded and fade it in instead.
  const [loaded, setLoaded] = useState(false)
  const box = cls(styles.avatar, sizeClass[size])

  if (failed || isPlaceholder(src)) {
    return (
      <div className={cls(box, styles.avatarFallback)} role={"img"} aria-label={name}>
        {kind === 'person' ? <PersonGlyph/> : <ProjectGlyph/>}
      </div>
    )
  }
  return (
    <img
      className={cls(box, styles.avatarFade, loaded ? styles.avatarShown : undefined)}
      // A cached image can finish before React attaches onLoad.
      ref={(el) => { if (el?.complete) setLoaded(true) }}
      src={src}
      alt=""
      loading="lazy"
      data-fade={true}
      onLoad={() => setLoaded(true)}
      onError={() => setFailed(true)}
    />
  )
}
