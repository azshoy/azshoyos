import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemList} from "@/components/standalonePages/portfolioPro/itemList";
import {fetchPeople} from "@/components/standalonePages/portfolio/data/people";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {GetStaticProps} from "next";


const ProPeople = ({people}: {people: ItemDict}) => (
  <ProLayout
    active={'people'}
    title={"People · az.sh"}
    description={"The engineers and designers who do the work."}
  >
    <ItemList
      items={people}
      target={'people'}
      title={"People"}
      lede={"The engineers and designers who do the work."}
    />
  </ProLayout>
)

export const getStaticProps: GetStaticProps = async () => ({
  props: {people: await fetchPeople()},
  revalidate: 300,
})

export default ProPeople
