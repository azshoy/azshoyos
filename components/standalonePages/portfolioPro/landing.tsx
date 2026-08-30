import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import Link from "next/link";


const Arrow = () => (
  <svg className={styles.landingArrow} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden={true}>
    <path d="M3 8h10M9 4l4 4-4 4"/>
  </svg>
)

const Count = ({n, singular, plural}: {n: number, singular: string, plural: string}) => (
  // Renders nothing until the fetch lands, so the card does not jump.
  <span className={styles.landingCount}>{n > 0 ? `${n} ${n === 1 ? singular : plural}` : " "}</span>
)

type LandingProps = {
  projectCount: number
  peopleCount: number
}

export const Landing = ({projectCount, peopleCount}: LandingProps) => {

  return (
    <div className={styles.landing}>
      <img className={styles.landingLogo} src={"/icons/start.svg"} alt={"az.sh"}/>

      <p className={styles.landingLede}>
        We build and run software end to end: architecture, implementation, infrastructure and design.
      </p>

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
    </div>
  )
}
