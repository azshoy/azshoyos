import {Result} from "@/components/Program/Console/commandHandler";
import {Command} from "@/components/Program/Console/availableCommands";
import {ConsoleContext} from "@/components/Program/Console";


export const shutdownCommand:Command = {
  argCount: [0, 0],
  help: "Shuts the computer.",
  description: "Time to go?",
  unlisted: false,
  run: (_args: string[], context:ConsoleContext):Result => {
    if (context.taskManager){
      setTimeout(() => context.taskManager.setShutDown(1), 100)
      return {exitCode: 0, output: [{s: "Bye!"}]}
    }
    return {exitCode: 1, output: [{s: "Unknown error!", c:"error"}]}
  }
}