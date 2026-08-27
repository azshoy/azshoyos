import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemDetail} from "@/components/standalonePages/portfolioPro/itemDetail";
import {usePeople} from "@/components/standalonePages/portfolio/data/people";
import {useRouter} from "next/router";


const ProPerson = () => {
  const people = usePeople()
  const router = useRouter()
  const selection = Array.isArray(router.query.selection) ? router.query.selection[0] : router.query.selection
  const item = selection ? people[selection] : undefined

  return (
    <ProLayout active={'people'} title={item ? `${item.title} — az.sh` : "People — az.sh"}>
      <ItemDetail items={people} id={selection ?? ""} target={'people'}/>
    </ProLayout>
  )
}

export default ProPerson
