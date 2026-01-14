
import {createContext, ReactNode, use, useContext, useEffect, useRef, useState} from "react";
import {Task, TaskManagerContext} from "@/components/OS/TaskManager";
import {ProgramWindow} from "@/components/OS/Window";
import {WindowedProgramClass} from "@/components/Program/Program";
import {useMonitor} from "@/components/OS/MonitorHandler";
import {removeFromArray} from "@/util/misc";


type WindowManagerProviderProps = {
  children: ReactNode,
}

type WindowManagerInterface = {
  focused: number,
  order: number[],
  orderUpdated: number,
  focus: (taskID:number) => void,
  unfocus: (taskID:number) => void
}

const useWindowCalls = () => {
  const [focused, setFocused] = useState<number>(-1)
  const [toUnfocus, setToUnfocus] = useState(-1)
  const [order, setOrder] = useState<number[]>([])
  const [orderUpdated, setOrderUpdated] = useState(0)
  const {tasks, taskUpdate} = useContext(TaskManagerContext)

  useEffect(() => {
    const toClean = tasks.filter((t) => order.includes(t.taskID) && t.type == 'killed').map((t) => t.taskID)
    const toAdd = tasks.filter((t) => !(order.includes(t.taskID)) && t.type == 'window').map((t) => t.taskID)
    if (toClean.length > 0 || toAdd.length > 0) {
      setOrder((prevState) => [...toAdd, ...removeFromArray(prevState, toClean)])
      setOrderUpdated(Date.now())
    }
  }, [tasks, taskUpdate, order]);

  const focus = (taskID:number) => {
    setFocused(taskID)
    setOrder((prevState) => [taskID, ...removeFromArray(prevState, taskID)])
    setOrderUpdated(Date.now())
  }
  const unfocus = (taskID:number) => {
    // use -2 to unfocus all.
    setToUnfocus(taskID)
  }
  useEffect(() => {
    if ((focused == toUnfocus && focused >= 0) || toUnfocus == -2){
      setFocused(-1)
      setToUnfocus(-1)
    }
  }, [toUnfocus, focused]);


  return {focused, order, orderUpdated, focus, unfocus}
}

export const WindowManagerContext = createContext<WindowManagerInterface | undefined>(undefined);


export const WindowManagerProvider = ({
    children
}:WindowManagerProviderProps) => {
  const {tasks, programs, taskUpdate} = useContext(TaskManagerContext)
  const monitor = useMonitor()
  const [windows, setWindows] = useState<{[key: number]: ReactNode}>({})
  const [windowDefaultSize, setWindowDefaultSize] = useState({x: 0, y: 0})
  const [nextWindowSpawnPos, setNextWindowSpawnPos] = useState({x: -1, y: -1})
  const call = useWindowCalls()


  useEffect(() => {
    if (monitor.size && monitor.uiScale){
      setWindowDefaultSize({
        x: Math.min(monitor.size.x, Math.max(800, monitor.size.x * 0.6)),
        y: Math.min((monitor.size.y-50) , Math.max(600, (monitor.size.y-50) * 0.6))
      })
    }
  }, [monitor.size, monitor.uiScale]);
  useEffect(() => {
    if (monitor.size){
      if (nextWindowSpawnPos.x == -1 && windowDefaultSize.x != 0){
        setNextWindowSpawnPos({
          x: (monitor.size.x - windowDefaultSize.x) / 2,
          y: ((monitor.size.y-50) - windowDefaultSize.y) / 2,
        })
      } else if (nextWindowSpawnPos.x > (monitor.size.x - windowDefaultSize.x) || nextWindowSpawnPos.y > ((monitor.size.y-50)  - windowDefaultSize.y)){
        setNextWindowSpawnPos({
          x: nextWindowSpawnPos.x > (monitor.size.x - windowDefaultSize.x) ? 0 : nextWindowSpawnPos.x,
          y: nextWindowSpawnPos.y > ((monitor.size.y-50)  - windowDefaultSize.y) ? 0 : nextWindowSpawnPos.y,
        })
      }
    }
  }, [windowDefaultSize, nextWindowSpawnPos, monitor.size]);

  useEffect(() => {
    const makeNewWindow = (t:Task) => {
      return <ProgramWindow key={t.taskID} taskID={t.taskID} position={nextWindowSpawnPos} size={windowDefaultSize} program={programs[t.programID] as WindowedProgramClass} ></ProgramWindow>
    }
    tasks.forEach((t) => {
      if (t.type == 'window' && !(t.taskID in windows)){
        setWindows((prevState) => {return {...prevState, ...{[t.taskID]: makeNewWindow(t)}}})
        setNextWindowSpawnPos({x: nextWindowSpawnPos.x + 46, y: nextWindowSpawnPos.y +46})
      } else if (t.type == 'killed' && t.taskID in windows){
        setWindows((prevState) => {
          delete prevState[t.taskID]
          return prevState
        })
      }
    })
  }, [tasks, taskUpdate, windows, programs, windowDefaultSize, nextWindowSpawnPos]);


  return (
    <WindowManagerContext.Provider value={{...call}}>
      {children}
      {Object.values(windows)}
    </WindowManagerContext.Provider>
    )
}
