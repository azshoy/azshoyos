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
  images: {
    title: "Images",
    description: "A folder",
    type: ProgramType.FILE_EXPLORER,
    path: quickPaths.images,
    shortcut: {
      icon: "/icons/dir.svg",
      position: {x: 0.2, y: 0.9},
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
