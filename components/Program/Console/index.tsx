import styles from "../program.module.css";
import {ReactNode, useCallback, useContext, useEffect, useRef, useState} from "react";
import {handleCommand, Result, Txt} from "@/components/Program/Console/commandHandler";
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
  print: (txt: Txt | Txt[]) => void
}

export type ShellConsoleProps = {
  path?: string[]
}
export const ShellConsole = ({
  path = []
}:ShellConsoleProps) => {
  const [outputLines, setOutputLines] = useState<ReactNode[]>([])
  const [exitCode, setExitCode] = useState(0)

  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyCursor, setHistoryCursor] = useState(-1)
  const outputKeyRef = useRef(0)

  // Async-safe print function for commands
  const asyncPrint = useCallback((txtInput: Txt | Txt[]) => {
    const txt: Txt[] = Array.isArray(txtInput) ? txtInput : [txtInput];
    setOutputLines(prev => {
      const newOutputs: ReactNode[] = [];
      txt.forEach((t) => {
        const sl = t.s.split("\n");
        for (let s = 0; s < sl.length; s++) {
          newOutputs.push(
            <span key={outputKeyRef.current++} className={[styles.line, t.c == "error" ? styles.error : t.c == "highlight" ? styles.highlight : ""].join(" ")}>
              {sl[s]}
            </span>
          );
          if (s != sl.length - 1) newOutputs.push(<br key={outputKeyRef.current++} />);
        }
      });
      newOutputs.push(<br key={outputKeyRef.current++} />);
      return [...prev, ...newOutputs];
    });
  }, []);

  const context:ConsoleContext = {
    taskManager: useContext(TaskManagerContext),
    monitor: useMonitor(),
    state: {},
    print: asyncPrint
  }

  useEffect(() => {
    doAction('hello', [])
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
      const inputElement: HTMLInputElement = e.currentTarget.children[1].children[1] as HTMLInputElement
      if (inputElement) inputElement.focus()
    }
  }
  const getInput = (e:React.KeyboardEvent) =>{
    if (e.key === 'ArrowUp'){
      moveHistoryCursor(1, e.currentTarget as HTMLInputElement)
    } else if (e.key === 'ArrowDown'){
      moveHistoryCursor(-1, e.currentTarget as HTMLInputElement)
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const inputElement: HTMLInputElement = e.currentTarget as HTMLInputElement
      if (inputElement){
        const input = inputElement.value
        saveCommandToHistory(input)
        const split = input.split(" ")
        const param:string[] = []
        for (let p = 0; p < split.length; p++){
          if (split[p]) param.push(split[p])
        }
        inputElement.value = ""
        const command = param.shift()
        addLineStart()
        printLine({s: input})
        if (command) {
          doAction(command, param);
        } else if (hasPendingPrompt()) {
          // Empty enter with pending prompt defaults to Y
          doAction('y', []);
        } else {
          setExitCode(0)
        }
        setTimeout(() => inputElement.scrollIntoView({ behavior: "instant", block: "nearest", inline: "end" }), 100)
      }
    }
  }
  const doAction = (command:string|undefined, param:string[])=> {
    const output:Result = command ? handleCommand(command, param, context) : {exitCode: 1}
    printLine(output.output)
    setExitCode(output.exitCode)
  }
  const printLine = (txtInput?: Txt | Txt[]) =>{
    const txt:Txt[] = txtInput ? (Array.isArray(txtInput) ? txtInput : [txtInput]) : [{s:""}]
    const newOutputs:ReactNode[] = []
    txt.forEach((t) => {
      const sl = t.s.split("\n")
      for (let s = 0; s < sl.length; s++){
        newOutputs.push(<span key={outputLines.length + newOutputs.length}  className={[styles.line, t.c == "error" ? styles.error : t.c == "highlight" ? styles.highlight : ""].join(" ")}>{sl[s]}</span>)
        if (s != sl.length-1) newOutputs.push(<br key={outputLines.length + newOutputs.length}/>)
      }
    })
    newOutputs.push(<br key={outputLines.length + newOutputs.length}/>)
    setOutputLines([...outputLines, ...newOutputs])
  }
  const addLineStart = () => {
    setOutputLines([...outputLines, (
      <span key={outputLines.length} className={styles.line}>
        <span className={exitCode ? styles.error : ""}>{path}</span>
        <img src={'/icons/consolez.svg'} alt="Console icon" className={styles.consolez} style={{filter: exitCode ? "hue-rotate(-120deg) brightness(70%)" : "none"}}/>
        <span>&nbsp;</span>
      </span>
    )])
  }

  return (
    <div className={styles.console} onClick={(e) => grabFocus(e)}>
      <div className={styles.textArea}>
        {outputLines}
      </div>
      <div className={styles.inputLine}>
        <div className={styles.line}>
          <span className={exitCode ? styles.error : ""}>~</span>
          <img src={'/icons/consolez.svg'} alt="Console icon" className={styles.consolez} style={{filter: exitCode ? "hue-rotate(-120deg) brightness(70%)" : "none"}}/>
          <span>&nbsp;</span>
        </div>
        <input type={"text"} className={styles.inputArea} onKeyDown={(e) => getInput(e)}/>
      </div>
    </div>
    )
}
