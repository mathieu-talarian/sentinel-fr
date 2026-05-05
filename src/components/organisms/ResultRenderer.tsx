import type {
  AlertsContentT,
  CodeDetailsContentT,
  CrossRulingsContentT,
  LandedCostContentT,
  SearchCodesContentT,
  SubscribeWatchContentT,
} from "~/lib/types";

import * as stylex from "@stylexjs/stylex";
import { Match, Switch } from "solid-js";

import { sx } from "~/lib/styles/sx";
import { fonts } from "~/lib/styles/tokens.stylex";

import { AlertList } from "./results/AlertList";
import { CodeDetails } from "./results/CodeDetails";
import { LandedCost } from "./results/LandedCost";
import { Rulings } from "./results/Rulings";
import { SearchResult } from "./results/SearchResult";
import { SubscribeConfirm } from "./results/SubscribeConfirm";

interface ResultRendererPropsT {
  tool: string;
  result: unknown;
}

export function ResultRenderer(props: Readonly<ResultRendererPropsT>) {
  return (
    <Switch
      fallback={
        <pre {...sx(s.pre)}>{JSON.stringify(props.result, null, 2)}</pre>
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

const s = stylex.create({
  pre: { fontFamily: fonts.mono, fontSize: 11, whiteSpace: "pre-wrap" },
});
