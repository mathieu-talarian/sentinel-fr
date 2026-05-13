import type { BulkClassifyResponseT } from "@/lib/api/generated/types.gen";

import * as Sentry from "@sentry/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

import { BulkClassifyBar } from "@/components/molecules/BulkClassifyBar";
import { importCaseGetQueryKey } from "@/lib/api/generated/@tanstack/react-query.gen";
import { importCaseClassifyBulk } from "@/lib/api/generated/sdk.gen";

interface BulkClassifyBarContainerPropsT {
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

/**
 * Wiring for `BulkClassifyBar`: owns the `useQueryClient`, the
 * `AbortController` ref, request lifecycle state, and Sentry breadcrumbs.
 * Bulk classify is a single POST whose response carries per-line results,
 * so progress is just a spinner; the user can `Cancel` mid-flight.
 * Transport-level errors bubble through `onError` to the panel's existing
 * ErrorBanner.
 */
export function BulkClassifyBarContainer(
  props: Readonly<BulkClassifyBarContainerPropsT>,
) {
  const { caseId, unclassifiedCount, isReadOnly, onError } = props;
  const queryClient = useQueryClient();
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<BulkClassifyResponseT | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const onClassify = () => {
    void (async () => {
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
        onError(msg);
      } finally {
        abortRef.current = null;
        setRunning(false);
      }
    })();
  };

  const onCancel = () => {
    abortRef.current?.abort();
  };

  return (
    <BulkClassifyBar
      running={running}
      result={result}
      unclassifiedCount={unclassifiedCount}
      isReadOnly={isReadOnly}
      onClassify={onClassify}
      onCancel={onCancel}
    />
  );
}
