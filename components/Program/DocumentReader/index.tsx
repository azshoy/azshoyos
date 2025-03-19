import styles from "../program.module.css";
import { BasicProgramProps} from "..";
import {Component} from "react";


export class DocumentReader extends  Component<BasicProgramProps> {
  parameters: string[]
  constructor(props:BasicProgramProps) {
    super(props);
    this.parameters = props.parameters
  }
  render() {
    return (
    <div className={styles.document}>
      {getContents(this.parameters)}
    </div>
  )
  }
}

const getContents = (parameters:string[])=> {
  const content = []
  for (let p = 0; p < parameters.length; p++){
    content.push(<div key={p}>{getContent(parameters[p])}</div>)
  }
  return content
}
const getContent = (parameter:string)=> {
  switch (parameter){
    case 'readme':
      return (
        <div>
          This is the readmefile yes. <br/>
          formating very easy. <br/>
          is html file actually.
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .<br/>
          .
          HELLO :D
        </div>
      )
    case 'contact':
      return (<div>
        Call a sakke! 342542542
      </div>)
    default:
      return (<div>{parameter}</div>)
  }
}

