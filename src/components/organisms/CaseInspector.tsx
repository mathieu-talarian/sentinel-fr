/* eslint-disable react-refresh/only-export-components -- the tab union
   type and the `asInspectorTab` parser are colocated with the inspector
   because the route file needs the same parser to validate `?tab=`. */
import type { ImportCaseResponseT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";
import { Tabs } from "radix-ui";

import { CaseFactsPanel } from "@/components/organisms/CaseFactsPanel";
import { CaseLinesPanel } from "@/components/organisms/CaseLinesPanel";
import { CasePlaceholderPanel } from "@/components/organisms/CasePlaceholderPanel";
import { CaseQuotePanel } from "@/components/organisms/CaseQuotePanel";
import { CaseRiskPanel } from "@/components/organisms/CaseRiskPanel";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

export type CaseInspectorTabT =
  | "facts"
  | "lines"
  | "quote"
  | "risks"
  | "evidence";

const KNOWN_TABS = new Set<CaseInspectorTabT>([
  "facts",
  "lines",
  "quote",
  "risks",
  "evidence",
]);

export const asInspectorTab = (s: string | undefined): CaseInspectorTabT =>
  s && KNOWN_TABS.has(s as CaseInspectorTabT)
    ? (s as CaseInspectorTabT)
    : "facts";

interface CaseInspectorPropsT {
  case_: ImportCaseResponseT;
  isReadOnly: boolean;
  tab: CaseInspectorTabT;
  onTabChange: (tab: CaseInspectorTabT) => void;
}

const TABS: { value: CaseInspectorTabT; label: string }[] = [
  { value: "facts", label: "Facts" },
  { value: "lines", label: "Lines" },
  { value: "quote", label: "Quote" },
  { value: "risks", label: "Risks" },
  { value: "evidence", label: "Evidence" },
];

/**
 * Right-rail inspector for the case workbench. Five tabs — only Facts
 * and Lines are wired in Phase 4; the other three render
 * `CasePlaceholderPanel` until their backend / FE work lands in later
 * phases. The tab strip stays in place across phases so the UX doesn't
 * shift when more panels turn on.
 */
export function CaseInspector(props: Readonly<CaseInspectorPropsT>) {
  return (
    <aside {...sx(s.aside)}>
      <Tabs.Root
        value={props.tab}
        onValueChange={(v) => {
          props.onTabChange(asInspectorTab(v));
        }}
        {...sx(s.root)}
      >
        <Tabs.List {...sx(s.list)} aria-label="Case inspector sections">
          {TABS.map((t) => (
            <Tabs.Trigger key={t.value} value={t.value} {...sx(s.trigger)}>
              {t.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div {...sx(s.body)}>
          <Tabs.Content value="facts">
            <CaseFactsPanel case_={props.case_} isReadOnly={props.isReadOnly} />
          </Tabs.Content>
          <Tabs.Content value="lines">
            <CaseLinesPanel case_={props.case_} isReadOnly={props.isReadOnly} />
          </Tabs.Content>
          <Tabs.Content value="quote">
            <CaseQuotePanel case_={props.case_} isReadOnly={props.isReadOnly} />
          </Tabs.Content>
          <Tabs.Content value="risks">
            <CaseRiskPanel case_={props.case_} isReadOnly={props.isReadOnly} />
          </Tabs.Content>
          <Tabs.Content value="evidence">
            <CasePlaceholderPanel
              title="Ruling evidence"
              description="Attached CBP CROSS rulings grouped by supports / conflicts / reference."
              phase="Phase 8"
            />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </aside>
  );
}

const s = stylex.create({
  aside: {
    backgroundColor: colors.paper2,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    borderLeftColor: colors.line,
    borderLeftStyle: borders.solid,
    borderLeftWidth: borders.thin,
    width: 380,
  },
  root: {
    flex: "1",
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  list: {
    padding: "8px 8px 0",
    gap: 2,
    display: "flex",
    borderBottomColor: colors.line,
    borderBottomStyle: borders.solid,
    borderBottomWidth: borders.thin,
  },
  trigger: {
    padding: "8px 10px",
    borderColor: "transparent",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    backgroundColor: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    color: {
      default: colors.ink3,
      ':is([data-state="active"])': colors.ink,
    },
    cursor: "pointer",
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: {
      default: 500,
      ':is([data-state="active"])': 600,
    },
  },
  body: {
    padding: 14,
    flex: "1",
    overflowY: "auto",
  },
});
