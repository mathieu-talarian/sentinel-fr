import type { JSX } from "solid-js";

import { Dialog } from "@ark-ui/solid";
import * as stylex from "@stylexjs/stylex";

import { Icon } from "~/components/atoms/Icons";
import { sx } from "~/lib/styles/sx";
import {
  borders,
  colors,
  fonts,
  radii,
  shadows,
} from "~/lib/styles/tokens.stylex";

interface TweaksDialogShellPropsT {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  children: JSX.Element;
}

export function TweaksDialogShell(props: Readonly<TweaksDialogShellPropsT>) {
  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={(d) => {
        props.onOpenChange(d.open);
      }}
      modal
      lazyMount
      unmountOnExit
    >
      <Dialog.Backdrop {...sx(s.backdrop)} />
      <Dialog.Positioner {...sx(s.positioner)}>
        <Dialog.Content {...sx(s.content)}>
          <div {...sx(s.head)}>
            <Dialog.Title {...sx(s.title)}>{props.title}</Dialog.Title>
            <Dialog.CloseTrigger {...sx(s.close)} aria-label="Close tweaks">
              <Icon.X />
            </Dialog.CloseTrigger>
          </div>
          <div {...sx(s.body)}>{props.children}</div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

const s = stylex.create({
  backdrop: {
    background: "oklch(0 0 0 / 0.36)",
    inset: 0,
    backdropFilter: "blur(2px)",
    position: "fixed",
    zIndex: 1000,
  },
  positioner: {
    inset: 0,
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
    position: "fixed",
    zIndex: 1001,
  },
  content: {
    background: colors.paper,
    borderColor: colors.lineStrong,
    borderRadius: radii.lg,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    overflow: "hidden",
    boxShadow: shadows.lg,
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto",
    maxHeight: "calc(100vh - 32px)",
    width: "min(420px, calc(100vw - 32px))",
  },
  head: {
    padding: "0 14px 0 18px",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    borderBottomColor: colors.line,
    borderBottomStyle: borders.solid,
    borderBottomWidth: borders.thin,
    height: 48,
  },
  title: {
    margin: 0,
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 16,
    fontWeight: 600,
  },
  close: {
    background: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    borderRadius: radii.sm,
    borderStyle: "none",
    borderWidth: 0,
    placeItems: "center",
    color: {
      default: colors.ink3,
      ":hover": colors.ink,
    },
    cursor: "pointer",
    display: "grid",
    height: 28,
    marginLeft: "auto",
    width: 28,
  },
  body: {
    padding: "14px 18px 20px",
    gap: 18,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
});
