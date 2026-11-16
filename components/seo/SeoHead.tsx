import Head from "next/head";
import {useRouter} from "next/router";
import {absoluteUrl, clip, org} from "@/util/site";
import {ldJson} from "@/util/ldJson";


type SeoHeadProps = {
  title: string
  // Shown in search results and in link previews on Slack, LinkedIn etc.
  description: string
  // JSON-LD for this page, usually one {"@graph": [...]} from util/structuredData.
  jsonLd?: object
  // Path of this page's Markdown twin, advertised to agents with rel="alternate".
  markdownPath?: string
  image?: string
  noindex?: boolean
}

// Everything robots and agents read from <head>. The pages own what people see.
export const SeoHead = ({title, description, jsonLd, markdownPath, image, noindex}: SeoHeadProps) => {
  // Query strings (?tag=) and fragments all canonicalise to the bare path.
  const canonical = absoluteUrl(useRouter().asPath.split(/[?#]/)[0])
  const summary = clip(description)
  const ogImage = image ?? absoluteUrl(org.ogImage)
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={summary}/>
      {noindex ? <meta name="robots" content="noindex"/> : <link rel="canonical" href={canonical}/>}
      {markdownPath ? <link rel="alternate" type="text/markdown" href={absoluteUrl(markdownPath)}/> : null}
      <link rel="alternate" type="text/plain" title="llms.txt" href={absoluteUrl("/llms.txt")}/>
      <meta property="og:url" content={canonical}/>
      <meta property="og:title" content={title}/>
      <meta property="og:description" content={summary}/>
      <meta property="og:type" content="website"/>
      <meta property="og:site_name" content={org.name}/>
      <meta property="og:locale" content="en_GB"/>
      <meta property="og:image" content={ogImage}/>
      {image ? null : <meta property="og:image:width" content="1200"/>}
      {image ? null : <meta property="og:image:height" content="630"/>}
      <meta property="og:image:alt" content={`${org.name}: ${org.tagline}`}/>
      <meta name="twitter:card" content="summary_large_image"/>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{__html: ldJson(jsonLd)}}/> : null}
    </Head>
  )
}
