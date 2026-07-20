import {azColorBase, v2} from "@/util/types";
import {CSSProperties} from "react";

export const cls = (...classes: (undefined | string)[]) => {
  return classes.filter((c) => typeof c !== "undefined").join(" ")
}

export const cssD = (key: string, variable: string | undefined, d?: string) => {
  return (variable ? {[key]: variable} : d ? {[key]: d} : {}) as CSSProperties
}
export const cssV = (key: keyof CSSProperties, variable: string | undefined, d?: string) => {
  return (variable ? {[key]: `var(--${variable})`} : d ? {[key]: `var(--${d})`} : {}) as CSSProperties
}
export const cssVV = (key: string, variable: string | undefined, d?: string) => {
  return (variable ? {[`--${key}`]: `var(--${variable})`} : d ? {[`--${key}`]: `var(--${d})`} : {}) as CSSProperties
}
export const cssVVs = (...args:([string, string | undefined] | [string, string | undefined, string])[]) => {
  return args.map((a) => cssVV(a[0], a[1], a[2])).reduce((a, b) => ({...a, ...b} as CSSProperties))
}
export const colorVars = (key: string, color:azColorBase, capitalized=true) => {
  return cssVVs(...(['-light', '', '-semidark', '-dark', '-megadark', '-ultradark'].map((cv) => ([key + (capitalized ? capitalize(cv.replace("-", "")) : cv), color+cv] as [string, string]))))
}
export const capitalize = (s:string, byWord=false):string => {
  if (byWord) return (s.split(" ").map((w) => capitalize(w))).join(" ")
  return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase()
}

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