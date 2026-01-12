import {Result} from "@/components/Program/Console/commandHandler";
import {Command} from "@/components/Program/Console/availableCommands";
import {ConsoleContext} from "@/components/Program/Console";

export const onchainCommand: Command = {
  argCount: [0, 0],
  help: "Display onchain challenge details",
  description: "Onchain challenge",
  run: (_args: string[], _context: ConsoleContext): Result => {
    return {
      exitCode: 0,
      output: [{s: "42161 0x259207d12b8991Cfb9F222BD31e87c8b53a81FDF", c: "highlight"}]
    };
  }
};
