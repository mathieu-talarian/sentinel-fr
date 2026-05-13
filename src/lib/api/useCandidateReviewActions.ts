import * as Sentry from "@sentry/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import {
  importCaseCandidateAcceptMutation,
  importCaseCandidateDeleteMutation,
  importCaseCandidateRejectMutation,
  importCaseCandidatesListQueryKey,
  importCaseGetQueryKey,
  importCasePatchLineItemMutation,
} from "@/lib/api/generated/@tanstack/react-query.gen";

type ActionT = "accepting" | "rejecting" | "deleting";

export interface CandidateBusyT {
  candidateId: string;
  action: ActionT;
}

interface UseCandidateReviewActionsParamsT {
  caseId: string;
  lineId: string;
  /**
   * Fired after a reject when the rejected candidate's id matches the
   * line's current `selectedHtsCode`. Drives the clear-selection
   * follow-up prompt in `CandidatesReviewDialog`.
   */
  onPromptClear: () => void;
}

const errorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Couldn't update the candidate.";
};

/**
 * Shared mutation + busy-state plumbing for the candidate review
 * dialog. Hoisted out of the component so the dialog stays under the
 * 250-line lint cap. The hook only knows about candidate-level
 * actions plus the "clear selection" PATCH; the caller maps results
 * back to UI affordances (dialog open, prompt visibility, etc).
 */
export function useCandidateReviewActions(
  params: UseCandidateReviewActionsParamsT,
) {
  const { caseId, lineId, onPromptClear } = params;
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<CandidateBusyT | null>(null);
  const [error, setError] = useState<string | null>(null);
  const selectedCandidateIdRef = useRef<string | null>(null);

  const invalidateAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: importCaseCandidatesListQueryKey({
          path: { caseId, lineId },
        }),
      }),
      queryClient.invalidateQueries({
        queryKey: importCaseGetQueryKey({ path: { caseId } }),
      }),
    ]);
  };

  const handleError = (e: unknown, action: string) => {
    const msg = errorMessage(e);
    Sentry.addBreadcrumb({
      category: "candidates",
      level: "warning",
      message: `${action} failed`,
      data: { detail: msg },
    });
    setError(msg);
  };

  const acceptMut = useMutation({
    ...importCaseCandidateAcceptMutation(),
    meta: { tags: { "import_case.id": caseId } },
    onSuccess: async () => {
      setError(null);
      await invalidateAll();
    },
    onError: (e) => {
      handleError(e, "accept-candidate");
    },
    onSettled: () => {
      setBusy(null);
    },
  });

  const rejectMut = useMutation({
    ...importCaseCandidateRejectMutation(),
    meta: { tags: { "import_case.id": caseId } },
    onSuccess: async (_data, variables) => {
      setError(null);
      if (variables.path.candidateId === selectedCandidateIdRef.current) {
        onPromptClear();
      }
      await invalidateAll();
    },
    onError: (e) => {
      handleError(e, "reject-candidate");
    },
    onSettled: () => {
      setBusy(null);
    },
  });

  const deleteMut = useMutation({
    ...importCaseCandidateDeleteMutation(),
    meta: { tags: { "import_case.id": caseId } },
    onSuccess: async () => {
      setError(null);
      await invalidateAll();
    },
    onError: (e) => {
      handleError(e, "delete-candidate");
    },
    onSettled: () => {
      setBusy(null);
    },
  });

  const clearSelectionMut = useMutation({
    ...importCasePatchLineItemMutation(),
    meta: { tags: { "import_case.id": caseId } },
    onSuccess: async () => {
      await invalidateAll();
    },
    onError: (e) => {
      handleError(e, "clear-selection");
    },
  });

  return {
    busy,
    error,
    setError,
    /**
     * The reject mutation needs the current `selectedHtsCode` candidate
     * id at fire-time. The dialog computes it from the latest
     * candidates-list response on every render and stashes it here so
     * the mutation closure stays stable.
     */
    setSelectedCandidateId: (id: string | null) => {
      selectedCandidateIdRef.current = id;
    },
    accept: (candidateId: string) => {
      setBusy({ candidateId, action: "accepting" });
      acceptMut.mutate({ path: { caseId, lineId, candidateId } });
    },
    reject: (candidateId: string) => {
      setBusy({ candidateId, action: "rejecting" });
      rejectMut.mutate({ path: { caseId, lineId, candidateId } });
    },
    deleteCandidate: (candidateId: string) => {
      setBusy({ candidateId, action: "deleting" });
      deleteMut.mutate({ path: { caseId, lineId, candidateId } });
    },
    clearSelection: () => {
      clearSelectionMut.mutate({
        body: { selectedHtsCode: null, classificationState: "unclassified" },
        path: { caseId, lineId },
      });
    },
    clearSelectionPending: clearSelectionMut.isPending,
  };
}
