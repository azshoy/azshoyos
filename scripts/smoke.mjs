#!/usr/bin/env node
// Smoke test for what robots and agents read on azsh.fi: status codes,
// redirects, canonicals, JSON-LD, robots.txt, sitemap.xml, llms.txt and the
// Markdown twins. Runs against any running build, no dependencies:
//
//   npm run build && npm start &          # or any deployed URL
//   npm run smoke -- http://localhost:3000
//
// Exits non-zero on the first run with a failure, listing every check.

const base = (process.argv[2] ?? process.env.SMOKE_URL ?? "http://localhost:3000").replace(/\/$/, "")
const site = "https://azsh.fi"
const api = process.env.NEXT_PUBLIC_PORTFOLIO_API_URL

const results = []
const check = (name, ok, detail = "") => results.push({name, ok: !!ok, detail})

const get = async (path, headers = {}) => {
  const res = await fetch(base + path, {redirect: "manual", headers})
  return {status: res.status, type: res.headers.get("content-type") ?? "", location: res.headers.get("location") ?? "",
    link: res.headers.get("link") ?? "", vary: res.headers.get("vary") ?? "", body: await res.text()}
}

const attr = (html, re) => (html.match(re) ?? [])[1]
const canonicalOf = (html) => attr(html, /<link rel="canonical" href="([^"]+)"/)
const decode = (s) => s.replace(/&(amp|quot|lt|gt|#x27|#39);/g, (_, e) => ({amp: "&", quot: '"', lt: "<", gt: ">", "#x27": "'", "#39": "'"})[e])
const descriptionOf = (html) => decode(attr(html, /<meta name="description" content="([^"]*)"/) ?? "")
const jsonLdOf = (html) => [...html.matchAll(/<script type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs)]
  .map((m) => JSON.parse(m[1]))
const typesIn = (docs) => docs.flatMap((d) => d["@graph"] ?? [d]).map((n) => n["@type"])
const local = (url) => url.replace(site, "") || "/"

const htmlPage = async (path, expectTypes) => {
  const r = await get(path)
  check(`${path} is 200 HTML`, r.status === 200 && r.type.includes("text/html"), `${r.status} ${r.type}`)
  check(`${path} has lang="en"`, /<html lang="en"/.test(r.body))
  const canonical = canonicalOf(r.body)
  check(`${path} canonical is ${site}${path === "/" ? "" : path}`, canonical === site + (path === "/" ? "" : path), canonical)
  const desc = descriptionOf(r.body) ?? ""
  check(`${path} description is 50-160 chars`, desc.length >= 50 && desc.length <= 160, `${desc.length}`)
  check(`${path} has og:image`, /<meta property="og:image" content="https:\/\//.test(r.body))
  let docs = []
  try { docs = jsonLdOf(r.body) } catch (e) { check(`${path} JSON-LD parses`, false, String(e)) }
  const types = typesIn(docs)
  for (const t of ["WebSite", "Organization", ...expectTypes]) check(`${path} JSON-LD has ${t}`, types.includes(t), types.join(","))
  return r
}

const main = async () => {
  // Home: the JS desktop plus the visually hidden summary.
  const home = await htmlPage("/", ["WebPage"])
  check("/ has the hidden summary h1", /<h1 id="site-summary-title">/.test(home.body))
  check("/ summary links take no Tab stop", !/<section[^>]*aria-labelledby="site-summary-title"[\s\S]*?<a (?![^>]*tabindex="-1")/.test(home.body.split("</section>")[0]))

  const portfolio = await htmlPage("/portfolio", ["CollectionPage", "BreadcrumbList"])
  check("/portfolio shows the services as text", /What we do/.test(portfolio.body) && /AI-assisted delivery/.test(portfolio.body))
  check("/portfolio sends Vary: Accept", /accept/i.test(portfolio.vary), portfolio.vary)

  // Markdown twins of the non-item pages, by .md URL and by Accept header.
  for (const [path, md, canonical] of [["/", "/index.md", site], ["/portfolio", "/portfolio.md", `${site}/portfolio`],
    ["/portfolio/projects", "/portfolio/projects.md", `${site}/portfolio/projects`], ["/portfolio/people", "/portfolio/people.md", `${site}/portfolio/people`]]) {
    const r = await get(md)
    check(`${md} is Markdown with canonical ${canonical}`, r.status === 200 && r.type.includes("text/markdown") && r.body.startsWith("# ") && r.link.includes(`<${canonical}>`), `${r.status} ${r.type} ${r.link}`)
    const neg = await get(path, {accept: "text/markdown"})
    check(`${path} with Accept: text/markdown returns Markdown`, neg.type.includes("text/markdown"), neg.type)
  }
  await htmlPage("/portfolio/projects", ["CollectionPage", "BreadcrumbList"])
  await htmlPage("/portfolio/people", ["CollectionPage", "BreadcrumbList"])

  const robots = await get("/robots.txt")
  check("robots.txt allows all and names the sitemap", robots.status === 200 && /Allow: \//.test(robots.body) && /Sitemap: https:\/\/azsh\.fi\/sitemap\.xml/.test(robots.body))

  const sitemap = await get("/sitemap.xml")
  const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  check("sitemap.xml is XML with at least 6 URLs", sitemap.type.includes("xml") && locs.length >= 6, `${locs.length} urls`)
  for (const loc of locs) {
    const path = local(loc)
    if (!/^\/portfolio\/(projects|people)\/[^/]+$/.test(path)) continue
    const r = await htmlPage(path, [path.includes("/people/") ? "Person" : "Article", "BreadcrumbList"])
    check(`${path} slug is lowercase ASCII`, /^[a-z0-9-]+$/.test(path.split("/").pop()))
    const md = await get(`${path}.md`)
    check(`${path}.md is Markdown with a canonical Link`, md.status === 200 && md.type.includes("text/markdown") && md.body.startsWith("# ") && md.link.includes(loc), `${md.status} ${md.type}`)
    const neg = await get(path, {accept: "text/markdown"})
    check(`${path} with Accept: text/markdown returns Markdown`, neg.type.includes("text/markdown"), neg.type)
    check(`${path} links its Markdown twin`, r.body.includes(`rel="alternate" type="text/markdown" href="${loc}.md"`))
  }

  const llms = await get("/llms.txt")
  check("llms.txt follows llmstxt.org (H1, summary, sections)", llms.status === 200 && /^# az\.sh\n\n> /.test(llms.body) && /\n## Case studies\n/.test(llms.body) && /\n## Optional\n/.test(llms.body))
  const full = await get("/llms-full.txt")
  check("llms-full.txt is longer than llms.txt", full.status === 200 && full.body.length > llms.body.length * 2, `${full.body.length} vs ${llms.body.length}`)

  const missing = await get("/portfolio/projects/this-does-not-exist")
  check("unknown project is a real 404, noindex", missing.status === 404 && /<meta name="robots" content="noindex"/.test(missing.body), `${missing.status}`)
  const old = await get("/people")
  check("/people redirects permanently", old.status === 308 && old.location.endsWith("/portfolio/people"), `${old.status} ${old.location}`)

  // Old API-id URLs (the slugs before Nov 2026) must 308 to the readable slug.
  if (api) {
    const people = (await (await fetch(`${api}/people`)).json()).people ?? []
    if (people[0]) {
      const r = await get(`/portfolio/people/${people[0].id}`)
      check(`old id URL /portfolio/people/${people[0].id} redirects permanently`, r.status === 308 && /\/portfolio\/people\/[a-z0-9-]+$/.test(r.location), `${r.status} ${r.location}`)
    }
  }

  const failed = results.filter((r) => !r.ok)
  for (const r of results) console.log(`${r.ok ? "ok  " : "FAIL"} ${r.name}${r.ok || !r.detail ? "" : `  (${r.detail})`}`)
  console.log(`\n${results.length - failed.length}/${results.length} checks passed against ${base}`)
  process.exit(failed.length ? 1 : 0)
}

main().catch((e) => { console.error(e); process.exit(1) })
