import {GetServerSidePropsContext} from "next";


// Text and XML routes (sitemap.xml, llms.txt) are pages that write the body
// themselves. The CDN keeps each for an hour and refreshes it in the background;
// `partial` (the API did not answer) keeps it for a minute so a gap heals fast.
export const sendText = (ctx: GetServerSidePropsContext, contentType: string, body: string, partial = false) => {
  ctx.res.setHeader("Content-Type", contentType)
  ctx.res.setHeader("Cache-Control", partial ? "public, s-maxage=60" : "public, s-maxage=3600, stale-while-revalidate=86400")
  ctx.res.write(body)
  ctx.res.end()
  return {props: {}}
}
