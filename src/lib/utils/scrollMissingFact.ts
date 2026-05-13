import type { MissingCaseFactKeyT } from "@/lib/state/caseStatus";

// Map a missing-fact key to the matching input id in `CaseFactsPanel`.
// Lines-level deficiencies don't map to a specific input — callers should
// switch to the Lines tab instead and pass `null` here.
const FIELD_ID: Partial<Record<MissingCaseFactKeyT, string>> = {
  transport: "case-transport",
  countryOfOrigin: "case-coo",
  declaredValueUsd: "case-value",
};

/**
 * Scroll to and focus the input that owns the given missing-fact key.
 * Waits two frames so the inspector tab content has a chance to mount and
 * paint before we measure layout — `queueMicrotask` runs before the next
 * paint and would miss a freshly-switched tab.
 */
export const scrollMissingFact = (field: MissingCaseFactKeyT): void => {
  const inputId = FIELD_ID[field];
  if (!inputId) return;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = document.querySelector(`#${CSS.escape(inputId)}`);
      if (!(el instanceof HTMLElement)) return;
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) {
        el.focus();
      }
    });
  });
};
