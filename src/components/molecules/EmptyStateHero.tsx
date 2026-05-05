import * as stylex from "@stylexjs/stylex";

import { Eyebrow } from "@/components/atoms/Eyebrow";
import { Heading } from "@/components/atoms/Heading";
import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

export function EmptyStateHero() {
  return (
    <div {...sx(s.hero)}>
      <Eyebrow tone="accent" rule>
        FR → US · Customs Classification Agent
      </Eyebrow>
      <Heading level="h1" size="lg">
        What are you <em {...sx(s.em)}>shipping</em> today?
      </Heading>
      <p {...sx(s.sub)}>
        Describe your product in plain language. I'll search the HTS catalog,
        check prior CBP rulings, and give you the right 10-digit code with the
        all-in landed cost.
      </p>
    </div>
  );
}

const s = stylex.create({
  hero: {
    gap: 8,
    display: "flex",
    flexDirection: "column",
    marginBottom: 28,
  },
  em: { color: colors.goldDeep, fontStyle: "italic" },
  sub: {
    margin: 0,
    color: colors.ink3,
    fontSize: 14,
    maxWidth: 540,
  },
});
