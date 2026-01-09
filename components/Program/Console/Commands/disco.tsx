import {Result} from "@/components/Program/Console/commandHandler";
import {Command} from "@/components/Program/Console/availableCommands";
import {ConsoleContext} from "@/components/Program/Console";

type commandState = {
  on: boolean,
}
export const discoCommand:Command = {
  argCount: [0, 0],
  help: "Starts a disco!",
  description: "Wanna party?",
  unlisted: false,
  default_state: {on: false},
  run: (_args: string[], context:ConsoleContext):Result => {
    context.state["disco"].on = !context.state["disco"].on
    const currentState = context.state["disco"] as commandState
    if (currentState.on) {
      context.taskManager.setAsBackground('url("/misc/disco.gif")')
      context.taskManager.specialEffects.add("shortcuts_dance")
      return {exitCode: 0, output: [{s: "Party time!"}]}
    } else {
      context.taskManager.specialEffects.remove("shortcuts_dance")
      context.taskManager.setAsBackground('default')
      return {exitCode: 0, output: [{s: "Party Over! :("}]}
    }
    return {exitCode: 1, output: [{s: "Unknown error!", c:"error"}]}
  }
}