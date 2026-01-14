import {Result, Txt} from "@/components/Program/Console/commandHandler";
import {Command} from "@/components/Program/Console/availableCommands";
import {ConsoleContext, Status} from "@/components/Program/Console";
import {doCheck} from "@/components/Program/Console/Commands/pesti/pestiprogresslogger";


export const pestiCommand:Command = {
  argCount: [0, 2],
  help: "Pesti-Challenge 2026",
  description: "Pesti-Challenge journey",
  unlisted: true,
  defaultState: {state: ""},
  run: async (command: string, args: string[], context:ConsoleContext):Promise<Result> => {
    const progress = getProgress()
    const taskCount = pestiChallengeOrder.length
    if (args.length == 0) {
      const user = getUsername()
      if (!user) {
        context.state["pesti"].state = "register"
        context.setState({...context.state})
        return {
          status: Status.WAITINPUT, output: [
            {s: "Welcome to az.sh Pesti-Challenge journey!\n\n"},
            {s: `The journey includes ${taskCount-1} short challenges and a bit longer bonus task. `},
            {s: "If you complete all of the short challenges during the Pesti event you will be rewarded with a small prize!\n"},
            {s: "\nPlease give nickname:"}
          ]
        }
      }
      return { exitCode: 0, output: [
          {s: "Welcome to az.sh Pesti-Challenge journey!\n\n"},
          {s: progress < pestiChallengeOrder.length ? "Your current challenge:\n\n" : ""},
          ...(progress < taskCount ? pestiChallengeOrder[progress].question as Txt[] : [{s: "You have completed all of the Pesti challenges!\n"}]),
          {s: "\nMore info about the Pesti challenge with command "},
          {s: "pesti --help", onClick: {a: "command", t: "pesti --help"}},
        ]
      }
    } else {
      switch (args[0]) {
        case "--help":
        case "-h":
          return { exitCode: 0, output: [
              {s: `az.sh Pesti Challenge journey includes ${taskCount-1} short challenges and an optional bonus task.\n`},
              {s: "If you complete all of the short challenges during the Pesti event you will be rewarded with a small prize!\n\n"},
              {s: "Meet az.sh at University of Oulu’s Linnanmaa campus from 9 to 15. Stand 111 is located at Agora near the main entrance at door 2T.\n"},
              {s: "\nChallenge status:  "},
              {s: "pesti --status", onClick: {a: "command", t: "pesti --status"}},
              {s: "\nValidate answer:   "},
              {s: "pesti --check <ANSWER>", onClick: {a: "command", t: "pesti --check <ANSWER>"}},
              {s: "\nRename user:       "},
              {s: "pesti --rename", onClick: {a: "command", t: "pesti --rename"}},
              {s: "\nReset progress:    "},
              {s: "pesti --reset", onClick: {a: "command", t: "pesti --reset"}},
              {s: "\n"}
            ]
          }
        case "--status":
        case "-s":
          const nameOfChallenge = (c:number, p:number, bonus:boolean=false) =>{
            const line = [{s: `\n${bonus ? "Bonus!" : String(c) + "."} `, c:"highlight"}, {s: `${p >= c ? pestiChallengeOrder[c].name : "?????"}`}]
            if (p == c){
              line.push({s: " <- ", c: "error"})
              line.push({s: "You are here", c: "highlight"})
            }
            return line as Txt[]
          }

          return { exitCode: 0, output: [
              {s: `You have completed ${progress} out of ${taskCount-1} challenges!`},
              ...nameOfChallenge(0, progress),
              ...nameOfChallenge(1, progress),
              ...nameOfChallenge(2, progress),
              ...nameOfChallenge(3, progress),
              ...nameOfChallenge(4, progress),
              {s: "\n~ ", c: "highlight"},
              {s: "REWARD", c: "error"},
              {s: " ~", c: "highlight"},
              ...nameOfChallenge(5, progress, true),
            ]
          }
        case "--check":
        case "-c":
          if (args.length < 2) {
            return { exitCode: 1, output: [{s: "Please provide your answer to be checked!", c: "error"}]}
          }
          doCheck(pestiChallengeOrder[progress].id, args[1]).then(check => {
            setTimeout(() => {
              if (check.error) {
                context.printLine([{s: "Network error! Please try again", c: "error"}])
                context.setCommandStatus({t: Date.now(), status: Status.EXITED, exitCode: 1, command: command})
              } else if (check.ok) {
                context.printLine([{s: "Correct!", c: "highlight"}])
                if (pestiChallengeOrder[progress].after.length > 0) context.printLine(pestiChallengeOrder[progress].after as Txt[])
                setTimeout(() => {
                  if (progress == taskCount - 2) {
                    context.printLine([{s: "\nYou have completed all short quests! Go to az.sh pesti stand for your reward!"}])
                  }
                  if (progress == taskCount - 1) {
                    context.printLine([{s: "\nYou have completed all quests! WOW! good job!"}])
                  } else {
                    context.printLine([{s: "\nNext task:\n"}])
                    setTimeout(() => {
                      context.printLine((pestiChallengeOrder[progress + 1].question as Txt[]))
                    }, 500)
                  }
                }, 500)
                setProgress(progress + 1)
                context.setState({...context.state})
                context.setCommandStatus({t: Date.now(), status: Status.EXITED, exitCode: 0, command: command})
              } else {
                context.printLine([{s: "Wrong answer! Please try again", c: "error"}])
                context.setCommandStatus({t: Date.now(), status: Status.EXITED, exitCode: 1, command: command})
              }
            }, 1000 + Math.random() * 4000)
          })
          return {status: Status.PENDING, output: [{s: "Checking..."}]}
        case "--rename":
        case "-r":
          context.state["pesti"].state = "rename"
          context.setState({...context.state})
          return {status: Status.WAITINPUT, output: [{s: "Please give nickname:"}]}
        case "--reset":
          context.state["pesti"].state = "reset"
          context.setState({...context.state})
          return {status: Status.WAITINPUT, output: [{s: "Are you sure you want to reset progress? (y/N)"}]}
        default:
          if (args.length < 2) {
            return { exitCode: 1, output: [
              {s: "Error: Unknown arguments!", c: "error"},
                {s: "\nUse "},
                {s: "pesti --help ", onClick: {a: "command", t: "pesti --help"}},
                {s: "for usage help."},
              ]}
          }

      }
    }
    return {exitCode: 0, output: []}

  },
  continue: async (_command: string, input:string[], context:ConsoleContext):Promise<Result> => {
    const state = context.state["pesti"].state
    switch (state){
      case "rename":
      case "register":
        const username = input.join(" ")
        setUsername(username)
        context.state["pesti"].state = ""
        context.setState({...context.state})
        if (state == "register") {
          return {exitCode: 0, output: [{s: `Hello ${username}!\n\n`}, ...(pestiChallengeOrder[0].question as Txt[])]}
        } else {
          return {exitCode: 0, output: [{s: `Your name is now ${username}!`}]}
        }
      case "reset":
        const v = input.join(" ").toLowerCase()
        context.state["pesti"].state = ""
        context.setState({...context.state})
        if (["yes", "y"].includes(v)){
          setProgress(0)
          localStorage.removeItem("username")
          return {exitCode: 0, output: [{s: 'Your pesti challenge progress has been deleted', c:"error"}]}
        }
        return {exitCode: 0, output: [{s: 'Ok!'}]}
      default:
        return {exitCode: 0, output: []}
    }
  }

}

