import {commands} from "@/components/Program/Console/availableCommands";
import {ConsoleContext} from "@/components/Program/Console/index";

type textColor = "default" | "error" | "highlight"

export type Txt = {
  s: string,
  c?: textColor
}

export type Result = {
  exitCode: number,
  output?: Txt | Txt[]
}


export const handleCommand = (c: string, args: string[], context:ConsoleContext):Result => {
  if (c in commands) {
    const command = commands[c]
    if (args.length >= command.argCount[0] && args.length <= command.argCount[1]) {
      if (typeof context.state[c] == 'undefined') context.state[c] = command.default_state
      return command.run(args, context)
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
