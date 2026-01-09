import {createContext, CSSProperties, ReactNode, useEffect, useRef, useState} from "react";
import {programData} from "@/components/ProgramData/programs";
import {Shortcut, ShortcutDraggable} from "@/components/Shortcut/Shortcut";
import {v2} from "@/util/types";
import {
  DocumentReaderProgramClass,
  FileExplorerProgramClass,
  ProgramAction,
  ProgramClass,
  ProgramType,
  ScriptProgramClass,
  ShellConsoleProgramClass
} from "@/components/Program/Program";
import {WindowManagerProvider} from "@/components/OS/WindowManager";
import {removeFromArray} from "@/util/misc";
import {useCursor} from "@/components/OS/Cursor";


type ProgramIds = keyof typeof programData
export type TaskManagerInterface = {
  programs: Record<ProgramIds, ProgramClass>
  shortcuts: Shortcut[]
  shortcutID: number
  tasks: Task[]
  runXonY: (_x: Shortcut, _y:string) => boolean,
  startNewTask: (programID: string) => void,
  killTask: (taskID: number) => void,
  taskUpdate: number
  shutDown: number
  setShutDown: (s: number) => void
  shortcutUpdate: number,
  setShortcutUpdate: (s:number) => void,
  setShortcuts: (shortcuts:Shortcut[]) => void,
  setAsBackground: (s:CSSProperties['background']) => void,
  specialEffects: {effects: string[], add: (s:string) => void, remove: (s:string) => void, updated: number}
}



type TaskManagerProviderProps = {
  children: ReactNode
}



const initializeProgramsAndShortcuts = () => {
  const programs:Record<ProgramIds, ProgramClass> = {}
  const shortcuts:Shortcut[] = []
  Object.keys(programData).forEach((pID, index) => {
    const pd = {...programData[pID], identifier: pID}
    switch (pd.type) {
      case ProgramType.FILE_EXPLORER:
        programs[pID] = new FileExplorerProgramClass(pd)
        break
      case ProgramType.DOCUMENT_READER:
        programs[pID] = new DocumentReaderProgramClass(pd)
        break
      case ProgramType.SHELL_CONSOLE:
        programs[pID] = new ShellConsoleProgramClass(pd)
        break
      case ProgramType.RUNNABLE_SCRIPT:
        programs[pID] = new ScriptProgramClass(pd)
        break
    }
    shortcuts.push(programs[pID].createShortcut(index))
  })
  return {programs, shortcuts}
}


export type Task = {
  taskID: number,
  programID: string,
  type: 'window' | 'killed'
}

export const TaskManagerContext = createContext<TaskManagerInterface>({
  programs: {},
  shortcuts: [],
  tasks: [],
  shortcutID: 0,
  taskUpdate:0,
  shutDown:0,
  setShutDown: (s:number) => {},
  shortcutUpdate: 0,
  setShortcuts: (shortcuts:Shortcut[]) => {},
  setShortcutUpdate: (s:number) => {},
  runXonY: (x:Shortcut, y:string) => false,
  startNewTask: (programID: string) =>{},
  killTask: (taskID: number) =>{},
  setAsBackground: (s: CSSProperties['background']) =>{},
  specialEffects: {effects: [], add: (s:string) => {}, remove: (s:string)=> {}, updated: 0},
});

