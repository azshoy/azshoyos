import {Result} from "@/components/Program/Console/commandHandler";
import {Command} from "@/components/Program/Console/availableCommands";
import {ConsoleContext} from "@/components/Program/Console";



export const timeCommand:Command = {
  argCount: [0, 0],
  help: "Tells you the current time",
  description: "What time is it?",
  unlisted: false,
  run: (_command: string, _args: string[], _context:ConsoleContext):Result => {
    return {exitCode: 0, output: [{s: "Please check the bottom right corner."}]}
  },
  continue: (_command: string, _input:string[], _context:ConsoleContext):Result => {
    return {exitCode: 0, output: []}
  }
}