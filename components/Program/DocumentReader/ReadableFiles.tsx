import {CSSProperties, ReactNode} from "react";
import auctionsJSON from './downloads/auctions.json';
import bidsJSON from './downloads/bids.json';
import usersJSON from './downloads/users.json';
import vehiclesJSON from './downloads/vehicles.json';
import styles from './document.module.css'

export type Readable = {
  type: "ReactNode"
  content: ReactNode
} | {
  type: "json"
  content: string
} | {
  type: "python"
  content: string
} | {
  type: "image"
  content: ContentImage
}
export type ContentImage = {
  src: string,
  alt?: string
}

export const readableFiles:{[key:string]: Readable} = {
  CANTREAD: {type: "ReactNode", content: <div>Can't read file</div>},
  readme: {
    type: "ReactNode",
    content: (
      <div>
        <h2>## az.sh oy</h2>
        <br/>
        <h3># TL;DR:</h3>
        DAO:n johto ja web2/3 ohjelmointiprojektit lohkottuina kokonaisuuksina.
        <br/>
        <br/>
        Yrityksen yhteystiedot löydät Contact Information pikakuvakkeen takaa.<br/>
      </div>
    )
  },
  contact: {
    type: "ReactNode",
    content: (
      <div>
        <h2>## az.sh oy</h2>
        <br/>
        <h3># Yhteystiedot</h3>
        <br/>
        Y-tunnus:<br/>
        3474773-5<br/>
        <br/>
        Sähköposti:<br/>
        info@azsh.fi<br/>
        Puhelin:<br/>
        050 432 4719<br/>
        <br/>
        Postiosoite:<br/>
        az.sh oy<br/>
        Isokatu 56<br/>
        90100 Oulu<br/>
      </div>
    )
  },
  pestiInfo: {
    type: "ReactNode",
    content: (
      <div>
        <h2>## Pesti Career Day 2026-1-15</h2>
        <br/>
        Meet az.sh at University of Oulu’s Linnanmaa campus from 9 to 15. <br/>The stand number 111 is located at Agora near the main entrance at door 2T.
        <br/>
        <br/>
        <a href={"https://pestipaivat.fi/"} target={"_blank"} className={styles.link}>pestipaivat.fi <img src={"/icons/zplorer.svg"} alt={""} className={styles.noSpaceIcon}/>&nbsp;&nbsp;&nbsp;&nbsp; ↪</a>
        <br/>
        <br/>
        <h3># az.sh Pesti Challenge 2026</h3>
        <br/>
        az.sh Pesti Challenge consists of a few short challenges and an optional bonus task.
        <br/>
        If you complete all of the short challenges during the Pesti event you will be rewarded with a small prize!
        <br/>
        <br/>
        Begin the challenge by opening the <span className={styles.blue}>az.sh</span> <img src={"/icons/console.svg"} alt={""} className={styles.inlineIcon}/> console from the desktop and run command <div className={styles.codeBlock}>pesti</div>.
      </div>
    )
  },
  statue: {
    type: "image",
    content: {src: "/misc/statue.png", alt: "picture of a statue"}
  },
  pestiAuctionsJSON: {
    type: "json",
    content: JSON.stringify(auctionsJSON, undefined,2)
  },
  pestiBidsJSON: {
    type: "json",
    content: JSON.stringify(bidsJSON, undefined,2)
  },
  pestiUsersJSON: {
    type: "json",
    content: JSON.stringify(usersJSON, undefined,2)
  },
  pestiVehiclesJSON: {
    type: "json",
    content: JSON.stringify(vehiclesJSON, undefined,2)
  },
  pestiPython: {
    type: "python",
    content: (
      "#!/usr/bin/env python3\n" +
      "\n" +
      "lizard = \"\"\"\n" +
      "         what a nice lizardo\n" +
      "                       }/_                                          ____()()\n" +
      "             _.--..-`\"-,--c_                                      /      @@             Andd a mouse. Hope nothing bad will happen to it :d\n" +
      "        \\\\L..'           ._O__)_                           ``~~~~~\\\\_;m__m._>o\n" +
      ",-.     _.+  _  \\\\..--( /                                                                            ())(()\n" +
      "  `\\\\.-''__.-' \\\\ (     \\\\_                                                                          öäöäö       \n" +
      "    `'''       `\\\\__   /  `                                                                      \n" +
      "                ')                                       \n" +
      "         oh no it might get eaten  ---ä\\n\"\"\"\n" +
      "\n" +
      "\n" +
      "def calculate_secret_from_lizardo(lizardo):\n" +
      "    lines = lizardo.strip().splitlines()\n" +
      "    digits = []\n" +
      "    for idx, line in enumerate(lines):\n" +
      "        if idx == 2:\n" +
      "            while True:\n" +
      "                pass\n" +
      "        digits.append(_calculate_digit_from_lizardo_line(line))\n" +
      "    return \"\".join(str(digit) for digit in digits)\n" +
      "\n" +
      "def _calculate_digit_from_lizardo_line(line):\n" +
      "    val = sum(1 for char in line if char in \")(@Hhoöäpd`)\") % 10\n" +
      "    if val == 1:\n" +
      "        return \"-\"\n" +
      "    return val\n" +
      "\n" +
      "if __name__ == \"__main__\":\n" +
      "    output = calculate_secret_from_lizardo(lizard)\n" +
      "    print(f\"The output: {output}\")"
    )
  }
}