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
          # az.sh oy <br/>
          <br/>
          ## TL;DR:<br/>
          DAO:n johto ja web2/3 ohjelmointiprojektit lohkottuina kokonaisuuksina.
          <br/>
          <br/>
          Yrityksen yhteistiedot löydät Contact Information pikakuvakkeen takaa.<br/>
        </div>
      )
    case 'contact':
      return (
        <div>
          # az.sh oy <br/>
          <br/>
          ## Yhteystiedot <br/>
          <br/>
          Y-tunnus:<br/>
          3474773-5<br/>
          <br/>
          Sähköposti:<br/>
          info@azsh.fi<br/>
          Puhelin:<br/>
          050 432 4719<br/>
          <br/>
          Postiosoite:<br/>
          az.sh oy<br/>
          Isokatu 56<br/>
          90100 Oulu<br/>
        </div>
      )
    default:
      return (<div>{parameter}</div>)
  }
}

