import styles from "../program.module.css";
import {BasicProgramProps} from "..";
import {Component, ReactElement} from "react";
import {CommandHandler} from "@/components/Program/Console/commandHandler";


export class Console extends  Component<BasicProgramProps> {
  parameters: string[]
  txtId:number = 0
  lineId:number = 0
  commandHandler = new CommandHandler
  lines = [<Line key={this.lineId} text={[this.commandHandler.toTxt("this is a console :--D")]}/>]
  latestFailed = false
  constructor(props:BasicProgramProps) {
    super(props);
    this.parameters = props.parameters
  }
  grabFocus(e:React.MouseEvent){
    if (window.getSelection()?.toString() == "") {
      const inputElement: HTMLInputElement = e.currentTarget.children[1].children[1] as HTMLInputElement
      if (inputElement) inputElement.focus()
    }
  }
  getInput(e:React.KeyboardEvent){
    if (e.key === 'Enter') {
      const inputElement: HTMLInputElement = e.currentTarget as HTMLInputElement
      if (inputElement){
        const input = inputElement.value
        const param = input.split(" ")
        inputElement.value = ""
        const command = param.shift()
        this.doAction(command, param, input)
        this.forceUpdate()
      }
    }
  }

  doAction(command:string|undefined, param:string[], input:string){
    const output:{success:boolean, output:ReactElement[] | undefined} = command ? this.commandHandler.handleCommand(command, param) : {success:true, output:[]}
    this.lineId += 1
    this.lines.push(<Line key={this.lineId} text={[this.commandHandler.toTxt(input), <br/>, ...(output.output || [])]} fail={this.latestFailed}/>)
    this.latestFailed = !output.success
  }

  success(text:ReactElement[]=[]){
    this.latestFailed = false
    this.lineId += 1
    this.lines.push(<Line key={this.lineId} text={text}/>)
  }
  error(text:ReactElement[]=[]) {
    this.latestFailed = true
    this.lineId += 1
    this.lines.push(<Line key={this.lineId} text={text} fail={true}/>)
  }
  render() {
    return (
    <div className={styles.console} onClick={(e) => this.grabFocus(e)}>
      <div className={styles.textArea}>
        {this.lines}
      </div>
      <div className={styles.inputLine}>
        <div className={styles.line}>
          <span className={this.latestFailed ? styles.error : ""}>~</span>
          <img src={'/icons/consolez.svg'} className={styles.consolez} style={{filter: this.latestFailed ? "hue-rotate(-120deg) brightness(70%)" : "none"}}/>
          <span>&nbsp;</span>
        </div>
        <input type={"text"} className={styles.inputArea} onKeyDown={(e) => this.getInput(e)}/>
      </div>
    </div>
    )
  }
}


type LineProps = {
  text: ReactElement[]
  fail?: boolean
}

export class Line extends Component<LineProps> {
  text: ReactElement[]
  fail: boolean

  constructor(props: LineProps) {
    super(props);
    this.text = props.text
    this.fail = props.fail || false
  }

  render() {
    return (
        <div className={styles.line}>
          <span className={this.fail ? styles.error : ""}>~</span><img src={'/icons/consolez.svg'} className={styles.consolez} style={{filter: this.fail ? "hue-rotate(-120deg) brightness(70%)" : "none"}}/>
          <span>&nbsp;</span>
          {this.text}
        </div>
    )
    }
  }
