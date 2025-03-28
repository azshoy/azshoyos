import {Command, Result} from "@/components/Program/Console/commandHandler";
import {TaskManager} from "@/util/taskManager";


export const helloCommand:Command = {
  args: [0, 0],
  help: "Hello world!",
  description: "Startup script",
  unlisted: true,
  run: (_args: string[], _tm:TaskManager):Result => {
    return {
      exitStatus: 0, output: [
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