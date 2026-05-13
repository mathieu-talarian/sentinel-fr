import type {
  CreateLineItemBodyT,
  ImportCaseResponseT,
} from "@/lib/api/generated/types.gen";

import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { FieldLabel } from "@/components/atoms/FieldLabel";
import { Textarea } from "@/components/atoms/Textarea";
import { CaseLineItemRow } from "@/components/molecules/CaseLineItemRow";
import { ErrorBanner } from "@/components/molecules/ErrorBanner";
import {
  importCaseAddLineItemMutation,
  importCaseDeleteLineItemMutation,
  importCaseGetQueryKey,
  importCaseLineClassifyMutation,
} from "@/lib/api/generated/@tanstack/react-query.gen";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

interface CaseLinesPanelPropsT {
  case_: ImportCaseResponseT;
  isReadOnly: boolean;
}

const errorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return "Something went wrong.";
};

/**
 * Line-items list + add-line affordance + per-line classify trigger.
 *
 * Classification is fire-and-refetch: kick the mutation, the case query
 * gets invalidated on success and `useActiveCase()` propagates the new
 * `selectedHtsCode` / `candidates` / `classificationState` back into the
 * row. We track which line is currently in-flight locally so only that
 * row's button shows a busy state.
 */
export function CaseLinesPanel(props: Readonly<CaseLinesPanelPropsT>) {
  const { case_, isReadOnly } = props;
  const queryClient = useQueryClient();
  const caseQueryKey = importCaseGetQueryKey({ path: { caseId: case_.id } });

  const [newDescription, setNewDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [classifyingId, setClassifyingId] = useState<string | null>(null);

  const invalidateCase = () =>
    queryClient.invalidateQueries({ queryKey: caseQueryKey });

  const addLine = useMutation({
    ...importCaseAddLineItemMutation(),
    meta: { tags: { "import_case.id": case_.id } },
    onSuccess: async () => {
      setNewDescription("");
      await invalidateCase();
    },
    onError: (e) => {
      const msg = errorMessage(e);
      Sentry.addBreadcrumb({
        category: "cases",
        level: "warning",
        message: "add-line failed",
        data: { detail: msg },
      });
      setError(msg);
    },
  });

  const deleteLine = useMutation({
    ...importCaseDeleteLineItemMutation(),
    meta: { tags: { "import_case.id": case_.id } },
    onSuccess: () => invalidateCase(),
    onError: (e) => {
      setError(errorMessage(e));
    },
  });

  const classifyLine = useMutation({
    ...importCaseLineClassifyMutation(),
    meta: { tags: { "import_case.id": case_.id } },
    onSettled: () => {
      setClassifyingId(null);
    },
    onSuccess: () => invalidateCase(),
    onError: (e) => {
      setError(errorMessage(e));
    },
  });

  const onAdd = () => {
    setError(null);
    const description = newDescription.trim();
    if (!description) return;
    const body: CreateLineItemBodyT = { description };
    addLine.mutate({ body, path: { caseId: case_.id } });
  };

  const onClassify = (lineId: string) => {
    setError(null);
    setClassifyingId(lineId);
    classifyLine.mutate({
      body: { attachCandidates: true },
      path: { caseId: case_.id, lineId },
    });
  };

  const onRemove = (lineId: string) => {
    setError(null);
    deleteLine.mutate({ path: { caseId: case_.id, lineId } });
  };

  const sortedLines = case_.lineItems.toSorted(
    (a, b) => a.position - b.position,
  );

  return (
    <div {...sx(s.panel)}>
      {error && <ErrorBanner message={error} />}

      {sortedLines.length === 0 ? (
        <p {...sx(s.empty)}>
          No line items yet. Add the first one below — at least one line is
          required before a quote can run.
        </p>
      ) : (
        <ul {...sx(s.list)}>
          {sortedLines.map((line) => (
            <CaseLineItemRow
              key={line.id}
              line={line}
              caseCountryOfOrigin={case_.countryOfOrigin}
              classifying={classifyingId === line.id}
              isReadOnly={isReadOnly}
              onClassify={() => {
                onClassify(line.id);
              }}
              onRemove={() => {
                onRemove(line.id);
              }}
            />
          ))}
        </ul>
      )}

      {!isReadOnly && (
        <div {...sx(s.addRow)}>
          <FieldLabel htmlFor="case-new-line">Add a line</FieldLabel>
          <Textarea
            id="case-new-line"
            value={newDescription}
            rows={2}
            onValueChange={setNewDescription}
            placeholder="Describe the next product…"
          />
          <div {...sx(s.addActions)}>
            <Button
              variant="primary"
              onClick={onAdd}
              disabled={addLine.isPending || !newDescription.trim()}
            >
              {addLine.isPending ? "Adding…" : "Add line"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

const s = stylex.create({
  panel: {
    gap: 12,
    display: "flex",
    flexDirection: "column",
  },
  list: {
    margin: 0,
    padding: 0,
    gap: 8,
    display: "flex",
    flexDirection: "column",
    listStyleType: "none",
  },
  empty: {
    margin: 0,
    padding: "12px 14px",
    borderColor: colors.line,
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    backgroundColor: colors.paper2,
    color: colors.ink3,
    fontSize: 12.5,
    fontStyle: "italic",
  },
  addRow: {
    padding: "12px",
    borderColor: colors.line,
    borderRadius: 8,
    borderStyle: "solid",
    borderWidth: 1,
    gap: 8,
    backgroundColor: colors.paper2,
    display: "flex",
    flexDirection: "column",
  },
  addActions: {
    display: "flex",
    justifyContent: "flex-end",
  },
  // Unused stub kept to make sure the import stays valid in tooling.
  _: {
    fontFamily: fonts.sans,
  },
});
