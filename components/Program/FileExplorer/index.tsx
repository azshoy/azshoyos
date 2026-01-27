import styles from "../program.module.css";
import {Component} from "react";
import globalStyles from "@/globalStyles/global.module.css";
import {Directory} from "@/components/Directory/Directory";


export type FileExplorerTypes = {
  windowComponent: typeof FileExplorer
  parameters: FileExplorerProps
}

export type FileExplorerProps = {
  path: string[]
}


export const FileExplorer = ({
  path,
}:FileExplorerProps) => {
  return <div className={styles.container}><Directory path={path} showPathBar/></div>
}
