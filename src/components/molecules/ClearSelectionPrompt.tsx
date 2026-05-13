import * as stylex from "@stylexjs/stylex";

import { Button } from "@/components/atoms/Button";
import { sx } from "@/lib/styles/sx";
import { borders, colors, radii } from "@/lib/styles/tokens.stylex";

interface ClearSelectionPromptPropsT {
  busy: boolean;
  onKeep: () => void;
  onClear: () => void;
}

/**
 * Surfaced inside `CandidatesReviewDialog` when the user rejects a
 * candidate that was the line's `selectedHtsCode`. Per the backend
 * contract reject doesn't auto-clear the selection, so this is the
 * follow-up affordance.
 */
export function ClearSelectionPrompt(
  props: Readonly<ClearSelectionPromptPropsT>,
) {
  return (
    <div {...sx(s.box)}>
      <span>
        You rejected the candidate that's still the line's selected HTS code.
        Clear the selection?
      </span>
      <div {...sx(s.actions)}>
        <Button variant="secondary" onClick={props.onKeep}>
          Keep
        </Button>
        <Button variant="primary" onClick={props.onClear} disabled={props.busy}>
          {props.busy ? "Clearing…" : "Clear selection"}
        </Button>
      </div>
    </div>
  );
}

const s = stylex.create({
  box: {
    margin: "12px 18px 0",
    padding: "10px 12px",
    borderColor: colors.warnSoft,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 8,
    backgroundColor: colors.warnSoft,
    color: colors.ink2,
    display: "flex",
    flexDirection: "column",
    fontSize: 12,
  },
  actions: { gap: 8, display: "flex", justifyContent: "flex-end" },
});
