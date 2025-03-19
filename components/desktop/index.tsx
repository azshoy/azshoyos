import styles from "./desktop.module.css";
import {ShortCut} from "@/components/Program/ShortCut";
import {TaskManager} from "@/util/taskManager";
import {useState} from "react";



export type DesktopProps = {
  shortCuts: ShortCut[]
  taskManager: TaskManager
}

export const Desktop = ({
  shortCuts,
  taskManager
}:DesktopProps) => {
  const [, updateDesktop] = useState(0)
  taskManager.subscribe("Desktop", "size", updateDesktop)
  taskManager.subscribe("Desktop", "shortcuts", updateDesktop)

  const scr = []
  for (let s = 0; s < shortCuts.length; s++){
    if (shortCuts[s].desktopIcon) scr.push(shortCuts[s].render())
  }

  return (
    <div className={styles.desktop}>
      {scr}
    </div>
  );
}

