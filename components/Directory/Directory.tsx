import {ReactNode, useContext, useEffect, useRef, useState} from "react";
import {Draggable, DragManagerContext, TaskManagerContext} from "@/components/OS/TaskManager";
import {useMonitor} from "@/components/OS/MonitorHandler";
import {v2} from "@/util/types";
import {Shortcut, ShortcutComponent} from "@/components/Shortcut/Shortcut";

type DirectoryProps = {
  path: string[]
  allowFreePosition?: boolean
  className?: string
}
export type DirGrid = {
  gridSize: v2
  cellSize: v2
  grid: (string | null)[][]
}

export const Directory = ({
  path:inputPath,
  allowFreePosition = false,
  className,
}:DirectoryProps) => {
  const {shortcuts:allShortcuts, shortcutUpdate, setShortcutUpdate, runXonY} = useContext(TaskManagerContext)
  const {uiScale} = useMonitor()
  const [viewSize, setViewSize] = useState<v2|undefined>(undefined);
  const [grid, setGrid] = useState<DirGrid | undefined>(undefined);
  const [scrollable, setScrollable] = useState(false);
  const viewAreaElement = useRef<HTMLDivElement>(null)
  const [path, setPath] = useState(inputPath)
  const pathString = "/"+path.join("/")
  const [shortcutElements, setShortCutElements] = useState<ReactNode[]>([])
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([])
  const DMC = useContext(DragManagerContext)


  const [collectPos, setCollectPos] = useState<v2>({x:0, y:0});
  const [collected, setCollected] = useState<Draggable>(null);


  useEffect(() => {
    setShortcuts(allShortcuts.filter((s) => {return "/"+s.path.join('/') == pathString}))
  }, [allShortcuts, shortcutUpdate, pathString]);

  useEffect(() => {
    if (viewAreaElement.current) {
      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setViewSize({
            x: entry.contentRect.width,
            y: entry.contentRect.height,
          });
        }
      });
      observer.observe(viewAreaElement.current);
      // Cleanup function
      return () => {
        observer.disconnect();
      };
    }
  }, [viewAreaElement]);

  useEffect(() => {
    if (viewSize) {
      const gridSize = {x: Math.floor(viewSize.x / (150*uiScale)), y: Math.floor(viewSize.y / (150*uiScale))}
      const cellSize = {x: viewSize.x/gridSize.x, y: viewSize.y/gridSize.y}
      const grid = Array.from({length: gridSize.y}, () => Array.from({length: gridSize.x}, () => null));
      setGrid({gridSize, cellSize, grid})
    }
  }, [viewSize, uiScale]);
  useEffect(() => {
    if (grid){
      const updateGridAt = (v: string, p:v2 = {x:-1, y:-1}) => {
        const nGrid = grid.grid.map((row, y) => row.map((c, x) => {
          if (c == v) return null
          if (x == p.x && y == p.y) return v
          return c
        }))
        setGrid({...grid, grid: nGrid})
        grid.grid = nGrid
      }
      const dropTo = (short: Shortcut, push:boolean=false, move:number=0, skipOnFail=false) => {
        const gPos = {x: Math.floor(short.position.x * (grid.gridSize.x-0.001)), y: Math.floor(short.position.y * (grid.gridSize.y-0.001))}
        gPos.x += move
        if (gPos.x < 0){
          gPos.x = grid.gridSize.x -1
          gPos.y -= 1
          if (gPos.y < 0){
            return false
          }
        }
        if (gPos.x >= grid.gridSize.x){
          gPos.x =  0
          gPos.y += 1
          if (gPos.y >= grid.gridSize.y){
            return false
          }
        }
        const current = grid.grid[gPos.y][gPos.x]
        if (current == null) {
          updateGridAt(short.id, gPos)
        } else if (current == short.id) {
          return
        } else {
          const cShort = shortcuts.find((s) => {return ("/"+s.path.join('/') == pathString && current == s.id)})
          if (typeof cShort == 'undefined') {
            updateGridAt(current)
            updateGridAt(short.id, gPos)
            return
          }
          if (push) {
            if (!dropTo(cShort, true, move == 0 ? 1 : move)) {
              if (move != 0) return false
              if (!dropTo(cShort, true, -1)) {
                return false
              }
            }
            updateGridAt(short.id, gPos)
          } else {
            if (skipOnFail) return false
            if (!dropTo(short, false, move >= 0 ? move+1 : move -1)){
              if (move != 0) return false
              if (!dropTo(short, false, move-1)){
                return false
              }
            }
          }
        }
        setGrid({...grid})
        return true
      }
      const findCurrentPosition = (short:Shortcut) => {
        const pos = {x: -1, y: -1}
        grid.grid.forEach((row, y) => {
          const x = row.findIndex((s) => (s == short.id))
          if (x >= 0) {
            pos.x = x
            pos.y = y
          }
        })
        return pos.x == -1 ? undefined : pos
      }
      setShortCutElements(
        shortcuts.filter((s) => {
          return "/"+s.path.join('/') == pathString
        }).map((s, i) => {
          return (<ShortcutComponent key={i} shortcut={s} grid={grid} freePos={allowFreePosition} dropTo={dropTo} gridPos={findCurrentPosition(s)}/>)
        })
      )
    }
  }, [shortcuts, pathString, grid, allowFreePosition, shortcutUpdate]);

  const collectShortcut = (clientClickPos:v2) =>{
    if (viewAreaElement.current && DMC) {
      const elemRect = viewAreaElement.current.getBoundingClientRect()
      const clickPos = {
        x: clientClickPos.x - elemRect.x,
        y: clientClickPos.y - elemRect.y
      }
      DMC.setCollector({f: setCollected, p: path})
      setCollectPos(clickPos)
    }
  }

  const onTouchEnd = (e: React.TouchEvent)=> {
    const touch =  e.touches[0] ?? e.targetTouches[0] ?? e.changedTouches[0] ?? undefined
    if (!touch) return
    collectShortcut({x: touch.clientX, y: touch.clientY})
  }
  const onMouseUp = (e: React.MouseEvent) => {
    collectShortcut({x: e.clientX, y: e.clientY})
  }

  useEffect(() => {
    setCollected(null)
    if (collected && viewSize && grid) {
      const s = allShortcuts.find((s) => s.id == collected.id)
      if (s) {
        const dropPos = {x: collectPos.x / viewSize.x, y: collectPos.y / viewSize.y}
        const gPos = {x: Math.floor(dropPos.x * (grid.gridSize.x-0.001)), y: Math.floor(dropPos.y * (grid.gridSize.y-0.001))}
        const current = grid.grid[gPos.y][gPos.x]
        const currentS = current ? allShortcuts.find((s) => s.id == current) : undefined
        if (current == s.id) return
        if ("/"+s.path.join('/') != pathString){
          s.path = [...path]
          setShortcutUpdate(Date.now())
        }
        if (current == null || !currentS){
          s.position = {
            x: collectPos.x / viewSize.x,
            y: collectPos.y / viewSize.y
          }
          const nGrid = grid.grid.map((row, y) => row.map((c, x) => {
            if (c == s.id) return null
            return c
          }))
          setGrid({...grid, grid: nGrid})
        } else {
          const gone = runXonY(s, currentS.programID)
          if (gone) {
            const nGrid = grid.grid.map((row, y) => row.map((c, x) => {
              if (c == s.id) return null
              return c
            }))
            setGrid({...grid, grid: nGrid})
            setShortcutUpdate(Date.now())
          }
        }
      }
    }
  }, [collected, collectPos, viewSize, path, pathString, shortcuts, grid]);

  return (
    <div ref={viewAreaElement} className={className} style={{width: "100%", height: "100%", display:'grid', gridTemplateColumns: `repeat(${grid?.gridSize.x}, ${grid?.cellSize.x}px)`, gridTemplateRows: `repeat(${grid?.gridSize.y}, ${grid?.cellSize.y}px)`}} onMouseUp={onMouseUp} onTouchEnd={onTouchEnd}>
      {shortcutElements}
    </div>
  )
}