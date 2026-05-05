import type { StyleXStyles } from "@stylexjs/stylex";
import type { JSX } from "solid-js";

import * as stylex from "@stylexjs/stylex";
import { splitProps } from "solid-js";

import { cn, sx } from "~/lib/styles/sx";
import { colors } from "~/lib/styles/tokens.stylex";

export type AvatarToneT = "gold" | "ink";

interface AvatarPropsT extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "style"
> {
  style?: StyleXStyles;
  initial: string;
  size?: number;
  tone?: AvatarToneT;
}

export function Avatar(props: Readonly<AvatarPropsT>) {
  const [own, rest] = splitProps(props, [
    "initial",
    "size",
    "tone",
    "style",
    "class",
  ]);

  const styled = () => sx(s.avatar, TONES[own.tone ?? "gold"], own.style);
  const size = () => own.size ?? 28;

  return (
    <div
      {...rest}
      class={cn(styled().class, own.class)}
      style={{
        height: `${String(size())}px`,
        width: `${String(size())}px`,
      }}
    >
      {own.initial}
    </div>
  );
}

const s = stylex.create({
  avatar: {
    borderRadius: "50%",
    placeItems: "center",
    display: "grid",
    fontSize: 12,
    fontWeight: 600,
  },
});

const TONES = stylex.create({
  gold: { background: colors.goldSoft, color: colors.goldDeep },
  ink: { background: colors.ink, color: colors.paper },
});
