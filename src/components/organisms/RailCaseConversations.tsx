import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";

import { conversationsListOptions } from "@/lib/api/generated/@tanstack/react-query.gen";
import { useActiveCaseId } from "@/lib/state/cases";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";
import { formatMonthDay, formatRelativeDays } from "@/lib/utils/intl";

const ONE_DAY_MS = 86_400_000;

const formatWhen = (iso: string, lang: "en" | "fr"): string => {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / ONE_DAY_MS);
  if (days <= 1) return formatRelativeDays(-Math.max(days, 0), lang);
  return formatMonthDay(d, lang);
};

/**
 * Rail section listing the past conversations pinned to the active
 * import case. Hidden when there is no active case. Display-only for
 * now: clicking a row is a no-op until `loadConversation` + the
 * casePatchSuggestion rehydration path are wired (the backend's
 * `ToolCallView` deserializer doesn't surface the marker entries yet —
 * see plan doc §1.14).
 */
export function RailCaseConversations() {
  const [tweaks] = useTweaks();
  const activeCaseId = useActiveCaseId();
  const q = useQuery({
    ...conversationsListOptions({ query: { caseId: activeCaseId ?? "" } }),
    enabled: activeCaseId !== null,
  });

  if (activeCaseId === null) return null;
  const conversations = q.data?.conversations ?? [];
  if (conversations.length === 0 && !q.isLoading) return null;

  return (
    <>
      <div {...sx(s.section)}>Conversations on this case</div>
      <div {...sx(s.list)}>
        {q.isLoading && <div {...sx(s.note)}>Loading…</div>}
        {conversations.map((c) => (
          <div key={c.id} {...sx(s.row)}>
            <div {...sx(s.title)}>{c.title}</div>
            <div {...sx(s.when)}>
              {formatWhen(c.lastMessageAt, tweaks.lang)}
            </div>
          </div>
        ))}
        {q.isError && <div {...sx(s.error)}>Couldn't load conversations</div>}
      </div>
    </>
  );
}

const s = stylex.create({
  section: {
    padding: "10px 14px 4px",
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  list: {
    padding: "0 6px 12px",
    gap: 1,
    display: "flex",
    flexDirection: "column",
  },
  row: {
    padding: "6px 10px",
    gap: 2,
    display: "flex",
    flexDirection: "column",
  },
  title: {
    overflow: "hidden",
    color: colors.ink2,
    fontFamily: fonts.sans,
    fontSize: 12.5,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  when: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 10.5,
  },
  note: {
    padding: "6px 10px",
    color: colors.ink4,
    fontSize: 12,
    fontStyle: "italic",
  },
  error: {
    padding: "6px 10px",
    color: colors.err,
    fontFamily: fonts.mono,
    fontSize: 11,
  },
});
