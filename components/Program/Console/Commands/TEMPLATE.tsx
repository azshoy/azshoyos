import {Result} from "@/components/Program/Console/commandHandler";
import {Command} from "@/components/Program/Console/availableCommands";
import {ConsoleContext} from "@/components/Program/Console";


// const should be named as <YourCommand>Command
export const TemplateCommand:Command = {
  argCount: [0, 0],
  // number of required arguments. [Minimum, Maximum] both inclusive. The requirement is handled by the command handler.
  help: "Shuts the computer.",
  // Text displayed when user runs 'help <yourcommand>'
  description: "Time to go?",
  // Short description of the command. Displayed when commands are listed with 'help'
  unlisted: false,
  // If set true, the command will not be listed by 'help' but can still be executed normally.

  run: (_args: string[], _context:ConsoleContext):Result => {
    // this function runs when your command is executed.
    // remove the _prefix if you want to use these parameters.
    // args is list consisting all arguments user has given. The length of the list will be >= argCount[0] and <= argCount[1]
    // tm is the global TaskManager object which can be used to interact with things outside your program.
    ////// YOUR LOGIC /////



    return {exitCode: 0, output: []}
    // allways return Result object.
    // exitStatus: number, 0 success and anything else is considered failure.
    // output: Txt[],
    //     where Txt type = { s: string, c?: textColor }
    //         where optional param c is textColor = "default" | "error" | "highlight"
    // Add multiple Txt's to change output color on the fly.
    // Split lines with \n as newline.
  }
}
// Look at other files in this dir for examples.

// ############ REMEMBER TO ADD YOUR COMMAND TO ../availableCommands.tsx