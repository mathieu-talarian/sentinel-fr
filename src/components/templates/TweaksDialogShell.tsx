import type { ReactNode } from "react";

import * as stylex from "@stylexjs/stylex";
import { Dialog } from "radix-ui";

import { Icon } from "@/components/atoms/Icons";
import { sx } from "@/lib/styles/sx";
import {
  borders,
  colors,
  fonts,
  radii,
  shadows,
} from "@/lib/styles/tokens.stylex";

interface TweaksDialogShellPropsT {
  open: boolean;
  title: string;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function TweaksDialogShell(props: Readonly<TweaksDialogShellPropsT>) {
  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay {...sx(s.backdrop)} />
        <Dialog.Content {...sx(s.content)}>
          <div {...sx(s.head)}>
            <Dialog.Title {...sx(s.title)}>{props.title}</Dialog.Title>
            <Dialog.Close {...sx(s.close)} aria-label="Close tweaks">
              <Icon.X />
            </Dialog.Close>
          </div>
          <div {...sx(s.body)}>{props.children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const s = stylex.create({
  backdrop: {
    inset: 0,
    backdropFilter: "blur(2px)",
    backgroundColor: "oklch(0 0 0 / 0.36)",
    position: "fixed",
    zIndex: 1000,
  },
  content: {
    borderColor: colors.lineStrong,
    borderRadius: radii.lg,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    overflow: "hidden",
    // Radix Dialog.Content has no built-in positioning — centre it explicitly
    // so the dialog sits in the viewport regardless of scroll.
    backgroundColor: colors.paper,
    boxShadow: shadows.lg,
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    transform: "translate(-50%, -50%)",
    zIndex: 1001,
    left: "50%",
    maxHeight: "calc(100vh - 32px)",
    top: "50%",
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
    borderRadius: radii.sm,
    borderStyle: "none",
    borderWidth: 0,
    placeItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.paper3,
    },
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
