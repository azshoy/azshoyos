import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemList} from "@/components/standalonePages/portfolioPro/itemList";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {GetStaticProps} from "next";
import {loadPortfolio} from "@/util/portfolio";
import {listGraph} from "@/util/structuredData";


const title = "People: engineers and designers · az.sh"
const description = "The engineers and designers at az.sh in Oulu and Helsinki, Finland: "
  + "fullstack, Web3, DevOps, embedded, quality assurance, UI design and technical writing."

const ProPeople = ({people}: {people: ItemDict}) => (
  <ProLayout
    active={'people'}
    title={title}
    description={description}
    jsonLd={listGraph('people', people, title, description)}
    markdownPath={"/llms.txt"}
  >
    <ItemList items={people} target={'people'} title={"People"} lede={"The engineers and designers who do the work."}/>
  </ProLayout>
)

export const getStaticProps: GetStaticProps = async () => ({
  props: {people: (await loadPortfolio()).people},
  revalidate: 300,
})

export default ProPeople
