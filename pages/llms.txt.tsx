import {textRoute, NoPage} from "@/util/textRoute";
import {llmsTxt} from "@/util/markdown";


// https://llmstxt.org: the site index for AI assistants and coding agents.
export const getServerSideProps = textRoute("text/plain; charset=utf-8", (data) => ({body: llmsTxt(data)}))

export default NoPage
