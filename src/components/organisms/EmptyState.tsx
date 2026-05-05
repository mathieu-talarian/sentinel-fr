import type { SuggestionT } from "~/lib/utils/suggestions";

import * as stylex from "@stylexjs/stylex";
import { For } from "solid-js";

import { CatalogStatsStrip } from "~/components/molecules/CatalogStatsStrip";
import { EmptyStateHero } from "~/components/molecules/EmptyStateHero";
import { SuggestionCard } from "~/components/molecules/SuggestionCard";
import { sx } from "~/lib/styles/sx";
import { SUGGESTIONS } from "~/lib/utils/suggestions";

interface EmptyStatePropsT {
  onPick: (suggestion: SuggestionT) => void;
}

export function EmptyState(props: Readonly<EmptyStatePropsT>) {
  return (
    <div {...sx(s.root)}>
      <div {...sx(s.inner)}>
        <EmptyStateHero />
        <div {...sx(s.grid)}>
          <For each={SUGGESTIONS}>
            {(suggestion) => (
              <SuggestionCard suggestion={suggestion} onPick={props.onPick} />
            )}
          </For>
        </div>
        <CatalogStatsStrip />
      </div>
    </div>
  );
}

const s = stylex.create({
  root: {
    padding: "24px 28px",
    flex: "1",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  inner: { margin: "0 auto", maxWidth: 720, width: "100%" },
  grid: {
    gap: 10,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
  },
});
