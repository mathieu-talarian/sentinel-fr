import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { FieldLabel } from "@/components/atoms/FieldLabel";
import { Input } from "@/components/atoms/Input";
import { Textarea } from "@/components/atoms/Textarea";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

/**
 * Small "draft-then-commit" fields shared by `CaseFactsPanel` (and later
 * by any inline-editing surface).
 *
 * Each tracks a local `draft` that overrides the server-supplied `initial`
 * while the user is editing. On blur, the field commits when the draft
 * differs from `initial`, then clears the draft so subsequent server
 * pushes (e.g. an accepted `casePatchSuggestion` in Phase 6) flow through.
 *
 * The override pattern (`draft ?? initial`) avoids a `useEffect`-based
 * sync — the `react-hooks/set-state-in-effect` rule (correctly) flags
 * the effect form as a cascading-render risk.
 */

interface TextFieldPropsT {
  id: string;
  label: string;
  initial: string;
  disabled?: boolean;
  maxLength?: number;
  onCommit: (value: string) => void;
}

export function TextField(props: Readonly<TextFieldPropsT>) {
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? props.initial;
  return (
    <div {...sx(s.field)}>
      <FieldLabel htmlFor={props.id}>{props.label}</FieldLabel>
      <Input
        id={props.id}
        value={value}
        disabled={props.disabled}
        maxLength={props.maxLength}
        onValueChange={(v) => {
          setDraft(v);
        }}
        onBlur={() => {
          if (draft !== null && draft !== props.initial) {
            props.onCommit(draft);
          }
          setDraft(null);
        }}
      />
    </div>
  );
}

interface SelectFieldPropsT {
  id: string;
  label: string;
  initial: string;
  options: readonly string[];
  disabled?: boolean;
  onCommit: (value: string) => void;
}

export function SelectField(props: Readonly<SelectFieldPropsT>) {
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? props.initial;
  return (
    <div {...sx(s.field)}>
      <FieldLabel htmlFor={props.id}>{props.label}</FieldLabel>
      <select
        id={props.id}
        value={value}
        disabled={props.disabled}
        onChange={(e) => {
          const next = e.currentTarget.value;
          setDraft(next);
          if (next !== props.initial) props.onCommit(next);
        }}
        onBlur={() => {
          setDraft(null);
        }}
        {...sx(s.select)}
      >
        <option value="">—</option>
        {props.options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

interface NumberFieldPropsT {
  id: string;
  label: string;
  initial: number | null | undefined;
  disabled?: boolean;
  onCommit: (value: number | null) => void;
}

export function NumberField(props: Readonly<NumberFieldPropsT>) {
  const initialString = props.initial == null ? "" : String(props.initial);
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? initialString;
  return (
    <div {...sx(s.field)}>
      <FieldLabel htmlFor={props.id}>{props.label}</FieldLabel>
      <Input
        id={props.id}
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        value={value}
        disabled={props.disabled}
        onValueChange={(v) => {
          setDraft(v);
        }}
        onBlur={() => {
          if (draft !== null && draft !== initialString) {
            if (draft.trim() === "") {
              props.onCommit(null);
            } else {
              const parsed = Number.parseFloat(draft);
              props.onCommit(Number.isFinite(parsed) ? parsed : null);
            }
          }
          setDraft(null);
        }}
      />
    </div>
  );
}

interface TextareaFieldPropsT {
  id: string;
  label: string;
  initial: string;
  disabled?: boolean;
  onCommit: (value: string) => void;
}

export function TextareaField(props: Readonly<TextareaFieldPropsT>) {
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? props.initial;
  return (
    <div {...sx(s.field)}>
      <FieldLabel htmlFor={props.id}>{props.label}</FieldLabel>
      <Textarea
        id={props.id}
        value={value}
        rows={3}
        disabled={props.disabled}
        onValueChange={(v) => {
          setDraft(v);
        }}
        onBlur={() => {
          if (draft !== null && draft !== props.initial) {
            props.onCommit(draft);
          }
          setDraft(null);
        }}
      />
    </div>
  );
}

const s = stylex.create({
  field: {
    flex: "1",
    gap: 4,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
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
});
