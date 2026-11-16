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
// time vs browser time). It is on production too and predates this check, so
// one is allowed; a second one, or the hidden summary's text changing during
// hydration (checked below), means something new broke.
const CLOCK_MISMATCH = /Minified React error #418/

// Port 0: Chrome picks a free port and prints the DevTools address on stderr,
// which is read below; no guessing or polling a fixed port.
const browser = spawn(chrome, ["--headless=new", "--disable-gpu", "--no-first-run", "--no-sandbox",
  "--disable-dev-shm-usage", "--remote-debugging-port=0", "--window-size=1280,800",
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "desktop-check-"))}`, "about:blank"],
  {stdio: ["ignore", "ignore", "pipe"]})
let chromeLog = ""
const devtools = new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new Error(`Chrome did not start within 30 s: ${chromeLog.slice(-600)}`)), 30000)
  browser.stderr.on("data", (d) => {
    chromeLog += d
    const m = chromeLog.match(/DevTools listening on (ws:\/\/[^\s]+)/)
    if (m) { clearTimeout(timer); resolve(new URL(m[1])) }
  })
  browser.on("exit", (code) => { clearTimeout(timer); reject(new Error(`Chrome exited with ${code}: ${chromeLog.slice(-600)}`)) })
})
devtools.catch(() => {})  // reported where it is awaited, never as an unhandled rejection
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const results = []
const check = (name, ok, detail = "") => results.push({name, ok: !!ok, detail})

try {
  const {host} = await devtools
  let tabs = []
  for (let i = 0; i < 50 && !tabs.some((t) => t.type === "page"); i++) {
    try { tabs = await (await fetch(`http://${host}/json`)).json() } catch { /* not ready yet */ }
    if (!tabs.some((t) => t.type === "page")) await sleep(200)
  }
  const page = tabs.find((t) => t.type === "page")
  if (!page) throw new Error(`no page target from Chrome at ${host}`)
  const ws = new WebSocket(page.webSocketDebuggerUrl)
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

  // The hidden summary as the server sent it, to compare after hydration.
  const serverHtml = await (await fetch(`${base}/`)).text()
  const serverSummary = (serverHtml.match(/<section[^>]*aria-labelledby="site-summary-title"[^>]*>([\s\S]*?)<\/section>/)?.[1] ?? "")
    .replace(/<!-- -->/g, "").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, "")

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
  const clientSummary = await evaluate(`(document.querySelector('section[aria-labelledby="site-summary-title"]')?.textContent ?? "").replace(/\\s+/g, "")`)
  check("hidden summary text survives hydration unchanged", serverSummary.length > 50 && clientSummary === serverSummary, `${serverSummary.length} vs ${clientSummary?.length}`)

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

  const clock = errors.filter((e) => CLOCK_MISMATCH.test(e))
  const unknown = errors.filter((e) => !CLOCK_MISMATCH.test(e))
  check("no unexpected console errors", unknown.length === 0, unknown.join(" | ").slice(0, 400))
  check("at most the one known hydration mismatch (taskbar clock)", clock.length <= 1, `${clock.length} × #418`)
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
