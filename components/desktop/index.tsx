import {Directory} from "@/components/Directory/Directory";
import {quickPaths} from "@/components/ProgramData/programs";




export const Desktop = () => {
  return (
    <div style={{position: "absolute", width: "100%", height: "100%", paddingBottom: "var(--bar-height)"}}>
      <Directory path={quickPaths.desktop} allowFreePosition/>
    </div>
  );
}

