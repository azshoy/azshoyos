import {Result} from "@/components/Program/Console/commandHandler";
import {Command} from "@/components/Program/Console/availableCommands";
import {ConsoleContext} from "@/components/Program/Console";
import {sendCommandProgressToServer} from "@/components/Program/Console/Commands/pesti/pestiprogresslogger";



export const pestiCommand:Command = {
  argCount: [0, 0],
  help: "Pesti-Challenge start!",
  description: "Start your Pesti-Challenge journey",
  unlisted: true,
  run: (args: string[], _context:ConsoleContext):Result => {
    sendCommandProgressToServer("pesti", args)
    return {
      exitCode: 0, output: [
        {s: "On your Pesti journey you see an interesting statue."},
        {s: "\n[images/statue.jpg]\n", c: "highlight"},
        {s: "It seems that someone has written strange message to the base of the statue, it reads:"},
        {s: "\n"},
        {s: "> Tox Vtxltk\n", c: "highlight"},
        {s: "> Max gxqm vhfftgw bl uknmnl\n", c: "highlight"},
        {s: "> Mabl pbee teehp rhn mh ikhvxxw mh max gxqm mtld\n", c: "highlight"},
        {s: "Encrypt the message to continue your journey.\nThe statue guy might have something to do with this nonsense.."},
      ]
    }
  }
}
