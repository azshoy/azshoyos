import {Result} from "@/components/Program/Console/commandHandler";
import {Command} from "@/components/Program/Console/availableCommands";
import {ConsoleContext} from "@/components/Program/Console";



export const helloCommand:Command = {
  argCount: [0, 0],
  help: "Hello world!",
  description: "Startup script",
  unlisted: true,
  run: (_args: string[], _context:ConsoleContext):Result => {
    return {
      exitCode: 0, output: [
        {s: "       Welcome.             "}, {s: "_\n", c: "highlight"},
        {s: "    Running version 1.1   "}, {s: "/  /\n", c: "highlight"},
        {s: "   _____  _____     ____ /  /___\n", c: "highlight"},
        {s: " /      /___   /  /   __/   _   /\n", c: "highlight"},
        {s: "/  /   /.'  .' _  _\\  \\/  / /  /\n", c: "highlight"},
        {s: "\\___._/______/__/_____/__/ /__/", c: "highlight"}
      ]
    }
  }
}