export const TaskManagerProvider = ({
    children
}:TaskManagerProviderProps) => {
  const defaultData = initializeProgramsAndShortcuts()
  const [shortcutID] = useState(defaultData.shortcuts.length+1)
  const [programs] = useState(defaultData.programs)
  const [shortcuts, setShortcuts] = useState(defaultData.shortcuts)
  const [shortcutUpdate, setShortcutUpdate] = useState(0)
  const [shutDown, setShutDown] = useState(0)
  const [newTask, setNewTask] = useState<string | null>(null)
  const [newKillTask, setKillTask] = useState<number | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [taskID, setTaskID] = useState(1)
  const [taskUpdate, setTaskUpdate] = useState(0)

  const specialEffects = useSpecialEffects()


  const [background, setAsBackground] = useState<CSSProperties['background']>('var(--blue-dark)')

  useEffect(() => {
    if (background == "default") {
      setAsBackground('var(--blue-dark)')
    } else {
      if (document){
        var root: HTMLElement | null = document.querySelector(':root')
        if (root) {
          root.style.setProperty('--background', String(background))
        }
      }
    }
  }, [background]);

  const runXonY = (x: Shortcut, y: string) =>{
    const program = programs[y]
    const res = program.runWith(x)
    switch (res){
      case ProgramAction.MOVE:
        if (program.programType == ProgramType.FILE_EXPLORER) {
          const onMoveRes = x.onMoveDir((program as FileExplorerProgramClass).parameters.path)
          switch (onMoveRes) {
            case ProgramAction.SHUTDOWN:
              setShutDown(1)
              break
            case ProgramAction.SHUTDOWNNOW:
              setShutDown(2)
              break
            case ProgramAction.NONE:
              return false
          }
          return true
        }
        return true
      default:
        return false

    }

  }
  useEffect(() => {
    if (newTask) {
      console.log("OPENING", newTask)
      const program = programs[newTask]
      if (program) {
        if (program.programType == ProgramType.RUNNABLE_SCRIPT) {
          (program as ScriptProgramClass).run()
        } else {
          setTasks([...tasks, {taskID: taskID, programID: newTask, type: 'window'}])
        }
        setTaskID(taskID + 1)
      }
    }
    setNewTask(null)
    setTaskUpdate(Date.now())
  }, [newTask, tasks, taskID]);

  useEffect(() => {
    if (newKillTask){
      const ntasks:Task[] = []
      tasks.forEach((t) => {
        if (t.taskID == newKillTask) {
          t.type = 'killed'
        }
        ntasks.push(t)
      })
      setTasks(ntasks)
      setTaskUpdate(Date.now())
      setKillTask(null)
    }
  }, [newKillTask, tasks]);


  useEffect(() => {
    if (shutDown == 1){
      setTimeout(() => {
        setShutDown(2)
      }, 10000)
    }
  }, [shutDown]);


  return (
    <TaskManagerContext.Provider value={{programs, shortcuts, shortcutID, tasks, taskUpdate, shutDown, setShutDown, setShortcuts, shortcutUpdate, setShortcutUpdate, runXonY, startNewTask:setNewTask, killTask:setKillTask, setAsBackground, specialEffects}}>
      <WindowManagerProvider>
        <DragManagerProvider>
          {children}
        </DragManagerProvider>
      </WindowManagerProvider>
    </TaskManagerContext.Provider>
    )
}
export type Draggable = Shortcut | null

const useSpecialEffects = () => {
  const [specialEffects, setSpecialEffects] = useState<string[]>([])
  const [specialEffectUpdated, setSpecialEffectUpdated] = useState(0)
  const [specialEffectToAdd, setSpecialEffectToAdd] = useState<string[]>([])
  const [specialEffectToRemove, setSpecialEffectToRemove] = useState<string[]>([])
  useEffect(() => {
    if (specialEffectToAdd.length > 0){
      const filtered = specialEffectToAdd.filter((se) => {
        return !(specialEffects.includes(se))
      })
      if (filtered){
        setSpecialEffects((prevState) => [...prevState, ...filtered])
      }
      setSpecialEffectUpdated(Date.now())
      setSpecialEffectToAdd([])
    }
  }, [specialEffectToAdd, specialEffects]);

  useEffect(() => {
    if (specialEffectToRemove.length > 0){
      const filtered = specialEffectToRemove.filter((se) => {
        return specialEffects.includes(se)
      })
      if (filtered){
        setSpecialEffects((prevState) => removeFromArray(prevState, filtered))
      }
      setSpecialEffectUpdated(Date.now())
      setSpecialEffectToRemove([])
    }
  }, [specialEffectToRemove, specialEffects]);

  const addSpecialEffect = (s:string) => {
    setSpecialEffectToAdd((prevState) => {
      return prevState.includes(s) ? prevState : [...prevState, s]
    })
  }
  const removeSpecialEffect = (s:string) => {
    setSpecialEffectToRemove((prevState) => {
      return prevState.includes(s) ? prevState : [...prevState, s]
    })
  }
  return {effects: specialEffects, add: addSpecialEffect, remove: removeSpecialEffect, updated: specialEffectUpdated}
}


