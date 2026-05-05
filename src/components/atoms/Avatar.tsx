import type { StyleXStyles } from "@stylexjs/stylex";
import type { ComponentProps } from "react";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

export type AvatarToneT = "gold" | "ink";

interface AvatarPropsT extends Omit<ComponentProps<"div">, "style"> {
  style?: StyleXStyles;
  initial: string;
  size?: number;
  tone?: AvatarToneT;
}

export function Avatar(props: Readonly<AvatarPropsT>) {
  const { initial, size, tone, style, ...rest } = props;

  return (
    <div
      {...rest}
      {...sx(s.avatar, TONES[tone ?? "gold"], s.sized(size ?? 28), style)}
    >
      {initial}
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
