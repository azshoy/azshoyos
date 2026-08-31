import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {cls} from "@/util/misc";


type TagListProps = {
  tags: {[key: string]: string[]}
  limit?: number
  // Passing a handler turns the chips into filter buttons.
  onSelect?: (value: string) => void
  active?: string
}

export type TaggedValue = {value: string, group: string}

// The API serves tag groups alphabetically (interests, skills, stack), so a
// card's first three tags would otherwise always be hobbies.
export const groupOrder = ['skills', 'stack', 'interests']

export const orderedGroups = <T,>(tags: {[key: string]: T}) =>
  Object.entries(tags ?? {}).sort(([a], [b]) => {
    const ai = groupOrder.indexOf(a), bi = groupOrder.indexOf(b)
    return (ai < 0 ? groupOrder.length : ai) - (bi < 0 ? groupOrder.length : bi)
  })

export const flattenTags = (tags: {[key: string]: string[]}): TaggedValue[] =>
  orderedGroups(tags).flatMap(([group, values]) => values.map((value) => ({value, group})))

// Each group carries its own tint, so a long tag list reads as three short ones
// rather than one undifferentiated wall.
const groupClasses: {[key: string]: string} = {
  skills: styles.tagSkills,
  stack: styles.tagStack,
  interests: styles.tagInterests,
}

export const tagGroupClass = (group: string) => groupClasses[group] ?? ''

export const TagList = ({tags, limit, onSelect, active}: TagListProps) => {
  const all = flattenTags(tags)
  if (all.length === 0) return null
  // The tag a card matched on has to be among the ones it shows, or the card
  // looks like it turned up in a filtered list for no reason.
  const ordered = active ? [...all].sort((a, b) => Number(b.value === active) - Number(a.value === active)) : all
  const shown = limit ? ordered.slice(0, limit) : ordered
  const rest = all.length - shown.length

  return (
    <div className={styles.tags}>
      {shown.map((t) => (onSelect ? (
        <button
          className={cls(styles.tag, styles.tagButton, tagGroupClass(t.group), t.value === active ? styles.tagActive : undefined)}
          key={t.value}
          type={"button"}
          aria-pressed={t.value === active}
          onClick={() => onSelect(t.value)}
        >{t.value}</button>
      ) : (
        <span className={cls(styles.tag, tagGroupClass(t.group))} key={t.value}>{t.value}</span>
      )))}
      {rest > 0 ? <span className={styles.tagMore}>+{rest}</span> : null}
    </div>
  )
}
