import {ReactNode} from "react";
import auctionsJSON from './downloads/auctions.json';
import bidsJSON from './downloads/bids.json';
import usersJSON from './downloads/users.json';
import vehiclesJSON from './downloads/vehicles.json';

export type Readable = {
  type: "ReactNode"
  content: ReactNode
} | {
  type: "json"
  content: string
} | {
  type: "python"
  content: string
}

export const readableFiles:{[key:string]: Readable} = {
  CANTREAD: {type: "ReactNode", content: <div>Can't read file</div>},
  readme: {
    type: "ReactNode",
    content: (
      <div>
        # az.sh oy <br/>
        <br/>
        ## TL;DR:<br/>
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
        # az.sh oy <br/>
        <br/>
        ## Yhteystiedot <br/>
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
  statue: {
    type: "ReactNode",
    content: (
      <div style={{inset: "0px", position: "absolute", background: "#13261c", display: 'flex', flexDirection: "column", justifyContent: "center", alignItems: "center"}}>
        <img src={"/misc/statue.png"} alt={""} style={{margin: "auto", maxHeight: "100%", maxWidth: "100%", objectFit: "contain"}}/>
      </div>
    )
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