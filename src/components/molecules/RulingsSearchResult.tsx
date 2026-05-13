import type {
  ImportCaseLineItemResponseT,
  RulingViewT,
} from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { Textarea } from "@/components/atoms/Textarea";
import { HtsCodeBadge } from "@/components/molecules/HtsCodeBadge";
import { SourceLink } from "@/components/molecules/SourceLink";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

type VerdictT = "yes" | "no" | "unknown";

const LABELS: Record<VerdictT, string> = {
  yes: "Supports",
  no: "Conflicts",
  unknown: "Reference",
};

interface RulingsSearchResultPropsT {
  ruling: RulingViewT;
  busyVerdict: VerdictT | null;
  attached: boolean;
  isReadOnly: boolean;
  lineItems: readonly ImportCaseLineItemResponseT[];
  onAttach: (
    verdict: VerdictT,
    opts: { lineItemId: string | null; matchNote: string | null },
  ) => void;
}

/**
 * One row in the `RulingsSearchDialog` results list. Renders ruling
 * metadata plus an optional line-item picker and a match-note input,
 * then three verdict buttons (Supports / Conflicts / Reference). After
 * a successful attach the row collapses to an "Attached" hint so the
 * user can keep attaching others from the same search.
 */
export function RulingsSearchResult(
  props: Readonly<RulingsSearchResultPropsT>,
) {
  const { ruling, busyVerdict, attached, isReadOnly } = props;
  const [lineItemId, setLineItemId] = useState<string>("");
  const [matchNote, setMatchNote] = useState("");

  const submitAttach = (verdict: VerdictT) => {
    props.onAttach(verdict, {
      lineItemId: lineItemId || null,
      matchNote: matchNote.trim() || null,
    });
  };

  return (
    <div {...sx(s.result)}>
      <div {...sx(s.head)}>
        <span {...sx(s.number)}>{ruling.rulingNumber}</span>
        {ruling.rulingDate && <span {...sx(s.date)}>{ruling.rulingDate}</span>}
      </div>
      <p {...sx(s.subject)}>{ruling.subject}</p>
      {ruling.tariffs.length > 0 && (
        <div {...sx(s.codes)}>
          {ruling.tariffs.map((t) => (
            <HtsCodeBadge key={t.dotted} code={t.digits} tone="default" />
          ))}
        </div>
      )}
      <SourceLink label="View on CROSS" url={ruling.url} />
      {attached ? (
        <p {...sx(s.attached)}>Attached to case.</p>
      ) : (
        <>
          {props.lineItems.length > 0 && (
            <div {...sx(s.optional)}>
              <label
                htmlFor={`pin-${ruling.rulingNumber}`}
                {...sx(s.optionalLabel)}
              >
                Pin to line (optional)
              </label>
              <select
                id={`pin-${ruling.rulingNumber}`}
                value={lineItemId}
                onChange={(e) => {
                  setLineItemId(e.currentTarget.value);
                }}
                {...sx(s.select)}
              >
                <option value="">Case-level</option>
                {props.lineItems.map((line) => (
                  <option key={line.id} value={line.id}>
                    #{line.position} · {line.description}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div {...sx(s.optional)}>
            <label
              htmlFor={`note-${ruling.rulingNumber}`}
              {...sx(s.optionalLabel)}
            >
              Match note (optional)
            </label>
            <Textarea
              id={`note-${ruling.rulingNumber}`}
              value={matchNote}
              rows={2}
              onValueChange={setMatchNote}
              placeholder="Why this ruling fits the case…"
            />
          </div>
          <div {...sx(s.attachRow)}>
            {(["yes", "no", "unknown"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  submitAttach(v);
                }}
                disabled={isReadOnly || busyVerdict === v}
                {...sx(s.verdict)}
              >
                {busyVerdict === v ? "Attaching…" : LABELS[v]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const s = stylex.create({
  result: {
    padding: "10px 12px",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 6,
    backgroundColor: colors.paper,
    display: "flex",
    flexDirection: "column",
  },
  head: { gap: 8, alignItems: "baseline", display: "flex" },
  number: {
    color: colors.ink,
    fontFamily: fonts.mono,
    fontSize: 12,
    fontWeight: 600,
  },
  date: { color: colors.ink4, fontFamily: fonts.mono, fontSize: 11 },
  subject: {
    margin: 0,
    color: colors.ink2,
    fontSize: 12.5,
    lineHeight: 1.45,
  },
  codes: { gap: 4, display: "flex", flexWrap: "wrap" },
  optional: { gap: 3, display: "flex", flexDirection: "column", marginTop: 2 },
  optionalLabel: {
    color: colors.ink4,
    fontSize: 10.5,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  select: {
    padding: "6px 10px",
    borderColor: colors.lineStrong,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    backgroundColor: colors.paper,
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 12,
    width: "100%",
  },
  attachRow: {
    gap: 6,
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
    marginTop: 2,
  },
  verdict: {
    padding: "4px 10px",
    borderColor: colors.lineStrong,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    backgroundColor: {
      default: colors.paper,
      ":hover:not(:disabled)": colors.paper3,
    },
    color: colors.ink,
    cursor: {
      default: "pointer",
      ":disabled": "not-allowed",
    },
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: 500,
  },
  attached: { margin: 0, color: colors.ok, fontSize: 12, fontStyle: "italic" },
});
