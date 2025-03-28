import {Command, Result} from "@/components/Program/Console/commandHandler";
import {TaskManager} from "@/util/taskManager";


export const shutdownCommand:Command = {
  args: [0, 0],
  help: "Shuts the computer.",
  description: "Time to go?",
  unlisted: false,
  run: (_args: string[], tm:TaskManager):Result => {
    if (tm){
      setTimeout(() => tm.closeComputer(), 1000)
      return {exitStatus: 0, output: [{s: "Bye!"}]}
    }
    return {exitStatus: 1, output: [{s: "Unknown error!", c:"error"}]}
  }
}