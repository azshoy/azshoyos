import {commands} from "@/components/Program/Console/availableCommands";
import {CommandStatus, ConsoleContext, Status} from "@/components/Program/Console/index";

type textColor = "default" | "error" | "highlight"

export type Txt = {
  s: string,
  c?: textColor,
  onClick?: TxtAction
}
export type TxtAction = {
  a: "link" | "file" | "command"
  t: string
}

export type Result = {
  exitCode: number,
  output?: Txt | Txt[]
} | {
  status: Exclude<Status, Status.EXITED>,
  output?: Txt | Txt[]
}


export const handleCommand = async (commandStatus: CommandStatus, c: string | undefined, args: string[], context:ConsoleContext) => {
  if (commandStatus.status == Status.EXITED) {
    await runCommand(c, args, context).then(output => {
      if ("exitCode" in output){
        context.printLine(output.output)
        context.setCommandStatus({t: Date.now(), status: Status.EXITED, exitCode: output.exitCode, command: c ?? ""})
      } else {
        context.printLine(output.output)
        context.setCommandStatus({t: Date.now(), status: output.status, command: c ?? ""})
      }
    })
  } else if (commandStatus.command) {
    const command = commands[commandStatus.command]
    const output = await command.continue(commandStatus.command, [c, ...args], context)
    if ("exitCode" in output){
      context.printLine(output.output)
      context.setCommandStatus({t: Date.now(), status: Status.EXITED, exitCode: output.exitCode, command: commandStatus.command})
    } else {
      context.printLine(output.output)
      context.setCommandStatus({t: Date.now(), status: output.status, command: commandStatus.command})
    }
  }
  return {exitCode: 1, output: {s: "Error: Something went terribly wrong", c:"error"}}
}

const runCommand = async (c: string | undefined, args: string[], context:ConsoleContext):Promise<Result> => {
  if (!c) {
    return {exitCode: 1, output: []}
  }
  if (c in commands) {
    const command = commands[c]
    if (args.length >= command.argCount[0] && args.length <= command.argCount[1]) {
      if (typeof context.state[c] == 'undefined') {
        context.setState({...context.state, [c]: command.defaultState})
        context.state[c] = command.defaultState
      }
      return command.run(c, args, context)
    } else {
      if (command.argCount[0] != command.argCount[1]) {
        return {exitCode: 1, output: {s: "Error: Expected " + command.argCount[0].toString() + " to " + command.argCount[1].toString() + " parameters, but received " + args.length.toString(), c: "error"}}
      } else {
        return {exitCode: 1, output: {s: "Error: Expected " + command.argCount[0].toString() + " parameter, but received " + args.length.toString(), c:"error"}}
      }
    }
  }
  return {exitCode: 1, output: {s: "Error: Command " + c + " not found!", c:"error"}}
}


const argParse = (command:string, args: string[]) => {

}

