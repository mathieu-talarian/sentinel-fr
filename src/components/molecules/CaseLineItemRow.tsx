import type { ImportCaseLineItemResponseT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";

import { Button } from "@/components/atoms/Button";
import { CandidateReviewChip } from "@/components/molecules/CandidateReviewChip";
import { ClassificationStateChip } from "@/components/molecules/ClassificationStateChip";
import { HtsCodeBadge } from "@/components/molecules/HtsCodeBadge";
import { MissingFieldChip } from "@/components/molecules/MissingFieldChip";
import { selectMissingLineFacts } from "@/lib/state/caseStatus";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";
import { formatUsd } from "@/lib/utils/intl";

interface CaseLineItemRowPropsT {
  line: ImportCaseLineItemResponseT;
  /** When set, the row shows the case-level CoO in muted text as a hint. */
  caseCountryOfOrigin?: string | null;
  classifying: boolean;
  isReadOnly: boolean;
  onClassify: () => void;
  onRemove: () => void;
  onReviewCandidates: () => void;
}

export function CaseLineItemRow(props: Readonly<CaseLineItemRowPropsT>) {
  const { line, caseCountryOfOrigin, classifying, isReadOnly } = props;
  const missing = selectMissingLineFacts(line);
  const country = line.countryOfOrigin ?? caseCountryOfOrigin ?? null;
  const usesCaseDefault = !line.countryOfOrigin && Boolean(caseCountryOfOrigin);

  return (
    <li {...sx(s.row)}>
      <div {...sx(s.head)}>
        <span {...sx(s.position)}>#{line.position}</span>
        <span {...sx(s.description)}>{line.description}</span>
        <ClassificationStateChip state={line.classificationState} />
      </div>

      <div {...sx(s.meta)}>
        {line.selectedHtsCode && (
          <HtsCodeBadge code={line.selectedHtsCode} tone="selected" />
        )}
        {line.selectedRateText && (
          <span {...sx(s.rate)}>{line.selectedRateText}</span>
        )}
        {line.customsValueUsd != null && (
          <span {...sx(s.value)}>{formatUsd(line.customsValueUsd)}</span>
        )}
        {line.quantity != null && (
          <span {...sx(s.quantity)}>
            {line.quantity}
            {line.quantityUnit ? ` ${line.quantityUnit}` : ""}
          </span>
        )}
        {country && (
          <span {...sx(s.country)}>
            {country}
            {usesCaseDefault && (
              <span {...sx(s.countryHint)}> · case default</span>
            )}
          </span>
        )}
        <CandidateReviewChip
          summary={line.candidateSummary}
          onClick={props.onReviewCandidates}
        />
      </div>

      {missing.length > 0 && (
        <div {...sx(s.missing)}>
          {missing.map((f) => (
            <MissingFieldChip key={f} field={f} />
          ))}
        </div>
      )}

      <div {...sx(s.actions)}>
        <Button
          variant="secondary"
          onClick={props.onClassify}
          disabled={isReadOnly || classifying}
        >
          {classifying ? "Classifying…" : "Classify"}
        </Button>
        <Button
          variant="danger"
          onClick={props.onRemove}
          disabled={isReadOnly || classifying}
        >
          Remove
        </Button>
      </div>
    </li>
  );
}

const s = stylex.create({
  row: {
    padding: "12px 12px",
    borderColor: colors.line,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 8,
    backgroundColor: colors.paper,
    display: "flex",
    flexDirection: "column",
  },
  head: {
    gap: 8,
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  position: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
    fontWeight: 500,
  },
  description: {
    flex: "1",
    color: colors.ink,
    fontSize: 13,
    minWidth: 0,
  },
  meta: {
    gap: 10,
    alignItems: "center",
    display: "flex",
    flexWrap: "wrap",
  },
  rate: {
    color: colors.ink2,
    fontFamily: fonts.mono,
    fontSize: 11.5,
    fontVariantNumeric: "tabular-nums",
  },
  value: {
    color: colors.ink2,
    fontFamily: fonts.mono,
    fontSize: 11.5,
    fontVariantNumeric: "tabular-nums",
  },
  quantity: {
    color: colors.ink3,
    fontFamily: fonts.mono,
    fontSize: 11.5,
  },
  country: {
    color: colors.ink3,
    fontFamily: fonts.mono,
    fontSize: 11.5,
  },
  countryHint: {
    color: colors.ink4,
    fontStyle: "italic",
  },
  missing: {
    gap: 4,
    display: "flex",
    flexWrap: "wrap",
  },
  actions: {
    gap: 8,
    display: "flex",
    justifyContent: "flex-end",
  },
});
