import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemDetail} from "@/components/standalonePages/portfolioPro/itemDetail";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {GetStaticPaths, GetStaticProps} from "next";
import {itemPath, loadPortfolio, projectsOf, RelatedItem, resolveItem, slugOf, summaryOf} from "@/util/portfolio";
import {personGraph} from "@/util/structuredData";


// "Oula Kuuva, Dev and Ops Expert · az.sh"; the role is left out when it would
// push the title past what search results show.
const personTitle = (name: string, role?: string) => {
  const full = `${name}, ${role} · az.sh`
  return role && full.length <= 65 ? full : `${name} · az.sh`
}

// `selection` is the URL slug; `id` is the API id the components key on.
type Props = {people: ItemDict, id: string, related: RelatedItem[]}

const ProPerson = ({people, id, related}: Props) => {
  const item = people[id]
  // Machine-readable text uses the bio, not the playful card one-liner.
  const description = item ? `${[item.subtitle, "az.sh"].filter(Boolean).join(" at ")}. ${summaryOf(item)}` : ""
  return (
    <ProLayout
      active={'people'}
      title={item ? personTitle(item.title, item.subtitle) : "People · az.sh"}
      description={description}
      jsonLd={item ? personGraph(item, description) : undefined}
      markdownPath={item ? `${itemPath('people', item)}.md` : undefined}
    >
      <ItemDetail items={people} id={id} target={'people'} related={related}/>
    </ProLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const {people} = await loadPortfolio()
  return {paths: Object.values(people).map((p) => ({params: {selection: slugOf(p)}})), fallback: 'blocking'}
}

export const getStaticProps: GetStaticProps<Props> = async ({params}) => {
  const data = await loadPortfolio()
  const {item, redirect} = resolveItem(data.people, String(params?.selection ?? ""))
  // Old API-id URLs move to the readable slug for good.
  if (redirect && item) return {redirect: {destination: itemPath('people', item), permanent: true}, revalidate: 300}
  if (!item) return {notFound: true, revalidate: 300}
  return {props: {people: data.people, id: item.id, related: projectsOf(item, data.projects)}, revalidate: 300}
}

export default ProPerson