type DragManagerInterface = {
  setCollector: CallableFunction
  startDragging: (_e:Draggable, _o:v2) => void
}

export const DragManagerContext = createContext<DragManagerInterface | undefined>(undefined);

enum DragState {
  IDLE,
  INIT,
  DRAGGING,
  DROPPED
}

export const DragManagerProvider = ({
    children
}:TaskManagerProviderProps) => {
  const [dragging, setDragging] = useState<Draggable>(null)
  const [offset, setOffset] = useState<v2>({x:0,y:0})
  const [dragState, setDragState] = useState<DragState>(DragState.IDLE)
  const [collector, setCollector] = useState<{f: CallableFunction} | undefined>(undefined)
  const [lMA, setLastMouseAction] = useState<{p:v2, t:string, s:number}>({p:{x:-1,y:-1}, t:"", s:0})

  const timer = useRef<ReturnType<typeof setTimeout>>(null);
  const cursor = useCursor()



  const startDragging = (e:Draggable, o:v2) => {
    setOffset(o)
    setDragging(e)
    setDragState(DragState.INIT)
  }

  useEffect(() => {
    if (typeof collector != 'undefined'){
      console.log("Collecting?", dragState)
      if (dragState == DragState.DROPPED){
        collector.f(dragging)
        setDragState(DragState.IDLE)
      }
      if (dragState != DragState.DRAGGING){
        setCollector(undefined)
      }
    }
  }, [dragging, dragState, collector]);

  useEffect(() => {
    console.log(dragState)
    if (dragState == DragState.INIT){
      timer.current = setTimeout(() => {
        setDragState(DragState.DRAGGING)
      }, 100)
    }
    if (dragState == DragState.DROPPED){
      timer.current = setTimeout(() => {
        setDragState(DragState.IDLE)
        setDragging(null)
      }, 100)
    }
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }

  }, [dragState]);

  useEffect(() => {
    if (Date.now()-lMA.s < 100){
      if (dragState == DragState.INIT && (lMA.t == 'touchmove' || lMA.t == 'mousemove')){
        console.log("set dragging")
        setDragState(DragState.DRAGGING)
      }
      if (dragState == DragState.INIT && (lMA.t == 'touchend' || lMA.t == 'mouseup')){
        console.log("set idle")
        setDragState(DragState.IDLE)
      }
      if (dragState == DragState.DRAGGING && (lMA.t == 'touchend' || lMA.t == 'mouseup')){
        console.log("set dropped")
        setDragState(DragState.DROPPED)
      }
    }
  }, [dragState, lMA.t]);

  useEffect(() => {
    setLastMouseAction({p:{x:cursor.clientX, y:cursor.clientY}, t:cursor.type, s:cursor.timestamp})
  },[cursor.timestamp])

  return (
    <DragManagerContext.Provider value={{startDragging, setCollector}}>
      <div style={{position: "absolute", top: 0, left: 0, right: 0, bottom: 0, pointerEvents:'none'}}>
        {dragging && dragState == DragState.DRAGGING ? <ShortcutDraggable shortcut={dragging} x={cursor.clientX-offset.x} y={cursor.clientY-offset.y}/>: <div></div> }
      </div>
      {children}
    </DragManagerContext.Provider>
    )
}