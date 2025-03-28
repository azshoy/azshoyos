import styles from "./windowManager.module.css";
import {TaskManager} from "@/util/taskManager";
import {useState} from "react";



export type WindowManagerProps = {
  taskManager: TaskManager
}

export const WindowManager = ({
  taskManager,
}:WindowManagerProps) => {
  const [, onWindowUpdate] = useState(0)
  taskManager.subscribe("windowManager", "window", onWindowUpdate)
  const prog = []
  for (let p = 0; p < taskManager.programs.length; p++){
    const program = taskManager.programs[p]
    if (!program.minimized){
      prog.push(program.render())
    }
  }

  return (
    <div className={styles.windowManager}>
      {prog}
    </div>
  );
}

