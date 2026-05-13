import { useQuery } from "@tanstack/react-query";

import { CatalogStatsStrip } from "@/components/molecules/CatalogStatsStrip";
import { catalogStatsOptions } from "@/lib/api/generated/@tanstack/react-query.gen";
import { useTweaks } from "@/lib/state/tweaks";

/**
 * Wiring for `CatalogStatsStrip`: pulls catalog stats from the API and
 * the active language from tweaks, then renders the pure strip.
 */
export function CatalogStatsStripContainer() {
  const [tweaks] = useTweaks();
  const stats = useQuery(catalogStatsOptions());

  if (!stats.data) return null;

  return (
    <CatalogStatsStrip
      htsCodesIndexed={stats.data.htsCodesIndexed}
      crossRulingsSince={stats.data.crossRulingsSince}
      activeAlerts={stats.data.activeAlerts}
      lang={tweaks.lang}
    />
  );
}
