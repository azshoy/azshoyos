import {v2} from "@/util/types";
import {useContext} from "react";
import {TaskManagerContext} from "@/components/OS/TaskManager";
import {ProgramAction, ProgramConstructor, ProgramType} from "@/components/Program/Program";


export const quickPaths = {
  root: [],
  images: ['images'],
  desktop: ['desktop'],
  trash: ['trash'],
  data: ['ourComputer'],
  devNull: ['dev', 'null']
}
const useTrashIcon = () => {
  const {shortcuts} = useContext(TaskManagerContext)
  if (shortcuts.findIndex((s) => s.path.join("/") == quickPaths.trash.join("/")) == -1){
    return "/icons/trash_empty.svg"
  }
  return "/icons/trash_full.svg"
}
const onOurComputerMoved = (path:string[]) => {
  if (path[path.length-1] == "trash"){
    return ProgramAction.SHUTDOWNNOW
  }
  return ProgramAction.DEFAULT
}

const randomPages = [
  "https://wiki.archlinux.org/",
]
const openRandomPage = () => {
  const page = randomPages[Math.floor(Math.random() * (randomPages.length))]
  if (window && page) window.open(page)
}

export const programData:{[key: string]: ProgramConstructor} = {
  trash: {
    title: "Trash",
    description: "Last stop before dev/null",
    type: ProgramType.FILE_EXPLORER,
    path: quickPaths.trash,
    shortcut: {
      icon: useTrashIcon,
      position: {x: 1, y: 1},
      onMoveDir: (_p: string[]) => ProgramAction.NONE,
      showInStartMenu: true,
    }
  },
  computer: {
    title: "Our Computer",
    description: "This does the thing",
    type: ProgramType.FILE_EXPLORER,
    path: quickPaths.root,
    shortcut: {
      icon: "/icons/computer.svg",
      position: {x: 0, y: 0},
      onMoveDir: onOurComputerMoved,
      showInStartMenu: true,
    }
  },
  imagesDir: {
    title: "Images",
    description: "A folder",
    type: ProgramType.FILE_EXPLORER,
    path: quickPaths.images,
    shortcut: {
      icon: "/icons/dir_blue.svg",
      position: {x: 0, y: 0},
      path: quickPaths.root
    }
  },
  pestiStatue: {
    title: "statue.png",
    filename: "statue.png",
    description: "Strange statue",
    type: ProgramType.DOCUMENT_READER,
    file: "statue",
    shortcut: {
      icon: "/icons/image.svg",
      path: ["images"],
      position: {x: 0, y: 0},
    }
  },
  codeDir: {
    title: "Code Projects",
    description: "A folder",
    type: ProgramType.FILE_EXPLORER,
    path: ["code_projects"],
    shortcut: {
      icon: "/icons/dir_green.svg",
      position: {x: 0.1, y: 0},
      path: quickPaths.root
    }
  },
  pestiPython: {
    title: "important.py",
    filename: "important.py",
    description: "a bit broken code snippet",
    type: ProgramType.DOCUMENT_READER,
    file: "pestiPython",
    downloadable: true,
    shortcut: {
      icon: "/icons/python.svg",
      position: {x: 0, y: 0},
      path: ["code_projects"],
    }
  },
  dataDir: {
    title: "Auction Data",
    description: "A folder",
    type: ProgramType.FILE_EXPLORER,
    path: ["auction_data"],
    shortcut: {
      icon: "/icons/dir_yellow.svg",
      position: {x: 0.2, y: 0},
      path: quickPaths.root
    }
  },
  pestiAuctionsJSON: {
    title: "auctions.json",
    filename: "auctions.json",
    description: "json data",
    type: ProgramType.DOCUMENT_READER,
    file: "pestiAuctionsJSON",
    downloadable: true,
    shortcut: {
      icon: "/icons/json.svg",
      position: {x: 0, y: 0},
      path: ["auction_data"]
    }
  },
  pestiBidsJSON: {
    title: "bids.json",
    filename: "bids.json",
    description: "json data",
    type: ProgramType.DOCUMENT_READER,
    file: "pestiBidsJSON",
    downloadable: true,
    shortcut: {
      icon: "/icons/json.svg",
      position: {x: 0, y: 0},
      path: ["auction_data"]
    }
  },
  pestiUsersJSON: {
    title: "users.json",
    filename: "users.json",
    description: "json data",
    type: ProgramType.DOCUMENT_READER,
    file: "pestiUsersJSON",
    downloadable: true,
    shortcut: {
      icon: "/icons/json.svg",
      position: {x: 0, y: 0},
      path: ["auction_data"]
    }
  },
  pestiVehiclesJSON: {
    title: "vehicles.json",
    filename: "vehicles.json",
    description: "json data",
    type: ProgramType.DOCUMENT_READER,
    file: "pestiVehiclesJSON",
    downloadable: true,
    shortcut: {
      icon: "/icons/json.svg",
      position: {x: 0, y: 0},
      path: ["auction_data"]
    }
  },
  shell: {
    title: "az.sh",
    description: "The Best Shell",
    type: ProgramType.SHELL_CONSOLE,
    shortcut: {
      icon: "/icons/console.svg",
      position: {x: 0, y: 0.1},
      showInStartMenu: true,
    }
  },
  contactInformation: {
    title: "Contact information",
    filename: "contact.md",
    description: "",
    type: ProgramType.DOCUMENT_READER,
    file: "contact",
    shortcut: {
      icon: "/icons/contact.svg",
      position: {x: 0.3, y: 0.8},
      showInStartMenu: true,
    }
  },
  readMe: {
    title: "Readme.md",
    filename: "readme.md",
    description: "",
    type: ProgramType.DOCUMENT_READER,
    file: "readme",
    shortcut: {
      icon: "/icons/document.svg",
      position: {x: 0.6, y: 0.4},
      showInStartMenu: true,
    }
  },
  browser: {
    title: "Interweb zplorer",
    description: "Very Fast yes",
    type: ProgramType.RUNNABLE_SCRIPT,
    func: openRandomPage,
    shortcut: {
      icon: "/icons/zplorer.svg",
      position: {x: 0.4, y: 0.2},
      showInStartMenu: true,
    }
  }
}
