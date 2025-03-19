import "@/globalStyles/globals.css";
import styles from '@/globalStyles/global.module.css'
import { TaskBar } from "@/components/TaskBar";
import {ProgramProperties, TaskManager} from "@/util/taskManager";
import { WindowManager } from "@/components/WindowManager";
import {Desktop} from "@/components/desktop";
import {useEffect, useRef, useState} from "react";
import {ShortCut, ShortCutProps} from "@/components/Program/ShortCut";
import {Vector2} from "@/util/types";


export const Home = ()=> {
  const [taskManager, setWindowManager] = useState<TaskManager|null>(null)
  const screenArea = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (screenArea && screenArea.current) {
      setWindowManager(new TaskManager(screenArea.current))
    }
  }, [screenArea]);
  const content = taskManager ? <Content taskManager={taskManager} shortCuts={getShortCuts(taskManager)}/> : <div key={0} className={styles.loading}></div>

  return (
      <div ref={screenArea} className={styles.screenArea}>
        {content}
      </div>
  );
}

type ContentProps = {
  taskManager:TaskManager,
  shortCuts: ShortCut[]
}

const Content = ({
  taskManager,
  shortCuts,
}:ContentProps) => {

  return ([
    <div key={0} className={styles.main} onClick={(e) => taskManager.anyclick()}>
      <Desktop shortCuts={shortCuts} taskManager={taskManager}></Desktop>
      <WindowManager taskManager={taskManager}></WindowManager>
    </div>,
    <TaskBar key={1} taskManager={taskManager}/>,
    <CloseComputer key={2} taskManager={taskManager}/>
  ])
}

const getShortCuts = (taskManager:TaskManager):ShortCut[]=>{
  const shortCuts:ShortCut[] = []
  for (let s = 0; s < shortCutInputs.length; s++){
    const sci = shortCutInputs[s]
    const props:ShortCutProps = {
      taskManager: taskManager,
      properties: sci.properties,
      parameters: sci.parameters,
      position: sci.position,
      startMenuIcon: sci.startMenuIcon,
      desktopIcon: sci.startMenuIcon
    }
    shortCuts.push(new ShortCut(props))
  }
  return shortCuts
}



type ShortCutInput = {
  properties: ProgramProperties
  parameters: string[]
  position: Vector2
  startMenuIcon?: boolean
  desktopIcon?: boolean
}

const shortCutInputs: ShortCutInput[] = [
  {
    properties: {
      tittle: "Trash",
      icon: "/icons/trash_empty.svg",
      description: "Last stop before dev/null",
      program: "files",
      extra: "trash",
    },
    parameters: ["cd", "-s", "trash"],
    position: new Vector2(1,1)
  },
  {
    properties: {
      tittle: "Our Computer",
      icon: "/icons/computer.svg",
      description: "This does the thing",
      program: "files",
      extra: "closeiftrashed"
    },
    parameters: ["cd", "-s", "root"],
    position: new Vector2(0,0)
  },
  {
    properties: {
      tittle: "az.sh",
      icon: "/icons/console.svg",
      description: "The Best Shell",
      program: "console",
    },
    parameters: [],
    position: new Vector2(0,0.1)
  },
  {
    properties: {
      tittle: "Contact information",
      icon: "/icons/contact.svg",
      description: "",
      program: "document",
    },
    parameters: ["contact"],
    position: new Vector2(0.3,0.8)
  },
  {
    properties: {
      tittle: "Readme.md",
      icon: "/icons/document.svg",
      description: "",
      program: "document",
    },
    parameters: ["readme"],
    position: new Vector2(0.6,0.4)
  },
  {
    properties: {
      tittle: "Interweb zplorer",
      icon: "/icons/zplorer.svg",
      description: "Very Fast yes",
      program: "",
      extra: "openTab"
    },
    parameters: [],
    position: new Vector2(0.4,0.2)
  }
]

export default Home


type CloseComputerProps = {
  taskManager:TaskManager,
}


const CloseComputer = ({
  taskManager,
}:CloseComputerProps) => {
  const [shutState, shutDown] = useState(0)
  taskManager.shutDown = shutDown
  const classN = shutState == 0 ? styles.hidden : shutState == 1 ? styles.shutDownNow : styles.shutDown
  return (
    <div className={classN}>
      <div className={styles.shutDownBye}>
        kthxbye :(
      </div>
      <div className={styles.topshutter}>
        <div className={styles.shutterline}></div>
      </div>

      <div className={styles.bottomshutter}>
        <div className={styles.shutterline}></div>
      </div>
    </div>
  )
}