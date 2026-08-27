import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {Avatar} from "@/components/standalonePages/portfolioPro/avatar";
import {MainText} from "@/components/standalonePages/portfolioPro/mainText";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import Link from "next/link";
import {asPerson, PersonEducation, PersonFacts, PersonProjects} from "@/components/standalonePages/portfolioPro/personSections";


type ItemDetailProps = {
  items: ItemDict
  id: string
  target: 'projects' | 'people'
}

const backLabel = {projects: "Back to projects", people: "Back to people"}

export const ItemDetail = ({items, id, target}: ItemDetailProps) => {
  const item = items[id]

  if (!item) {
    return (
      <>
        <Link className={styles.back} href={`/portfolio/${target}`}>← {backLabel[target]}</Link>
        <p className={styles.empty}>{Object.keys(items).length === 0 ? "Loading…" : "Not found."}</p>
      </>
    )
  }

  const tagGroups = Object.entries(item.tags ?? {}).filter(([, v]) => v && v.length > 0)
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
          {item.mainText
            ? <MainText text={item.mainText} images={item.mainTextImages} lede={true}/>
            : <p className={styles.lede}>{item.description}</p>}
          {person ? <PersonEducation person={person}/> : null}
          {person ? <PersonProjects person={person}/> : null}
        </article>

        <aside className={styles.aside}>
          {person ? <PersonFacts person={person}/> : null}
          {tagGroups.map(([group, values]) => (
            <div className={styles.asideBlock} key={group}>
              <div className={styles.asideHead}>{group}</div>
              <div className={styles.tags}>
                {values.map((v) => <span className={styles.tag} key={v}>{v}</span>)}
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
