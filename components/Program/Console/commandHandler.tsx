import {TaskManager} from "@/util/taskManager";
import {commands} from "@/components/Program/Console/availableCommands";

type textColor = "default" | "error" | "highlight"

export type Txt = {
  s: string,
  c?: textColor
}

export type Result = {
  exitStatus: number,
  output?: Txt | Txt[]
}


export class CommandHandler {
  handleCommand(c: string, args: string[], taskManager:TaskManager):Result {
    if (c in commands) {
      const command = commands[c]
      if (args.length >= command.argCount[0] && args.length <= command.argCount[1]) {
        return command.run(args, taskManager)
      } else {
        if (command.argCount[0] != command.argCount[1]) {
          return {exitStatus: 1, output: {s: "Error: Expected " + command.argCount[0].toString() + " to " + command.argCount[1].toString() + " parameters, but received " + args.length.toString(), c: "error"}}
        } else {
          return {exitStatus: 1, output: {s: "Error: Expected " + command.argCount[0].toString() + " parameter, but received " + args.length.toString(), c:"error"}}
        }
      }
    }
    return {exitStatus: 1, output: {s: "Error: Command " + c + " not found!", c:"error"}}
  }
}