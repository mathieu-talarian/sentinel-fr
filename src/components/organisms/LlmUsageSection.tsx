import type { LlmUsageRowT } from "@/lib/api/generated/types.gen";

import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { FieldLabel } from "@/components/atoms/FieldLabel";
import { Input } from "@/components/atoms/Input";
import { Section } from "@/components/molecules/Section";
import { adminLlmUsageOptions } from "@/lib/api/generated/@tanstack/react-query.gen";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";
import { formatInteger, formatPercent } from "@/lib/utils/intl";

const THIRTY_DAYS_MS = 30 * 86_400_000;

interface ProviderAggT {
  provider: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedInputTokens: number;
}

const toDateInput = (iso: string): string => iso.slice(0, 10);

const fromDateInput = (date: string, endOfDay: boolean): string => {
  if (!date) return "";
  return endOfDay ? `${date}T23:59:59Z` : `${date}T00:00:00Z`;
};

const aggregateByProvider = (rows: readonly LlmUsageRowT[]): ProviderAggT[] => {
  const map = new Map<string, ProviderAggT>();
  for (const r of rows) {
    const acc = map.get(r.provider) ?? {
      provider: r.provider,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      cachedInputTokens: 0,
    };
    acc.inputTokens += r.inputTokens;
    acc.outputTokens += r.outputTokens;
    acc.totalTokens += r.totalTokens;
    acc.cachedInputTokens += r.cachedInputTokens;
    map.set(r.provider, acc);
  }
  return [...map.values()].toSorted((a, b) => b.totalTokens - a.totalTokens);
};

const defaultFrom = (): string =>
  toDateInput(new Date(Date.now() - THIRTY_DAYS_MS).toISOString());
const defaultTo = (): string => toDateInput(new Date().toISOString());

/**
 * Settings widget — 30-day LLM token usage stacked by provider. Date
 * range defaults to "last 30 days"; users can override via the two
 * native date inputs. The widget shows a horizontal stacked bar (one
 * segment per provider) plus a per-provider table with the input /
 * output / cached splits.
 */
export function LlmUsageSection() {
  const [tweaks] = useTweaks();
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const q = useQuery({
    ...adminLlmUsageOptions({
      query: {
        from: fromDateInput(from, false),
        to: fromDateInput(to, true),
      },
    }),
    throwOnError: false,
  });

  const providers = useMemo(
    () => aggregateByProvider(q.data?.rows ?? []),
    [q.data?.rows],
  );
  const totalTokens = providers.reduce((acc, p) => acc + p.totalTokens, 0);

  return (
    <Section label="LLM usage">
      <div {...sx(s.dateRow)}>
        <div {...sx(s.dateField)}>
          <FieldLabel htmlFor="usage-from">From</FieldLabel>
          <Input
            id="usage-from"
            type="date"
            value={from}
            onValueChange={setFrom}
          />
        </div>
        <div {...sx(s.dateField)}>
          <FieldLabel htmlFor="usage-to">To</FieldLabel>
          <Input id="usage-to" type="date" value={to} onValueChange={setTo} />
        </div>
      </div>

      {q.isLoading && <p {...sx(s.note)}>Loading…</p>}
      {q.isError && (
        <p {...sx(s.error)}>Couldn't load usage. Try a smaller range.</p>
      )}

      {!q.isLoading && !q.isError && providers.length === 0 && (
        <p {...sx(s.note)}>No usage in this range.</p>
      )}

      {providers.length > 0 && (
        <>
          <div {...sx(s.total)}>
            {formatInteger(totalTokens, tweaks.lang)} tokens total
          </div>
          <div {...sx(s.stack)} aria-label="Tokens stacked by provider">
            {providers.map((p, i) => (
              <span
                key={p.provider}
                {...sx(s.segment, segmentTones[i % segmentTones.length])}
                style={{
                  width: `${((p.totalTokens / totalTokens) * 100).toFixed(2)}%`,
                }}
                title={`${p.provider} · ${formatPercent(p.totalTokens / totalTokens, tweaks.lang, 0)}`}
              />
            ))}
          </div>
          <div {...sx(s.table)}>
            {providers.map((p, i) => (
              <div key={p.provider} {...sx(s.tableRow)}>
                <span
                  {...sx(s.swatch, segmentTones[i % segmentTones.length])}
                  aria-hidden
                />
                <span {...sx(s.providerName)}>{p.provider}</span>
                <span {...sx(s.providerTotal)}>
                  {formatInteger(p.totalTokens, tweaks.lang)} tokens
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </Section>
  );
}

const s = stylex.create({
  dateRow: {
    gap: 8,
    display: "flex",
  },
  dateField: {
    flex: "1",
    gap: 4,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  note: { margin: 0, color: colors.ink3, fontSize: 12, fontStyle: "italic" },
  error: {
    margin: 0,
    color: colors.err,
    fontFamily: fonts.mono,
    fontSize: 11.5,
  },
  total: {
    color: colors.ink2,
    fontFamily: fonts.mono,
    fontSize: 12.5,
    fontVariantNumeric: "tabular-nums",
    fontWeight: 500,
  },
  stack: {
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    overflow: "hidden",
    display: "flex",
    height: 8,
  },
  segment: { height: "100%" },
  table: {
    gap: 4,
    display: "flex",
    flexDirection: "column",
  },
  tableRow: {
    gap: 8,
    alignItems: "center",
    display: "flex",
  },
  swatch: {
    borderRadius: 2,
    flexShrink: 0,
    height: 10,
    width: 10,
  },
  providerName: {
    color: colors.ink2,
    fontFamily: fonts.sans,
    fontSize: 12,
    fontWeight: 500,
    textTransform: "capitalize",
  },
  providerTotal: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11.5,
    fontVariantNumeric: "tabular-nums",
    marginLeft: "auto",
  },
});

const segmentTonesByIndex = stylex.create({
  a: { backgroundColor: colors.ink2 },
  b: { backgroundColor: colors.ok },
  c: { backgroundColor: colors.warn },
  d: { backgroundColor: colors.err },
});

const TONE_KEYS = ["a", "b", "c", "d"] as const;

const segmentTones = TONE_KEYS.map((k) => segmentTonesByIndex[k]);
