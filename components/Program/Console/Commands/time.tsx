import {Command, Result} from "@/components/Program/Console/commandHandler";
import {TaskManager} from "@/util/taskManager";


export const timeCommand:Command = {
  args: [0, 0],
  help: "Tells you the current time",
  description: "What time is it?",
  unlisted: false,
  run: (_args: string[], _tm:TaskManager):Result => {
    return {exitStatus: 0, output: [{s: "Please check the bottom right corner."}]}
  }
}