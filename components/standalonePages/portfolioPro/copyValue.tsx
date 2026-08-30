import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import {useEffect, useRef, useState} from "react";


type CopyValueProps = {
  value: string
  label: string
}

// mailto:/tel: hand off to whatever handler the OS registered, which on desktop
// is often nothing at all. Copying is the same everywhere.
export const CopyValue = ({value, label}: CopyValueProps) => {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  const copy = async () => {
    let ok = false
    try {
      await navigator.clipboard.writeText(value)
      ok = true
    } catch {
      // The clipboard API needs a secure context and permission. Fall back to
      // the old selection trick so the click is never dead.
      try {
        const field = document.createElement("textarea")
        field.value = value
        field.setAttribute("readonly", "")
        field.style.position = "fixed"
        field.style.opacity = "0"
        document.body.appendChild(field)
        field.select()
        ok = document.execCommand("copy")
        document.body.removeChild(field)
      } catch {}
    }
    if (!ok) return
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type={"button"}
      className={styles.copyValue}
      onClick={copy}
      title={`Copy ${label}`}
      aria-label={`Copy ${label}: ${value}`}
    >
      <span className={styles.copyText}>{value}</span>
      <span className={styles.copyHint} aria-live={"polite"}>{copied ? "Copied" : ""}</span>
    </button>
  )
}
