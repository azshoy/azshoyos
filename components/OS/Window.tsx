import {CSSProperties, ReactNode, useContext, useEffect, useState} from "react";
import {v2} from "@/util/types";
import styles from "@/components/Program/program.module.css";
import {FileExplorerProgramClass, WindowedProgramClass} from "@/components/Program/Program";
import {TaskManagerContext} from "@/components/OS/TaskManager";
import {WindowManagerContext} from "@/components/OS/WindowManager";
import {useCursor} from "@/components/OS/Cursor";


type WindowProps = {
  position: v2
  size: v2
  program: WindowedProgramClass
  taskID: number
}
const getWindowStyle = (p: v2, s: v2, z: number, max: boolean, min: boolean, moving: boolean):CSSProperties => {
  if (!min) {
    if (max) {
      return {
        transition: moving ? "none" : "width 0.3s, height 0.3s, left 0.3s, top 0.3s",
        width: 100 + "%",
        height: "calc(100% - var(--bar-height))",
        left: 0 + "px",
        top: 0 + "px",
        zIndex: 1000 - z
      }
    } else {
      return {
        transition: moving ? "none" : "width 0.3s, height 0.3s, left 0.3s, top 0.3s",
        width: s.x + "px",
        height: s.y + "px",
        left: p.x + "px",
        top: p.y + "px",
        zIndex:  1000 - z
      }
    }
  } else {
    return {
      transition: "width 0.3s, height 0.3s, left 0.3s, top 0.3s",
      width: 0 + "%",
      height: 0 + "%",
      left: 25 + "%",
      top: 100 + "%",
      zIndex: 1000 - z
    }
  }
}
type WindowSide = "top" | "left" | "right" | "bottom"

