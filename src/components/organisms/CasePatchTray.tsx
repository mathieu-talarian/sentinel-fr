import type { ImportCaseT } from "@/lib/types";

import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { CasePatchSuggestionRow } from "@/components/molecules/CasePatchSuggestionRow";
import { casesActions } from "@/lib/state/casesSlice";
import { applyCasePatch } from "@/lib/state/casesThunks";
import { useAppDispatch, useAppSelector } from "@/lib/state/hooks";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts } from "@/lib/styles/tokens.stylex";

interface CasePatchTrayPropsT {
  case_: ImportCaseT;
  isReadOnly: boolean;
}

/**
 * Sticky tray rendered above the case-aware composer. Lists every
 * `casePatchSuggestion` chunk the assistant has emitted in this session
 * that the user hasn't accepted or dismissed yet. Hidden when empty.
 *
 * Accepting routes through `applyCasePatch` — see the thunk for path-
 * parsing and the case/line-item PATCH split. Dismissing just drops
 * the row without a network call.
 */
export function CasePatchTray(props: Readonly<CasePatchTrayPropsT>) {
  const { case_, isReadOnly } = props;
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const patches = useAppSelector((s) => s.cases.pendingPatches);
  const [applyingIndex, setApplyingIndex] = useState<number | null>(null);

  const lineIdByPosition = useMemo(() => {
    const map = new Map<number, string>();
    for (const line of case_.lineItems) map.set(line.position, line.id);
    return map;
  }, [case_.lineItems]);

  if (patches.length === 0) return null;

  const onAccept = (patchIndex: number) => {
    setApplyingIndex(patchIndex);
    void (async () => {
      try {
        await dispatch(
          applyCasePatch({
            caseId: case_.id,
            patchIndex,
            patch: patches[patchIndex],
            lineIdByPosition,
            queryClient,
          }),
        );
      } catch (error) {
        Sentry.addBreadcrumb({
          category: "case-patch",
          level: "warning",
          message: "Patch apply failed; left in tray.",
          data: { detail: String(error) },
        });
      } finally {
        setApplyingIndex(null);
      }
    })();
  };

  const onDismiss = (patchIndex: number) => {
    dispatch(casesActions.resolvePatch(patchIndex));
  };

  return (
    <section {...sx(s.tray)} aria-label="Suggested case updates">
      <div {...sx(s.head)}>
        <span {...sx(s.label)}>Suggested updates</span>
        <span {...sx(s.count)}>{patches.length} pending</span>
      </div>
      <ul {...sx(s.list)}>
        {patches.map((p, i) => (
          <CasePatchSuggestionRow
            key={`${p.op}:${p.path}:${i.toString()}`}
            patch={p}
            applying={applyingIndex === i}
            isReadOnly={isReadOnly}
            onAccept={() => {
              onAccept(i);
            }}
            onDismiss={() => {
              onDismiss(i);
            }}
          />
        ))}
      </ul>
    </section>
  );
}

const s = stylex.create({
  tray: {
    padding: "10px 12px",
    borderColor: colors.goldSoft,
    borderRadius: 8,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 8,
    backgroundColor: colors.goldSoft,
    display: "flex",
    flexDirection: "column",
  },
  head: {
    gap: 8,
    alignItems: "baseline",
    display: "flex",
    justifyContent: "space-between",
  },
  label: {
    color: colors.goldDeep,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  count: {
    color: colors.goldDeep,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  list: {
    margin: 0,
    padding: 0,
    gap: 6,
    display: "flex",
    flexDirection: "column",
    listStyleType: "none",
  },
});
