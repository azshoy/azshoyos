import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {useEffect, useState} from "react";


export type ProTheme = 'system' | 'light' | 'dark'

export const THEME_KEY = "pro-theme"

// Runs in <head> before first paint so a stored choice never flashes the
// system theme first. Kept in sync with applyTheme() below.
export const themeBootScript = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-pro-theme",t)}}catch(e){}})()`

const applyTheme = (theme: ProTheme) => {
  const html = document.documentElement
  if (theme === 'system') html.removeAttribute("data-pro-theme")
  else html.setAttribute("data-pro-theme", theme)
}

const next: Record<ProTheme, ProTheme> = {system: 'light', light: 'dark', dark: 'system'}
const label: Record<ProTheme, string> = {system: 'System', light: 'Light', dark: 'Dark'}

const Icon = ({theme}: {theme: ProTheme}) => {
  const common = {className: styles.themeIcon, viewBox: "0 0 16 16", fill: "none", stroke: "currentColor", strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true}
  if (theme === 'light') return (
    <svg {...common}>
      <circle cx="8" cy="8" r="3.1"/>
      <path d="M8 1v1.6M8 13.4V15M15 8h-1.6M2.6 8H1M12.9 3.1l-1.1 1.1M4.2 11.8l-1.1 1.1M12.9 12.9l-1.1-1.1M4.2 4.2L3.1 3.1"/>
    </svg>
  )
  if (theme === 'dark') return (
    <svg {...common}><path d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.9 5.9 0 1 0 7.1 7.1Z"/></svg>
  )
  return (
    <svg {...common}>
      <rect x="1.5" y="3" width="13" height="8.5" rx="1.2"/>
      <path d="M5.5 14h5"/>
    </svg>
  )
}

export const ThemeToggle = () => {
  const [theme, setTheme] = useState<ProTheme>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    let stored: string | null = null
    try {stored = localStorage.getItem(THEME_KEY)} catch {}
    if (stored === 'light' || stored === 'dark') setTheme(stored)
    setMounted(true)
  }, [])

  const choose = () => {
    const picked = next[theme]
    setTheme(picked)
    applyTheme(picked)
    try {
      if (picked === 'system') localStorage.removeItem(THEME_KEY)
      else localStorage.setItem(THEME_KEY, picked)
    } catch {}
  }

  return (
    <button
      className={styles.themeToggle}
      onClick={choose}
      title={"Switch theme"}
      aria-label={`Theme: ${label[theme]}. Switch to ${label[next[theme]]}.`}
      suppressHydrationWarning={true}
    >
      <Icon theme={theme}/>
      <span suppressHydrationWarning={true}>{mounted ? label[theme] : label.system}</span>
    </button>
  )
}
