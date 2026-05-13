import type { CasePatchT } from "@/lib/types";
import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

/**
 * Cross-component UI state for the import-case workbench.
 *
 * Reads of case data (list, detail, line items) stay on TanStack Query —
 * see `src/lib/state/cases.ts` facade. This slice holds only state that
 * needs to survive across components:
 *
 *   - `activeCaseId` — drives the rail's "you are here" indicator and
 *     the `useActiveCase()` query.
 *   - `pendingPatches` — `casePatchSuggestion` chunks accepted off the
 *     case-aware chat stream, awaiting user accept/dismiss in
 *     `CasePatchTray`. Phase 6 surface.
 *
 * `draftLineEdits` is still deferred to Phase 4-onwards inline editing
 * if a real consumer needs it; the field components in
 * `CaseFactsFields.tsx` track their own local drafts for now.
 */

export interface CasesStateT {
  activeCaseId: string | null;
  pendingPatches: CasePatchT[];
}

const STORAGE_KEY = "sentinel.cases.activeId.v1";

function loadActiveCaseId(): string | null {
  if (typeof localStorage === "undefined") return null;
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function persistActiveCaseId(id: string | null) {
  try {
    if (id === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // localStorage may be unavailable (private mode, SSR) — non-fatal
  }
}

const INITIAL: CasesStateT = {
  activeCaseId: loadActiveCaseId(),
  pendingPatches: [],
};

const slice = createSlice({
  name: "cases",
  initialState: INITIAL,
  reducers: {
    setActiveCaseId(state, action: PayloadAction<string | null>) {
      state.activeCaseId = action.payload;
      // Switching cases drops pending patches from the prior case — they
      // were scoped to that case's chat and don't make sense to apply
      // to a different one.
      state.pendingPatches = [];
    },
    pushPendingPatches(state, action: PayloadAction<CasePatchT[]>) {
      state.pendingPatches.push(...action.payload);
    },
    resolvePatch(state, action: PayloadAction<number>) {
      state.pendingPatches.splice(action.payload, 1);
    },
    clearPendingPatches(state) {
      state.pendingPatches = [];
    },
  },
});

export const casesActions = slice.actions;
export const casesReducer = slice.reducer;
