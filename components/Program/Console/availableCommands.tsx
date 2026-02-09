
// ### IMPORT YOUR COMMAND HERE ###
import {helpCommand} from "@/components/Program/Console/Commands/help";
import {helloCommand} from "@/components/Program/Console/Commands/hello";
import {discoCommand} from "@/components/Program/Console/Commands/disco";
import {timeCommand} from "@/components/Program/Console/Commands/time";
import {shutdownCommand} from "@/components/Program/Console/Commands/shutdown";
import {csCommand} from "@/components/Program/Console/Commands/cs";
import {challengeCommand} from "@/components/Program/Console/Commands/challenge/challenge";
import {retroCommand} from "@/components/Program/Console/Commands/retro";

//import {TemplateCommand} from "@/components/Program/Console/Commands/TEMPLATE";

const alias:{[key: string]: Command} = {
  pesti: {...challengeCommand, unlisted: true}
}

// ### ADD YOUR COMMAND HERE ###
export const commands:{[key: string]: Command} = {
  help: helpCommand,
  hello: helloCommand,
  disco: discoCommand,
  time: timeCommand,
  cs: csCommand,
  shutdown: shutdownCommand,
  pesti: alias.pesti,
  challenge:challengeCommand,
  retro: retroCommand

  //template: TemplateCommand,
}


// Command type. no need to touch.
export type Command = {
  argCount: [number, number]
  help?: string
  description?: string
  unlisted?: boolean
  run: CallableFunction
  continue: CallableFunction
  defaultState?: any
}
