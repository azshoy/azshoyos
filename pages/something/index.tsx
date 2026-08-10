import "@/globalStyles/global.css";
import People from "@/pages/people";
import {useRouter} from "next/router";
import {useEffect} from "react";


const SinglePerson = () => {
  const router = useRouter()
  const id = Array.isArray(router.query.selection) ? router.query.selection[0] : router.query.selection
  useEffect(() => {
    if (!router.isReady) return
    router.push("/people/", "/people/" + id).then()
  }, [router.isReady, id])
  return <People/>
}

export default SinglePerson
