import styles from "./program.module.css";
import {ProgramProperties, TaskManager} from "@/util/taskManager";
import {Component} from "react";
import {Console} from "@/components/Program/Console"
import globalStyles from "@/globalStyles/global.module.css"
import {TaskBarButton} from "@/components/TaskBar";
import {Vector2} from "@/util/types";
import {DocumentReader} from "@/components/Program/DocumentReader";
import {FileExplorer} from "@/components/Program/FileExplorer";


type ProgramProps = {
  properties: ProgramProperties
  parameters: string[]
  taskManager: TaskManager
}


export class Program extends Component<ProgramProps> {
  properties: ProgramProperties
  parameters: Parameters
  taskManager: TaskManager
  window: {wid:number, zIndex:number, size:Vector2, position:Vector2}
  minimized:boolean = false
  maximized:boolean = false
  key:number
  moving = false
  moveOffset: Vector2 = new Vector2()
  element: null | HTMLElement = null
  constructor(props:ProgramProps) {
    super(props)
    this.properties = props.properties
    this.parameters = props.parameters
    this.taskManager = props.taskManager
    this.window =  props.taskManager.nextWindowParam
    this.key = this.taskManager.programs.length
  }
  minimize(e:React.MouseEvent){
    console.log("minim")
    e.stopPropagation()
    this.minimized = true
    this.taskManager.callUpdate('window')
  }
  toggleMaximize(e:React.MouseEvent){
    e.preventDefault()
    this.maximized = !this.maximized
    this.taskManager.callUpdate('window')
  }
  close(e:React.MouseEvent){
    e.preventDefault()
    this.taskManager.closeWindow(this)
  }
  pop(){
    if (this.window.zIndex != this.taskManager.zIndex){
      this.taskManager.zIndex += 1
      this.window.zIndex = this.taskManager.zIndex
      this.minimized = false
      this.taskManager.callUpdate('window')
    } else if (this.minimized){
      this.minimized = false
      this.taskManager.callUpdate('window')
    }
  }
  startMove(e:React.MouseEvent){
    document.removeEventListener('mousemove', (e) => this.move(e))
    document.removeEventListener('mouseup', () => this.endMove())
    document.addEventListener('mousemove', (e) => this.move(e))
    document.addEventListener('mouseup', () => this.endMove())
    if (this.maximized) {
      this.moveOffset.x = e.clientX
      this.moveOffset.y = e.clientY
    } else {
      this.moveOffset.x = e.clientX - this.window.position.x
      this.moveOffset.y = e.clientY - this.window.position.y
    }
    this.moving = true


  }
  move(e:MouseEvent){
    if (this.moving){

      if (this.maximized){
        if (Math.abs(this.moveOffset.x - e.clientX) < 80 && Math.abs(this.moveOffset.y - e.clientY) < 80) return
        this.maximized = false
        this.moveOffset.x = this.window.size.x/2
        this.moveOffset.y = 50/2
        this.taskManager.callUpdate('window')
        return
      }
      this.window.position.x = e.clientX - this.moveOffset.x
      this.window.position.y = e.clientY - this.moveOffset.y
      if (!this.element) this.element = document.getElementById("azshwindow" + this.key)
      if (this.element){
        this.element.style.left = this.window.position.x + "px"
        this.element.style.top = this.window.position.y + "px"
      }
    }
  }

  endMove(){
    if (this.moving){
      this.moving = false
      let update = false
      if (!this.maximized) {
        if (this.window.position.y < 0) {
          if (this.window.position.y < -25) {
            this.maximized = true
            update = true
          }
          this.window.position.y = 0
        }
        if (this.window.position.y > this.taskManager.screenSize.y -100) {
          this.window.position.y = this.taskManager.screenSize.y -100
        }
      }
      if (update){
        this.taskManager.callUpdate('window')
      } else {
        if (this.element) {
          this.element.style.left = this.window.position.x + "px"
          this.element.style.top = this.window.position.y + "px"
        }
      }
    }
  }

  render(){
    return (
      <div id={"azshwindow" + this.key} key={this.key} className={styles.window} onClick={(e) => this.pop()} style={this.maximized ?
      {
        width: 100 + "%",
        height: 100 + "%",
        left: 0 + "px",
        top: 0 + "px",
        zIndex: this.window.zIndex
      }:{
        width: this.window.size.x + "px",
        height: this.window.size.y + "px",
        left: this.window.position.x + "px",
        top: this.window.position.y + "px",
        zIndex: this.window.zIndex
      }}>
        <div className={styles.tittleBar} onMouseDown={(e) => this.startMove(e)}>

          <img src={this.properties.icon} alt={''} className={styles.icon}></img>
          <div className={styles.tittle}>
            {this.properties.tittle}
          </div>
          <button className={styles.minimize} onClick={(e)=> {this.minimize(e)}}>
            <img src={'/icons/minimize.svg'} alt={''} className={styles.icon}></img>
          </button>
          <button className={styles.minimize} onClick={(e)=> this.toggleMaximize(e)}>
            <img src={this.maximized ? '/icons/unmaximize.svg' : '/icons/maximize.svg'} alt={''} className={styles.icon}></img>
          </button>
          <button className={styles.close} onClick={(e)=> this.close(e)}>
            <img src={'/icons/close.svg'} alt={''} className={styles.icon}></img>
          </button>
        </div>
        <div className={styles.program}>
          {getProgram(this.properties.program, this.parameters)}
        </div>
      </div>
    )
  }
  get taskBarButton(){
    return (
      <TaskBarButton key={this.key} programProperties={this.properties} program={this}></TaskBarButton>
    )
  }
}



const getProgram = (program:string, parameters:string[])=> {
  switch (program){
    case 'console':
      return (<Console parameters={parameters}/>)
    case 'document':
      return (<DocumentReader parameters={parameters}/>)
    case 'files':
      return (<FileExplorer parameters={parameters}/>)
  }
  return (<BasicProgram parameters={parameters}/>)
}
type Parameters = string[]

export type BasicProgramProps = {
  parameters: Parameters
}

export class BasicProgram extends Component<BasicProgramProps> {
  parameters: Parameters
  constructor(props:BasicProgramProps) {
    super(props);
    this.parameters = props.parameters
  }
  render(){
    return (
      <div className={globalStyles.error}>
        Error: Program launch error.
      </div>
    )}
}