import type { JSX } from "solid-js";

import { IconButton } from "~/components/atoms/IconButton";

interface ComposerToolButtonPropsT {
  title: string;
  children: JSX.Element;
  onClick?: () => void;
}

export function ComposerToolButton(props: Readonly<ComposerToolButtonPropsT>) {
  return (
    <IconButton
      size="lg"
      variant="ghost-subtle"
      title={props.title}
      onClick={props.onClick}
    >
      {props.children}
    </IconButton>
  );
}
