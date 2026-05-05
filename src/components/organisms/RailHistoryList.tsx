import * as stylex from "@stylexjs/stylex";
import { createQuery } from "@tanstack/solid-query";
import { For, Show, Suspense } from "solid-js";

import { RailConvoItem } from "~/components/molecules/RailConvoItem";
import { priorConvosQuery } from "~/lib/api/queries";
import { sx } from "~/lib/styles/sx";
import { colors, fonts } from "~/lib/styles/tokens.stylex";

export function RailHistoryList() {
  const convos = createQuery(() => priorConvosQuery());

  return (
    <>
      <div {...sx(s.section)}>Recent</div>
      <div {...sx(s.list)}>
        <RailConvoItem title="New chat" when="Now" active />
        <Suspense>
          <For each={convos.data ?? []}>
            {(c) => <RailConvoItem title={c.title} when={c.when} />}
          </For>
        </Suspense>
        <Show when={convos.isError}>
          <div {...sx(s.error)}>Couldn't load history</div>
        </Show>
      </div>
    </>
  );
}

const s = stylex.create({
  section: {
    padding: "14px 14px 4px",
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  list: {
    padding: "0 6px 12px",
    flex: "1",
    gap: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  error: {
    padding: "8px 10px",
    color: colors.err,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
});
