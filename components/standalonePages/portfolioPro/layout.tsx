import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {cls} from "@/util/misc";
import Head from "next/head";
import Link from "next/link";
import {ThemeToggle, themeBootScript} from "@/components/standalonePages/portfolioPro/themeToggle";
import {ReactNode} from "react";
import {CopyValue} from "@/components/standalonePages/portfolioPro/copyValue";


type ProLayoutProps = {
  active?: 'projects' | 'people'
  title: string
  // Shown in search results and in link previews on Slack, LinkedIn etc.
  description?: string
  children: ReactNode
}

const defaultDescription = "Software engineering and design: selected work and the people behind it."

const nav = [
  {href: "/portfolio/projects", label: "Projects", key: "projects"},
  {href: "/portfolio/people", label: "People", key: "people"},
]

export const ProLayout = ({active, title, description, children}: ProLayoutProps) => {
  const summary = description ?? defaultDescription
  return (
    <div className={styles.page}>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="description" content={summary}/>
        <meta property="og:title" content={title}/>
        <meta property="og:description" content={summary}/>
        <meta property="og:type" content="website"/>
        <meta property="og:site_name" content="az.sh"/>
        <meta name="twitter:card" content="summary"/>
      </Head>
      {/* Inline, not in <Head>: next/head rejects script tags, and this must run
          during parse, before the header paints, to avoid a theme flash. */}
      <script dangerouslySetInnerHTML={{__html: themeBootScript}}/>
      {/* Photos fade in once decoded, which needs the load handler. Without JS
          there is nothing to flip them back on, so show them outright. */}
      <noscript><style dangerouslySetInnerHTML={{__html: "img[data-fade]{opacity:1!important}[data-slot]{animation:none!important}"}}/></noscript>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href={"/portfolio"} aria-label={"az.sh, home"}>
            <img className={styles.brandLogo} src={"/icons/start.svg"} alt={"az.sh"}/>
          </Link>
          <div className={styles.headerRight}>
            <nav className={styles.nav}>
              {nav.map((n) => (
                <Link
                  key={n.key}
                  href={n.href}
                  className={cls(styles.navLink, active === n.key ? styles.navLinkActive : '')}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <ThemeToggle/>
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        az.sh · selected work and the people behind it.{" "}
        <CopyValue value={"contact@azsh.fi"} label={"email address"}/>
      </footer>
    </div>
  )
}
