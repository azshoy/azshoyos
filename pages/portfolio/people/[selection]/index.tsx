import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemDetail} from "@/components/standalonePages/portfolioPro/itemDetail";
import {fetchPeople} from "@/components/standalonePages/portfolio/data/people";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {GetStaticPaths, GetStaticProps} from "next";


type Props = {people: ItemDict, selection: string}

const ProPerson = ({people, selection}: Props) => {
  const item = people[selection]
  return (
    <ProLayout active={'people'} title={item ? `${item.title} · az.sh` : "People · az.sh"}>
      <ItemDetail items={people} id={selection} target={'people'}/>
    </ProLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: Object.keys(await fetchPeople()).map((selection) => ({params: {selection}})),
  fallback: 'blocking',
})

export const getStaticProps: GetStaticProps<Props> = async ({params}) => ({
  props: {people: await fetchPeople(), selection: String(params?.selection ?? "")},
  revalidate: 300,
})

export default ProPerson
