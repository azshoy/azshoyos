
// ### IMPORT YOUR COMMAND HERE ###
import {helpCommand} from "@/components/Program/Console/Commands/help";
import {helloCommand} from "@/components/Program/Console/Commands/hello";
import {discoCommand} from "@/components/Program/Console/Commands/disco";
import {timeCommand} from "@/components/Program/Console/Commands/time";
import {shutdownCommand} from "@/components/Program/Console/Commands/shutdown";

//import {TemplateCommand} from "@/components/Program/Console/Commands/TEMPLATE";

// ### ADD YOUR COMMAND HERE ###
export const commands:{[key: string]: Command} = {
  help: helpCommand,
  hello: helloCommand,
  disco: discoCommand,
  time: timeCommand,
  shutdown: shutdownCommand,

  //template: TemplateCommand,
}

// Command type. no need to touch.
export type Command = {
  argCount: [number, number]
  help?: string
  description?: string
  unlisted?: boolean
  run: CallableFunction
}
