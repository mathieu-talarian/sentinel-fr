import type { CreateCaseBodyT } from "@/lib/types";

import * as Sentry from "@sentry/react";
import * as stylex from "@stylexjs/stylex";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { Button } from "@/components/atoms/Button";
import { FieldError } from "@/components/atoms/FieldError";
import { FieldLabel } from "@/components/atoms/FieldLabel";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { ErrorBanner } from "@/components/molecules/ErrorBanner";
import {
  importCaseCreateMutation,
  importCaseListQueryKey,
} from "@/lib/api/generated/@tanstack/react-query.gen";
import { useSetActiveCase } from "@/lib/state/cases";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

const TRANSPORT_OPTIONS = ["ocean", "air", "truck", "rail", "other"] as const;
type TransportT = (typeof TRANSPORT_OPTIONS)[number];

const today = () => new Date().toISOString().slice(0, 10);

const errorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  if (e && typeof e === "object" && "detail" in e) {
    const detail = (e as { detail?: unknown }).detail;
    if (typeof detail === "string") return detail;
  }
  return "Couldn't create case.";
};

/**
 * Phase 3 intake form. Title + first line description are the only
 * required fields; transport / country of origin / declared value are
 * surfaced here as optional shortcuts so a user with the basics in hand
 * doesn't have to open the workbench just to set them. Everything else
 * (incoterm, freight, insurance, additional lines, classification, etc.)
 * gets filled in inside the workbench (Phase 4+).
 */
export function NewCaseForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setActive = useSetActiveCase();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [transport, setTransport] = useState<TransportT | "">("");
  const [countryOfOrigin, setCountryOfOrigin] = useState("");
  const [declaredValueUsd, setDeclaredValueUsd] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createCase = useMutation({
    ...importCaseCreateMutation(),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: importCaseListQueryKey(),
      });
      setActive(data.id);
      void navigate({ to: "/cases/$caseId", params: { caseId: data.id } });
    },
    onError: (error) => {
      const msg = errorMessage(error);
      Sentry.addBreadcrumb({
        category: "cases",
        level: "warning",
        message: "case create failed",
        data: { detail: msg },
      });
      setSubmitError(msg);
    },
  });

  const submit = () => {
    setSubmitError(null);
    const titleTrim = title.trim();
    const descriptionTrim = description.trim();
    const titleOk = titleTrim.length > 0;
    const descriptionOk = descriptionTrim.length > 0;
    setTitleError(titleOk ? null : "Required.");
    setDescriptionError(descriptionOk ? null : "Required.");
    if (!titleOk || !descriptionOk) return;

    const declaredValue = declaredValueUsd
      ? Number.parseFloat(declaredValueUsd)
      : null;

    const body: CreateCaseBodyT = {
      title: titleTrim,
      referenceDate: today(),
      transport: transport || null,
      countryOfOrigin: countryOfOrigin.trim() || null,
      declaredValueUsd:
        declaredValue != null && Number.isFinite(declaredValue)
          ? declaredValue
          : null,
      lineItems: [{ description: descriptionTrim }],
    };

    createCase.mutate({ body });
  };

  return (
    <>
      {submitError && <ErrorBanner message={submitError} />}

      <form
        {...sx(s.form)}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        noValidate
      >
        <div {...sx(s.field)}>
          <FieldLabel htmlFor="case-title">Case title</FieldLabel>
          <Input
            id="case-title"
            value={title}
            state={titleError ? "error" : "default"}
            onValueChange={(v) => {
              setTitle(v);
              if (titleError) setTitleError(null);
            }}
            placeholder="Cotton shirts to New York"
            autoFocus
          />
          {titleError && <FieldError message={titleError} />}
        </div>

        <div {...sx(s.field)}>
          <FieldLabel htmlFor="case-line-description">
            First line description
          </FieldLabel>
          <Textarea
            id="case-line-description"
            value={description}
            state={descriptionError ? "error" : "default"}
            onValueChange={(v) => {
              setDescription(v);
              if (descriptionError) setDescriptionError(null);
            }}
            placeholder="Men's knitted cotton T-shirts, 100% cotton"
            rows={3}
          />
          {descriptionError && <FieldError message={descriptionError} />}
        </div>

        <div {...sx(s.row)}>
          <div {...sx(s.field, s.fieldHalf)}>
            <FieldLabel htmlFor="case-transport">Transport</FieldLabel>
            <select
              id="case-transport"
              value={transport}
              onChange={(e) => {
                setTransport(e.currentTarget.value as TransportT | "");
              }}
              {...sx(s.select)}
            >
              <option value="">—</option>
              {TRANSPORT_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div {...sx(s.field, s.fieldHalf)}>
            <FieldLabel htmlFor="case-coo">Country of origin</FieldLabel>
            <Input
              id="case-coo"
              value={countryOfOrigin}
              onValueChange={setCountryOfOrigin}
              placeholder="FR"
              maxLength={2}
            />
          </div>
        </div>

        <div {...sx(s.field)}>
          <FieldLabel htmlFor="case-value">Declared value (USD)</FieldLabel>
          <Input
            id="case-value"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={declaredValueUsd}
            onValueChange={setDeclaredValueUsd}
            placeholder="20000"
          />
        </div>

        <div {...sx(s.actions)}>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              void navigate({ to: "/cases" });
            }}
            disabled={createCase.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={createCase.isPending}
          >
            {createCase.isPending ? "Creating…" : "Create case"}
          </Button>
        </div>
      </form>
    </>
  );
}

const s = stylex.create({
  form: {
    gap: 14,
    display: "flex",
    flexDirection: "column",
    marginTop: 6,
  },
  field: {
    gap: 4,
    display: "flex",
    flexDirection: "column",
  },
  fieldHalf: { flex: "1", minWidth: 0 },
  row: {
    gap: 12,
    display: "flex",
  },
  select: {
    padding: "10px 12px",
    borderColor: colors.lineStrong,
    borderRadius: 8,
    borderStyle: "solid",
    borderWidth: 1,
    backgroundColor: colors.paper,
    color: colors.ink,
    fontFamily: fonts.sans,
    fontSize: 14,
    width: "100%",
  },
  actions: {
    gap: 10,
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 6,
  },
});
