import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {cls} from "@/util/misc";
import {useEffect, useState} from "react";


export type ProTheme = 'light' | 'dark'

export const THEME_KEY = "pro-theme"

// Runs in <head> before first paint so a stored choice never flashes the
// system theme first. Kept in sync with applyTheme() below.
export const themeBootScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-pro-theme",t)}}catch(e){}})()`

const applyTheme = (theme: ProTheme | null) => {
  const html = document.documentElement
  if (theme === null) html.removeAttribute("data-pro-theme")
  else html.setAttribute("data-pro-theme", theme)
}

const SunIcon = () => (
  <svg className={styles.themeIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden={true}>
    <circle cx="8" cy="8" r="3.1"/>
    <path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2L3.1 3.1"/>
  </svg>
)

const MoonIcon = () => (
  <svg className={styles.themeIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden={true}>
    <path d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.9 5.9 0 1 0 7.1 7.1Z"/>
  </svg>
)

export const ThemeToggle = () => {
  const [stored, setStored] = useState<ProTheme | null>(null)
  const [systemDark, setSystemDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let saved: string | null = null
    try {saved = localStorage.getItem(THEME_KEY)} catch {}
    if (saved === 'light' || saved === 'dark') setStored(saved)

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    setSystemDark(media.matches)
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    media.addEventListener("change", onChange)
    setMounted(true)
    return () => media.removeEventListener("change", onChange)
  }, [])

  const systemTheme: ProTheme = systemDark ? 'dark' : 'light'
  const effective: ProTheme = stored ?? systemTheme

  // Picking the theme the OS is already on drops the override, so the page
  // goes back to following the system instead of pinning a stale choice.
  const choose = (theme: ProTheme) => {
    const override = theme === systemTheme ? null : theme
    setStored(override)
    applyTheme(override)
    try {
      if (override === null) localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, override)
    } catch {}
  }

  const option = (theme: ProTheme, icon: React.ReactNode, label: string) => (
    <button
      className={cls(styles.themeOption, mounted && effective === theme ? styles.themeOptionActive : '')}
      onClick={() => choose(theme)}
      aria-pressed={mounted ? effective === theme : undefined}
      aria-label={`${label} theme`}
      title={`${label} theme`}
      type={"button"}
    >
      {icon}
    </button>
  )

  return (
    <div className={styles.themeSwitch} role={"group"} aria-label={"Colour theme"} suppressHydrationWarning={true}>
      {option('light', <SunIcon/>, "Light")}
      {option('dark', <MoonIcon/>, "Dark")}
    </div>
  )
}
