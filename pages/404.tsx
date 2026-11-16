import {ProLayout} from "@/components/standalonePages/portfolioPro/layout";
import styles from "@/components/standalonePages/portfolioPro/pro.module.css";
import Link from "next/link";


// Shown for any unknown URL, including a project or person that does not exist.
// Same look as the portfolio's old "Not found." state, with a real 404 status.
const NotFound = () => (
  <ProLayout title={"Not found · az.sh"} description={"This page does not exist."} noindex={true}>
    <Link className={styles.back} href={"/portfolio/projects"}>← Back to projects</Link>
    <p className={styles.empty}>Not found.</p>
  </ProLayout>
)

export default NotFound
