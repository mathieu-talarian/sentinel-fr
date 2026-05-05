import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";

import { Icon } from "@/components/atoms/Icons";
import { catalogStatsOptions } from "@/lib/api/generated/@tanstack/react-query.gen";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

export function CatalogStatsStrip() {
  const stats = useQuery(catalogStatsOptions());

  if (!stats.data) return null;
  const d = stats.data;

  return (
    <div {...sx(s.meta)}>
      <span {...sx(s.item)}>
        <Icon.Customs /> {d.htsCodesIndexed?.toLocaleString("en-US")} HTS codes
        indexed
      </span>
      <span {...sx(s.item)}>
        <Icon.Scroll /> CBP CROSS rulings since {d.crossRulingsSince}
      </span>
      <span {...sx(s.item)}>
        <Icon.Bell /> {d.activeAlerts} active alerts
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
