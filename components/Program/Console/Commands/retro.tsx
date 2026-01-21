import {Result} from "@/components/Program/Console/commandHandler";
import {Command} from "@/components/Program/Console/availableCommands";
import {ConsoleContext} from "@/components/Program/Console";

type commandState = {
  on: boolean,
}
export const retroCommand:Command = {
  argCount: [0, 0],
  help: "Retro mode!",
  description: "Feeling nostalgic?",
  unlisted: false,
  defaultState: {on: false},
  run: (_command: string, _args: string[], context:ConsoleContext):Result => {
    context.state["retro"].on = !context.state["retro"].on
    context.setState({...context.state})
    const currentState = context.state["retro"] as commandState
    if (currentState.on) {
      context.taskManager.setAsBackground('url("/misc/retro.png")')
      return {exitCode: 0, output: [{s: "Retro time!"}]}
    } else {
      context.taskManager.setAsBackground('default')
      return {exitCode: 0, output: [{s: "Nostalgia is overrated :("}]}
    }
    return {exitCode: 1, output: [{s: "Unknown error!", c:"error"}]}
  },
  continue: (_command: string, _input:string[], _context:ConsoleContext):Result => {
    return {exitCode: 0, output: []}
  }
}