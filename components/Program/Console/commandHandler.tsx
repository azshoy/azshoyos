import {helpCommand} from "@/components/Program/Console/Commands/help";
import {helloCommand} from "@/components/Program/Console/Commands/hello";
import {TaskManager} from "@/util/taskManager";
import {discoCommand} from "@/components/Program/Console/Commands/disco";
import {timeCommand} from "@/components/Program/Console/Commands/time";
import {shutdownCommand} from "@/components/Program/Console/Commands/shutdown";


export const commands:{[key: string]: Command} = {
  help: helpCommand,
  hello: helloCommand,
  disco: discoCommand,
  time: timeCommand,
  shutdown: shutdownCommand,
}

export type Command = {
  args: [number, number]
  help?: string
  description?: string
  unlisted?: boolean
  run: CallableFunction
}

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
      if (args.length >= command.args[0] && args.length <= command.args[1]) {
        return command.run(args, taskManager)
      } else {
        if (command.args[0] != command.args[1]) {
          return {exitStatus: 1, output: {s: "Error: Expected " + command.args[0].toString() + " to " + command.args[1].toString() + " parameters, but received " + args.length.toString(), c: "error"}}
        } else {
          return {exitStatus: 1, output: {s: "Error: Expected " + command.args[0].toString() + " parameter, but received " + args.length.toString(), c:"error"}}
        }
      }
    }
    return {exitStatus: 1, output: {s: "Error: Command " + c + " not found!", c:"error"}}
  }
}