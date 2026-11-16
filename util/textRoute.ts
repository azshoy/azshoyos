import {GetServerSideProps} from "next";
import {loadPortfolio, Portfolio} from "@/util/portfolio";


// Text routes (sitemap.xml, llms.txt, the .md pages) are pages-router pages
// that write their own body. The CDN keeps each for an hour and refreshes it
// in the background. If the portfolio API is down the route answers 503,
// which the CDN does not cache, instead of publishing an empty file.
type Render = (data: Portfolio, params: {[key: string]: string}) => {body: string, canonical?: string} | null

export const textRoute = (contentType: string, render: Render): GetServerSideProps => async ({res, params}) => {
  let data: Portfolio
  try {
    data = await loadPortfolio()
  } catch {
    res.statusCode = 503
    res.setHeader("Retry-After", "60")
    res.setHeader("Cache-Control", "no-store")
    res.end("Portfolio temporarily unavailable\n")
    return {props: {}}
  }
  const out = render(data, Object.fromEntries(Object.entries(params ?? {}).map(([k, v]) => [k, String(v)])))
  if (!out) return {notFound: true}
  res.setHeader("Content-Type", contentType)
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400")
  // The HTML page is the one to index; this is the same content for agents.
  if (out.canonical) res.setHeader("Link", `<${out.canonical}>; rel="canonical"`)
  res.end(out.body)
  return {props: {}}
}

// Next needs a default export for a page; text routes never render it.
export const NoPage = () => null
