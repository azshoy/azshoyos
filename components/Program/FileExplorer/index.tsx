import styles from "../program.module.css";
import { BasicProgramProps} from "..";
import {Component} from "react";
import globalStyles from "@/globalStyles/global.module.css";

export class FileExplorer extends Component<BasicProgramProps> {
  parameters: string[]
  constructor(props:BasicProgramProps) {
    super(props);
    this.parameters = props.parameters
  }
  render(){
    return (
      <div className={styles.document}>
        <div className={globalStyles.error}>
          Error: ACCESS DENIED.
        </div>
        Please contact your local az.sh person for help.
      </div>
    )
  }
}