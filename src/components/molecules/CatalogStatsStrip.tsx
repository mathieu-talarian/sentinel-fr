import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";

import { Icon } from "@/components/atoms/Icons";
import { catalogStatsOptions } from "@/lib/api/generated/@tanstack/react-query.gen";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";
import { formatInteger } from "@/lib/utils/intl";

export function CatalogStatsStrip() {
  const [tweaks] = useTweaks();
  const stats = useQuery(catalogStatsOptions());

  if (!stats.data) return null;
  const d = stats.data;

  return (
    <div {...sx(s.meta)}>
      <span {...sx(s.item)}>
        <Icon.Customs /> {formatInteger(d.htsCodesIndexed, tweaks.lang)} HTS
        codes indexed
      </span>
      <span {...sx(s.item)}>
        <Icon.Scroll /> CBP CROSS rulings since{" "}
        {formatInteger(d.crossRulingsSince, tweaks.lang)}
      </span>
      <span {...sx(s.item)}>
        <Icon.Bell /> {formatInteger(d.activeAlerts, tweaks.lang)} active alerts
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
