import type { LangT } from "@/lib/utils/intl";

import * as stylex from "@stylexjs/stylex";


import { Icon } from "@/components/atoms/Icons";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";
import { formatInteger } from "@/lib/utils/intl";

interface CatalogStatsStripPropsT {
  htsCodesIndexed: number;
  crossRulingsSince: number;
  activeAlerts: number;
  lang: LangT;
}

export function CatalogStatsStrip(props: Readonly<CatalogStatsStripPropsT>) {
  const { htsCodesIndexed, crossRulingsSince, activeAlerts, lang } = props;

  return (
    <div {...sx(s.meta)}>
      <span {...sx(s.item)}>
        <Icon.Customs /> {formatInteger(htsCodesIndexed, lang)} HTS codes
        indexed
      </span>
      <span {...sx(s.item)}>
        <Icon.Scroll /> CBP CROSS rulings since{" "}
        {formatInteger(crossRulingsSince, lang)}
      </span>
      <span {...sx(s.item)}>
        <Icon.Bell /> {formatInteger(activeAlerts, lang)} active alerts
      </span>
    </div>
  );
}

const s = stylex.create({
  meta: {
    gap: 18,
    color: colors.ink4,
    display: "flex",
    fontFamily: fonts.mono,
    fontSize: 11.5,
    letterSpacing: "0.02em",
    marginTop: 24,
  },
  item: {
    gap: 6,
    alignItems: "center",
    display: "flex",
  },
});
