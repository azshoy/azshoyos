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
  dragActive = false
  dragging = false
  drag: Vector2 = new Vector2()
  dragOffset: Vector2 = new Vector2()
  clickedOnce = false
  dragElement: HTMLElement |null = null
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
    this.onMouseMove = this.onMouseMove.bind(this)
    this.onTouchMove = this.onTouchMove.bind(this)
    this.onMouseUp = this.onMouseUp.bind(this)
    this.onTouchEnd = this.onTouchEnd.bind(this)
  }
  joinGrid(){
    this.position = this.taskManager.joinGrid(this)
  }
  startDrag(posX:number, posY:number, mouse:boolean) {
    if (!this.dragActive) {
      this.dragActive = true
      this.dragOffset.x = posX - this.position.x
      this.dragOffset.y = posY - this.position.y
      this.updateDrag(posX, posY)
      if (mouse) {
        document.addEventListener("mousemove", this.onMouseMove)
        document.addEventListener("mouseup", this.onMouseUp)
      } else {
        document.addEventListener("touchmove", this.onTouchMove)
        document.addEventListener("touchend", this.onTouchEnd)
      }
    }
  }
  onMouseMove(e:MouseEvent){
    this.updateDrag(e.pageX, e.pageY)
  }
  onMouseUp(e:MouseEvent){
    this.endDrag(e.pageX, e.pageY, true)
  }
  onTouchMove(e:TouchEvent){
    this.updateDrag(e.touches[0].pageX, e.touches[0].pageY)
  }
  onTouchEnd(e:TouchEvent){
    this.endDrag(e.changedTouches[0].pageX, e.changedTouches[0].pageY, false)
  }
  endDrag(posX:number, posY:number, mouse:boolean){
    if (this.dragActive){
      this.updateDrag(posX, posY)
      this.taskManager.dropShortCut(this)
      this.dragging = false
      this.dragActive = false
      if (!this.dragElement) this.dragElement = document.getElementById("azshShortcutDrag" + this.key.toString())
      if (this.dragElement){
        this.dragElement.style.display = "none"
      }
      if (mouse){
        document.removeEventListener("mousemove", this.onMouseMove)
        document.removeEventListener("mouseup", this.onMouseUp)
      } else {
        document.removeEventListener("touchmove", this.onTouchMove)
        document.removeEventListener("touchend", this.onTouchEnd)
      }
    }
  }
  updateDrag(posX:number, posY:number){
    this.drag.x = posX
    this.drag.y = posY
    if (!this.dragging && Math.abs(this.drag.x - (this.position.x + this.dragOffset.x)) < 10 && Math.abs(this.drag.y - (this.position.y + this.dragOffset.y)) < 10) return
    if (!this.dragElement) this.dragElement = document.getElementById("azshShortcutDrag" + this.key.toString())
    if (this.dragElement){
      this.dragElement.style.left = this.drag.x - this.dragOffset.x + "px"
      this.dragElement.style.top = this.drag.y - this.dragOffset.y + "px"
      if (!this.dragging) {
        this.dragElement.style.display = "flex"
        this.dragging = true
      }
    }
  }

  handleDoubleClick(){
    if (this.clickedOnce){
      this.handleClick()
    } else {
      this.clickedOnce = true
      setTimeout(() => this.clickedOnce = false, 500)
    }

  }
  handleClick(){
    this.clickedOnce = false
    if (this.properties.extra == "openTab"){
      window.open("https://www.google.com/")
      return
    }
    this.taskManager.createWindow(this.properties, this.parameters)
  }

  render(){
    return (
      <div key={this.key} className={styles.shortCutHolder}>
        <div className={styles.slot} style={{
          left: this.position.x + "px",
          top: this.position.y + "px",
          width: this.taskManager.grid.slot.x + "px",
          height: this.taskManager.grid.slot.y + "px"
        } as CSSProperties}>
          <div className={styles.shortCut}
               onMouseDown={(e) => this.startDrag(e.pageX, e.pageY, true)}
               onTouchStart={(e) => this.startDrag(e.touches[0].pageX, e.touches[0].pageY, false)}
               onClick={() => {this.handleDoubleClick()}}>
            <img
              src={this.properties.extra == "trash" && this.taskManager.trash.length > 0 ? "/icons/trash_full.svg" : this.properties.icon}
              alt={this.properties.description || ""} className={styles.icon}></img>
            <div className={styles.tittle}>
              {this.properties.tittle}
            </div>
          </div>
        </div>

        <div id={"azshShortcutDrag" + this.key.toString()} className={styles.dragSlot}>
          <div className={styles.shortCut}>
            <img
              src={this.properties.extra == "trash" && this.taskManager.trash.length > 0 ? "/icons/trash_full.svg" : this.properties.icon}
              alt={this.properties.description || ""} className={styles.icon}></img>
            <div className={styles.tittle}>
              {this.properties.tittle}
            </div>
          </div>
        </div>
      </div>
    )
  }


  get startMenuShortcut() {
    return (
      <div key={this.key} className={styles.startMenuShortCut} onClick={() => {
        this.handleClick()
      }}>
        <img
          src={this.properties.extra == "trash" && this.taskManager.trash.length > 0 ? "/icons/trash_full.svg" : this.properties.icon}
          alt={this.properties.description || ""} className={styles.icon}></img>
        <div className={styles.tittle}>
          {this.properties.tittle}
        </div>
      </div>
    )
  }
}

