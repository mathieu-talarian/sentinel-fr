import type { IconKeyT } from "../Icons";
import type { ToolCallStatusT, ToolCallT } from "~/lib/types";

import * as stylex from "@stylexjs/stylex";
import { Show } from "solid-js";

import { animations } from "~/lib/animations.stylex";
import { formatHtsCode, truncate } from "~/lib/format";
import { sx } from "~/lib/sx";
import { borders, colors, fonts } from "~/lib/tokens.stylex";

import { Icon } from "../Icons";

interface ToolMetaT {
  label: string;
  icon: IconKeyT;
}

const TOOLS: Record<string, ToolMetaT> = {
  search_codes: { label: "Searching catalog", icon: "Search" },
  get_code_details: { label: "Looking up", icon: "Book" },
  get_landed_cost: { label: "Computing landed cost", icon: "Coin" },
  find_cross_rulings: { label: "Checking prior rulings", icon: "Scroll" },
  subscribe_watch: { label: "Setting up alert", icon: "Bell" },
  list_alerts: { label: "Reading alert queue", icon: "Clipboard" },
};

const FALLBACK_META: ToolMetaT = { label: "", icon: "Sparkle" };

const metaFor = (tool: string): ToolMetaT =>
  TOOLS[tool] ?? { ...FALLBACK_META, label: tool };

const argString = (args: Record<string, unknown>, key: string) => {
  const v = args[key];
  return typeof v === "string" ? v : undefined;
};

const codeArg = (args: Record<string, unknown>) =>
  argString(args, "code_prefix") ?? argString(args, "code");

const suffixFor = (tool: string, raw: unknown): string | undefined => {
  const args = (raw ?? {}) as Record<string, unknown>;
  switch (tool) {
    case "get_code_details":
    case "get_landed_cost": {
      const code = argString(args, "code");
      return code ? formatHtsCode(code) : undefined;
    }
    case "search_codes": {
      const desc = argString(args, "description");
      return desc ? `“${truncate(desc, 36)}”` : undefined;
    }
    case "find_cross_rulings": {
      const q = argString(args, "query");
      return q ? `“${truncate(q, 36)}”` : undefined;
    }
    case "subscribe_watch": {
      const code = codeArg(args);
      return code ? formatHtsCode(code) : undefined;
    }
    case "list_alerts": {
      const cp = argString(args, "code_prefix");
      return cp ? formatHtsCode(cp) : undefined;
    }
    default: {
      return undefined;
    }
  }
};

const labelFor = (tool: string) =>
  tool === "get_code_details" ? "Looking up" : metaFor(tool).label;

const statusStyle = (status: ToolCallStatusT) =>
  status === "failed" ? p.failed : undefined;

const statusIconColor = (status: ToolCallStatusT) => {
  if (status === "in-flight") return p.iconInFlight;
  if (status === "complete") return p.iconComplete;
  return p.iconFailed;
};

interface ToolPillPropsT {
  call: ToolCallT;
  active: boolean;
  onClick: () => void;
}

function StatusGlyph(props: Readonly<{ status: ToolCallStatusT }>) {
  return (
    <Show
      when={props.status !== "in-flight"}
      fallback={<span {...sx(p.spinner)} />}
    >
      <Show when={props.status === "complete"} fallback={<Icon.X />}>
        <Icon.Check />
      </Show>
    </Show>
  );
}

export function ToolPill(props: Readonly<ToolPillPropsT>) {
  const meta = () => metaFor(props.call.tool);
  const IconCmp = () => Icon[meta().icon];
  const suffix = () => suffixFor(props.call.tool, props.call.args);
  const label = () => labelFor(props.call.tool);

  return (
    <button
      type="button"
      {...sx(p.pill, statusStyle(props.call.status), props.active && p.active)}
      onClick={() => { props.onClick(); }}
      aria-live="polite"
    >
      <span {...sx(p.iconSlot, statusIconColor(props.call.status))}>
        <StatusGlyph status={props.call.status} />
      </span>
      <span {...sx(p.body)}>
        <span {...sx(p.toolIcon)}>{IconCmp()({})}</span>
        <span>{label()}</span>
        <Show when={suffix()}>{(c) => <span {...sx(p.code)}>{c()}</span>}</Show>
      </span>
    </button>
  );
}

const p = stylex.create({
  pill: {
    background: {
      default: colors.paper2,
      ":hover": colors.paper3,
    },
    padding: "4px 10px 4px 8px",
    borderColor: {
      default: colors.line,
      ":hover": colors.lineStrong,
    },
    borderRadius: 999,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 6,
    transition: "all 140ms",
    alignItems: "center",
    color: colors.ink2,
    cursor: "pointer",
    display: "inline-flex",
    fontSize: 12,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  active: {
    background: colors.goldSoft,
    borderColor: colors.gold,
    color: colors.ink,
  },
  failed: {
    background: colors.errSoft,
    borderColor: colors.err,
    color: colors.err,
  },
  iconSlot: {
    placeItems: "center",
    color: colors.ink3,
    display: "grid",
    flexShrink: 0,
    height: 14,
    width: 14,
  },
  iconInFlight: { color: colors.goldDeep },
  iconComplete: { color: colors.ok },
  iconFailed: { color: colors.err },
  body: { gap: 4, alignItems: "center", display: "inline-flex" },
  toolIcon: { display: "inline-flex", opacity: 0.85 },
  code: { fontFamily: fonts.mono, fontSize: 11 },
  spinner: {
    borderColor: colors.gold,
    borderRadius: "50%",
    borderStyle: borders.solid,
    borderWidth: borders.thick,
    animationDuration: "0.8s",
    animationIterationCount: "infinite",
    animationName: animations.spin,
    animationTimingFunction: "linear",
    borderTopColor: "transparent",
    height: 12,
    width: 12,
  },
});
