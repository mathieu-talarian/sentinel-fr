import type {
  CaseRulingViewT,
  ImportCaseResponseT,
} from "@/lib/api/generated/types.gen";

import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Button } from "@/components/atoms/Button";
import { CaseRulingCard } from "@/components/molecules/CaseRulingCard";
import { ErrorBanner } from "@/components/molecules/ErrorBanner";
import { RulingsSearchDialog } from "@/components/organisms/RulingsSearchDialog";
import {
  importCaseGetQueryKey,
  importCaseRulingDetachMutation,
  importCaseRulingRefreshMutation,
} from "@/lib/api/generated/@tanstack/react-query.gen";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

interface CaseEvidencePanelPropsT {
  case_: ImportCaseResponseT;
  isReadOnly: boolean;
}

type GroupKeyT = "supports" | "conflicts" | "reference";

const GROUP_LABELS: Record<GroupKeyT, string> = {
  supports: "Supports the selected code",
  conflicts: "Conflicts with the selected code",
  reference: "Reference only",
};

const verdictToGroup = (verdict: string): GroupKeyT => {
  if (verdict === "yes") return "supports";
  if (verdict === "no") return "conflicts";
  return "reference";
};

const groupRulings = (
  rulings: readonly CaseRulingViewT[],
): Record<GroupKeyT, CaseRulingViewT[]> => {
  const groups: Record<GroupKeyT, CaseRulingViewT[]> = {
    supports: [],
    conflicts: [],
    reference: [],
  };
  for (const r of rulings) {
    groups[verdictToGroup(r.supportsSelectedCode)].push(r);
  }
  return groups;
};

const errorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Couldn't detach the ruling.";
};

/**
 * Evidence tab in the inspector. Lists attached CROSS rulings grouped
 * by the user's verdict on whether each ruling supports the line's
 * selected HTS code. "Add ruling" opens `RulingsSearchDialog`; per-card
 * Detach hits `importCaseRulingDetach`. Read-only when archived.
 */
export function CaseEvidencePanel(props: Readonly<CaseEvidencePanelPropsT>) {
  const { case_, isReadOnly } = props;
  const queryClient = useQueryClient();
  const [searchOpen, setSearchOpen] = useState(false);
  const [detachingNumber, setDetachingNumber] = useState<string | null>(null);
  const [refreshingNumber, setRefreshingNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const invalidateCase = () =>
    queryClient.invalidateQueries({
      queryKey: importCaseGetQueryKey({ path: { caseId: case_.id } }),
    });

  const detachMut = useMutation({
    ...importCaseRulingDetachMutation(),
    meta: { tags: { "import_case.id": case_.id } },
    onSuccess: async () => {
      setError(null);
      await invalidateCase();
    },
    onError: (e) => {
      const msg = errorMessage(e);
      Sentry.addBreadcrumb({
        category: "rulings",
        level: "warning",
        message: "detach-ruling failed",
        data: { detail: msg },
      });
      setError(msg);
    },
    onSettled: () => {
      setDetachingNumber(null);
    },
  });

  const refreshMut = useMutation({
    ...importCaseRulingRefreshMutation(),
    meta: { tags: { "import_case.id": case_.id } },
    onSuccess: async () => {
      setError(null);
      await invalidateCase();
    },
    onError: (e) => {
      setError(errorMessage(e));
    },
    onSettled: () => {
      setRefreshingNumber(null);
    },
  });

  const rulings = useMemo(() => case_.rulings ?? [], [case_.rulings]);
  const groups = useMemo(() => groupRulings(rulings), [rulings]);

  const linePositionsById = useMemo(() => {
    const map = new Map<string, number>();
    for (const line of case_.lineItems) map.set(line.id, line.position);
    return map;
  }, [case_.lineItems]);

  const onDetach = (rulingNumber: string) => {
    setError(null);
    setDetachingNumber(rulingNumber);
    detachMut.mutate({ path: { caseId: case_.id, rulingNumber } });
  };

  const onRefresh = (rulingNumber: string) => {
    setError(null);
    setRefreshingNumber(rulingNumber);
    refreshMut.mutate({ path: { caseId: case_.id, rulingNumber } });
  };

  return (
    <div {...sx(s.panel)}>
      <header {...sx(s.head)}>
        <div {...sx(s.headText)}>
          <span {...sx(s.eyebrow)}>Evidence</span>
          <span {...sx(s.count)}>{rulings.length} attached</span>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSearchOpen(true);
          }}
          disabled={isReadOnly}
        >
          Add ruling
        </Button>
      </header>

      {error && <ErrorBanner message={error} />}

      {rulings.length === 0 ? (
        <p {...sx(s.empty)}>
          Attach prior CBP rulings as evidence for the selected HTS codes.
          Similar rulings increase confidence; conflicting rulings are a signal
          to pause, document the reasoning, or request a binding ruling before
          shipping.
        </p>
      ) : (
        (["supports", "conflicts", "reference"] as const).map((g) => {
          const items = groups[g];
          if (items.length === 0) return null;
          return (
            <section key={g} {...sx(s.group)}>
              <h3 {...sx(s.groupTitle)}>
                {GROUP_LABELS[g]} · {items.length}
              </h3>
              <div {...sx(s.list)}>
                {items.map((r) => (
                  <CaseRulingCard
                    key={r.rulingNumber}
                    ruling={r}
                    linePositionsById={linePositionsById}
                    detaching={detachingNumber === r.rulingNumber}
                    refreshing={refreshingNumber === r.rulingNumber}
                    isReadOnly={isReadOnly}
                    onDetach={() => {
                      onDetach(r.rulingNumber);
                    }}
                    onRefresh={() => {
                      onRefresh(r.rulingNumber);
                    }}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}

      <RulingsSearchDialog
        caseId={case_.id}
        lineItems={case_.lineItems}
        open={searchOpen}
        isReadOnly={isReadOnly}
        onOpenChange={setSearchOpen}
      />
    </div>
  );
}

const s = stylex.create({
  panel: { gap: 12, display: "flex", flexDirection: "column" },
  head: {
    gap: 12,
    alignItems: "flex-start",
    display: "flex",
    justifyContent: "space-between",
  },
  headText: {
    gap: 6,
    alignItems: "baseline",
    display: "flex",
  },
  eyebrow: {
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  count: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
  empty: {
    margin: 0,
    padding: "12px 14px",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: "dashed",
    borderWidth: borders.thin,
    backgroundColor: colors.paper2,
    color: colors.ink3,
    fontSize: 12,
    lineHeight: 1.5,
  },
  group: {
    gap: 6,
    display: "flex",
    flexDirection: "column",
  },
  groupTitle: {
    margin: 0,
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  list: {
    gap: 8,
    display: "flex",
    flexDirection: "column",
  },
});
