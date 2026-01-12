
import {ReactNode} from "react";
import {FileExplorer, FileExplorerProps} from "@/components/Program/FileExplorer";
import {DocumentReader, DocumentReaderProps} from "@/components/Program/DocumentReader";
import {Shortcut} from "@/components/Shortcut/Shortcut";
import {ShellConsole, ShellConsoleProps} from "@/components/Program/Console";
import {v2} from "@/util/types";
import {quickPaths} from "@/components/ProgramData/programs";

export enum ProgramType {
  UNDEFINED,
  FILE_EXPLORER,
  DOCUMENT_READER,
  SHELL_CONSOLE,
  RUNNABLE_SCRIPT
}

export type ShortcutData = {
  icon: string | (() => string),
  position: v2,
  path?: string[]
  showInStartMenu?: boolean,
  onMove?: (_p:v2) => void,
  onMoveDir?: (_p:string[]) => ProgramAction,
}

type ProgramBaseProps = {
  title: string
  description: string
  shortcut: ShortcutData
  identifier: string
}

export enum ProgramRunType {
  WINDOW,
  SCRIPT
}
export enum ProgramAction {
  DEFAULT,
  NONE,
  MOVE,
  LAUNCH,
  SHUTDOWN,
  SHUTDOWNNOW,
}

class ProgramBase {
  title: string
  description: string
  programType: ProgramType = ProgramType.UNDEFINED
  runType: ProgramRunType = ProgramRunType.WINDOW
  shortcut: ShortcutData
  identifier: string
  constructor(construct:ProgramBaseProps) {
    this.title = construct.title
    this.description = construct.description
    this.shortcut = construct.shortcut
    this.identifier = construct.identifier
  }
  runWith = (s:Shortcut) => {
    return ProgramAction.NONE
  }
  run = () => {
  }
  createShortcut = (index: number, to?: string[]) => {
    const path = to ?? this.shortcut.path ?? quickPaths.desktop
    return new Shortcut({
      index: index+1,
      programID: this.identifier,
      title: this.title,
      description: this.description,
      order: index,
      randomizePosition: path == quickPaths.desktop,
      ...this.shortcut,
      path: path,
    })
  }
  get icon() {
    if (typeof this.shortcut.icon == 'string') {
      return this.shortcut.icon
    } else {
      return this.shortcut.icon()
    }
  }
  get programWindow():ReactNode {
    return null
  }
}

export class FileExplorerProgramClass extends ProgramBase {
  programType: ProgramType = ProgramType.FILE_EXPLORER
  windowComponent = FileExplorer
  parameters: FileExplorerProps
  constructor(construct:ProgramBaseProps & FileExplorerProps) {
    super(construct)
    this.parameters = {
      path: construct.path
    }
  }
  runWith = (s:Shortcut)=> {
    if (this.parameters.path.join("/") != s.path.join("/")){
      s.position = {x: 1, y: 1}
      s.order = 9999
      s.path = [...this.parameters.path]
      return ProgramAction.MOVE
    }
    return ProgramAction.NONE
  }
  run = () => {
    return this.windowComponent(this.parameters)
  }
  get programWindow():ReactNode {
    return this.windowComponent(this.parameters)
  }
}
export class DocumentReaderProgramClass extends ProgramBase {
  programType: ProgramType = ProgramType.DOCUMENT_READER
  windowComponent = DocumentReader
  parameters: DocumentReaderProps
  constructor(construct:ProgramBaseProps & DocumentReaderProps) {
    super(construct)
    this.parameters = {
      file: construct.file
    }
  }
  run = () => {
    return this.windowComponent(this.parameters)
  }
  get programWindow():ReactNode {
    return this.windowComponent(this.parameters)
  }
}
export class ShellConsoleProgramClass extends ProgramBase {
  programType: ProgramType = ProgramType.SHELL_CONSOLE
  windowComponent = ShellConsole
  parameters: ShellConsoleProps
  constructor(construct:ShellConsoleProps & ProgramBaseProps) {
    super(construct)
    this.parameters = {
      path: construct.path
    }
  }
  run = () => {
    return this.windowComponent(this.parameters)
  }
  get programWindow():ReactNode {
    return this.windowComponent(this.parameters)
  }
}

type ScriptProgramProps = {
  func: CallableFunction
}
export class ScriptProgramClass extends ProgramBase {
  programType: ProgramType = ProgramType.RUNNABLE_SCRIPT
  runType = ProgramRunType.SCRIPT
  func: CallableFunction
  constructor(construct:ScriptProgramProps & ProgramBaseProps) {
    super(construct)
    this.func = construct.func
  }
  run = () => {
    return this.func()
  }
}

export type WindowedProgramClass = FileExplorerProgramClass | DocumentReaderProgramClass | ShellConsoleProgramClass
export type ProgramClass = WindowedProgramClass | ScriptProgramClass

type BaseWithoutID = Omit<ProgramBaseProps, 'identifier'>
export type ProgramConstructor =
  ({type: ProgramType.FILE_EXPLORER} & BaseWithoutID & FileExplorerProps) |
  ({type: ProgramType.DOCUMENT_READER} & BaseWithoutID & DocumentReaderProps) |
  ({type: ProgramType.SHELL_CONSOLE} & BaseWithoutID & ShellConsoleProps) |
  ({type: ProgramType.RUNNABLE_SCRIPT} & BaseWithoutID & ScriptProgramProps)

