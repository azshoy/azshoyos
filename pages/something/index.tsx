import "@/globalStyles/global.css";
import People from "@/pages/people";
import {useRouter} from "next/router";


const SinglePerson = () => {
  const router = useRouter()
  const id = Array.isArray(router.query.selection) ? router.query.selection[0] : router.query.selection
  const people = People.config.data()
  const person = router.query.person ? people[decodeURI(id?.toLowerCase() ?? "")] : null
  router.push("/people/", "/people/" + id).then()
  return <People/>
}

export default SinglePerson