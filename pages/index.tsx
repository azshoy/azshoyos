import "@/globalStyles/global.css";
import "@/globalStyles/os.global.css";
import styles from '@/globalStyles/os.module.css'
import { TaskBar } from "@/components/azshoyos/TaskBar";
import {Desktop} from "@/components/azshoyos/desktop";
import {CSSProperties, useContext, useState} from "react";
import Head from 'next/head';
import {TaskManagerContext, TaskManagerProvider} from "@/components/azshoyos/OS/TaskManager";
import {useMonitor} from "@/components/azshoyos/OS/MonitorHandler";
import {OverlayFilter} from "@/components/azshoyos/extras/OverlayFilter";
import {GetStaticProps} from "next";
import Link from "next/link";
import {fetchProjects} from "@/components/standalonePages/portfolio/data/projects";
import {absoluteUrl, ldJson, org, organizationLd} from "@/util/seo";


type CaseStudy = {id: string, title: string, description: string | null}


export const Home = ({caseStudies}: {caseStudies: CaseStudy[]})=> {
  const {uiScale} = useMonitor()
  return (
    <>
      <Head>
        <title>az.sh · software engineering and design, Finland</title>
        <meta name="description" content={org.summary} />
        <link rel="canonical" href={absoluteUrl("/")}/>
        <meta property="og:url" content={absoluteUrl("/")}/>
        <meta property="og:title" content="az.sh · software engineering and design"/>
        <meta property="og:description" content={org.summary}/>
        <meta property="og:type" content="website"/>
        <meta property="og:site_name" content="az.sh"/>
        <meta name="twitter:card" content="summary"/>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: ldJson({
          ...organizationLd(),
          subjectOf: caseStudies.map((c) => ({"@type": "Article", headline: c.title, url: absoluteUrl(`/portfolio/projects/${c.id}`)})),
        })}}/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>
      <SiteSummary caseStudies={caseStudies}/>
      <TaskManagerProvider>
        <div className={styles.main} style={{'--uiScale': String(uiScale)} as CSSProperties}>
          <Desktop/>
        </div>
        <TaskBar/>
        <OverlayFilter/>
        <CloseComputer/>
      </TaskManagerProvider>
    </>
  );
}


export default Home


export const getStaticProps: GetStaticProps = async () => {
  const projects = await fetchProjects()
  const caseStudies: CaseStudy[] = Object.values(projects).map((p) => ({id: p.id, title: p.title, description: p.description ?? null}))
  return {props: {caseStudies}, revalidate: 300}
}


// The desktop is drawn by JavaScript, so without this the home page reads as
// empty to search engines, AI crawlers and screen readers. It says what the
// portfolio pages say, in text, and is hidden only visually.
const srOnly = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0,
} as const

const SiteSummary = ({caseStudies}: {caseStudies: CaseStudy[]}) => (
  <section style={srOnly}>
    <h1>az.sh: software engineering and design from Finland</h1>
    <p>{org.summary}</p>
    <h2>What we do</h2>
    <ul>{org.services.map((s) => <li key={s}>{s}</li>)}</ul>
    {caseStudies.length > 0 ? (
      <>
        <h2>Case studies</h2>
        <ul>
          {caseStudies.map((c) => (
            <li key={c.id}>
              <Link href={`/portfolio/projects/${c.id}`}>{c.title}</Link>{c.description ? `: ${c.description}` : ""}
            </li>
          ))}
        </ul>
      </>
    ) : null}
    <p>
      <Link href="/portfolio">Portfolio</Link> · <Link href="/portfolio/projects">Projects</Link> · <Link href="/portfolio/people">People</Link>
    </p>
    <p>Contact: <a href={`mailto:${org.email}`}>{org.email}</a> · {org.telephone}</p>
  </section>
)




const CloseComputer = () => {
  const {shutDown} = useContext(TaskManagerContext)
  const classN = shutDown == 0 ? styles.hidden : shutDown == 2 ? styles.shutDownNow : styles.shutDown
  return (
    <div className={classN}>
      <div className={styles.shutDownBye}>
        kthxbye :(
      </div>
      <div className={styles.topshutter}>
        <div className={styles.shutterline}></div>
      </div>

      <div className={styles.bottomshutter}>
        <div className={styles.shutterline}></div>
      </div>
    </div>
  )
}