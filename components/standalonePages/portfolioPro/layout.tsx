import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {cls} from "@/util/misc";
import Head from "next/head";
import Link from "next/link";
import {ThemeToggle, themeBootScript} from "@/components/standalonePages/portfolioPro/themeToggle";
import {ReactNode} from "react";


type ProLayoutProps = {
  active?: 'projects' | 'people'
  title: string
  children: ReactNode
}

const nav = [
  {href: "/portfolio/projects", label: "Projects", key: "projects"},
  {href: "/portfolio/people", label: "People", key: "people"},
]

export const ProLayout = ({active, title, children}: ProLayoutProps) => {
  return (
    <div className={styles.page}>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
      </Head>
      {/* Inline, not in <Head>: next/head rejects script tags, and this must run
          during parse, before the header paints, to avoid a theme flash. */}
      <script dangerouslySetInnerHTML={{__html: themeBootScript}}/>
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
      <footer className={styles.footer}>az.sh · selected work and the people behind it.</footer>
    </div>
  )
}
