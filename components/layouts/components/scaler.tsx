import {useMonitor} from "@/components/azshoyos/OS/MonitorHandler";
import {CSSProperties} from "react";
import {MinimalContainer} from "@/util/componentTypes";

export const Scaler = ({children, className}:MinimalContainer) => {
  const {uiScale} = useMonitor()
  return (
    <div className={className} style={{'--uiScale': String(uiScale)} as CSSProperties}>
      {children}
    </div>
  )
}