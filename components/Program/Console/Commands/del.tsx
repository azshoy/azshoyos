import { Result } from "@/components/Program/Console/commandHandler";
import { Command } from "@/components/Program/Console/availableCommands";
import { ConsoleContext } from "@/components/Program/Console";

const TOTAL_STEPS = 10;
const STEP_INTERVAL_MS = 300;
const BSOD_DURATION_MS = 5000;
const BSOD_IMAGE = "/misc/bsod_chatgpt_generated.png";

const showBsod = () => {
  const img = document.createElement("img");
  img.src = BSOD_IMAGE;
  img.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;object-fit:cover;z-index:150000000;";
  document.body.appendChild(img);
  setTimeout(() => img.remove(), BSOD_DURATION_MS);
};

const progressBar = (step: number) => {
  const filled = "█".repeat(step);
  const empty = "░".repeat(TOTAL_STEPS - step);
  return `Deleting: [${filled}${empty}] ${step * 10}%`;
};

export const delCommand: Command = {
  argCount: [0, 5],
  help: "just do it",
  description: "just do it",
  unlisted: false,
  run: (_command: string, _args: string[], context: ConsoleContext): Result => {
    let step = 0;
    context.printLine({ s: "Deleting C:\\Windows\\system32...", c: "highlight" });

    const interval = setInterval(() => {
      step += 1;
      context.printLine({ s: progressBar(step) });

      if (step >= TOTAL_STEPS) {
        clearInterval(interval);
        context.printLine({ s: "CRITICAL SYSTEM FAILURE: C:\\Windows\\system32 deleted!", c: "error" });
        showBsod();
      }
    }, STEP_INTERVAL_MS);

    return { exitCode: 0, output: [] };
  },
  continue: (_command: string, _input: string[], _context: ConsoleContext): Result => {
    return { exitCode: 0, output: [] };
  }
};
