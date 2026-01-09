import {ReactNode} from "react";

export const readableFiles:{[key:string]: ReactNode} = {
  CANTREAD: (<div>Can't read file</div>),
  readme: (
    <div>
      # az.sh oy <br/>
      <br/>
      ## TL;DR:<br/>
      DAO:n johto ja web2/3 ohjelmointiprojektit lohkottuina kokonaisuuksina.
      <br/>
      <br/>
      Yrityksen yhteystiedot löydät Contact Information pikakuvakkeen takaa.<br/>
    </div>
  ),
  contact: (
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
}