import {NextRequest, NextResponse} from "next/server";


// Markdown for agents. A portfolio page URL with ".md" added, or the page
// itself requested with "Accept: text/markdown", is served from the text
// routes (pages/md, pages/llms.txt.tsx) instead of the HTML page.
//
// Middleware rather than next.config rewrites: rewrites ship route-matching
// code to every browser (about 5 kB, on the desktop too), and this matcher
// only runs for those agent requests, never for a person's page view.
export function middleware(req: NextRequest) {
  const {pathname} = req.nextUrl
  const item = pathname.match(/^\/portfolio\/(projects|people)\/([^/]+?)(?:\.md)?$/)
  const url = req.nextUrl.clone()
  url.pathname = item ? `/md/${item[1]}/${item[2]}` : "/llms.txt"
  return NextResponse.rewrite(url)
}

// Must be plain literals: Next reads this statically, and anything it cannot
// read (a shared variable, a cast) silently becomes "match every request".
export const config = {
  matcher: [
    {source: "/portfolio/:target(projects|people)/:slug.md"},
    {source: "/:page(index|portfolio).md"},
    {source: "/portfolio/:target(projects|people)/:slug", has: [{type: "header", key: "accept", value: ".*text/markdown.*"}]},
    {source: "/", has: [{type: "header", key: "accept", value: ".*text/markdown.*"}]},
    {source: "/portfolio", has: [{type: "header", key: "accept", value: ".*text/markdown.*"}]},
  ],
}
