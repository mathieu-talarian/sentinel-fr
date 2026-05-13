import type {
  AlertsResponseT,
  CommodityBodyT,
  LandedCostResponseT,
  SearchBodyT,
  WatchSubscribeResponseT,
} from "@/lib/api/generated/types.gen";
import type { CrossRulingsContentT } from "@/lib/types";

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
      return <SearchResult result={props.result as SearchBodyT} />;
    }
    case "get_code_details": {
      return <CodeDetails result={props.result as CommodityBodyT} />;
    }
    case "get_landed_cost": {
      return <LandedCost result={props.result as LandedCostResponseT} />;
    }
    case "find_cross_rulings": {
      return <Rulings result={props.result as CrossRulingsContentT} />;
    }
    case "subscribe_watch": {
      return (
        <SubscribeConfirm result={props.result as WatchSubscribeResponseT} />
      );
    }
    case "list_alerts": {
      return <AlertList result={props.result as AlertsResponseT} />;
    }
    default: {
      return <pre {...sx(s.pre)}>{JSON.stringify(props.result, null, 2)}</pre>;
    }
  }
}

const s = stylex.create({
  pre: { fontFamily: fonts.mono, fontSize: 11, whiteSpace: "pre-wrap" },
});
