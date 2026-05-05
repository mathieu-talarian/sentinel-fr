import type { ReactNode } from "react";

import * as stylex from "@stylexjs/stylex";

import { Card } from "@/components/atoms/Card";
import { Heading } from "@/components/atoms/Heading";
import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

interface LoginCardPropsT {
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}

export function LoginCard(props: Readonly<LoginCardPropsT>) {
  return (
    <Card elevation="md" padded gap="lg" width={380}>
      <div {...sx(s.head)}>
        <Heading level="h1" size="md" align="center">
          {props.title}
        </Heading>
        <p {...sx(s.sub)}>{props.subtitle}</p>
      </div>
      {props.children}
    </Card>
  );
}

const s = stylex.create({
  head: {
    gap: 4,
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
  },
  sub: { margin: 0, color: colors.ink3, fontSize: 13 },
});
