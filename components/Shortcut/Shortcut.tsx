
import {CSSPropertiesPlus, v2} from "@/util/types";
import {DirGrid} from "@/components/Directory/Directory";
import {CSSProperties, useContext, useEffect, useRef, useState} from "react";
import styles from "@/components/Shortcut/shortcut.module.css";
import {DragManagerContext, TaskManagerContext} from "@/components/OS/TaskManager";
import {clampf} from "@/util/misc";
import {useMonitor} from "@/components/OS/MonitorHandler";
import {ProgramAction} from "@/components/Program/Program";



export type ShortcutInitProps = {
  programID: string
  title: string,
  index: number
  description: string,
  path: string[]
  position?: v2
  order?: number
  randomizePosition?: boolean
  onMove?: (_p:v2) => void,
  onMoveDir?: (_p:string[]) => ProgramAction
  icon: string | (() => string)
  showInStartMenu?: boolean
}

export class Shortcut {
  programID: string
  path: string[]
  title: string
  description: string
  position: v2
  dropped: boolean = false
  order: number | undefined
  iconFile?: string
  id: string
  showInStartMenu: boolean
  iconFunc: (() => string) = () => ""
  onMove = (p:v2) => {}
  onMoveDir = (p:string[]) => ProgramAction.DEFAULT
  constructor(props:ShortcutInitProps) {
    if (typeof props.icon == 'string') {
      this.iconFile = props.icon
    } else {
      this.iconFunc = props.icon
    }
    if (props.onMove) this.onMove = props.onMove
    if (props.onMoveDir) this.onMoveDir = props.onMoveDir
    this.showInStartMenu = props.showInStartMenu ?? false
    this.id = "s" + props.index
    this.title = props.title
    this.description = props.description
    this.programID = props.programID
    this.path = props.path
    this.position = props.randomizePosition && props.position ? getRandomPosition(props.position, 0.1) : props.position ?? {x: 1, y: 1}
    this.order = props.order
  }
  get icon() {
    return this.iconFile ? this.iconFile : this.iconFunc()
  }
}
const getRandomPosition = (p:v2, d:number) => {
  return {x: getRandomValue(p.x, d), y: getRandomValue(p.y, d)}
}
const getRandomValue = (v:number, d: number, b:number=1) => {
  return Math.random() * b * d + v * (1-d)
}

type ShortcutComponentProps = {
  shortcut: Shortcut,
  grid: DirGrid,
  freePos: boolean
  dropTo: CallableFunction
  gridPos?: v2
}

const useDanceTimer = () => {
  const {specialEffects} = useContext(TaskManagerContext)
  const danceTimer = useRef<ReturnType<typeof setInterval>>(null);
  const [dance, setDance] = useState(0)
  useEffect(() => {
    if (specialEffects.effects.includes("shortcuts_dance")){
      danceTimer.current = setInterval(() => {
        setDance(Date.now())
      }, 250)
    } else {
      setDance(0)
    }
    return () => {
      if (danceTimer.current) clearInterval(danceTimer.current)
    }
  }, [specialEffects.updated]);
  return dance
}

