import type { ImportCaseLineItemResponseT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";
import { Dialog } from "radix-ui";
import { useEffect, useState } from "react";

import { Icon } from "@/components/atoms/Icons";
import { CandidateRow } from "@/components/molecules/CandidateRow";
import { ClearSelectionPrompt } from "@/components/molecules/ClearSelectionPrompt";
import { ErrorBanner } from "@/components/molecules/ErrorBanner";
import { importCaseCandidatesListOptions } from "@/lib/api/generated/@tanstack/react-query.gen";
import { useCandidateReviewActions } from "@/lib/api/useCandidateReviewActions";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import {
  borders,
  colors,
  fonts,
  radii,
  shadows,
} from "@/lib/styles/tokens.stylex";

interface CandidatesReviewDialogPropsT {
  caseId: string;
  line: ImportCaseLineItemResponseT;
  open: boolean;
  isReadOnly: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Per-line candidate review surface. Lists all candidates for a single
 * line item and exposes Accept / Reject / Delete actions. When the user
 * rejects the candidate that's currently the line's selectedHtsCode,
 * we surface a "Clear selection" follow-up (clearing isn't automatic
 * per the backend contract — the user might want the rejection to
 * stand for audit while keeping the selection while they pick a
 * replacement).
 */
export function CandidatesReviewDialog(
  props: Readonly<CandidatesReviewDialogPropsT>,
) {
  const { caseId, line, open, isReadOnly } = props;
  const [tweaks] = useTweaks();
  const [showClearPrompt, setShowClearPrompt] = useState(false);

  const actions = useCandidateReviewActions({
    caseId,
    lineId: line.id,
    onPromptClear: () => {
      setShowClearPrompt(true);
    },
  });

  const listQ = useQuery({
    ...importCaseCandidatesListOptions({
      path: { caseId, lineId: line.id },
    }),
    enabled: open,
  });

  const candidates = listQ.data?.candidates ?? [];
  const selectedCandidateId =
    line.selectedHtsCode == null
      ? null
      : (candidates.find((c) => c.code === line.selectedHtsCode)?.id ?? null);

  // Keep the actions hook's selected-candidate ref in sync each render
  // so the reject mutation can decide whether to fire onPromptClear.
  useEffect(() => {
    actions.setSelectedCandidateId(selectedCandidateId);
  });

  return (
    <Dialog.Root open={open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay {...sx(s.backdrop)} />
        <Dialog.Content {...sx(s.content)}>
          <div {...sx(s.head)}>
            <Dialog.Title {...sx(s.title)}>
              Candidates · line #{line.position}
            </Dialog.Title>
            <Dialog.Close {...sx(s.close)} aria-label="Close dialog">
              <Icon.X />
            </Dialog.Close>
          </div>

          {actions.error && <ErrorBanner message={actions.error} />}

          {showClearPrompt && (
            <ClearSelectionPrompt
              busy={actions.clearSelectionPending}
              onKeep={() => {
                setShowClearPrompt(false);
              }}
              onClear={() => {
                actions.clearSelection();
                setShowClearPrompt(false);
              }}
            />
          )}

          <div {...sx(s.list)}>
            {listQ.isLoading && <p {...sx(s.note)}>Loading candidates…</p>}
            {!listQ.isLoading && candidates.length === 0 && (
              <p {...sx(s.note)}>
                No candidates yet. Run Classify on the line to populate.
              </p>
            )}
            {candidates.map((c) => (
              <CandidateRow
                key={c.id}
                candidate={c}
                isSelected={c.id === selectedCandidateId}
                busy={
                  actions.busy?.candidateId === c.id
                    ? actions.busy.action
                    : null
                }
                isReadOnly={isReadOnly}
                lang={tweaks.lang}
                onAccept={() => {
                  actions.accept(c.id);
                }}
                onReject={() => {
                  actions.reject(c.id);
                }}
                onDelete={() => {
                  actions.deleteCandidate(c.id);
                }}
              />
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const s = stylex.create({
  backdrop: {
    inset: 0,
    backdropFilter: "blur(2px)",
    backgroundColor: "oklch(0 0 0 / 0.36)",
    position: "fixed",
    zIndex: 1000,
  },
  content: {
    borderColor: colors.lineStrong,
    borderRadius: radii.lg,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    overflow: "hidden",
    backgroundColor: colors.paper,
    boxShadow: shadows.lg,
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    transform: "translate(-50%, -50%)",
    zIndex: 1001,
    left: "50%",
    maxHeight: "calc(100vh - 32px)",
    top: "50%",
    width: "min(560px, calc(100vw - 32px))",
  },
  head: {
    padding: "0 14px 0 18px",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    borderBottomColor: colors.line,
    borderBottomStyle: borders.solid,
    borderBottomWidth: borders.thin,
    height: 48,
  },
  title: {
    margin: 0,
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 16,
    fontWeight: 600,
  },
  close: {
    borderRadius: radii.sm,
    borderStyle: "none",
    borderWidth: 0,
    placeItems: "center",
    backgroundColor: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    color: {
      default: colors.ink3,
      ":hover": colors.ink,
    },
    cursor: "pointer",
    display: "grid",
    height: 28,
    marginLeft: "auto",
    width: 28,
  },
  list: {
    padding: "12px 18px 20px",
    gap: 8,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  note: {
    margin: 0,
    color: colors.ink3,
    fontSize: 12.5,
    fontStyle: "italic",
  },
});
