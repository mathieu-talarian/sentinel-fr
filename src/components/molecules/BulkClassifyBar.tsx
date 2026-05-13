import type { BulkClassifyResponseT } from "@/lib/api/generated/types.gen";

import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { Button } from "@/components/atoms/Button";
import { importCaseGetQueryKey } from "@/lib/api/generated/@tanstack/react-query.gen";
import { importCaseClassifyBulk } from "@/lib/api/generated/sdk.gen";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

interface BulkClassifyBarPropsT {
  caseId: string;
  unclassifiedCount: number;
  isReadOnly: boolean;
  /** Bubble user-facing failures up to the panel's `ErrorBanner`. */
  onError: (msg: string) => void;
}

const errorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Bulk classify failed.";
};

const countResults = (
  result: BulkClassifyResponseT,
): { ok: number; skipped: number; failed: number } => {
  let ok = 0;
  let skipped = 0;
  let failed = 0;
  for (const r of result.results) {
    if (r.status === "ok") ok++;
    else if (r.status === "skipped") skipped++;
    else failed++;
  }
  return { ok, skipped, failed };
};

const labelFor = (running: boolean, unclassifiedCount: number): string => {
  if (running) return "Classifying unclassified lines…";
  const noun = unclassifiedCount === 1 ? "line" : "lines";
  return `${unclassifiedCount.toString()} unclassified ${noun}`;
};

/**
 * The "Classify all" bar inside `CaseLinesPanel`. Bulk classify is a
 * single POST whose response carries per-line results, so progress is
 * just a spinner; the user can `Cancel` mid-flight via an
 * AbortController. Per-line failures surface as a small summary below
 * the bar after the run settles; transport-level errors bubble through
 * `onError` to the panel's existing ErrorBanner.
 */
export function BulkClassifyBar(props: Readonly<BulkClassifyBarPropsT>) {
  const { caseId, unclassifiedCount, isReadOnly } = props;
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BulkClassifyResponseT | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const onClassify = async () => {
    setResult(null);
    const controller = new AbortController();
    abortRef.current = controller;
    setRunning(true);
    try {
      const res = await importCaseClassifyBulk({
        body: { onlyUnclassified: true, attachCandidates: true },
        path: { caseId },
        signal: controller.signal,
        throwOnError: true,
      });
      setResult(res.data);
      await queryClient.invalidateQueries({
        queryKey: importCaseGetQueryKey({ path: { caseId } }),
      });
    } catch (error) {
      if (controller.signal.aborted) return;
      const msg = errorMessage(error);
      Sentry.addBreadcrumb({
        category: "cases",
        level: "warning",
        message: "bulk-classify failed",
        data: { detail: msg },
      });
      props.onError(msg);
    } finally {
      abortRef.current = null;
      setRunning(false);
    }
  };

  if (!running && !result && unclassifiedCount === 0) return null;

  const counts = result ? countResults(result) : null;
  const failed = result?.results.filter((r) => r.status === "failed") ?? [];

  return (
    <>
      <div {...sx(s.bar)}>
        <span {...sx(s.label)}>{labelFor(running, unclassifiedCount)}</span>
        {running ? (
          <Button
            variant="secondary"
            onClick={() => {
              abortRef.current?.abort();
            }}
          >
            Cancel
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={() => {
              void onClassify();
            }}
            disabled={isReadOnly || unclassifiedCount === 0}
          >
            Classify all
          </Button>
        )}
      </div>
      {counts && !running && (
        <div {...sx(s.summary)}>
          <span {...sx(s.summaryLine)}>
            {counts.ok} classified · {counts.skipped} skipped · {counts.failed}{" "}
            failed
          </span>
          {failed.length > 0 && (
            <ul {...sx(s.summaryList)}>
              {failed.map((f) => (
                <li key={f.line_item_id} {...sx(s.summaryFailure)}>
                  {f.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}

const s = stylex.create({
  bar: {
    padding: "8px 12px",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 10,
    alignItems: "center",
    backgroundColor: colors.paper2,
    display: "flex",
    justifyContent: "space-between",
  },
  label: {
    color: colors.ink2,
    fontSize: 12.5,
    fontWeight: 500,
  },
  summary: {
    padding: "8px 12px",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: "dashed",
    borderWidth: borders.thin,
    gap: 6,
    backgroundColor: colors.paper2,
    color: colors.ink3,
    display: "flex",
    flexDirection: "column",
    fontSize: 12,
  },
  summaryLine: { color: colors.ink2, fontWeight: 500 },
  summaryList: { margin: 0, paddingLeft: 16 },
  summaryFailure: {
    margin: "2px 0",
    color: colors.err,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
});
