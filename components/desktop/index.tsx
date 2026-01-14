import {Directory} from "@/components/Directory/Directory";
import {quickPaths} from "@/components/ProgramData/programs";




export const Desktop = () => {
  return (
    <div style={{position: "absolute", top: "5px", left: "8px", right: "8px", bottom: "calc(var(--bar-height) + 5px)"}}>
      <Directory path={quickPaths.desktop} allowFreePosition/>
    </div>
  );
}

