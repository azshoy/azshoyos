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
  console.log("waat?")
  for (let p = 0; p < taskManager.programs.length; p++){
    const program = taskManager.programs[p]
    console.log(program.minimized)
    if (!program.minimized){
      prog.push(program.render())
    } else {
      console.log("should be minimized")
    }
  }

  return (
    <div className={styles.windowManager}>
      {prog}
    </div>
  );
}

