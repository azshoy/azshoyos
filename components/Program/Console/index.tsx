import styles from "../program.module.css";
import {ReactNode, useCallback, useContext, useEffect, useRef, useState} from "react";
import {handleCommand, Result, Txt, TxtAction} from "@/components/Program/Console/commandHandler";
import {FileExplorer} from "@/components/Program/FileExplorer";
import {TaskManagerContext, TaskManagerInterface} from "@/components/OS/TaskManager";
import {useMonitor} from "@/components/OS/MonitorHandler";
import {v2} from "@/util/types";
import {commands} from "@/components/Program/Console/availableCommands";
import {hasPendingPrompt} from "@/util/session";

export type ConsoleTypes = {
  windowComponent: typeof FileExplorer
  parameters: ShellConsoleProps
}

export type ConsoleContext = {
  taskManager: TaskManagerInterface
  monitor: {size: v2 | undefined, uiScale: number | undefined}
  state: {[K in (keyof typeof commands)]: any}
  setState: (s:{[K in (keyof typeof commands)]: any}) => void
  printLine: (txtInput?: Txt | Txt[], newLine?: boolean) => void
  setCommandStatus: (cs: CommandStatus) => void
}

export type ShellConsoleProps = {
  path?: string[]
}
export enum Status {
  EXITED,
  PENDING,
  WAITINPUT,
}
export type CommandStatus = {t: number, status: Status.EXITED, exitCode: number, command: string} | {t: number, status: Exclude<Status, Status.EXITED>, command: string}
export const ShellConsole = ({
  path = []
}:ShellConsoleProps) => {
  const [outputLines, setOutputLines] = useState<ReactNode[]>([])
  const [commandStatus, setCommandStatus] = useState<CommandStatus>({t: 0, status: Status.EXITED, exitCode: 0, command: ""})
  const [commandStates, setCommandStates] = useState({})

  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyCursor, setHistoryCursor] = useState(-1)
  const inputElement = useRef<HTMLInputElement>(null)
  const scrollTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const taskManagerContext = useContext(TaskManagerContext)
  const [inputOverride, setInputOverride] = useState("")

  const printLine = (txtInput?: Txt | Txt[], newLine=true) =>{
    if ((Array.isArray(txtInput) && txtInput.length == 0)) return
    const txt:Txt[] = txtInput ? (Array.isArray(txtInput) ? txtInput : [txtInput]) : [{s:""}]
    setOutputLines((prevState) => {
      const newOutputs:ReactNode[] = []
      txt.forEach((t) => {
        const sl = t.s.split("\n")
        for (let s = 0; s < sl.length; s++){
          newOutputs.push(<OutputLine key={prevState.length + newOutputs.length} style={t.c} action={t.onClick} inputOverride={setInputOverride} openFile={taskManagerContext.startTaskByPath}>{sl[s]}</OutputLine>)
          if (s != sl.length -1) newOutputs.push(<br key={prevState.length + newOutputs.length}/>)
        }
      })
      if (newLine) newOutputs.push(<br key={prevState.length + newOutputs.length}/>)
      return [...prevState, ...newOutputs]
    })
  }

  const context:ConsoleContext = {
    taskManager: taskManagerContext,
    monitor: useMonitor(),
    state: commandStates,
    setState: setCommandStates,
    printLine: printLine,
    setCommandStatus: setCommandStatus,
  }

  useEffect(() => {
    doAction(commandStatus, 'hello', [])
    getCommandHistory()
  }, []);

  const localCommandHistoryEnabled = () => {
    return localStorage.getItem("localCommandHistoryEnabled") == "TRUE"
  }

  const getCommandHistory = () => {
    if (localCommandHistoryEnabled()) {
      const localHistory = localStorage.getItem("localCommandHistory")
      if (localHistory){
        const lhArray = JSON.parse(localHistory)
        if (Array.isArray(lhArray)){
          setCommandHistory(lhArray)

        }
      }
    }
  }
  const saveCommandToHistory = (c:string) => {
    setCommandHistory((prevState) => [c, ...prevState])
    setHistoryCursor(-1)
  }

  const moveHistoryCursor = (d:number, element:HTMLInputElement) => {
    if (historyCursor + d >= -1 && historyCursor + d < commandHistory.length){
      if (historyCursor + d == -1){
        element.value = ""
      } else {
        element.value = commandHistory[historyCursor + d]
        element.setSelectionRange(commandHistory[historyCursor + d].length, commandHistory[historyCursor + d].length)
      }
      setHistoryCursor(historyCursor+d)
    }
  }

  useEffect(() => {
    if (localCommandHistoryEnabled()) {
      localStorage.setItem("localCommandHistory", JSON.stringify(commandHistory))
    }
  }, [commandHistory.length]);

  const grabFocus = (e:React.MouseEvent) => {
    if (window.getSelection()?.toString() == "") {
      const inputE: HTMLInputElement = e.currentTarget.children[1].children[1] as HTMLInputElement
      if (inputE) inputE.focus()
    }
  }
  const getInput = (e:React.KeyboardEvent) =>{
    if (e.key === 'ArrowUp'){
      e.preventDefault()
      moveHistoryCursor(1, e.currentTarget as HTMLInputElement)
    } else if (e.key === 'ArrowDown'){
      e.preventDefault()
      moveHistoryCursor(-1, e.currentTarget as HTMLInputElement)
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const inputE: HTMLInputElement = e.currentTarget as HTMLInputElement
      if (inputE){
        const input = inputE.value
        const split = input.split(" ")
        const args:string[] = []
        for (let p = 0; p < split.length; p++){
          if (split[p]) args.push(split[p])
        }
        inputE.value = ""
        const command = args.shift()
        if (commandStatus.status == Status.EXITED) {
          saveCommandToHistory(input)
          addLineStart(commandStatus.exitCode)
        }
        printLine({s: input})
        doAction(commandStatus, command, args);
      }
    }
  }
  const doAction = (commandStatus:CommandStatus, command:string|undefined, param:string[])=> {
    handleCommand(commandStatus, command, param, context)
  }

  const addLineStart = (exitCode:number) => {
    setOutputLines((prevState) => {
      return [...prevState, <LineStart exitCode={exitCode} path={path} key={prevState.length}/>]
    })
  }
  useEffect(() => {
    if (inputOverride != "" && inputElement && inputElement.current){
      inputElement.current.value = inputOverride
      const s = inputOverride.indexOf("<")
      const e = inputOverride.indexOf(">")
      if (s >= 0 && e >= 0){
        inputElement.current.setSelectionRange(s, e+1)
      } else {
        inputElement.current.setSelectionRange(inputOverride.length, inputOverride.length)
      }
      setInputOverride("")
    }
  }, [inputOverride]);

  useEffect(() => {
    if (inputElement && inputElement.current){
      scrollTimer.current = setTimeout(() => {
        if (inputElement && inputElement.current) inputElement.current.scrollIntoView({ behavior: "instant", block: "nearest", inline: "end" })
      }, 100)
    }
    return () => {
      if (scrollTimer.current) clearTimeout(scrollTimer.current)
    }
  }, [outputLines]);
  return (
    <div className={[styles.console, styles.container].join(" ")} onClick={(e) => grabFocus(e)}>
      <div className={styles.textArea}>
        {outputLines}
      </div>
      <div className={styles.inputLine}>
        <div className={styles.line}>
          {commandStatus.status == Status.EXITED ? <LineStart key={"-1"} exitCode={commandStatus.exitCode} path={path}></LineStart> : null}
        </div>
        <input ref={inputElement} type={"text"} className={styles.inputArea} onKeyDown={(e) => getInput(e)}/>
      </div>
    </div>
    )
}
type OutputLineProps = {
  style: Txt["c"]
  children: ReactNode
  action?: TxtAction
  inputOverride: CallableFunction
  openFile: CallableFunction
}

