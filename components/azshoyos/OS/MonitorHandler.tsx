import {useEffect, useState} from "react";
import {v2} from "@/util/types";

const getWindowDimensions = ():v2 | undefined => {
  if (typeof window == 'undefined') return undefined
  const { innerWidth: x, innerHeight: y } = window;
  return {
    x,
    y
  };
}

export const useMonitor = () => {
  const [size, setMonitorSize] = useState(getWindowDimensions());
  const [uiScale, setUiScale] = useState(1)
  useEffect(() => {
    const handleResize = () => {
      setMonitorSize(getWindowDimensions());
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (size){
      const minAxis = Math.min(size.x, size.y)
      setUiScale(minAxis < 600 ? 0.6 : minAxis < 800 ? 0.8 : size.x < 2000 ? 1 : 1.6)
    }
   }, [size]);
  return {size, uiScale};
}
