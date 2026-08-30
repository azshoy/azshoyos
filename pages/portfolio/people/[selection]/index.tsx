import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemDetail, RelatedItem} from "@/components/standalonePages/portfolioPro/itemDetail";
import {fetchPeople} from "@/components/standalonePages/portfolio/data/people";
import {fetchProjects} from "@/components/standalonePages/portfolio/data/projects";
import {ItemDict} from "@/components/standalonePages/portfolio/types";
import {asPerson} from "@/components/standalonePages/portfolioPro/personSections";
import {GetStaticPaths, GetStaticProps} from "next";


type Props = {people: ItemDict, selection: string, related: RelatedItem[]}

const ProPerson = ({people, selection, related}: Props) => {
  const item = people[selection]
  return (
    <ProLayout
      active={'people'}
      title={item ? `${item.title} · az.sh` : "People · az.sh"}
      description={item ? [item.subtitle, item.description].filter(Boolean).join(" — ") : undefined}
    >
      <ItemDetail items={people} id={selection} target={'people'} related={related}/>
    </ProLayout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: Object.keys(await fetchPeople()).map((selection) => ({params: {selection}})),
  fallback: 'blocking',
})

export const getStaticProps: GetStaticProps<Props> = async ({params}) => {
  const [people, projects] = await Promise.all([fetchPeople(), fetchProjects()])
  const selection = String(params?.selection ?? "")
  const entry = people[selection]
  const refs = ((entry ? asPerson(entry)?.projects : undefined) ?? []) as {id?: string}[]

  // Resolve the person's project ids against the project list; ids with no
  // matching project are dropped rather than rendered as a dead link.
  const related: RelatedItem[] = refs
    .map((r) => r.id)
    .filter((id): id is string => !!id)
    .map((id) => projects[id])
    .filter(Boolean)
    .map((p) => ({id: p.id, title: p.title, subtitle: p.subtitle ?? null, icon: p.icon}))

  return {props: {people, selection, related}, revalidate: 300}
}

export default ProPerson
