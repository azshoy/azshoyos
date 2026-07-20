import {useEffect, useState} from "react";

type Signal = {
  type: string
  detail: object
}
interface SignalListener extends EventListener {
  (signal: Signal): void
}

export const useConnectedSignal = <T extends object>(signalName:string, onFire?:CallableFunction) => {
  const [output, setOutput] = useState<T>()
  const [fired, setFired] = useState<number>(0)
  useEffect(() => {
    const listener: SignalListener = (e) => {
      setOutput(('detail' in e ? e.detail : {}) as T)
      setFired(Date.now())
      if (onFire) onFire()
    }
    connectSignal(signalName, listener);

    return () => {
      disconnectSignal(signalName, listener);
    }
  }, []);
  return {fired, output}
}


export const connectSignal = (signalName: string, listener: SignalListener) => {
  if (document) document.addEventListener(signalName, listener);
}

export const disconnectSignal = (signalName: string, listener: SignalListener) => {
  if (document) document.removeEventListener(signalName, listener);
}

export const emitSignal = (signalName: string, data: object = {}) => {
  const event = new CustomEvent(signalName, { detail: data });
  if (document) document.dispatchEvent(event);
}