const jargon = [
  "37RH8JK7ZV2TGOD9ZCEOSMMD1OJJW40M",
  "53O0JJPXBIHWCRFKHKS2Z1YCPB130TSP",
  "1KG6LVPX2RDE9OAISEZYSAD8KH1RCZYZ",
  "86QBZ3EGND4W8PWV2WBTJUPHQ1OYG2X9",
  "SJ30CPIYFIZUNY9AR7S8SZBEAU6FYPRS",
  "4L0EGEW36SJ4Q3TROOUGH8H2H4TL1S1P",
  "IFPCKXFJFRUJRNHDSMY2S9S3UFXHMTYV",
  "RTCWYNP82579TI9F3ODBSN3HOON52HMB",
  "HSG3WVD1DO3X61BG6VBNSFTNUBTVK28H",
  "TUYARNEMWWI1G0ZKLY5QJY3UO2LIKQZ6"
]

export const getProgress = () => {
  const p = localStorage.getItem("progress")
  if (p) {
    const pr = jargon.indexOf(p)
    if (pr >= 0) return pr
  }
  return 0
}
const setProgress = (n:number) => {
  localStorage.setItem("progress", jargon[n])
}


export const getUsername = () => {
  return localStorage.getItem("username")
}
const setUsername = (s:string) => {
  localStorage.setItem("username", s)
}

