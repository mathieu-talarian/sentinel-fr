import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

import {
  importCaseGetOptions,
  importCaseListOptions,
} from "@/lib/api/generated/@tanstack/react-query.gen";
import { casesActions } from "@/lib/state/casesSlice";
import { useAppDispatch, useAppSelector } from "@/lib/state/hooks";

/**
 * Component-friendly facade over the cases slice + TanStack Query helpers.
 * Mirrors the `useChatStore` / `useTweaks` patterns: thin hooks, typed
 * dispatch, no slice action imports in components.
 *
 * Reads stay on TanStack Query — the slice only holds `activeCaseId` (and
 * later, Phase 4/6, draft edits + pending patches).
 */

export const useActiveCaseId = (): string | null =>
  useAppSelector((s) => s.cases.activeCaseId);

export const useSetActiveCase = (): ((id: string | null) => void) => {
  const dispatch = useAppDispatch();
  return useCallback(
    (id: string | null) => {
      dispatch(casesActions.setActiveCaseId(id));
    },
    [dispatch],
  );
};

/** Paginated list of cases. Always enabled — the list view is cheap. */
export const useCases = () => useQuery(importCaseListOptions());

/**
 * Full case detail for the currently active case. Returns the same shape
 * as `useQuery` so callers can render loading/error states uniformly.
 * `enabled` follows `activeCaseId`, so this is a no-op when no case is
 * selected. The error type is RFC 9457 `Problem`, mirroring the rest of
 * the codegen surface.
 */
export const useActiveCase = () => {
  const id = useActiveCaseId();
  return useQuery({
    ...importCaseGetOptions({ path: { caseId: id ?? "" } }),
    enabled: id !== null,
  });
};
