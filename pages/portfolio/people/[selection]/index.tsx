import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemDetail} from "@/components/standalonePages/portfolioPro/itemDetail";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {GetStaticPaths, GetStaticProps} from "next";
import {hasData, itemPath, loadPortfolio, projectsOf, RelatedItem, resolveItem, slugOf, summaryOf} from "@/util/portfolio";
import {personGraph} from "@/util/structuredData";


// `selection` is the URL slug; `id` is the API id the components key on.
type Props = {people: ItemDict, id: string, related: RelatedItem[]}

const ProPerson = ({people, id, related}: Props) => {
  const item = people[id]
  // Machine-readable text uses the bio, not the playful card one-liner.
  const description = item ? `${[item.subtitle, "az.sh"].filter(Boolean).join(" at ")}. ${summaryOf(item)}` : ""
  return (
    <ProLayout
      active={'people'}
      title={item ? `${item.title} · az.sh` : "People · az.sh"}
      description={description}
      jsonLd={item ? personGraph(item, description, related) : undefined}
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
  // A real 404 for unknown slugs, unless the build ran with the API down.
  if (!item) return hasData(data) ? {notFound: true, revalidate: 300} : {props: {people: {}, id: "", related: []}, revalidate: 60}
  return {props: {people: data.people, id: item.id, related: projectsOf(item, data.projects)}, revalidate: 300}
}

export default ProPerson