const pestiChallenges = {
  cesar: {
    question: [
      {s: "Strange statue\n\n", c: "error"},
      {s: "On your Pesti journey you see an interesting statue.\n\n"},
      {s: "file: "},
      {s: "[our_computer/images/statue.png]", onClick: {a: "file", t: "images/statue.png"}},
      {s: "\n\nIt seems that someone has written strange message to the base of the statue, it reads:\n\n"},
      {s: "> Tox Vtxltk\n", c: "highlight"},
      {s: "> Max gxqm vhfftgw bl uknmnl\n", c: "highlight"},
      {s: "> Mabl pbee teehp rhn mh ikhvxxw mh max gxqm mtld\n\n", c: "highlight"},
      {s: "Decrypt the message to continue your journey.\nThe statue guy might have something to do with this nonsense..\n"},
    ],
    after: [
      {s: "Yes. Of course."}
    ],
    name: "Statue strings",
    id: "scroll",
  },
  chain: {
    question: [
      {s: "chain: ", c: "highlight"},
      {s: "42161\n", c: "error" },
      {s: "token: ", c: "highlight"},
      {s: "0x259207d12b8991Cfb9F222BD31e87c8b53a81FDF\n", c: "error"}
    ],
    after: [
      {s: "Chains go brrr..."}
    ],
    name: "Chain action",
    id: "onchain",
  },
  json: {
    question: [
      {s: "Kurre bought a car.\n\n", c: "error"},
      {s: "Kumikurre bought a car and now he wants to paint his house. But there is a major problem! Kumikurre can't remember "},
      {s: "the color of his new car", c: "highlight"},
      {s: " and it must match with the house!\n\n"},
      {s: "Luckily Kumikurre ain't no stupid squirrel so he hacked the car auction site and downloaded the data to this computer!\n\n"},
      {s: "Help Kumikurre and parse the data to find out the color of his new car!\n\n"},
      {s: "files: "},
      {s: "[our_computer/auction_data/auctions.json]", onClick: {a: "file", t: "auction_data/auctions.json"}},
      {s: "\n       "},
      {s: "[our_computer/auction_data/bids.json]", onClick: {a: "file", t: "auction_data/bids.json"}},
      {s: "\n       "},
      {s: "[our_computer/auction_data/users.json]", onClick: {a: "file", t: "auction_data/users.json"}},
      {s: "\n       "},
      {s: "[our_computer/auction_data/vehicles.json]", onClick: {a: "file", t: "auction_data/vehicles.json"}},
      {s: "\n"},
    ],
    after: [
      {s: "Yes!!! that must be it! Now Kurre can finally paint his house!"}
    ],
    name: "Gotta paint the house",
    id: "car",
  },
  python: {
    question: [
      {s: "Oh no! Code stuck!\n\n", c: "error"},
      {s: "Sakke has saved some important information into a Python file, but slotti must have messed with his files as the code doesn't work.\n\n"},
      {s: "file: "},
      {s: "[our_computer/code_projects/important.py]", onClick: {a: "file", t: "code_projects/important.py"}},
      {s: "\n\n"},
      {s: "Please help Sakke by fixing the code and return the forgotten important information.\n"},
      {s: "When you have found the info, check it with command "},
      {s: "pesti --check <ANSWER>", onClick: {a: "command", t: "pesti --check <ANSWER>"}},
      {s: "\n"}
    ],
    after: [
      {s: "Oh! This must be the az.sh business ID.\nIt is very important indeed...\n\nAnd you totally can't find it from our Contact Information..."}
    ],
    name: "Code stuck",
    id: "python",
  },
  bonus: {
    question: [
      {s: "BONUS TASK!\n\n", c:"error"},
      {s: "OS upgrade!\n\n", c:"error"},
      {s: "You have completed all the small tasks but there can always be more!\n\n"},
      {s: "Clone the azshoyos repo from "},
      {s: "https://github.com/azshoy/azshoyos", onClick: {a: "link", t: "https://github.com/azshoy/azshoyos"}},
      {s: " and implement your own feature to the system!\nAnything is possible.\n\n"},
      {s: "Finish the quest by making a pull request to the repo and you won't be forgotten!\n"},
    ],
    after: [],
    name: "OS upgrade",
    id: "bonus",
  }
}

const pestiChallengeOrder = [pestiChallenges.python, pestiChallenges.cesar, pestiChallenges.chain, pestiChallenges.json, pestiChallenges.bonus]