const OutputLine = ({
  style,
  children: txt,
  action,
  inputOverride,
  openFile,
}:OutputLineProps) => {
  const {end, classNames} = getLineProperties(style, action)
  const onClick = () => {
    if (action) {
      if (action.a == "command") inputOverride(action.t)
      if (action.a == "file") openFile(action.t)
      if (action.a == "link" && window) window.open(action.t, '_blank')?.focus()
    }
  }
  if (action && action.a == "command" && typeof txt == "string"){
    const s = txt.indexOf("<")
    const e = txt.indexOf(">")
    if (s >= 0 && e >= 0) {
      return <span className={classNames} onClick={() => onClick()}>{txt.slice(0, s)}<span className={styles.optional}>&lt;<span>{txt.slice(s+1, e)}</span>&gt;</span>{txt.slice(e+1)}{end}</span>
    }
  }
  return <span className={classNames} onClick={() => onClick()}>{txt}{end}</span>
}

const getLineProperties = (s: OutputLineProps["style"], a: OutputLineProps['action']) => {
  const classNames = [styles.line]
  switch (s){
    case "error":
      classNames.push(styles.error)
      break
    case "highlight":
      classNames.push(styles.highlight)
      break
  }
  if (typeof a != "undefined") {
    switch (a.a) {
      case "command":
        classNames.push(styles.openCommand)
        return {end: <span className={styles.endArrow}> ⤏</span>, classNames: classNames.join(" ")}
      case "link":
        classNames.push(styles.openLink)
        return {end: <span className={styles.endArrow}> ↪</span>, classNames: classNames.join(" ")}
      case "file":
        classNames.push(styles.openFile)
        return {end: <span className={styles.endArrow}> ➤</span>, classNames: classNames.join(" ")}
    }
  }
  return {end: "", classNames: classNames.join(" ")}

}

const LineStart = ({exitCode=0, path}:{exitCode:number, path:string[]}) => {
  return (
    <span className={styles.line}>
      <span className={exitCode ? styles.error : ""}>{path.length == 0 ? "~" : path.join("/")}</span>
      <img src={'/icons/consolez.svg'} alt="Console icon" className={styles.consolez} style={{filter: exitCode ? "hue-rotate(-120deg) brightness(70%)" : "none"}}/>
      <span>&nbsp;</span>
    </span>
  )
}