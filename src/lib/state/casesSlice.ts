import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

/**
 * Cross-component UI state for the import-case workbench.
 *
 * Reads of case data (list, detail, line items) stay on TanStack Query —
 * see `src/lib/state/cases.ts` facade. This slice holds only state that
 * needs to survive across components: which case is active in the
 * workbench, and (later) draft line-item edits + pending model-suggested
 * case patches.
 *
 * For now the slice is intentionally tiny — `draftLineEdits` is deferred
 * to Phase 4 (CaseLinesPanel inline editing) and `pendingPatches` to
 * Phase 6 (casePatchSuggestion SSE events). Adding empty scaffolding for
 * features without consumers would be designing for hypotheticals.
 */

export interface CasesStateT {
  /** `null` when no case is active (e.g. on `/cases` index, or never set). */
  activeCaseId: string | null;
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
};

const slice = createSlice({
  name: "cases",
  initialState: INITIAL,
  reducers: {
    setActiveCaseId(state, action: PayloadAction<string | null>) {
      state.activeCaseId = action.payload;
    },
  },
});

export const casesActions = slice.actions;
export const casesReducer = slice.reducer;
