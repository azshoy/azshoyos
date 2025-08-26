import {Result} from "@/components/Program/Console/commandHandler";
import {Command} from "@/components/Program/Console/availableCommands";
import {TaskManager} from "@/util/taskManager";


export const discoCommand:Command = {
  argCount: [0, 0],
  help: "Starts a disco!",
  description: "Wanna party?",
  unlisted: false,
  run: (_args: string[], _tm:TaskManager):Result => {
    const r: HTMLElement|null = document.querySelector(':root')
    if (r) {
      const background = r.style.getPropertyValue('--background')
      if (background === 'url("/misc/disco.gif")') {
        r.style.setProperty('--background', 'var(--blue-dark)');
        return {exitStatus: 0, output: [{s: "Party time is over!"}]}
      } else {
        r.style.setProperty('--background', 'url("/misc/disco.gif")');
        return {exitStatus: 0, output: [{s: "Party time!"}]}
      }
    }
    return {exitStatus: 1, output: [{s: "Unknown error!", c:"error"}]}
  }
}