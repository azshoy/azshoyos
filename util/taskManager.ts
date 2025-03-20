import {Vector2} from "@/util/types";
import {Program} from "@/components/Program";
import {ShortCut} from "@/components/Program/ShortCut";

export type Update = "any"|"window"|"size"|"shortcuts"

export class TaskManager {
  programs:Program[] = []
  shortCuts: ShortCut[] = []
  trash: ShortCut[] = []
  updates: { [key: string]: {[key: string]: CallableFunction}} = {}
  wid = 0
  zIndex = 0
  nextWindowPos:Vector2 = new Vector2()

  resizeObserver: ResizeObserver
  screenAreaElement: HTMLDivElement
  screenSize:Vector2 = new Vector2(1)

  scale:number = 1

  shutDown: null|CallableFunction = null
  startMenuOpen = false
  startMenuState: null|CallableFunction = null

  grid = {
    size: new Vector2(),
    slot: new Vector2()
  }
  root: HTMLElement | null = null

  constructor(screenArea:HTMLDivElement) {
    this.screenAreaElement = screenArea

    this.resizeObserver = new ResizeObserver(() => this.updateSize())
    this.resizeObserver.observe(this.screenAreaElement)
    this.updateSize()
    const s = this.defaultWindowSize
    this.nextWindowPos.x = Math.max(0, this.screenSize.x/2 - s.x/2)
    this.nextWindowPos.y = Math.max(0, this.screenSize.y/2 - s.y/2)
    this.root = document.querySelector(':root');

  }
  updateSize(){
    if (this.screenAreaElement) {
      const rect = this.screenAreaElement.getBoundingClientRect()
      const old = new Vector2(this.screenSize.x, this.screenSize.y)
      this.screenSize.x = rect.width
      this.screenSize.y = rect.height-50
      this.setGrid()
      this.updateShortcuts(old)
      this.callUpdate('size')
    }
  }

  setGrid(){
    this.scale = (Math.min(this.screenSize.x, this.screenSize.y) < 600) ? 0.6 : (Math.min(this.screenSize.x, this.screenSize.y) < 800) ? 0.8 : (this.screenSize.x < 2000) ? 1 : 1.6
    this.grid.size.x = Math.floor(this.screenSize.x / (150*this.scale))
    this.grid.size.y = Math.floor(this.screenSize.y / (150*this.scale))
    this.grid.slot.x = this.screenSize.x / this.grid.size.x
    this.grid.slot.y = this.screenSize.y / this.grid.size.y
    console.log(this.scale)
    console.log(this.grid.size)
    console.log(this.grid.slot)
    if (this.root) this.root.style.setProperty('--scale', this.scale.toString())
  }

  callUpdate(updateType:Update){
    const update = updateType.toString()
    if (this.updates[update]) {
      Object.values(this.updates[update]).forEach(f => {f(Date.now())
      })
    }

    if (this.updates['any']) {
      Object.values(this.updates['any']).forEach(f => {f(Date.now())
      })
    }
    this.openStartMenu(false)
  }

  subscribe(id:string, updateType:Update, f:CallableFunction){
    const update = updateType.toString()
    if (!this.updates[update]) {
      this.updates[update] = {}
    }
    this.updates[update][id] = f
  }

  get nextWindowParam(){
    return {wid:this.wid, zIndex:this.zIndex, size:this.defaultWindowSize.clone, position: this.nextWindowPos.clone}
  }
  get defaultWindowSize(){
    return new Vector2(Math.min(800*this.scale, this.screenSize.x), Math.min(800*this.scale, this.screenSize.y))
  }

  setNextValues(){
    const s = this.defaultWindowSize
    this.wid +=1
    this.zIndex += 1
    this.nextWindowPos.x += this.screenSize.x*0.05
    this.nextWindowPos.y += this.screenSize.y*0.05
    if (this.nextWindowPos.x + s.x > this.screenSize.x){
      this.nextWindowPos.x = Math.max(0, this.screenSize.x/3 - s.x/2)
    }
    if (this.nextWindowPos.y + s.y > this.screenSize.y){
      this.nextWindowPos.y = Math.max(0, this.screenSize.y/3 - s.y/2)
    }
  }
  createWindow(properties:ProgramProperties, parameters:string[]){
    this.programs.push(new Program({properties:properties, taskManager:this, parameters:parameters}))
    this.setNextValues()
    this.callUpdate('window')
  }
  closeWindow(program:Program){
    const index = this.programs.indexOf(program)
    if (index >= 0) this.programs.splice(index, 1)
    this.callUpdate('window')
  }


