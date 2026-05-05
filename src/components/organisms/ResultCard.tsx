import type { IconKeyT } from "@/components/atoms/Icons";
import type { ToolCallT } from "@/lib/types";

import * as stylex from "@stylexjs/stylex";

import { Icon } from "@/components/atoms/Icons";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

import { ResultRenderer } from "./ResultRenderer";

interface ToolMetaT {
  title: string;
  tag: string;
  icon: IconKeyT;
}

const TOOL_META: Record<string, ToolMetaT> = {
  search_codes: {
    title: "Catalog search",
    tag: "search_codes",
    icon: "Search",
  },
  get_code_details: {
    title: "HTS code detail",
    tag: "get_code_details",
    icon: "Book",
  },
  get_landed_cost: {
    title: "Landed cost",
    tag: "get_landed_cost",
    icon: "Coin",
  },
  find_cross_rulings: {
    title: "CBP CROSS rulings",
    tag: "find_cross_rulings",
    icon: "Scroll",
  },
  subscribe_watch: {
    title: "Alert subscription",
    tag: "subscribe_watch",
    icon: "Bell",
  },
  list_alerts: {
    title: "Recent alerts",
    tag: "list_alerts",
    icon: "Clipboard",
  },
};

const metaFor = (tool: string): ToolMetaT =>
  TOOL_META[tool] ?? { title: tool, tag: tool, icon: "Sparkle" };

interface ResultCardPropsT {
  call: ToolCallT;
  highlight: boolean;
}

export function ResultCard(props: Readonly<ResultCardPropsT>) {
  const meta = metaFor(props.call.tool);
  const IconCmp = Icon[meta.icon];

  return (
    <div {...sx(c.card, props.highlight && c.cardHighlight)}>
      <div {...sx(c.head)}>
        <span {...sx(c.headIcon)}>
          <IconCmp />
        </span>
        <span {...sx(c.headLabel)}>{meta.title}</span>
        <span {...sx(c.headStats)}>
          {meta.tag}
          {props.call.durationMs != null && <> · {props.call.durationMs}ms</>}
        </span>
      </div>
      <div {...sx(c.body)}>
        <ResultRenderer tool={props.call.tool} result={props.call.result} />
      </div>
    </div>
  );
}

const c = stylex.create({
  card: {
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    overflow: "hidden",
    backgroundColor: colors.paper,
  },
  cardHighlight: {
    outlineColor: colors.gold,
    outlineOffset: 0,
    outlineStyle: borders.solid,
    outlineWidth: borders.bold,
  },
  head: {
    padding: "8px 12px",
    gap: 8,
    alignItems: "center",
    backgroundColor: colors.paper2,
    display: "flex",
    borderBottomColor: colors.line,
    borderBottomStyle: borders.solid,
    borderBottomWidth: borders.thin,
  },
  headIcon: {
    placeItems: "center",
    color: colors.ink3,
    display: "grid",
    height: 18,
    width: 18,
  },
  headLabel: { color: colors.ink, fontSize: 12, fontWeight: 500 },
  headStats: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 10.5,
    marginLeft: "auto",
  },
  body: { padding: 12 },
});
