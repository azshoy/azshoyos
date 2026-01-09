import {v2} from "@/util/types";

export const distanceTo = (a:v2, b:v2) => {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2))
}

export const removeFromArray = <T>(arr:T[], value:T | T[])=> {
  const values = Array.isArray(value) ? value : [value]
  values.forEach((v) => {
    const index = arr.indexOf(v);
    if (index > -1) {
      arr.splice(index, 1);
    }
  })
  return arr;
}

export const clampf = (value:number, min:number = 0, max:number = 1) => {
  return Math.min(max, Math.max(min, value))
}