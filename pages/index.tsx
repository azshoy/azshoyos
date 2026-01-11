import "@/globalStyles/globals.css";
import styles from '@/globalStyles/global.module.css'
import { TaskBar } from "@/components/TaskBar";
import {Desktop} from "@/components/desktop";
import {CSSProperties, useContext, useState} from "react";;
import Head from 'next/head'
import {TaskManagerContext, TaskManagerProvider} from "@/components/OS/TaskManager";
import {useMonitor} from "@/components/OS/MonitorHandler";


export const Home = ()=> {
  const {uiScale} = useMonitor()
  return (
    <>
      <Head>
        <title>az.sh</title>
        <meta name="description" content="Welcome to az.sh" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>
      <TaskManagerProvider>
        <div className={styles.main} style={{'--uiScale': String(uiScale)} as CSSProperties}>
          <Desktop/>
        </div>
        <TaskBar/>
        <CloseComputer/>
      </TaskManagerProvider>
    </>
  );
}


export default Home




const CloseComputer = () => {
  const {shutDown} = useContext(TaskManagerContext)
  console.log(shutDown)
  const classN = shutDown == 0 ? styles.hidden : shutDown == 2 ? styles.shutDownNow : styles.shutDown
  return (
    <div className={classN}>
      <div className={styles.shutDownBye}>
        kthxbye :(
      </div>
      <div className={styles.topshutter}>
        <div className={styles.shutterline}></div>
      </div>

      <div className={styles.bottomshutter}>
        <div className={styles.shutterline}></div>
      </div>
    </div>
  )
}