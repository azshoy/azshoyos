import styles from "./taskBar.module.css";
import {ProgramProperties, TaskManager} from "@/util/taskManager";
import {useState} from "react";
import {Program} from "@/components/Program";

export type TaskBarProps = {
  taskManager: TaskManager
}

export const TaskBar = ({
  taskManager
}:TaskBarProps) => {
  const [, onWindowUpdate] = useState(0)
  taskManager.subscribe("TaskBar", "window", onWindowUpdate)
  const prog = []
  for (let p = 0; p < taskManager.programs.length; p++){
    const program = taskManager.programs[p]
    prog.push(program.taskBarButton)
  }
  return (
    <div className={styles.taskBar}>
      <StartMenu taskManager={taskManager}/>
      <StartMenuButton taskManager={taskManager}/>
      <div className={styles.verticalSeparator}></div>
      <div className={styles.tasks}>
        {prog}
      </div>
      <div className={styles.verticalSeparator}></div>
      <Clock/>
    </div>
  );
}


export const Clock = () => {
  return (
    <div className={styles.clock}>13:37</div>
  );
}


export type startMenuProps = {
  taskManager: TaskManager
}
export const StartMenuButton = ({
  taskManager,
}:startMenuProps) => {
  return (
      <div className={`${styles.taskBarButton} ${styles.startButton}`} onClick={(e) => taskManager.toggleStartMenu()}>
        <img src={'/icons/start.svg'} alt={''} className={styles.icon}></img>
        <div className={styles.tittle}>
          MENU
        </div>
      </div>
  );
}

export type TaskBarButtonProps = {
  programProperties: ProgramProperties,
  program: Program
}

export const TaskBarButton = ({
  programProperties,
  program
}:TaskBarButtonProps) => {
  return (
    <div className={styles.taskBarButton} onClick={(e) => program.pop()}>
      <img src={programProperties.icon} alt={programProperties.description} className={styles.icon}></img>
      <div className={styles.tittle}>
        {programProperties.tittle}
      </div>
    </div>
  );
}

export const StartMenu = ({
  taskManager,
}:startMenuProps) => {
  const [showMenu, setShowMenu] = useState(false)
  taskManager.startMenuState = setShowMenu
  if (!showMenu){
    return (<div className={styles.startMenuHolder}></div>)
  }
  const scr = []
  for (let s = 0; s < taskManager.shortCuts.length; s++){
    const shortCut = taskManager.shortCuts[s]
    scr.push(shortCut.startMenuShortcut)
  }
  const profileImage:string = profileimages[Math.floor(Math.random()*999999) % profileimages.length]

  return (
  <div className={styles.startMenuHolder}>
    <div className={styles.startMenu}>
      <div className={styles.startMenuHead}>
        <img src={profileImage} alt={''} className={styles.icon}></img>
        <div className={styles.tittle}>
        az.sh
        </div>
      </div>
      {scr}


      <div className={styles.horizontalSeparator}></div>
      <div className={styles.startMenuButton} onClick={() => taskManager.closeComputer()}>
        <img src={'/icons/shutdown.svg'} alt={''} className={styles.icon}></img>
        <div className={styles.tittle}>
          Shutdown
        </div>
      </div>
    </div>
  </div>
  );
}

const profileimages = [
  '/logo/bluegreen.svg', '/logo/goldngreen.svg', '/logo/green.svg', '/logo/greenngold.svg',
  '/logo/magentagreen.svg', '/logo/purplegreen.svg', '/logo/bluenyellow.svg', '/logo/whiteonblack.svg',
]
