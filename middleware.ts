import {NextRequest, NextResponse} from "next/server";


// Markdown for agents. A page URL with ".md" added, or the page itself
// requested with "Accept: text/markdown", is served from the Markdown routes
// in pages/md instead of the HTML page:
//   /index.md, /portfolio.md                    -> /md/home, /md/portfolio (the site index)
//   /portfolio/projects.md, /portfolio/people.md -> /md/projects, /md/people
//   /portfolio/<projects|people>/<slug>.md      -> /md/<projects|people>/<slug>
//
// Middleware rather than next.config rewrites: rewrites ship route-matching
// code to every browser (about 5 kB, on the desktop too), and this matcher
// only runs for those agent requests, never for a person's page view.
export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname.replace(/\.md$/, "")
  const item = path.match(/^\/portfolio\/(projects|people)(?:\/([^/]+))?$/)
  const url = req.nextUrl.clone()
  url.pathname = item ? `/md/${item[1]}${item[2] ? `/${item[2]}` : ""}`
    : path === "/portfolio" ? "/md/portfolio"
    : "/md/home"
  return NextResponse.rewrite(url)
}

// Must be plain literals: Next reads this statically, and anything it cannot
// read (a shared variable, a cast) silently becomes "match every request".
export const config = {
  matcher: [
    {source: "/portfolio/:target(projects|people)/:slug.md"},
    {source: "/portfolio/:target(projects|people).md"},
    {source: "/:page(index|portfolio).md"},
    {source: "/portfolio/:target(projects|people)/:slug", has: [{type: "header", key: "accept", value: ".*text/markdown.*"}]},
    {source: "/portfolio/:target(projects|people)", has: [{type: "header", key: "accept", value: ".*text/markdown.*"}]},
    {source: "/portfolio", has: [{type: "header", key: "accept", value: ".*text/markdown.*"}]},
    {source: "/", has: [{type: "header", key: "accept", value: ".*text/markdown.*"}]},
  ],
}