  joinGrid(shortCut:ShortCut){
    this.shortCuts.push(shortCut)
    const purePos = new Vector2(
      shortCut.position.x*(this.screenSize.x-this.grid.slot.x) + this.grid.slot.x/2,
      shortCut.position.y*(this.screenSize.y-this.grid.slot.y) + this.grid.slot.y/2,
    )
    return this.calculateShortcutPosition(shortCut, purePos)
  }
  updateShortcuts(oldsize:Vector2){
    if (oldsize.x == 1) return
    for (let s = 0; s < this.shortCuts.length; s++) {
      const purePos = new Vector2((this.shortCuts[s].position.x/oldsize.x)*this.screenSize.x,(this.shortCuts[s].position.y/oldsize.y)*this.screenSize.y)
      this.shortCuts[s].position = this.calculateShortcutPosition(this.shortCuts[s], purePos)
    }

  }
  calculateShortcutPosition(shortCut:ShortCut, purePos:Vector2){
    const index = this.shortCuts.indexOf(shortCut)

    const pos = new Vector2(
      Math.floor(purePos.x/this.grid.slot.x)*this.grid.slot.x + this.grid.slot.x/2,
      Math.floor(purePos.y/this.grid.slot.y)*this.grid.slot.y + this.grid.slot.y/2,
    ).withFunc(Math.floor)
    const taken: Vector2[] = []
    let ok = true
    for (let s = 0; s < this.shortCuts.length; s++) {
      if (!this.shortCuts[s].desktopIcon) continue
      if (s == index) continue
      taken.push(this.shortCuts[s].position)
      if (this.shortCuts[s].position.x == pos.x && this.shortCuts[s].position.y == pos.y) ok = false
    }
    if (ok) return pos
    const posN = new Vector2(-1000,-1000)
    for (let x = 0; x < this.grid.size.x; x++) {
      for (let y = 0; y < this.grid.size.y; y++) {
        let tok = true
        const n = new Vector2(x * this.grid.slot.x + this.grid.slot.x/2, y * this.grid.slot.y + this.grid.slot.y/2).withFunc(Math.floor)

        for (let t = 0; t < taken.length; t++) {
          if (taken[t].x == n.x && taken[t].y == n.y){
            tok = false
            break
          }
        }
        if (tok){
          if (posN.x < 0 || purePos.distanceTo(posN) > purePos.distanceTo(n)){
            posN.x = n.x
            posN.y = n.y
          }
        }
      }
    }
    return posN
  }
  dropShortCut(shortCut:ShortCut){
    const index = this.shortCuts.indexOf(shortCut)
    const pos = new Vector2(
      Math.floor(Math.max(this.grid.slot.x/4, Math.min(this.screenSize.x-this.grid.slot.x/4, shortCut.position.x-shortCut.drag.x))/this.grid.slot.x)*this.grid.slot.x + this.grid.slot.x/2,
      Math.floor(Math.max(this.grid.slot.y/4, Math.min(this.screenSize.y-this.grid.slot.y/4, shortCut.position.y-shortCut.drag.y))/this.grid.slot.y)*this.grid.slot.y + this.grid.slot.y/2
    ).withFunc(Math.floor)
    let trash = false
    for (let s = 0; s < this.shortCuts.length; s++) {
      if (!this.shortCuts[s].desktopIcon) continue
      if (this.shortCuts[s].position.x == pos.x && this.shortCuts[s].position.y == pos.y){
        if (s == index) return
        if (this.shortCuts[s].properties.extra == "trash"){
          trash = true
          break
        } else {
          console.log("Do error thingie")
          return
        }
      }
    }
    if (trash){
      if (shortCut.properties.extra == "closeiftrashed"){
        this.closeComputer(true)
      }
      shortCut.desktopIcon = false
      this.trash.push(shortCut)
      this.callUpdate('shortcuts')
    } else {
      shortCut.position = pos
      this.callUpdate('shortcuts')

    }
  }
  closeComputer(now=false){
    if (this.shutDown != null) this.shutDown(now ? 1 : 2)
  }
  anyclick(){
    this.openStartMenu(false)
  }
  openStartMenu(open=true){
    this.startMenuOpen = open
    if (this.startMenuState != null) this.startMenuState(this.startMenuOpen)
  }
  toggleStartMenu(){
    this.startMenuOpen = !this.startMenuOpen
    if (this.startMenuState != null) this.startMenuState(this.startMenuOpen)
  }

}

export type ProgramProperties = {
  extra?: string
  tittle: string
  icon: string
  description?: string
  program: string
}
