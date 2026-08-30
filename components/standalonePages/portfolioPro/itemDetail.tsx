import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {Avatar} from "@/components/standalonePages/portfolioPro/avatar";
import {MainText} from "@/components/standalonePages/portfolioPro/mainText";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import Link from "next/link";
import {asPerson, PersonEducation, PersonFacts} from "@/components/standalonePages/portfolioPro/personSections";
import {orderedGroups, tagGroupClass} from "@/components/standalonePages/portfolioPro/tags";
import {cls} from "@/util/misc";


// The link between people and projects lives on the person entry. Both sides are
// resolved at build time so neither page has to fetch the other list.
export type RelatedItem = {
  id: string
  title: string
  subtitle: string | null
  icon: string
}

type ItemDetailProps = {
  items: ItemDict
  id: string
  target: 'projects' | 'people'
  // Projects this person worked on.
  related?: RelatedItem[]
  // People who worked on this project.
  team?: RelatedItem[]
}

const backLabel = {projects: "Back to projects", people: "Back to people"}

export const ItemDetail = ({items, id, target, related = [], team = []}: ItemDetailProps) => {
  const item = items[id]

  if (!item) {
    return (
      <>
        <Link className={styles.back} href={`/portfolio/${target}`}>← {backLabel[target]}</Link>
        <p className={styles.empty}>{Object.keys(items).length === 0 ? "Loading…" : "Not found."}</p>
      </>
    )
  }

  const tagGroups = orderedGroups(item.tags ?? {}).filter(([, v]) => v && v.length > 0)
  const person = asPerson(item)

  return (
    <div className={styles.enter}>
      <Link className={styles.back} href={`/portfolio/${target}`}>← {backLabel[target]}</Link>

      <div className={styles.detailHead}>
        <Avatar src={item.icon} name={item.title} size={target === 'people' ? 'xl' : 'lg'} kind={target === 'people' ? 'person' : 'project'}/>
        <div>
          <h1 className={styles.detailTitle}>{item.title}</h1>
          {item.subtitle ? <p className={styles.detailSubtitle}>{item.subtitle}</p> : null}
          {item.alternateTitle ? (
            <p><span className={styles.nickChip} style={{marginLeft: 0}}>{item.alternateTitle}</span></p>
          ) : null}
        </div>
      </div>

      <div className={styles.detailBody}>
        <article className={styles.article}>
          {person ? (
            item.mainText
              ? <MainText text={item.mainText} images={item.mainTextImages} lede={true}/>
              : <p className={styles.lede}>{item.description}</p>
          ) : (
            <>
              {item.description ? <p className={styles.lede}>{item.description}</p> : null}
              {item.mainText ? <MainText text={item.mainText} images={item.mainTextImages} skipFirstParagraph={true}/> : null}
            </>
          )}
          {person ? <PersonEducation person={person}/> : null}
          {related.length > 0 ? (
            <>
              <h3 className={styles.sectionHeading}>Worked on</h3>
              <div className={styles.relatedRows}>
                {related.map((r) => (
                  <Link className={styles.relatedRow} key={r.id} href={`/portfolio/projects/${r.id}`}>
                    <Avatar src={r.icon} name={r.title} size={'sm'} kind={'project'}/>
                    <span className={styles.relatedRowText}>
                      <span className={styles.relatedRowTitle}>{r.title}</span>
                      {r.subtitle ? <span className={styles.relatedRowSub}>{r.subtitle}</span> : null}
                    </span>
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </article>

        <aside className={styles.aside}>
          {person ? <PersonFacts person={person}/> : null}
          {team.length > 0 ? (
            <div className={styles.asideBlock}>
              <div className={styles.asideHead}>Team</div>
              <div className={styles.relatedRows}>
                {team.map((m) => (
                  <Link className={styles.teamRow} key={m.id} href={`/portfolio/people/${m.id}`}>
                    <Avatar src={m.icon} name={m.title} size={'sm'} kind={'person'}/>
                    <span className={styles.relatedRowText}>
                      <span className={styles.relatedRowTitle}>{m.title}</span>
                      {m.subtitle ? <span className={styles.relatedRowSub}>{m.subtitle}</span> : null}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          {tagGroups.map(([group, values]) => (
            <div className={styles.asideBlock} key={group}>
              <div className={styles.asideHead}>{group}</div>
              <div className={styles.tags}>
                {values.map((v) => (
                  <span className={cls(styles.tag, tagGroupClass(group))} key={v}>{v}</span>
                ))}
              </div>
            </div>
          ))}
          {item.links && item.links.length > 0 ? (
            <div className={styles.asideBlock}>
              <div className={styles.asideHead}>Links</div>
              {item.links.map((l) => (
                <a className={styles.asideLink} key={l.url} href={l.url} target="_blank" rel="noreferrer noopener">
                  {l.text || l.url}
                </a>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
