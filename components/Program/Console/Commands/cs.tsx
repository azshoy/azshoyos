import {Result} from "@/components/Program/Console/commandHandler";
import {Command} from "@/components/Program/Console/availableCommands";
import {ConsoleContext} from "@/components/Program/Console";

type commandState = {
  on: boolean,
}
export const csCommand:Command = {
  argCount: [0, 1],
  help: "Command storage toggler",
  description: "By enabling local command storage, you agree to using cookies.",
  unlisted: false,
  run: (_command: string, args: string[], context:ConsoleContext):Result => {
    const enabled = localStorage.getItem("localCommandHistoryEnabled") == "TRUE"
    if (args.length == 0) {
      if (enabled){
        localStorage.removeItem("localCommandHistoryEnabled")
      } else {
        localStorage.setItem("localCommandHistoryEnabled", "TRUE")

      }
      return {exitCode: 0, output: [{s: "Toggling local command storage " + (enabled ? "OFF." : "ON.")}]}
    } else {
      const arg = args[0].toLowerCase()
      if (["n", "0", "disable", "false"].includes(arg)){
        localStorage.removeItem("localCommandHistoryEnabled")
        return {exitCode: 0, output: [{s: "Turned local command storage OFF."}]}
      }
      else if (["clear", "delete"].includes(arg)){
        localStorage.removeItem("localCommandHistoryEnabled")
        localStorage.removeItem("localCommandHistory")
        return {exitCode: 0, output: [{s: "Turned local command storage OFF, and cleared all stored commands."}]}
      }
      else if (["y", "1", "enable", "true"].includes(arg)){
        localStorage.setItem("localCommandHistoryEnabled", "TRUE")
        return {exitCode: 0, output: [{s: "Turned local command storage ON."}]}
      }
      else {
        return {exitCode: 1, output: [{s: "Unknown parameters!", c:"error"}]}
      }
    }
    return {exitCode: 1, output: [{s: "Unknown error!", c:"error"}]}
  },
  continue: (_command: string, _input:string[], _context:ConsoleContext):Result => {
    return {exitCode: 0, output: []}
  }
}