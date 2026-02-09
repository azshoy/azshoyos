import styles from "@/globalStyles/global.module.css";
import {useContext} from "react";
import {TaskManagerContext} from "@/components/OS/TaskManager";

export const OverlayFilter = () => {
  const {overlayFilter} = useContext(TaskManagerContext)
  const pxVal = {
    offset: 4,
    size: 1,
    strength: 2,
    dilateScale: 0.5
  }
  const posterValues = (steps:number=20, offset:number=-0.1) => {
    const step = 1.0 / steps
    const initial = step/2.0 + (offset/2.0)*step
    const values = []
    for (var i = 0; i < steps; i++){
      values.push(initial + step*i)
    }
    return values.join(" ")
  }
  return (
    <div className={styles.filterOverlay} style={{backdropFilter: overlayFilter}}>
      <svg>
        <filter id="retro" x="0" y="0">
          <feComponentTransfer result="b">
              <feFuncR type="discrete" tableValues={posterValues()} />
              <feFuncG type="discrete" tableValues={posterValues()} />
              <feFuncB type="discrete" tableValues={posterValues()} />
          </feComponentTransfer>
          <feFlood x={pxVal.offset} y={pxVal.offset} height={pxVal.size} width={pxVal.size}/>
          <feComposite width={pxVal.strength} height={pxVal.strength}/>
          <feTile result="a"/>
          <feComposite in="b" in2="a" operator="in"/>
          <feMorphology operator="dilate" radius={pxVal.strength*pxVal.dilateScale}/>
        </filter>
      </svg>
    </div>

  )
}