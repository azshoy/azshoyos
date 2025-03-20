import styles from "@/components/Program/program.module.css";
import {ReactElement} from "react";

type textColor = "default" | "error" | "highlight"

export class CommandHandler {
  txtId = 0
  commands = [
    {
      command: "help",
      param: [0, 1],
      func: this.cHelp
    }
  ]
  helpTexts: { [key: string]: ReactElement[] } = {
    "help": [
      this.toTxt("help gives you help!")
    ]
  }

  handleCommand(command: string, param: string[]):{success: boolean, output: ReactElement[]|undefined} {
    for (let c = 0; c < this.commands.length; c++) {
      if (this.commands[c].command == command) {
        if (param.length >= this.commands[c].param[0] && param.length <= this.commands[c].param[1]) {
          return this.commands[c].func.call(this, param)
        } else {
          if (this.commands[c].param[0] != this.commands[c].param[1]) {
            return {
              success: false, output: [
                this.toTxt("Error: Expected " + this.commands[c].param[0].toString() + " to " + this.commands[c].param[1].toString() + " parameters, but received " + param.length.toString(), "error")
              ]
            }
          } else {
            return {
              success: false, output: [
                this.toTxt("Error: Expected " + this.commands[c].param[0].toString() + " parameter, but received " + param.length.toString(), "error")]
            }
          }
        }
      }
    }
    return {success: false, output: [
      this.toTxt("Error: Command " + command + " not found!", "error")
      ]
    }
  }
  cHelp(param: string[]):{success: boolean, output: ReactElement[]|undefined} {
    if (param.length == 0) {
      const clist: ReactElement[] = [this.toTxt("Usage: help <command>"), <br key="br-help-1"/>, this.toTxt("Try these commands:")]
      for (let c = 0; c < this.commands.length; c++) {
        clist.push(<br key={`br-help-cmd-${c}`}/>)
        clist.push(<span key={`span-help-cmd-${c}`}>&nbsp;&nbsp;&nbsp;</span>)
        clist.push(this.toTxt(this.commands[c].command))
      }
      return {success: true, output: clist}
    } else {
      for (let c = 0; c < this.commands.length; c++) {
        if (this.commands[c].command == param[0]) {
          const helptext = this.helpTexts[param[0]]
          if (helptext) {
            return {success: true, output: helptext}
          }
          return {
            success: false, output: [this.toTxt("Sorry, there is no help with this command..", "error")]
          }

        }
      }
      return {
        success: false, output: [this.toTxt("Sorry, can't help with nonexistent command. '" + param[0] + "' :(")]
      }
    }
  }




  toTxt(txt: string, t: textColor = "default"): ReactElement {
    this.txtId += 1
    return <span key={this.txtId}
                 className={t == "error" ? styles.error : t == "highlight" ? styles.highlight : ""}>{txt}</span>
  }
}