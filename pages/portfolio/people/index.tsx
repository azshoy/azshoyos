import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import {ItemList} from "@/components/standalonePages/portfolioPro/itemList";
import {usePeople} from "@/components/standalonePages/portfolio/data/people";


const ProPeople = () => {
  const people = usePeople()
  return (
    <ProLayout active={'people'} title={"People — az.sh"}>
      <ItemList
        items={people}
        target={'people'}
        title={"People"}
        lede={"The engineers and designers who do the work."}
      />
    </ProLayout>
  )
}

export default ProPeople
