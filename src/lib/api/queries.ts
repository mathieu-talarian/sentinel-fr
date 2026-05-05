import type { SessionView } from "@/lib/api/generated/types.gen";

import { queryOptions } from "@tanstack/react-query";

import { authMeQueryKey } from "@/lib/api/generated/@tanstack/react-query.gen";
import { authMe } from "@/lib/api/generated/sdk.gen";

/**
 * Hand-tuned wrapper over `authMeOptions`.
 *
 * The generated `authMeOptions` throws on every non-2xx (including the 401
 * that means "not signed in"), which would make route-guard
 * `ensureQueryData(meQueryOptions())` throw too. We wrap the queryFn so a
 * 401 resolves to `null` and unwrap the `SessionEnvelope` so consumers see
 * a flat `SessionView | null`.
 *
 * Every other query (`conversationsListOptions`, `frontendAlertsOptions`,
 * `catalogStatsOptions`) is fine as-is — import them directly from
 * `@/lib/api/generated/@tanstack/react-query.gen` at use sites instead of
 * routing through this file. ESLint's `no-barrel-files` rule blocks pure
 * re-exports anyway.
 */

export const ME_QUERY_KEY = authMeQueryKey();

const problemMessage = (
  e: { detail?: unknown; title?: unknown },
  fallback: string,
): string => {
  if (typeof e.detail === "string") return e.detail;
  if (typeof e.title === "string") return e.title;
  return fallback;
};

export const meQueryOptions = () =>
  queryOptions({
    queryKey: ME_QUERY_KEY,
    queryFn: async ({ signal }): Promise<SessionView | null> => {
      const r = await authMe({ signal, throwOnError: false });
      const status = r.response?.status ?? 0;
      if (status === 401) return null;
      if (r.error) {
        throw new Error(
          problemMessage(r.error, `/auth/me: ${status.toString()}`),
        );
      }
      return r.data.session;
    },
    staleTime: 5 * 60_000,
    gcTime: Infinity,
    retry: false,
  });
