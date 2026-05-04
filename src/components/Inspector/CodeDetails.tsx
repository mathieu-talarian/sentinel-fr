import type { CodeDetailsContentT, HierarchyNodeT } from "~/lib/types";

import * as stylex from "@stylexjs/stylex";
import { For, Show } from "solid-js";

import { formatHtsCode } from "~/lib/format";
import { sx } from "~/lib/sx";
import { colors, fonts } from "~/lib/tokens.stylex";

interface CrumbT {
  code?: string;
  label: string;
}

const hierarchyToCrumbs = (nodes: readonly HierarchyNodeT[]): CrumbT[] => {
  // Backend hierarchy is leaf-to-root; walk it in reverse for a top-down
  // breadcrumb without mutating the source array.
  const out: CrumbT[] = [];
  for (let i = nodes.length - 1; i >= 0; i--) {
    const h = nodes[i];
    out.push({
      code: h.code,
      label: h.desc_en ?? h.desc_fr ?? formatHtsCode(h.code),
    });
  }
  return out;
};

const buildCrumbs = (result: CodeDetailsContentT): CrumbT[] => {
  if (result.hierarchy?.length) return hierarchyToCrumbs(result.hierarchy);
  if (result.chain?.length) return result.chain.map((s) => ({ label: s }));
  return [];
};

const rateText = (result: CodeDetailsContentT) =>
  result.general_rate ?? result.rate_text ?? result.mfn_rate ?? "—";

const description = (result: CodeDetailsContentT) =>
  result.desc_en ?? result.desc_fr ?? result.desc ?? "";

export function CodeDetails(
  props: Readonly<{ result: CodeDetailsContentT }>,
) {
  const crumbs = () => buildCrumbs(props.result);
  const units = () => props.result.units ?? props.result.unit;

  return (
    <div>
      <div {...sx(d.crumb)}>
        <For each={crumbs()}>
          {(seg, i) => (
            <>
              <span
                {...sx(
                  d.crumbItem,
                  i() === crumbs().length - 1 && d.crumbItemLast,
                )}
                title={seg.code ? formatHtsCode(seg.code) : undefined}
              >
                {seg.code ? formatHtsCode(seg.code) : seg.label}
              </span>
              <Show when={i() < crumbs().length - 1}>
                <span {...sx(d.crumbSep)}>›</span>
              </Show>
            </>
          )}
        </For>
      </div>
      <Show when={props.result.code}>
        {(code) => <div {...sx(d.codeLine)}>{formatHtsCode(code())}</div>}
      </Show>
      <div {...sx(d.desc)}>{description(props.result)}</div>
      <div {...sx(d.rateRow)}>
        <span {...sx(d.rateLabel)}>MFN duty</span>
        <span {...sx(d.rateVal)}>{rateText(props.result)}</span>
      </div>
      <Show when={units()}>
        {(u) => (
          <div {...sx(d.unit)}>
            unit: {u()}
            {props.result.section301 ? ` · ${props.result.section301}` : ""}
          </div>
        )}
      </Show>
    </div>
  );
}

const d = stylex.create({
  crumb: {
    gap: "4px 6px",
    color: colors.ink3,
    display: "flex",
    flexWrap: "wrap",
    fontFamily: fonts.mono,
    fontSize: 11,
    marginBottom: 8,
  },
  crumbItem: { whiteSpace: "nowrap" },
  crumbItemLast: { color: colors.ink, fontWeight: 600 },
  crumbSep: { color: colors.ink5 },
  codeLine: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 14,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 600,
    marginBottom: 4,
  },
  desc: {
    color: colors.ink2,
    fontSize: 13,
    lineHeight: 1.45,
    marginBottom: 8,
  },
  rateRow: {
    gap: 8,
    alignItems: "baseline",
    display: "flex",
    marginTop: 4,
  },
  rateLabel: {
    color: colors.ink4,
    fontSize: 11.5,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  rateVal: {
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 18,
    fontWeight: 600,
  },
  unit: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginTop: 6,
  },
});
