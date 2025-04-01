import styles from "../program.module.css";
import {BasicProgramProps} from "..";
import {Component, ReactElement} from "react";
import {CommandHandler, Result, Txt} from "@/components/Program/Console/commandHandler";
import {TaskManager} from "@/util/taskManager";



export class Console extends  Component<BasicProgramProps> {
  parameters: string[]
  keyIndex:number = 0
  taskManager:TaskManager
  path:string = "~"
  commandHandler = new CommandHandler
  output: ReactElement[] = []
  latestFailed = false
  constructor(props:BasicProgramProps) {
    super(props);
    this.parameters = props.parameters
    this.taskManager = props.taskManager
    this.doAction("hello", [])
  }
  grabFocus(e:React.MouseEvent){
    if (window.getSelection()?.toString() == "") {
      const inputElement: HTMLInputElement = e.currentTarget.children[1].children[1] as HTMLInputElement
      if (inputElement) inputElement.focus()
    }
  }
  getInput(e:React.KeyboardEvent){
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const inputElement: HTMLInputElement = e.currentTarget as HTMLInputElement
      if (inputElement){
        const input = inputElement.value
        const split = input.split(" ")
        const param:string[] = []
        for (let p = 0; p < split.length; p++){
          if (split[p]) param.push(split[p])
        }
        inputElement.value = ""
        const command = param.shift()

        this.addLineStart()
        this.print({s: input})
        if (command) this.doAction(command, param); else this.latestFailed = false;
        this.forceUpdate()
        setTimeout(() => inputElement.scrollIntoView({ behavior: "instant", block: "nearest", inline: "end" }), 100)
      }
    }
  }
  doAction(command:string|undefined, param:string[]){
    const output:Result = command ? this.commandHandler.handleCommand(command, param, this.taskManager) : {exitStatus: 1}
    this.print(output.output)
    this.latestFailed = output.exitStatus != 0
  }
  print(txtInput?: Txt | Txt[]){
    const txt:Txt[] = txtInput ? (Array.isArray(txtInput) ? txtInput : [txtInput]) : [{s:""}]
    txt.forEach((t) => {
      const sl = t.s.split("\n")
      for (let s = 0; s < sl.length; s++){
        this.output.push(<span key={this.getKey()}  className={[styles.line, t.c == "error" ? styles.error : t.c == "highlight" ? styles.highlight : ""].join(" ")}>{sl[s]}</span>)
        if (s != sl.length-1) this.output.push(<br key={this.getKey()}/>)
      }

    })
    this.output.push(<br key={this.getKey()}/>)
  }
  addLineStart(){
    this.output.push(
      <span key={this.getKey()} className={styles.line}>
        <span className={this.latestFailed ? styles.error : ""}>{this.path}</span>
        <img src={'/icons/consolez.svg'} alt="Console icon" className={styles.consolez} style={{filter: this.latestFailed ? "hue-rotate(-120deg) brightness(70%)" : "none"}}/>
        <span>&nbsp;</span>
      </span>
    )
  }

  getKey() {
    this.keyIndex += 1
    return this.keyIndex
  }


  render() {
    return (
    <div className={styles.console} onClick={(e) => this.grabFocus(e)}>
      <div className={styles.textArea}>
        {this.output}
      </div>
      <div className={styles.inputLine}>
        <div className={styles.line}>
          <span className={this.latestFailed ? styles.error : ""}>~</span>
          <img src={'/icons/consolez.svg'} alt="Console icon" className={styles.consolez} style={{filter: this.latestFailed ? "hue-rotate(-120deg) brightness(70%)" : "none"}}/>
          <span>&nbsp;</span>
        </div>
        <input type={"text"} className={styles.inputArea} onKeyDown={(e) => this.getInput(e)}/>
      </div>
    </div>
    )
  }
}

