import type {
  ImportCaseResponseT,
  RiskFlagT,
  RiskSeverityT,
} from "@/lib/api/generated/types.gen";

import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Button } from "@/components/atoms/Button";
import { ErrorBanner } from "@/components/molecules/ErrorBanner";
import { RiskFlagRow } from "@/components/molecules/RiskFlagRow";
import { RiskStatusChip } from "@/components/molecules/RiskStatusChip";
import {
  importCaseGetQueryKey,
  importCaseRiskScreenLatestOptions,
  importCaseRiskScreenLatestQueryKey,
  importCaseRiskScreenRunMutation,
} from "@/lib/api/generated/@tanstack/react-query.gen";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";
import { formatRelativeDays } from "@/lib/utils/intl";

const ONE_DAY_MS = 86_400_000;

const SEVERITY_ORDER: RiskSeverityT[] = ["blocking", "review", "info"];

interface CaseRiskPanelPropsT {
  case_: ImportCaseResponseT;
  isReadOnly: boolean;
}

const pickButtonLabel = (busy: boolean, hasScreen: boolean): string => {
  if (busy) return "Running…";
  if (hasScreen) return "Re-run screen";
  return "Run screen";
};

const errorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Couldn't run the risk screen.";
};

const formatCaptured = (iso: string, lang: "en" | "fr"): string => {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / ONE_DAY_MS);
  const relative = formatRelativeDays(-Math.max(days, 0), lang);
  const time = d.toLocaleTimeString(lang, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${relative} at ${time}`;
};

const groupBySeverity = (
  flags: readonly RiskFlagT[],
): Record<RiskSeverityT, RiskFlagT[]> => {
  const groups: Record<RiskSeverityT, RiskFlagT[]> = {
    blocking: [],
    review: [],
    info: [],
  };
  for (const f of flags) groups[f.severity].push(f);
  return groups;
};

/**
 * Risk-screen panel. Fetches the latest screen for the case via
 * `importCaseRiskScreenLatest`; the Run / Re-run CTA fires
 * `importCaseRiskScreenRunMutation`. Flags render grouped by severity
 * (blocking → review → info) with `RiskFlagRow`.
 *
 * Severity coloring: blocking = red, review = amber, info = neutral.
 * FE doc explicitly warns against painting every flag red.
 */
export function CaseRiskPanel(props: Readonly<CaseRiskPanelPropsT>) {
  const { case_, isReadOnly } = props;
  const [tweaks] = useTweaks();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const latestQ = useQuery({
    ...importCaseRiskScreenLatestOptions({ path: { caseId: case_.id } }),
    // Surface no-screen-yet as `data: undefined` instead of throwing.
    throwOnError: false,
  });

  // Backend returns 404 when no screen has run; TanStack normalises that
  // into `latestQ.error`. Treat 404 as "not run" rather than an error.
  const screen = latestQ.data;

  const runMut = useMutation({
    ...importCaseRiskScreenRunMutation(),
    onSuccess: async () => {
      setError(null);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: importCaseRiskScreenLatestQueryKey({
            path: { caseId: case_.id },
          }),
        }),
        queryClient.invalidateQueries({
          queryKey: importCaseGetQueryKey({ path: { caseId: case_.id } }),
        }),
      ]);
    },
    onError: (e) => {
      const msg = errorMessage(e);
      Sentry.addBreadcrumb({
        category: "risk",
        level: "warning",
        message: "run-risk-screen failed",
        data: { detail: msg },
      });
      setError(msg);
    },
  });

  const linePositionsById = useMemo(() => {
    const map = new Map<string, number>();
    for (const line of case_.lineItems) map.set(line.id, line.position);
    return map;
  }, [case_.lineItems]);

  const groups = useMemo(
    () => (screen ? groupBySeverity(screen.flags) : null),
    [screen],
  );

  const onRun = () => {
    setError(null);
    runMut.mutate({ path: { caseId: case_.id } });
  };

  return (
    <div {...sx(s.panel)}>
      <header {...sx(s.head)}>
        <div {...sx(s.headText)}>
          <span {...sx(s.eyebrow)}>Risk screen</span>
          <RiskStatusChip status={screen ? screen.status : "notRun"} />
          {screen && (
            <span {...sx(s.captured)}>
              Ran {formatCaptured(screen.createdAt, tweaks.lang)}
            </span>
          )}
        </div>
        <Button
          variant="primary"
          onClick={onRun}
          disabled={isReadOnly || runMut.isPending}
        >
          {pickButtonLabel(runMut.isPending, screen != null)}
        </Button>
      </header>

      {error && <ErrorBanner message={error} />}

      {!screen && (
        <p {...sx(s.note)}>
          The risk screen looks for trade-remedy exposure (Chapter 99, Section
          232/301, AD/CVD, quotas), missing facts that block accurate duty math,
          and Participating Government Agency flags. Decision support, not a
          binding customs determination.
        </p>
      )}

      {screen?.summary && <p {...sx(s.summary)}>{screen.summary}</p>}

      {screen?.flags.length === 0 && screen.status === "clear" && (
        <p {...sx(s.cleared)}>
          No review flags were found from Sentinel&apos;s current checks. Keep
          the source dates with the file and re-run if the shipment date,
          origin, product composition, or selected HTS changes.
        </p>
      )}

      {groups && screen && screen.flags.length > 0 && (
        <ul {...sx(s.list)}>
          {SEVERITY_ORDER.flatMap((sev) =>
            groups[sev].map((flag, i) => (
              <RiskFlagRow
                key={`${sev}-${i.toString()}-${flag.code}`}
                flag={flag}
                linePositionsById={linePositionsById}
              />
            )),
          )}
        </ul>
      )}
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
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  eyebrow: {
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  captured: { color: colors.ink4, fontFamily: fonts.mono, fontSize: 11 },
  note: {
    margin: 0,
    padding: "10px 12px",
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderStyle: "dashed",
    borderWidth: borders.thin,
    backgroundColor: colors.paper2,
    color: colors.ink3,
    fontSize: 12,
    lineHeight: 1.5,
  },
  summary: {
    margin: 0,
    color: colors.ink2,
    fontSize: 12.5,
    lineHeight: 1.5,
  },
  cleared: {
    margin: 0,
    padding: "10px 12px",
    borderRadius: radii.sm,
    backgroundColor: colors.okSoft,
    color: colors.ok,
    fontSize: 12.5,
    lineHeight: 1.5,
  },
  list: {
    margin: 0,
    padding: 0,
    gap: 8,
    display: "flex",
    flexDirection: "column",
    listStyleType: "none",
  },
});
