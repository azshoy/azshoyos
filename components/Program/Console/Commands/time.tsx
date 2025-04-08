import {Result} from "@/components/Program/Console/commandHandler";
import {Command} from "@/components/Program/Console/availableCommands";
import {TaskManager} from "@/util/taskManager";



export const timeCommand:Command = {
  argCount: [0, 0],
  help: "Tells you the current time",
  description: "What time is it?",
  unlisted: false,
  run: (_args: string[], _tm:TaskManager):Result => {
    return {exitStatus: 0, output: [{s: "Please check the bottom right corner."}]}
  }
}