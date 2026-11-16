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
import {SeoHead} from "@/components/seo/SeoHead";
import {readme} from "@/components/azshoyos/Program/DocumentReader/companyText";
import {itemPath, loadPortfolio} from "@/util/portfolio";
import {homeGraph} from "@/util/structuredData";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {org} from "@/util/site";


type CaseStudy = {title: string, href: string, description: string | null}

const title = "az.sh · software engineering and design, Finland"
const description = org.summary


export const Home = ({caseStudies, jsonLd}: {caseStudies: CaseStudy[], jsonLd: object})=> {
  const {uiScale} = useMonitor()
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>
      <SeoHead title={title} description={description} jsonLd={jsonLd} markdownPath={"/llms.txt"}/>
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


export const getStaticProps: GetStaticProps = async () => {
  const {projects}: {projects: ItemDict} = await loadPortfolio()
  const caseStudies: CaseStudy[] = Object.values(projects)
    .map((p) => ({title: p.title, href: itemPath('projects', p), description: p.description ?? null}))
  return {props: {caseStudies, jsonLd: homeGraph(title, description, Object.values(projects))}, revalidate: 300}
}


// The desktop is drawn by JavaScript, so without this the home page reads as
// empty to search engines, AI crawlers and screen readers. It repeats only
// what people can already read on the desktop (Readme.md) and the portfolio,
// and it is hidden only visually: the links take no Tab stop and no prefetch,
// so keyboard and mouse users get exactly the desktop they always had.
const srOnly = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0,
} as const

const SiteLink = ({href, children}: {href: string, children: string}) =>
  <Link href={href} tabIndex={-1} prefetch={false}>{children}</Link>

const SiteSummary = ({caseStudies}: {caseStudies: CaseStudy[]}) => (
  <section style={srOnly} aria-labelledby={"site-summary-title"}>
    <h1 id={"site-summary-title"}>{org.legalName}: {org.tagline.toLowerCase()}</h1>
    {readme.paragraphs.map((p) => <p key={p}>{p}</p>)}
    {caseStudies.length > 0 ? (
      <>
        <h2>Case studies</h2>
        <ul>
          {caseStudies.map((c) => (
            <li key={c.href}>
              <SiteLink href={c.href}>{c.title}</SiteLink>{c.description ? `: ${c.description}` : ""}
            </li>
          ))}
        </ul>
      </>
    ) : null}
    <p>
      <SiteLink href={"/portfolio"}>Portfolio</SiteLink>{" · "}
      <SiteLink href={"/portfolio/projects"}>Projects</SiteLink>{" · "}
      <SiteLink href={"/portfolio/people"}>People</SiteLink>
    </p>
    <p>Contact: {org.email} · {org.telephone} · Business ID {org.businessId}</p>
  </section>
)
