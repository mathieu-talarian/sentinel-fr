import type { ReactNode } from "react";

import { IconButton } from "@/components/atoms/IconButton";

interface ComposerToolButtonPropsT {
  title: string;
  children: ReactNode;
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
