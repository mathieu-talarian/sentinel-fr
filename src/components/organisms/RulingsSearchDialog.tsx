import type { ImportCaseLineItemResponseT } from "@/lib/api/generated/types.gen";

import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog } from "radix-ui";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { Icon } from "@/components/atoms/Icons";
import { Input } from "@/components/atoms/Input";
import { RulingsSearchResult } from "@/components/molecules/RulingsSearchResult";
import {
  importCaseGetQueryKey,
  importCaseRulingAttachMutation,
  rulingsSearchOptions,
} from "@/lib/api/generated/@tanstack/react-query.gen";
import { sx } from "@/lib/styles/sx";
import {
  borders,
  colors,
  fonts,
  radii,
  shadows,
} from "@/lib/styles/tokens.stylex";

type VerdictT = "yes" | "no" | "unknown";

interface RulingsSearchDialogPropsT {
  caseId: string;
  /** Case's line items, sorted by position by the parent. */
  lineItems: readonly ImportCaseLineItemResponseT[];
  open: boolean;
  isReadOnly: boolean;
  onOpenChange: (open: boolean) => void;
}

const errorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Search failed.";
};

/**
 * Search CROSS rulings and attach them to the active case. Phase 8
 * minimum: every result row gets three verdict buttons (Supports /
 * Conflicts / Reference). Attach is case-level — pinning to a specific
 * line item is a Phase 8.5 enhancement.
 *
 * Attaching invalidates the case-detail query so the evidence panel
 * re-renders with the new card; the dialog stays open so the user can
 * keep attaching from the same result set.
 */
export function RulingsSearchDialog(
  props: Readonly<RulingsSearchDialogPropsT>,
) {
  const { caseId, open, isReadOnly } = props;
  const queryClient = useQueryClient();

  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [attachedNumbers, setAttachedNumbers] = useState<Set<string>>(
    () => new Set(),
  );

  const searchQ = useQuery({
    ...rulingsSearchOptions({ query: { q: submittedQuery, limit: 10 } }),
    enabled: submittedQuery.length > 0,
    throwOnError: false,
  });

  const attachMut = useMutation({
    ...importCaseRulingAttachMutation(),
    meta: { tags: { "import_case.id": caseId } },
    onSuccess: async (_data, variables) => {
      setError(null);
      setAttachedNumbers((prev) =>
        new Set(prev).add(variables.body.rulingNumber),
      );
      await queryClient.invalidateQueries({
        queryKey: importCaseGetQueryKey({ path: { caseId } }),
      });
    },
    onError: (e) => {
      const msg = errorMessage(e);
      Sentry.addBreadcrumb({
        category: "rulings",
        level: "warning",
        message: "attach-ruling failed",
        data: { detail: msg },
      });
      setError(msg);
    },
    onSettled: () => {
      setBusyKey(null);
    },
  });

  const submitSearch = () => {
    const next = query.trim();
    if (!next) return;
    setSubmittedQuery(next);
  };

  const onAttach = (
    rulingNumber: string,
    verdict: VerdictT,
    opts: { lineItemId: string | null; matchNote: string | null },
  ) => {
    setError(null);
    setBusyKey(`${rulingNumber}:${verdict}`);
    attachMut.mutate({
      body: {
        rulingNumber,
        supportsSelectedCode: verdict,
        lineItemId: opts.lineItemId,
        matchNote: opts.matchNote,
      },
      path: { caseId },
    });
  };

  const results = searchQ.data?.rulings ?? [];

  return (
    <Dialog.Root open={open} onOpenChange={props.onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay {...sx(s.backdrop)} />
        <Dialog.Content {...sx(s.content)}>
          <div {...sx(s.head)}>
            <Dialog.Title {...sx(s.title)}>Attach CROSS ruling</Dialog.Title>
            <Dialog.Close {...sx(s.close)} aria-label="Close dialog">
              <Icon.X />
            </Dialog.Close>
          </div>

          <form
            {...sx(s.searchRow)}
            onSubmit={(e) => {
              e.preventDefault();
              submitSearch();
            }}
          >
            <Input
              value={query}
              onValueChange={setQuery}
              placeholder="Subject keywords, HTS prefix, or material…"
            />
            <Button type="submit" variant="primary" disabled={!query.trim()}>
              Search
            </Button>
          </form>

          {error && <p {...sx(s.error)}>{error}</p>}

          <div {...sx(s.results)}>
            {searchQ.isFetching && <p {...sx(s.note)}>Searching…</p>}
            {!searchQ.isFetching && submittedQuery && results.length === 0 && (
              <p {...sx(s.note)}>
                No matching rulings for &ldquo;{submittedQuery}&rdquo;.
              </p>
            )}
            {results.map((r) => {
              const busyVerdict = ((["yes", "no", "unknown"] as const).find(
                (v) => busyKey === `${r.rulingNumber}:${v}`,
              ) ?? null) satisfies VerdictT | null;
              return (
                <RulingsSearchResult
                  key={r.rulingNumber}
                  ruling={r}
                  busyVerdict={busyVerdict}
                  attached={attachedNumbers.has(r.rulingNumber)}
                  isReadOnly={isReadOnly}
                  lineItems={props.lineItems}
                  onAttach={(v, opts) => {
                    onAttach(r.rulingNumber, v, opts);
                  }}
                />
              );
            })}
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
    width: "min(540px, calc(100vw - 32px))",
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
  searchRow: {
    padding: "14px 18px 0",
    gap: 8,
    display: "flex",
  },
  error: {
    margin: "8px 18px 0",
    color: colors.err,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  results: {
    padding: "12px 18px 20px",
    gap: 10,
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
