import type { IconKeyT } from "../Icons";
import type {
  AlertsContentT,
  CodeDetailsContentT,
  CrossRulingsContentT,
  LandedCostContentT,
  SearchCodesContentT,
  SubscribeWatchContentT,
  ToolCallT,
} from "~/lib/types";

import * as stylex from "@stylexjs/stylex";
import { Match, Show, Switch } from "solid-js";

import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii } from "~/lib/tokens.stylex";

import { Icon } from "../Icons";

import { AlertList } from "./AlertList";
import { CodeDetails } from "./CodeDetails";
import { LandedCost } from "./LandedCost";
import { Rulings } from "./Rulings";
import { SearchResult } from "./SearchResult";
import { SubscribeConfirm } from "./SubscribeConfirm";

interface ToolMetaT {
  title: string;
  tag: string;
  icon: IconKeyT;
}

const TOOL_META: Record<string, ToolMetaT> = {
  search_codes: { title: "Catalog search", tag: "search_codes", icon: "Search" },
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

function RendererSwitch(props: Readonly<{ tool: string; result: unknown }>) {
  return (
    <Switch
      fallback={
        <pre {...sx(c.pre)}>{JSON.stringify(props.result, null, 2)}</pre>
      }
    >
      <Match when={props.tool === "search_codes"}>
        <SearchResult result={props.result as SearchCodesContentT} />
      </Match>
      <Match when={props.tool === "get_code_details"}>
        <CodeDetails result={props.result as CodeDetailsContentT} />
      </Match>
      <Match when={props.tool === "get_landed_cost"}>
        <LandedCost result={props.result as LandedCostContentT} />
      </Match>
      <Match when={props.tool === "find_cross_rulings"}>
        <Rulings result={props.result as CrossRulingsContentT} />
      </Match>
      <Match when={props.tool === "subscribe_watch"}>
        <SubscribeConfirm result={props.result as SubscribeWatchContentT} />
      </Match>
      <Match when={props.tool === "list_alerts"}>
        <AlertList result={props.result as AlertsContentT} />
      </Match>
    </Switch>
  );
}

interface ResultCardPropsT {
  call: ToolCallT;
  highlight: boolean;
}

export function ResultCard(props: Readonly<ResultCardPropsT>) {
  const meta = () => metaFor(props.call.tool);
  const IconCmp = () => Icon[meta().icon];

  return (
    <div {...sx(c.card, props.highlight && c.cardHighlight)}>
      <div {...sx(c.head)}>
        <span {...sx(c.headIcon)}>{IconCmp()({})}</span>
        <span {...sx(c.headLabel)}>{meta().title}</span>
        <span {...sx(c.headStats)}>
          {meta().tag}
          <Show when={props.call.durationMs}>
            {(ms) => <> · {String(ms())}ms</>}
          </Show>
        </span>
      </div>
      <div {...sx(c.body)}>
        <RendererSwitch tool={props.call.tool} result={props.call.result} />
      </div>
    </div>
  );
}

const c = stylex.create({
  card: {
    background: colors.paper,
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    overflow: "hidden",
  },
  cardHighlight: {
    outlineColor: colors.gold,
    outlineOffset: 0,
    outlineStyle: borders.solid,
    outlineWidth: borders.bold,
  },
  head: {
    background: colors.paper2,
    padding: "8px 12px",
    gap: 8,
    alignItems: "center",
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
  pre: { fontFamily: fonts.mono, fontSize: 11, whiteSpace: "pre-wrap" },
});
