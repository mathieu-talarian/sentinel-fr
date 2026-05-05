import type { ToolCallT } from "@/lib/types";

import * as stylex from "@stylexjs/stylex";

import { InspectorEmpty } from "@/components/molecules/InspectorEmpty";
import { InspectorHeader } from "@/components/molecules/InspectorHeader";
import { sx } from "@/lib/styles/sx";
import { borders, colors } from "@/lib/styles/tokens.stylex";

import { ResultCard } from "./ResultCard";

interface InspectorPropsT {
  open: boolean;
  calls: readonly ToolCallT[];
  focusedCallId: string | null;
  onFocusCall: (id: string) => void;
  onClose: () => void;
}

const isComplete = (c: ToolCallT) =>
  c.status === "complete" && c.result != null;

export function Inspector(props: Readonly<InspectorPropsT>) {
  const completed = props.calls.filter((c) => isComplete(c));

  return (
    <aside {...sx(s.aside)} aria-hidden={!props.open}>
      <InspectorHeader onClose={props.onClose} />
      <div {...sx(s.body)}>
        {completed.length === 0 ? (
          <InspectorEmpty />
        ) : (
          completed.map((call) => (
            <div
              key={call.id}
              onClick={() => {
                props.onFocusCall(call.id);
              }}
            >
              <ResultCard
                call={call}
                highlight={call.id === props.focusedCallId}
              />
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

const s = stylex.create({
  aside: {
    background: colors.paper2,
    overflow: "hidden",
    transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1), opacity 220ms",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    opacity: {
      default: 1,
      ':is([aria-hidden="true"])': 0,
    },
    borderLeftColor: colors.line,
    borderLeftStyle: borders.solid,
    borderLeftWidth: {
      default: borders.thin,
      ':is([aria-hidden="true"])': "0",
    },
    width: {
      default: 380,
      ':is([aria-hidden="true"])': 0,
    },
  },
  body: {
    padding: 16,
    flex: "1",
    gap: 14,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
});
