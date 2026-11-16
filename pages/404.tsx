import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import Link from "next/link";
import {useEffect, useState} from "react";


type Section = 'people' | 'projects'

// Shown for any unknown URL, with a real 404 status. Under /portfolio/people
// or /portfolio/projects it looks like that section's old "Not found." state:
// the same nav highlight and back link. The page is pre-rendered once (as
// /404), so the section is read from the real URL after mount; reading it
// during render would make the server and browser HTML disagree.
const NotFound = () => {
  const [section, setSection] = useState<Section | undefined>(undefined)
  useEffect(() => {
    setSection(window.location.pathname.match(/^\/portfolio\/(people|projects)\b/)?.[1] as Section | undefined)
  }, [])
  const target = section ?? 'projects'
  return (
    <ProLayout active={section} title={"Not found · az.sh"} description={"This page does not exist."} noindex={true}>
      <Link className={styles.back} href={`/portfolio/${target}`}>← Back to {target}</Link>
      <p className={styles.empty}>Not found.</p>
    </ProLayout>
  )
}

export default NotFound
