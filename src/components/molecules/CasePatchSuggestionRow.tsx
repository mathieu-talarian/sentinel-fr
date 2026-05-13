import type { CasePatchT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { Button } from "@/components/atoms/Button";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

interface CasePatchSuggestionRowPropsT {
  patch: CasePatchT;
  applying: boolean;
  isReadOnly: boolean;
  onAccept: () => void;
  onDismiss: () => void;
}

const formatValue = (value: CasePatchT["value"]): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  // Object / array — render compact JSON so the user can audit. Backend
  // serializes via serde so circular refs aren't a concern.
  return JSON.stringify(value);
};

/**
 * One row in the `CasePatchTray`. Renders the JSON-pointer path the
 * model wants to mutate, the new value, and the model's rationale —
 * plus accept + dismiss affordances. Never auto-applies; the user
 * always has to click.
 */
export function CasePatchSuggestionRow(
  props: Readonly<CasePatchSuggestionRowPropsT>,
) {
  const { patch, applying, isReadOnly } = props;
  return (
    <li {...sx(s.row)}>
      <div {...sx(s.head)}>
        <span {...sx(s.op)}>{patch.op}</span>
        <span {...sx(s.path)}>{patch.path}</span>
        {patch.op !== "remove" && (
          <span {...sx(s.value)}>{formatValue(patch.value)}</span>
        )}
      </div>
      <p {...sx(s.reason)}>{patch.reason}</p>
      <div {...sx(s.actions)}>
        <Button
          variant="secondary"
          onClick={props.onDismiss}
          disabled={applying}
        >
          Dismiss
        </Button>
        <Button
          variant="primary"
          onClick={props.onAccept}
          disabled={applying || isReadOnly}
        >
          {applying ? "Applying…" : "Accept"}
        </Button>
      </div>
    </li>
  );
}

const s = stylex.create({
  row: {
    padding: "10px 12px",
    borderColor: colors.goldSoft,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 6,
    backgroundColor: colors.paper,
    display: "flex",
    flexDirection: "column",
  },
  head: {
    gap: 8,
    alignItems: "baseline",
    display: "flex",
    flexWrap: "wrap",
  },
  op: {
    padding: "1px 5px",
    borderRadius: radii.sm,
    backgroundColor: colors.goldSoft,
    color: colors.goldDeep,
    fontFamily: fonts.mono,
    fontSize: 10.5,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  path: {
    color: colors.ink2,
    fontFamily: fonts.mono,
    fontSize: 12,
    fontWeight: 500,
  },
  value: {
    overflow: "hidden",
    color: colors.ink,
    fontFamily: fonts.mono,
    fontSize: 12,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    marginLeft: "auto",
    maxWidth: "60%",
  },
  reason: {
    margin: 0,
    color: colors.ink3,
    fontSize: 12,
    lineHeight: 1.45,
  },
  actions: {
    gap: 8,
    display: "flex",
    justifyContent: "flex-end",
  },
});
