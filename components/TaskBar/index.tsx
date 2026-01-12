import styles from "./taskBar.module.css";
import {ReactNode, useContext, useEffect, useMemo, useRef, useState} from "react";
import {TaskManagerContext} from "@/components/OS/TaskManager";
import {ProgramClass} from "@/components/Program/Program";
import {WindowManagerContext} from "@/components/OS/WindowManager";
import {Shortcut} from "@/components/Shortcut/Shortcut";


export const TaskBar = ({

}) => {
  const [taskButtons, setTaskButtons] = useState<ReactNode[]>([])
  const {tasks, taskUpdate, programs} = useContext(TaskManagerContext)

  useEffect(() => {
    const btn = tasks.filter((t) => t.type == 'window').map((t) => {
      return <TaskBarButton key={t.taskID} taskID={t.taskID} program={programs[t.programID]}/>
    })
    setTaskButtons(btn)
  }, [tasks, taskUpdate]);


  return (
    <div className={styles.taskBar}>
      <StartMenuHandler/>
      <div className={styles.verticalSeparator}></div>
      <div className={styles.tasks}>
        {taskButtons}
      </div>
      <div className={styles.verticalSeparator}></div>
      <Clock/>
    </div>
  );
}


export const Clock = () => {
  const [, setTime] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);
  const digits = new Date().toLocaleString('fi-Fi', {hour: '2-digit', minute: '2-digit',  hour12: false, timeZone: 'Europe/Helsinki' })
  return (
    <div className={styles.clock}>
      <div className={styles.num}>{digits[0]}</div>
      <div className={styles.num}>{digits[1]}</div>
      <div>{digits[2]}</div>
      <div className={styles.num}>{digits[3]}</div>
      <div className={styles.num}>{digits[4]}</div>
    </div>
  );
}

export type TaskBarButtonProps = {
  program: ProgramClass
  taskID: number
}

export const TaskBarButton = ({
  taskID,
  program
}:TaskBarButtonProps) => {
  const windowManager = useContext(WindowManagerContext)
  return (
    <div className={styles.taskBarButton} onClick={() => windowManager?.focus(taskID)}>
      <img src={program.icon} alt={program.description || ""} className={styles.icon}></img>
      <div className={styles.title}>
        {program.title}
      </div>
    </div>
  );
}



export const StartMenuHandler = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [outsideClick, setOutsideClick] = useState(0)
  const [insideClick, setInsideClick] = useState(0)
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const closeMenu = () => {
      setOutsideClick(Date.now)
    }
    if (window) window.removeEventListener('click', closeMenu)
    if (window) window.addEventListener('click', closeMenu)
    return () => {
      if (window) window.removeEventListener('click', closeMenu)
    }
  }, []);

  useEffect(() => {
    if (outsideClick - insideClick > 100){
      timer.current = setTimeout(() => {
        setMenuOpen(false)
      })
    } else if (timer.current) clearTimeout(timer.current)
    return () => {if (timer.current) clearTimeout(timer.current)}
  }, [outsideClick, insideClick]);

  const toggleMenu = () => {
    if (!menuOpen){
      setInsideClick(Date.now())
    }
    setMenuOpen(!menuOpen)
  }

  return (
    <>
      <div className={styles.startMenuHolder} onClick={() => setInsideClick(Date.now())}>
        {menuOpen ? <StartMenu toggleMenu={toggleMenu}/> : null}
      </div>
      <div className={`${styles.taskBarButton} ${styles.startButton}`} onClick={() => toggleMenu()}>
        <img src={'/icons/start.svg'} alt={''} className={styles.icon}></img>
        <div className={styles.tittle}>
          MENU
        </div>
      </div>
    </>
  )
}


export const StartMenu = ({toggleMenu}:{toggleMenu:CallableFunction}) => {

  const {shortcuts, setShutDown} = useContext(TaskManagerContext)
  const [profileImage, setProfileImage] = useState(profileimages[0])
  useEffect(() => {
    setProfileImage(profileimages[Math.floor(Math.random()*999999) % profileimages.length])
  }, []);

  return (
    <div className={styles.startMenu}>
      <div className={styles.startMenuHead}>
        <img src={profileImage} alt={''} className={styles.icon}></img>
        <div className={styles.title}>
        az.sh
        </div>
      </div>
      {shortcuts.filter((s) => s.showInStartMenu).map((s) => <StartMenuShortcut shortcut={s} key={s.id} toggleMenu={toggleMenu}/>)}
      <div className={styles.horizontalSeparator}></div>
      <div className={styles.startMenuButton} onClick={() => setShutDown(1)}>
        <img src={'/icons/shutdown.svg'} alt={''} className={styles.icon}></img>
        <div className={styles.title}>
          Shutdown
        </div>
      </div>
    </div>
  );
}

type StartMenuShortcutProps = {
  shortcut: Shortcut
  toggleMenu:CallableFunction
}

export const StartMenuShortcut = ({
  shortcut,
  toggleMenu
}:StartMenuShortcutProps) => {
  const {startNewTask, programs} = useContext(TaskManagerContext)
  const program = programs[shortcut.programID]
  const onClick = () => {
    startNewTask(shortcut.programID)
    toggleMenu()
  }
  return (
    <div className={styles.startMenuButton} onClick={() => onClick()}>
      <img src={program.icon} alt={program.description || ""} className={styles.icon}></img>
      <div className={styles.title}>
        {program.title}
      </div>
    </div>
  );
}


const profileimages = [
  '/logo/bluegreen.svg', '/logo/goldngreen.svg', '/logo/green.svg', '/logo/greenngold.svg',
  '/logo/magentagreen.svg', '/logo/purplegreen.svg', '/logo/bluenyellow.svg', '/logo/whiteonblack.svg',
]
