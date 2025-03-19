import {Component, CSSProperties} from "react";
import {ProgramProperties, TaskManager} from "@/util/taskManager";
import styles from "./program.module.css";
import {Vector2} from "@/util/types";


export type ShortCutProps = {
  properties: ProgramProperties
  parameters: string[]
  position: Vector2
  taskManager: TaskManager
  startMenuIcon?: boolean
  desktopIcon?: boolean
}

export class ShortCut extends Component<ShortCutProps> {
  properties: ProgramProperties
  parameters: string[]
  taskManager: TaskManager
  position:Vector2
  startMenuIcon:boolean
  desktopIcon: boolean
  key:number
  dragging = false
  drag: Vector2 = new Vector2()
  constructor(props:ShortCutProps) {
    super(props)
    this.properties = props.properties
    this.parameters = props.parameters
    this.taskManager = props.taskManager
    this.startMenuIcon = (props.desktopIcon == undefined) ? true : props.desktopIcon
    this.desktopIcon = (props.desktopIcon == undefined) ? true : props.desktopIcon
    this.position = new Vector2(Math.random()*0.2 + this.props.position.x*0.8,Math.random()*0.2 + this.props.position.y*0.8)//this.props.position
    this.key = this.taskManager.shortCuts.length
    if (this.desktopIcon){
      this.joinGrid()
    }
  }
  joinGrid(){
    this.position = this.taskManager.joinGrid(this)
  }
  handleClick(){
    if (this.properties.extra == "openTab"){
      window.open("https://www.google.com/")
      return
    }
    this.taskManager.createWindow(this.properties, this.parameters)
  }

  handleDrag(e:React.DragEvent<HTMLDivElement>){
    if (!this.dragging){
      this.drag.x = e.clientX
      this.drag.y = e.clientY
      this.dragging = true
    }
  }
  endDrag(e:React.DragEvent<HTMLDivElement>){

    this.drag.x -= e.clientX
    this.drag.y -= e.clientY
    this.taskManager.dropShortCut(this)
    this.dragging = false
  }

  render(){
    return (
      <div key={this.key} className={styles.slot} style={{left: this.position.x +"px", top: this.position.y +"px", "--scale": this.taskManager.scale, width: this.taskManager.grid.slot.x + "px", height: this.taskManager.grid.slot.y + "px"} as CSSProperties }>
        <div draggable={true} className={styles.shortCut} onDrag={(e) => this.handleDrag(e)} onDragEnd={(e) => this.endDrag(e)} onDoubleClick={(e) => {
          this.handleClick()
        }}>
          <img src={this.properties.extra == "trash" && this.taskManager.trash.length > 0 ? "/icons/trash_full.svg" : this.properties.icon} alt={this.properties.description} className={styles.icon}></img>
          <div className={styles.tittle}>
            {this.properties.tittle}
          </div>
        </div>
      </div>
    )
  }

  get startMenuShortcut() {
    return (
        <div key={this.key}  className={styles.startMenuShortCut} onClick={(e) => {this.handleClick()}}>
          <img
            src={this.properties.extra == "trash" && this.taskManager.trash.length > 0 ? "/icons/trash_full.svg" : this.properties.icon}
            alt={this.properties.description} className={styles.icon}></img>
          <div className={styles.tittle}>
            {this.properties.tittle}
          </div>
        </div>
    )
  }
}

