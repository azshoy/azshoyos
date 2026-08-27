import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {PersonData} from "@/components/standalonePages/portfolio/data/people";
import {useProjects} from "@/components/standalonePages/portfolio/data/projects";
import Link from "next/link";


// People and projects share one list shape; only people carry contact details.
export const asPerson = (item: object): PersonData | undefined =>
  'contact' in item || 'education' in item ? item as PersonData : undefined

type PersonProjectRef = {id?: string, inactive?: boolean}

export const PersonFacts = ({person}: {person: PersonData}) => {
  const location = person.contact?.location
  const email = person.contact?.email
  const phone = person.contact?.phone
  const languages = person.languages

  const hasContact = (location && location.length > 0) || email || phone
  if (!hasContact && (!languages || languages.length === 0)) return null

  return (
    <>
      {hasContact ? (
        <div className={styles.asideBlock}>
          <div className={styles.asideHead}>Contact</div>
          <div className={styles.factList}>
            {location && location.length > 0 ? <span>{location.join(" · ")}</span> : null}
            {email ? <a href={`mailto:${email}`}>{email}</a> : null}
            {phone ? <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a> : null}
          </div>
        </div>
      ) : null}

      {languages && languages.length > 0 ? (
        <div className={styles.asideBlock}>
          <div className={styles.asideHead}>Languages</div>
          <div className={styles.factList}>{languages.join(" · ")}</div>
        </div>
      ) : null}
    </>
  )
}

export const PersonEducation = ({person}: {person: PersonData}) => {
  const education = person.education
  if (!education || education.length === 0) return null

  return (
    <>
      <h3 className={styles.sectionHeading}>Education</h3>
      <div className={styles.education}>
        {education.map((e) => (
          <div className={styles.educationItem} key={`${e.institute}${e.year}`}>
            <div className={styles.educationDegree}>{e.degree}</div>
            <div className={styles.educationMeta}>
              {e.institute} · {e.graduated ? e.year : `expected ${e.year}`}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export const PersonProjects = ({person}: {person: PersonData}) => {
  const projects = useProjects()
  const refs = (person.projects ?? []) as PersonProjectRef[]
  const linked = refs.map((r) => r.id).filter((id): id is string => !!id)
  if (linked.length === 0) return null

  return (
    <>
      <h3 className={styles.sectionHeading}>Worked on</h3>
      <div className={styles.relatedList}>
        {linked.map((id) => (
          <Link className={styles.relatedLink} key={id} href={`/portfolio/projects/${id}`}>
            {projects[id]?.title ?? id}
          </Link>
        ))}
      </div>
    </>
  )
}
