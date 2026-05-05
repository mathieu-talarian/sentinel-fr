import type { StyleXStyles } from "@stylexjs/stylex";
import type { JSX } from "solid-js";

import * as stylex from "@stylexjs/stylex";
import { splitProps } from "solid-js";

import { sx } from "~/lib/styles/sx";
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
  const [own, rest] = splitProps(props, ["initial", "size", "tone", "style"]);

  return (
    <div
      {...rest}
      {...sx(
        s.avatar,
        TONES[own.tone ?? "gold"],
        s.sized(own.size ?? 28),
        own.style,
      )}
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
  sized: (size: number) => ({
    height: size,
    width: size,
  }),
});

const TONES = stylex.create({
  gold: { background: colors.goldSoft, color: colors.goldDeep },
  ink: { background: colors.ink, color: colors.paper },
});
