import {Result} from "@/components/Program/Console/commandHandler";
import {Command, commands} from "@/components/Program/Console/availableCommands";
import {Txt} from "@/components/Program/Console/commandHandler";
import {TaskManager} from "@/util/taskManager";


export const helpCommand:Command = {
  argCount: [0, 1],
  help: "help gives you help!",
  description: "a great help.",
  unlisted: false,
  run: (args: string[], _tm:TaskManager):Result => {
    if (args.length == 0) {
      const clist: Txt[] = [{s: "Usage: help <command>\nYou can try these commands:"}]
      for (const [key, value] of Object.entries(commands)) {
        if (!value.unlisted) clist.push({s: `\n   ${key} - ${value.description || ""}`})
      }
      return {exitStatus: 0, output: clist}
    } else {
      if (args[0] in commands) {
        const command = commands[args[0]]
        if (command.help){
          return {exitStatus: 0, output: {s: command.help}}
        }
        return {exitStatus: 1, output: {s: "Sorry, there is no help with this command..", c: "error"}}
      }
      return {exitStatus: 1, output: {s: "Sorry, can't help with nonexistent command. '" + args[0] + "' :(", c: "error"}}
    }
  }
}