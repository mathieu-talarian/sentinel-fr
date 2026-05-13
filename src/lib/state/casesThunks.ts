import type {
  CasePatchT,
  PatchCaseBodyT,
  PatchLineItemBodyT,
} from "@/lib/api/generated/types.gen";
import type { AppThunkT } from "@/lib/state/store";
import type { QueryClient } from "@tanstack/react-query";

import * as Sentry from "@sentry/react";

import {
  importCaseGetQueryKey,
  importCaseListQueryKey,
} from "@/lib/api/generated/@tanstack/react-query.gen";
import {
  importCasePatch,
  importCasePatchLineItem,
} from "@/lib/api/generated/sdk.gen";
import { casesActions } from "@/lib/state/casesSlice";

/**
 * Apply a model-suggested `CasePatchT` after the user clicks Accept.
 *
 * The patch's `path` is a JSON pointer into the `ImportCase` response
 * shape. Phase 6 supports two endpoints:
 *
 *   - `/<caseField>` → `PATCH /import-cases/{caseId}` with `{ [field]: value }`
 *   - `/lineItems/{position}/<lineField>` → resolve to line id by
 *     position, then `PATCH /import-cases/{caseId}/line-items/{lineId}`
 *     with `{ [lineField]: value }`
 *
 * Anything else is logged + dismissed without a network call; the
 * model occasionally produces unsupported paths and we'd rather drop
 * them than throw a 422.
 *
 * On success the case-detail + list queries are invalidated so
 * `useActiveCase()` refetches and the next render shows the new value.
 *
 * `queryClient` is passed in instead of importing a singleton so we
 * don't have to hoist the client out of `main.tsx`. Callers grab it
 * from the React tree (`useQueryClient()`) and forward it here.
 */
export const applyCasePatch =
  (args: {
    caseId: string;
    patchIndex: number;
    patch: CasePatchT;
    lineIdByPosition: Map<number, string>;
    queryClient: QueryClient;
  }): AppThunkT<Promise<void>> =>
  async (dispatch) => {
    const { caseId, patchIndex, patch, lineIdByPosition, queryClient } = args;
    const resolved = resolvePatch(patch, lineIdByPosition);

    if (!resolved) {
      Sentry.addBreadcrumb({
        category: "case-patch",
        level: "warning",
        message: "Unsupported patch path; dismissing.",
        data: { op: patch.op, path: patch.path },
      });
      dispatch(casesActions.resolvePatch(patchIndex));
      return;
    }

    try {
      await (resolved.kind === "case"
        ? importCasePatch({
            body: resolved.body,
            path: { caseId },
            throwOnError: true,
          })
        : importCasePatchLineItem({
            body: resolved.body,
            path: { caseId, lineId: resolved.lineId },
            throwOnError: true,
          }));
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: importCaseGetQueryKey({ path: { caseId } }),
        }),
        queryClient.invalidateQueries({
          queryKey: importCaseListQueryKey(),
        }),
      ]);
      dispatch(casesActions.resolvePatch(patchIndex));
    } catch (error) {
      Sentry.captureException(error, {
        tags: { source: "case-patch-apply" },
        extra: { caseId, op: patch.op, path: patch.path },
      });
      // Leave the patch in the tray so the user can retry or dismiss.
      throw error;
    }
  };

type ResolvedPatchT =
  | { kind: "case"; body: PatchCaseBodyT }
  | { kind: "line"; lineId: string; body: PatchLineItemBodyT };

const SUPPORTED_OPS = new Set(["add", "replace", "remove"]);

/**
 * Parse a `CasePatchT` into a typed REST call. Returns `null` for any
 * shape we don't handle yet (so callers can dismiss safely).
 *
 * Path segments use JSON pointer escaping (`~1` for `/`, `~0` for `~`);
 * Phase 6's case-field set has no slashes or tildes in keys so a
 * straight split is enough. If that ever changes, swap for a proper
 * unescaper.
 */
function resolvePatch(
  patch: CasePatchT,
  lineIdByPosition: Map<number, string>,
): ResolvedPatchT | null {
  if (!SUPPORTED_OPS.has(patch.op)) return null;
  if (!patch.path.startsWith("/")) return null;
  const segments = patch.path.slice(1).split("/");
  if (segments.length === 0 || segments[0] === "") return null;

  const value = patch.op === "remove" ? null : (patch.value ?? null);

  if (segments[0] === "lineItems") {
    if (segments.length !== 3) return null;
    const position = Number.parseInt(segments[1], 10);
    const field = segments[2];
    if (!Number.isFinite(position)) return null;
    const lineId = lineIdByPosition.get(position);
    if (!lineId) return null;
    const body = { [field]: value } as PatchLineItemBodyT;
    return { kind: "line", lineId, body };
  }

  if (segments.length !== 1) return null;
  const field = segments[0];
  const body = { [field]: value } as PatchCaseBodyT;
  return { kind: "case", body };
}
