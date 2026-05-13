import type {
  ImportCaseResponseT,
  PatchCaseBodyT,
} from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import {
  NumberField,
  SelectField,
  TextField,
  TextareaField,
} from "@/components/molecules/CaseFactsFields";
import { MissingFieldChip } from "@/components/molecules/MissingFieldChip";
import {
  importCaseGetQueryKey,
  importCaseListQueryKey,
  importCasePatchMutation,
} from "@/lib/api/generated/@tanstack/react-query.gen";
import { selectMissingCaseFacts } from "@/lib/state/caseStatus";
import { sx } from "@/lib/styles/sx";
import { colors } from "@/lib/styles/tokens.stylex";

const TRANSPORT_OPTIONS = ["ocean", "air", "truck", "rail", "other"] as const;

interface CaseFactsPanelPropsT {
  case_: ImportCaseResponseT;
  isReadOnly: boolean;
}

/**
 * Inline-editable case header fields. Each input is a controlled "draft
 * then commit" field (see `CaseFactsFields.tsx`). PATCH fires on blur,
 * only when the value differs from the persisted shape — keystroke-level
 * dispatching would batter the backend. Successful PATCH invalidates
 * both the detail query (so `useActiveCase` refetches) and the list
 * query (so the rail row's `updatedAt` ticks forward).
 */
export function CaseFactsPanel(props: Readonly<CaseFactsPanelPropsT>) {
  const { case_, isReadOnly } = props;
  const queryClient = useQueryClient();

  const patch = useMutation({
    ...importCasePatchMutation(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: importCaseGetQueryKey({ path: { caseId: case_.id } }),
        }),
        queryClient.invalidateQueries({
          queryKey: importCaseListQueryKey(),
        }),
      ]);
    },
  });

  const sendPatch = useCallback(
    (body: PatchCaseBodyT) => {
      if (isReadOnly) return;
      patch.mutate({ body, path: { caseId: case_.id } });
    },
    [case_.id, isReadOnly, patch],
  );

  const missing = selectMissingCaseFacts(case_);

  return (
    <div {...sx(s.panel)}>
      {missing.length > 0 && (
        <div {...sx(s.missingRow)}>
          <span {...sx(s.missingLabel)}>Missing for quote:</span>
          <div {...sx(s.missingChips)}>
            {missing.map((f) => (
              <MissingFieldChip key={f} field={f} />
            ))}
          </div>
        </div>
      )}

      <TextField
        id="case-title"
        label="Title"
        initial={case_.title}
        disabled={isReadOnly}
        onCommit={(v) => {
          sendPatch({ title: v });
        }}
      />

      <div {...sx(s.row)}>
        <SelectField
          id="case-transport"
          label="Transport"
          initial={case_.transport ?? ""}
          options={TRANSPORT_OPTIONS}
          disabled={isReadOnly}
          onCommit={(v) => {
            sendPatch({ transport: v || null });
          }}
        />
        <TextField
          id="case-coo"
          label="Country of origin"
          initial={case_.countryOfOrigin ?? ""}
          maxLength={2}
          disabled={isReadOnly}
          onCommit={(v) => {
            sendPatch({ countryOfOrigin: v.trim() || null });
          }}
        />
      </div>

      <div {...sx(s.row)}>
        <TextField
          id="case-origin"
          label="Origin country (exporter)"
          initial={case_.originCountry ?? ""}
          maxLength={2}
          disabled={isReadOnly}
          onCommit={(v) => {
            sendPatch({ originCountry: v.trim() || null });
          }}
        />
        <TextField
          id="case-destination"
          label="Destination"
          initial={case_.destinationCountry}
          maxLength={2}
          disabled={isReadOnly}
          onCommit={(v) => {
            sendPatch({ destinationCountry: v.trim() });
          }}
        />
      </div>

      <div {...sx(s.row)}>
        <TextField
          id="case-incoterm"
          label="Incoterm"
          initial={case_.incoterm ?? ""}
          disabled={isReadOnly}
          onCommit={(v) => {
            sendPatch({ incoterm: v.trim() || null });
          }}
        />
        <TextField
          id="case-currency"
          label="Currency"
          initial={case_.currency}
          maxLength={3}
          disabled={isReadOnly}
          onCommit={(v) => {
            sendPatch({ currency: v.trim() });
          }}
        />
      </div>

      <div {...sx(s.row)}>
        <NumberField
          id="case-value"
          label="Declared value (USD)"
          initial={case_.declaredValueUsd}
          disabled={isReadOnly}
          onCommit={(v) => {
            sendPatch({ declaredValueUsd: v });
          }}
        />
        <NumberField
          id="case-freight"
          label="Freight (USD)"
          initial={case_.freightUsd}
          disabled={isReadOnly}
          onCommit={(v) => {
            sendPatch({ freightUsd: v });
          }}
        />
      </div>

      <TextareaField
        id="case-notes"
        label="Notes"
        initial={case_.notes ?? ""}
        disabled={isReadOnly}
        onCommit={(v) => {
          sendPatch({ notes: v.trim() || null });
        }}
      />
    </div>
  );
}

const s = stylex.create({
  panel: {
    gap: 12,
    display: "flex",
    flexDirection: "column",
  },
  row: {
    gap: 10,
    display: "flex",
  },
  missingRow: {
    padding: "8px 10px",
    borderColor: colors.warnSoft,
    borderRadius: 6,
    borderStyle: "solid",
    borderWidth: 1,
    gap: 6,
    backgroundColor: colors.warnSoft,
    display: "flex",
    flexDirection: "column",
  },
  missingLabel: {
    color: colors.warn,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  },
  missingChips: {
    gap: 4,
    display: "flex",
    flexWrap: "wrap",
  },
});
