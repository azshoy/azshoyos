import {textRoute, NoPage} from "@/util/textRoute";
import {llmsFullTxt} from "@/util/markdown";


// Every case study in full, as one file to load into a context window.
export const getServerSideProps = textRoute("text/plain; charset=utf-8", (data) => ({body: llmsFullTxt(data)}))

export default NoPage