export const ProgramWindow = ({
  position: initialPosition,
  size: initialSize,
  program: initialProgram,
  taskID,
}:WindowProps) => {
  const {killTask, taskUpdate, tasks, programs, setShortcutUpdate} = useContext(TaskManagerContext)
  const [program, setProgram] = useState<WindowedProgramClass | null>(initialProgram)
  const [newProgram, setNewProgram] = useState<WindowedProgramClass | null>(null)
  const [position, setPosition] = useState(initialPosition)
  const [zIndex, setZIndex] = useState(0)
  const [size, setSize] = useState(initialSize)
  const [windowMaximized, setWindowMaximized] = useState(false)
  const [windowMinimized, setWindowMinimized] = useState(false)
  const windowManager = useContext(WindowManagerContext)
  const [isMoving, setIsMoving] = useState(false)
  const [moveOffset, setMoveOffset] = useState({x: 0, y: 0})
  const [resize, setResize] = useState<{o: number, side: WindowSide} | null>(null)
  const cursor = useCursor()

  useEffect(() => {
    if (windowManager) {
      const index = windowManager.order.indexOf(taskID)
      if (index != zIndex){
        setZIndex(index)
      }
      if (windowManager.focused == taskID){
        setWindowMinimized(false)
      }
    }
  }, [windowManager?.orderUpdated, zIndex, windowManager?.focused, taskID]);

  useEffect(() => {
    windowManager?.focus(taskID)
  }, [])


  useEffect(() => {
    const thisTask = tasks.find((t) => t.taskID == taskID)
    if (thisTask && thisTask.update == taskUpdate) {
      setNewProgram(programs[thisTask.programID] as WindowedProgramClass)
      setProgram(null)
    }
  }, [tasks, taskUpdate])

  useEffect(() => {
    if (newProgram) {
      setProgram(newProgram)
      setNewProgram(null)
    }
  }, [newProgram])

  const windowStyle = getWindowStyle(position, size, zIndex, windowMaximized, windowMinimized, isMoving || !!resize)

  const startMove = (e:React.MouseEvent) => {
    setMoveOffset({x: cursor.pageX - position.x, y: cursor.pageY - position.y})
    setIsMoving(true)
    windowManager?.focus(taskID)
  }
  const minimize = (e:React.MouseEvent) => {
    e.stopPropagation()
    setWindowMinimized(!windowMinimized)
  }
  const toggleMaximize = (e:React.MouseEvent) => {
    e.stopPropagation()
    setWindowMaximized(!windowMaximized)
  }
  const close = (e:React.MouseEvent) => {
    e.stopPropagation()
    killTask(taskID)
  }
  const doResize = (e:React.MouseEvent, side:WindowSide) => {
    e.preventDefault()
    e.stopPropagation()
    switch (side) {
      case "top":
        setResize({o: cursor.pageY, side: side})
        break
      case "left":
        setResize({o: cursor.pageX, side: side})
        break
      case "bottom":
        setResize({o: cursor.pageY, side: side})
        break
      case "right":
        setResize({o: cursor.pageX, side: side})
        break
    }
  }
  useEffect(() => {
    if (isMoving) {
      if (cursor.clickActive) {
        const newPos = {x: cursor.pageX - moveOffset.x, y: cursor.pageY - moveOffset.y}
        if (newPos.x != position.x || newPos.y != position.y) {

          if (windowMaximized) {
            setWindowMaximized(false)
          }
          setPosition({x: cursor.pageX - moveOffset.x, y: cursor.pageY - moveOffset.y})
        }
      } else {
        if (position.y < 5){
          setPosition({x: position.x, y: 0})
          setWindowMaximized(true)
        }
        setIsMoving(false)
      }
    }
  }, [cursor, isMoving, moveOffset, position, windowMaximized]);

  useEffect(() => {
    if (resize) {
      if (cursor.clickActive) {
        const diff = {x: cursor.pageX - resize.o, y: cursor.pageY - resize.o}
        switch (resize.side) {
          case "top":
            if (diff.y !== 0){
              setResize({side: resize.side, o: cursor.pageY})
              setPosition({x: position.x, y: position.y + diff.y})
              setSize({x: size.x, y:size.y - diff.y})
            }
            break
          case "left":
            if (diff.x !== 0) {
              setResize({side: resize.side, o: cursor.pageX})
              setPosition({x: position.x + diff.x, y: position.y})
              setSize({x: size.x - diff.x, y: size.y})
            }
            break
          case "bottom":
            if (diff.y !== 0) {
              setResize({side: resize.side, o: cursor.pageY})
              setSize({x: size.x, y: size.y + diff.y})
            }
            break
          case "right":
            if (diff.x !== 0) {
              setResize({side: resize.side, o: cursor.pageX})
              setSize({x: size.x + diff.x, y: size.y})
            }
            break
        }
      } else {
        setResize(null)
      }
    }
  }, [cursor, resize, size, position]);
  useEffect(() => {
    if (windowMinimized && windowManager){
      windowManager.unfocus(taskID)
    }
  }, [windowMinimized, taskID]);

  return (
    <div className={styles.window} onClick={() => windowManager?.focus(taskID)} style={windowStyle}>
      <div className={styles.windowEdgeVertical} onMouseDown={(e) => doResize(e, "left")}></div>
      <div className={styles.windowMid}>
        <div className={styles.windowEdgeHorizontal} onMouseDown={(e) => doResize(e, "top")}></div>

        <div className={styles.windowMid}>
        <div className={styles.titleBar} onMouseDown={startMove}>
          {program !== null ?
            <>
              <img src={program.icon} alt={''} className={styles.icon}></img>
              <div className={styles.title}>
                {program.title}
              </div>
            </>
          : null}
          <button className={styles.minimize} onClick={minimize}>
            <img src={'/icons/minimize.svg'} alt={''} className={styles.icon}></img>
          </button>
          <button className={styles.minimize} onClick={toggleMaximize}>
            <img src={windowMaximized ? '/icons/unmaximize.svg' : '/icons/maximize.svg'} alt={''} className={styles.icon}></img>
          </button>
          <button className={styles.close} onClick={close}>
            <img src={'/icons/close.svg'} alt={''} className={styles.icon}></img>
          </button>
        </div>
        <div className={styles.program}>
          {program ? program.programWindow : null}
        </div>
        </div>
        <div className={styles.windowEdgeHorizontal} onMouseDown={(e) => doResize(e, "bottom")}></div>
      </div>
      <div className={styles.windowEdgeVertical} onMouseDown={(e) => doResize(e, "right")}></div>
    </div>
  )


}


