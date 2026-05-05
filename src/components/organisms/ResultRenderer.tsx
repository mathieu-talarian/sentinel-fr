import type {
  AlertsContentT,
  CodeDetailsContentT,
  CrossRulingsContentT,
  LandedCostContentT,
  SearchCodesContentT,
  SubscribeWatchContentT,
} from "@/lib/types";

import * as stylex from "@stylexjs/stylex";

import { sx } from "@/lib/styles/sx";
import { fonts } from "@/lib/styles/tokens.stylex";

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
  switch (props.tool) {
    case "search_codes": {
      return <SearchResult result={props.result as SearchCodesContentT} />;
    }
    case "get_code_details": {
      return <CodeDetails result={props.result as CodeDetailsContentT} />;
    }
    case "get_landed_cost": {
      return <LandedCost result={props.result as LandedCostContentT} />;
    }
    case "find_cross_rulings": {
      return <Rulings result={props.result as CrossRulingsContentT} />;
    }
    case "subscribe_watch": {
      return (
        <SubscribeConfirm result={props.result as SubscribeWatchContentT} />
      );
    }
    case "list_alerts": {
      return <AlertList result={props.result as AlertsContentT} />;
    }
    default: {
      return <pre {...sx(s.pre)}>{JSON.stringify(props.result, null, 2)}</pre>;
    }
  }
}

const s = stylex.create({
  pre: { fontFamily: fonts.mono, fontSize: 11, whiteSpace: "pre-wrap" },
});
