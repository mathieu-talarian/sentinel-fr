import type { BulkClassifyResponseT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { Button } from "@/components/atoms/Button";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";

interface BulkClassifyBarPropsT {
  running: boolean;
  result: BulkClassifyResponseT | null;
  unclassifiedCount: number;
  isReadOnly: boolean;
  onClassify: () => void;
  onCancel: () => void;
}

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

export function BulkClassifyBar(props: Readonly<BulkClassifyBarPropsT>) {
  const {
    running,
    result,
    unclassifiedCount,
    isReadOnly,
    onClassify,
    onCancel,
  } = props;

  if (!running && !result && unclassifiedCount === 0) return null;

  const counts = result ? countResults(result) : null;
  const failed = result?.results.filter((r) => r.status === "failed") ?? [];

  return (
    <>
      <div {...sx(s.bar)}>
        <span {...sx(s.label)}>{labelFor(running, unclassifiedCount)}</span>
        {running ? (
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={onClassify}
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
