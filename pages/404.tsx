import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import Link from "next/link";
import {useRouter} from "next/router";


// Shown for any unknown URL, with a real 404 status. Under /portfolio/people
// or /portfolio/projects it looks like that section's old "Not found." state:
// the same nav highlight and back link.
const NotFound = () => {
  const section = useRouter().asPath.match(/^\/portfolio\/(people|projects)\b/)?.[1] as 'people' | 'projects' | undefined
  const target = section ?? 'projects'
  return (
    <ProLayout active={section} title={"Not found · az.sh"} description={"This page does not exist."} noindex={true}>
      <Link className={styles.back} href={`/portfolio/${target}`}>← Back to {target}</Link>
      <p className={styles.empty}>Not found.</p>
    </ProLayout>
  )
}

export default NotFound
