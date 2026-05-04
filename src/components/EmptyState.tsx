import type { SuggestionT } from "~/lib/suggestions";

import * as stylex from "@stylexjs/stylex";
import { createQuery } from "@tanstack/solid-query";
import { For, Show } from "solid-js";

import { catalogStatsQuery } from "~/lib/queries";
import { SUGGESTIONS } from "~/lib/suggestions";
import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii, shadows } from "~/lib/tokens.stylex";

import { Icon } from "./Icons";

interface EmptyStatePropsT {
  onPick: (suggestion: SuggestionT) => void;
}

export function EmptyState(props: Readonly<EmptyStatePropsT>) {
  const stats = createQuery(() => catalogStatsQuery());

  return (
    <div {...sx(s.root)}>
      <div {...sx(s.inner)}>
        <div {...sx(s.eyebrow)}>FR → US · Customs Classification Agent</div>
        <h1 {...sx(s.title)}>
          What are you <em {...sx(s.titleEm)}>shipping</em> today?
        </h1>
        <p {...sx(s.sub)}>
          Describe your product in plain language. I'll search the HTS catalog,
          check prior CBP rulings, and give you the right 10-digit code with the
          all-in landed cost.
        </p>

        <div {...sx(s.grid)}>
          <For each={SUGGESTIONS}>
            {(suggestion) => (
              <button
                type="button"
                {...sx(s.card)}
                onClick={() => {
                  props.onPick(suggestion);
                }}
              >
                <span {...sx(s.tag)}>
                  <span {...sx(s.dot, dotStyleFor(suggestion.id))} />
                  {suggestion.tag}
                </span>
                <span {...sx(s.text)}>{suggestion.text}</span>
                <span {...sx(s.arrow)}>
                  <Icon.Arrow />
                </span>
              </button>
            )}
          </For>
        </div>

        <Show when={stats.data}>
          {(d) => (
            <div {...sx(s.meta)}>
              <span {...sx(s.metaItem)}>
                <Icon.Customs /> {d().hts_codes_indexed.toLocaleString("en-US")}{" "}
                HTS codes indexed
              </span>
              <span {...sx(s.metaItem)}>
                <Icon.Scroll /> CBP CROSS rulings since{" "}
                {d().cross_rulings_since}
              </span>
              <span {...sx(s.metaItem)}>
                <Icon.Bell /> {d().active_alerts} active alerts
              </span>
            </div>
          )}
        </Show>
      </div>
    </div>
  );
}

function dotStyleFor(id: SuggestionT["id"]) {
  if (id === "cost") return s.dotCost;
  if (id === "alert") return s.dotAlert;
  return s.dotClassify;
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
  eyebrow: {
    gap: 8,
    alignItems: "center",
    color: colors.goldDeep,
    display: "flex",
    fontFamily: fonts.mono,
    fontSize: 11,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: 12,
    "::before": {
      background: colors.gold,
      content: '""',
      height: 1,
      width: 18,
    },
  },
  title: {
    margin: "0 0 8px",
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 32,
    fontWeight: 400,
    letterSpacing: "-0.02em",
    lineHeight: 1.15,
  },
  titleEm: { color: colors.goldDeep, fontStyle: "italic" },
  sub: {
    margin: "0 0 28px",
    color: colors.ink3,
    fontSize: 14,
    maxWidth: 540,
  },
  grid: {
    gap: 10,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
  },
  card: {
    background: {
      default: colors.paper2,
      ":hover": colors.paper,
    },
    padding: "14px 14px 12px",
    borderColor: {
      default: colors.line,
      ":hover": colors.lineStrong,
    },
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 8,
    transition: "all 160ms",
    boxShadow: {
      default: "none",
      ":hover": shadows.md,
    },
    color: colors.ink,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    transform: {
      default: "translateY(0)",
      ":hover": "translateY(-1px)",
    },
    minHeight: 132,
  },
  tag: {
    gap: 5,
    alignItems: "center",
    alignSelf: "flex-start",
    color: colors.ink4,
    display: "inline-flex",
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  dot: {
    background: colors.gold,
    borderRadius: "50%",
    height: 6,
    width: 6,
  },
  dotClassify: { background: colors.gold },
  dotCost: { background: colors.ok },
  dotAlert: { background: "oklch(0.65 0.12 280)" },
  text: {
    color: colors.ink,
    fontSize: 13.5,
    lineHeight: 1.45,
  },
  arrow: {
    transition: "transform 160ms, color 160ms",
    alignSelf: "flex-end",
    color: colors.ink4,
    marginTop: "auto",
  },
  meta: {
    gap: 18,
    color: colors.ink4,
    display: "flex",
    fontFamily: fonts.mono,
    fontSize: 11.5,
    letterSpacing: "0.02em",
    marginTop: 24,
  },
  metaItem: {
    gap: 6,
    alignItems: "center",
    display: "flex",
  },
});
