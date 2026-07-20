import Head from "next/head";
import {MinimalContainer} from "@/util/componentTypes";


export type HeaderProps = {
  title: string,
  description: string
}

type HeaderComponentProps = {
  headerProps: Partial<HeaderProps>,
  layoutDefault?: Partial<HeaderProps>
} & Partial<MinimalContainer>

export const Header = ({headerProps, layoutDefault, children}:HeaderComponentProps)=> {
  const props = {title: "az.sh", description: "Welcome to az.sh", ...(layoutDefault ?? {}), ...headerProps}
  return (
      <Head>
        <title>{props.title}</title>
        <meta name="description" content={props.description}/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        {children}
      </Head>
  );
}
