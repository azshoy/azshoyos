import styles from '@/globalStyles/os.module.css'
import { TaskBar } from "@/components/azshoyos/TaskBar";
import {Desktop} from "@/components/azshoyos/desktop";
import {useContext} from "react";
import {TaskManagerContext, TaskManagerProvider} from "@/components/azshoyos/OS/TaskManager";
import {OverlayFilter} from "@/components/azshoyos/extras/OverlayFilter";
import {Scaler} from "@/components/layouts/components/scaler";
import {Header, HeaderProps} from "@/components/layouts/components/header";


export const OSLayout = ({...headerProps}:Partial<HeaderProps> )=> {
  return (
    <>
      <Header headerProps={headerProps}/>
      <TaskManagerProvider>
        <Scaler className={styles.main}>
          <Desktop/>
        </Scaler>
        <TaskBar/>
        <OverlayFilter/>
        <CloseComputer/>
      </TaskManagerProvider>
    </>
  );
}


export default OSLayout




const CloseComputer = () => {
  const {shutDown} = useContext(TaskManagerContext)
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