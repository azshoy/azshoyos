#!/usr/bin/env node
// Checks that the desktop at `/` still works for people: it hydrates, shows
// its icons and taskbar, opens Readme.md on double-click, keeps keyboard focus
// off the hidden summary, and throws no new errors. Drives headless Chrome
// over the DevTools protocol; no dependencies (Node 22+ for WebSocket).
//
//   npm run desktop-check -- http://localhost:3000
//
// CHROME_PATH overrides the browser; otherwise the usual macOS and Linux paths are tried.

import {spawn} from "node:child_process";
import {existsSync, mkdtempSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "")
const chrome = [process.env.CHROME_PATH, "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser"]
  .find((p) => p && existsSync(p))
if (!chrome) { console.error("No Chrome found; set CHROME_PATH."); process.exit(1) }

// React error #418 is a text-hydration mismatch from the taskbar clock (server
// time vs browser time). It is on production too and predates this check.
const KNOWN_ERRORS = [/Minified React error #418/]

const port = 9300 + Math.floor(Math.random() * 500)
const browser = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-sandbox",
  `--remote-debugging-port=${port}`, "--window-size=1280,800", `--user-data-dir=${mkdtempSync(join(tmpdir(), "desktop-check-"))}`, "about:blank"],
  {stdio: "ignore"})
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const results = []
const check = (name, ok, detail = "") => results.push({name, ok: !!ok, detail})

try {
  let tabs
  for (let i = 0; i < 50 && !tabs; i++) {
    try { tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json() } catch { await sleep(200) }
  }
  const ws = new WebSocket(tabs.find((t) => t.type === "page").webSocketDebuggerUrl)
  await new Promise((r) => (ws.onopen = r))
  let id = 0
  const pending = {}
  const errors = []
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data)
    if (m.id && pending[m.id]) { pending[m.id](m); delete pending[m.id] }
    else if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text)
    else if (m.method === "Runtime.consoleAPICalled" && m.params.type === "error") errors.push(m.params.args.map((a) => a.value ?? a.description).join(" "))
  }
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({id: i, method, params})) })
  const evaluate = async (expression) => (await send("Runtime.evaluate", {expression, returnByValue: true, awaitPromise: true})).result?.result?.value
  const key = async (k, code, vk) => {
    await send("Input.dispatchKeyEvent", {type: "keyDown", key: k, code, windowsVirtualKeyCode: vk})
    await send("Input.dispatchKeyEvent", {type: "keyUp", key: k, code, windowsVirtualKeyCode: vk})
  }

  await send("Runtime.enable")
  await send("Page.enable")
  await send("Page.navigate", {url: `${base}/`})
  await sleep(5000)

  const labels = await evaluate(`[...document.querySelectorAll('#__next *')].filter(e => e.children.length === 0).map(e => e.textContent.trim()).filter(Boolean)`)
  check("taskbar MENU button renders", labels?.includes("MENU"))
  for (const icon of ["Readme.md", "Portfolio", "Trash"]) check(`desktop icon "${icon}" renders`, labels?.includes(icon))

  const hidden = await evaluate(`(() => { const s = document.querySelector('section[aria-labelledby="site-summary-title"]'); if (!s) return null; const r = s.getBoundingClientRect(); return {w: r.width, h: r.height, links: s.querySelectorAll('a').length, focusable: s.querySelectorAll('a:not([tabindex="-1"])').length} })()`)
  check("hidden summary exists and is 1x1px", hidden && hidden.w <= 1 && hidden.h <= 1, JSON.stringify(hidden))
  check("hidden summary links are not focusable", hidden && hidden.links > 0 && hidden.focusable === 0, JSON.stringify(hidden))

  for (let i = 0; i < 4; i++) await key("Tab", "Tab", 9)
  check("Tab focuses nothing on the desktop (as on production)", (await evaluate("document.activeElement.tagName")) === "BODY")
  check("page does not scroll", (await evaluate("[document.scrollingElement.scrollTop, getComputedStyle(document.body).overflow]"))?.join() === "0,hidden")

  // Double-click the Readme.md icon and expect its window text.
  const pos = await evaluate(`(() => { const el = [...document.querySelectorAll('#__next *')].find(e => e.children.length === 0 && e.textContent.trim() === 'Readme.md'); if (!el) return null; const r = el.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y - 20} })()`)
  if (pos) {
    for (const clickCount of [1, 2]) {
      await send("Input.dispatchMouseEvent", {type: "mousePressed", x: pos.x, y: pos.y, button: "left", clickCount})
      await send("Input.dispatchMouseEvent", {type: "mouseReleased", x: pos.x, y: pos.y, button: "left", clickCount})
    }
    await sleep(1000)
  }
  const readmeOpen = await evaluate(`[...document.querySelectorAll('#__next *')].some(e => !e.closest('section[aria-labelledby]') && e.offsetParent !== null && e.textContent.includes('high ownership in product based projects') && e.children.length < 20)`)
  check("double-clicking Readme.md opens its window", readmeOpen)

  const unknown = errors.filter((e) => !KNOWN_ERRORS.some((re) => re.test(e)))
  check("no unexpected console errors", unknown.length === 0, unknown.join(" | ").slice(0, 400))
  ws.close()
} catch (e) {
  check("browser session ran", false, String(e))
} finally {
  browser.kill()
}

for (const r of results) console.log(`${r.ok ? "ok  " : "FAIL"} ${r.name}${r.ok || !r.detail ? "" : `  (${r.detail})`}`)
const failed = results.filter((r) => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} desktop checks passed against ${base}`)
process.exit(failed ? 1 : 0)
