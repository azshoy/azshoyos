import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import Link from "next/link";
import {CopyValue} from "@/components/standalonePages/portfolioPro/copyValue";
import {org} from "@/util/site";


const Arrow = () => (
  <svg className={styles.landingArrow} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden={true}>
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
)

const Count = ({n, singular, plural}: {n: number, singular: string, plural: string}) => (
  // Renders nothing until the fetch lands, so the card does not jump.
  <span className={styles.landingCount}>{n > 0 ? `${n} ${n === 1 ? singular : plural}` : " "}</span>
)

// A service and the page that proves it, resolved by the page from util/site.ts.
export type ServiceProof = {name: string, detail: string, proof: {label: string, ariaLabel: string, href: string, external: boolean}}

type LandingProps = {
  projectCount: number
  peopleCount: number
  services: ServiceProof[]
  howWeWork: string
}

export const Landing = ({projectCount, peopleCount, services, howWeWork}: LandingProps) => {

  return (
    <div className={styles.landing}>
      <img className={styles.landingLogo} src={"/icons/start.svg"} alt={"az.sh"}/>

      <h1 className={styles.landingLede}>
        We build and run software end to end: architecture, implementation, infrastructure and design.
      </h1>

      <div className={styles.landingChoices}>
        <Link className={styles.landingCard} href={"/portfolio/projects"}>
          <span className={styles.landingCardTitle}>Projects <Arrow/></span>
          <span className={styles.landingCardText}>What we have built, and how it was engineered.</span>
          <Count n={projectCount} singular={"case study"} plural={"case studies"}/>
        </Link>

        <Link className={styles.landingCard} href={"/portfolio/people"}>
          <span className={styles.landingCardTitle}>People <Arrow/></span>
          <span className={styles.landingCardText}>The engineers and designers who do the work.</span>
          <Count n={peopleCount} singular={"person"} plural={"people"}/>
        </Link>
      </div>

      <p className={styles.landingContact}>
        Work with us:{" "}
        <CopyValue value={org.email} label={"email address"}/>
        {" · "}
        <CopyValue value={org.telephone} label={"phone number"}/>
      </p>

      {services.length > 0 ? (
        <section className={styles.services} aria-labelledby={"services-title"}>
          <h2 id={"services-title"} className={styles.sectionHeading}>What we do</h2>
          <ul className={styles.serviceList}>
            {services.map((s) => (
              <li key={s.name} className={styles.serviceItem}>
                <span className={styles.serviceName}>{s.name.replace("agent-ready", "agent\u2011ready")}</span>
                <span className={styles.serviceDetail}>{s.detail}</span>
                {s.proof.external
                  ? <a className={styles.serviceProof} href={s.proof.href} aria-label={s.proof.ariaLabel} target="_blank" rel="noreferrer noopener">{s.proof.label} ↗</a>
                  : <Link className={styles.serviceProof} href={s.proof.href} aria-label={s.proof.ariaLabel}>{s.proof.label} →</Link>}
              </li>
            ))}
          </ul>
          <p className={styles.serviceNote}>{howWeWork}</p>
        </section>
      ) : null}
    </div>
  )
}
