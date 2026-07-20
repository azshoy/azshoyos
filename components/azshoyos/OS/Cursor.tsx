import {useEffect, useState} from "react";

type CursorData = {
  pageX: number
  pageY: number
  clientX: number
  clientY: number
  type: string
  event?: MouseEvent | TouchEvent
}


export const useCursor = () => {
  const [timestamp, setTimestamp] = useState(Date.now())
  const [clickActive, setClickActive] = useState(false)
  const [cursorData, setCursorData] = useState<CursorData>({
    pageX: 0,
    pageY: 0,
    clientX: 0,
    clientY: 0,
    type: 'undefined',
  })

  useEffect(() => {
    const updateMousePosition = (ev:MouseEvent) => {
      updateCursorData({
        pageX: ev.pageX,
        pageY: ev.pageY,
        clientX: ev.clientX,
        clientY: ev.clientY,
        event: ev,
        type: ev.type
      });
      if (ev.type == 'click'){
        setClickActive(true)
      } else if (ev.type == 'mouseup') {
        setClickActive(false)
      }
    };
    const updateTouchPosition = (ev:TouchEvent) => {
      const touch =  ev.touches[0] ?? ev.targetTouches[0] ?? ev.changedTouches[0] ?? undefined
      if (!touch) return
      updateCursorData({
        pageX: touch.pageX,
        pageY: touch.pageY,
        clientX: touch.clientX,
        clientY: touch.clientY,
        event: ev,
        type: ev.type
      });
      if (ev.type == 'touchstart'){
        setClickActive(true)
      } else if (ev.type == 'touchend') {
        setClickActive(false)
      }
    };
    const updateCursorData = (cd:CursorData) =>{
      setCursorData(cd)
      setTimestamp(Date.now())
    }
    window.addEventListener('mousemove', updateMousePosition)
    window.addEventListener('click', updateMousePosition)
    window.addEventListener('mouseup', updateMousePosition)
    window.addEventListener('touchmove', updateTouchPosition)
    window.addEventListener('touchstart', updateTouchPosition)
    window.addEventListener('touchend', updateTouchPosition)
    return () => {
      window.removeEventListener('mousemove', updateMousePosition)
      window.removeEventListener('click', updateMousePosition)
      window.removeEventListener('mouseup', updateMousePosition)
      window.removeEventListener('touchmove', updateTouchPosition)
      window.removeEventListener('touchstart', updateTouchPosition)
      window.removeEventListener('touchend', updateTouchPosition)
    };
  }, []);
  return {...cursorData, clickActive, timestamp}
}
