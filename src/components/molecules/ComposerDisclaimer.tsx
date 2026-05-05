import * as stylex from "@stylexjs/stylex";

import { Disclaimer } from "@/components/atoms/Disclaimer";
import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

export function ComposerDisclaimer() {
  return (
    <Disclaimer>
      Sentinel surfaces best-effort classifications
      <span {...sx(s.dot)}>·</span>
      Always confirm with your customs broker before entry
      <span {...sx(s.dot)}>·</span>
      Section 301/232 not modelled
    </Disclaimer>
  );
}

const s = stylex.create({
  dot: { margin: "0 6px", color: colors.ink5 },
});