export const ShortcutComponent = ({
  shortcut,
  grid,
  freePos,
  dropTo,
  gridPos
}:ShortcutComponentProps) => {
  const {startNewTask, shortcutUpdate} = useContext(TaskManagerContext)
  const [gridArea, setGridArea] = useState<string|undefined>(undefined)
  const [order, setOrder] = useState<number|undefined>(undefined)
  const [click, setClick] = useState<boolean>(false)
  const [doubleClick, setDoubleClick] = useState<boolean>(false)
  const element = useRef<HTMLDivElement>(null)
  const DMC = useContext(DragManagerContext)
  const [move, setMove] = useState<{p: v2, skipIfFail:boolean} | null>(null)
  const [danceAround, setDanceAround] = useState<v2 | null>(null)

  const {uiScale} = useMonitor()
  const dance = useDanceTimer()
  useEffect(() => {
    if (dance > 0){
      if (freePos && !move){
        if (!danceAround){
          setDanceAround(shortcut.position)
        } else {
          const d = {
            x: Math.sign(danceAround.x - shortcut.position.x + (Math.random()-0.5)/100.0),
            y: Math.sign(danceAround.y - shortcut.position.y + (Math.random()-0.5)/100.0)
          }
          setMove({p:{x: Math.random()*0.2 * d.x - 0.07*d.x, y: Math.random()*0.2 * d.y - 0.07*d.y}, skipIfFail:true})
          setDanceAround({
            x: danceAround.x * 0.9 + shortcut.position.x * 0.1,
            y: danceAround.y * 0.9 + shortcut.position.y * 0.1,
          })
        }

      }
    }
  }, [dance, freePos, danceAround]);

  useEffect(() => {
    if (move && (move.p.x != 0 || move.p.y != 0)){
      shortcut.position.x = clampf(shortcut.position.x + move.p.x)
      shortcut.position.y = clampf(shortcut.position.y + move.p.y)
      dropTo(shortcut, false, 0, move.skipIfFail)
      setMove(null)
    }
  }, [move, dropTo]);

  useEffect(() => {
    if (click) {
      if (doubleClick) {
        startNewTask(shortcut.programID)
        setDoubleClick(false)
      } else {
        setDoubleClick(true)
        setTimeout(() => {setDoubleClick(false)}, 300)
      }
      setClick(false)
    }
  }, [click, doubleClick]);

  useEffect(() => {
    if (grid){
      if (typeof gridPos == 'undefined') {
        if (freePos) {
          dropTo(shortcut, true)
        } else {
          const gPos = {x: Math.floor(shortcut.position.x * (grid.gridSize.y-0.001)), y: Math.floor(shortcut.position.y * (grid.gridSize.y-0.001))}
          const ord = shortcut.order ?? gPos.x + gPos.y * (grid.gridSize.x+1)
          shortcut.order = ord
          setOrder(ord)
        }
      } else {
        const gArea = ((gridPos.y+1) + " / " + (gridPos.x+1))
        shortcut.position = {x: (gridPos.x + 0.5) / grid.gridSize.x, y: (gridPos.y + 0.5) / grid.gridSize.y}
        setGridArea(gArea)
      }
    }
  }, [grid, freePos, gridPos, dropTo, shortcut, shortcutUpdate]);


  const startDragging = (clientClickPos:v2) => {
    setClick(true)
    if (element.current && DMC) {
      const elemRect = element.current.getBoundingClientRect()
      DMC.startDragging(shortcut, {x: clientClickPos.x - elemRect.x, y: clientClickPos.y - elemRect.y})
    }
  }
  const onMouseDown = (e:React.MouseEvent) => {
    startDragging({x: e.clientX, y: e.clientY})
  }
  const onTouchStart = (e:React.TouchEvent) => {
    if (e.touches.length > 0) {
      startDragging({x: e.touches[0].clientX, y: e.touches[0].clientY})
    }
  }


  const style:CSSPropertiesPlus = {"--scale": uiScale, ...(freePos ? gridArea ? {gridArea: gridArea} : {visibility: "hidden"} : order ? {order: order} : {visibility: "hidden"})}
  return (
    <div ref={element} style={style} className={styles.shortCutHolder} onMouseDown={(e) => onMouseDown(e)} onTouchStart={(e) => onTouchStart(e)}>
      <div className={styles.slot}>
        <ShortcutContent shortcut={shortcut}/>
      </div>
    </div>
  )
}


const ShortcutContent =  ({shortcut}:{shortcut:Shortcut}) => {
  return (
    <div className={styles.shortCut}>
      <img src={shortcut.icon} alt={shortcut.description || ""} className={styles.icon}></img>
      <div className={styles.title}>
        {shortcut.title}
      </div>
    </div>
  )
}


type ShortcutDraggableProps = {
  x: number, y: number
  shortcut: Shortcut
}

export const ShortcutDraggable = ({
  x,
  y,
  shortcut
}:ShortcutDraggableProps) => {
  return (
    <div className={styles.dragSlot} style={{top: y +"px", left: x + "px"}}>
      <ShortcutContent shortcut={shortcut}/>
    </div>
  )
}