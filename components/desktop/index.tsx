import {Directory} from "@/components/Directory/Directory";
import {quickPaths} from "@/components/ProgramData/programs";




export const Desktop = () => {
  return (
    <div style={{position: "absolute", width: "100%", height: "100%", padding: "5px 8px calc(var(--bar-height) + 5px) 8px",}}>
      <Directory path={quickPaths.desktop} allowFreePosition/>
    </div>
  );
}

