import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";

import { conversationsListOptions } from "@/lib/api/generated/@tanstack/react-query.gen";
import { useActiveCaseId } from "@/lib/state/cases";
import { loadConversation } from "@/lib/state/chatThunks";
import { useAppDispatch, useAppSelector } from "@/lib/state/hooks";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { borders, colors, fonts, radii } from "@/lib/styles/tokens.stylex";
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
 * import case. Hidden when there is no active case. Clicking a row
 * dispatches `loadConversation`, which replaces the case's in-memory
 * thread with the persisted transcript and rehydrates any
 * `casePatchSuggestion` markers (Phase 12).
 */
export function RailCaseConversations() {
  const [tweaks] = useTweaks();
  const activeCaseId = useActiveCaseId();
  const dispatch = useAppDispatch();
  const activeConversationId = useAppSelector((s) =>
    activeCaseId
      ? (s.chat.threads[activeCaseId]?.conversationId ?? null)
      : null,
  );

  const q = useQuery({
    ...conversationsListOptions({ query: { caseId: activeCaseId ?? "" } }),
    enabled: activeCaseId !== null,
  });

  if (activeCaseId === null) return null;
  const conversations = q.data?.conversations ?? [];
  if (conversations.length === 0 && !q.isLoading) return null;

  const onPick = (conversationId: string) => {
    void dispatch(loadConversation(activeCaseId, conversationId));
  };

  return (
    <>
      <div {...sx(s.section)}>Conversations on this case</div>
      <div {...sx(s.list)}>
        {q.isLoading && <div {...sx(s.note)}>Loading…</div>}
        {conversations.map((c) => {
          const active = c.id === activeConversationId;
          return (
            <button
              key={c.id}
              type="button"
              {...sx(s.row, active && s.rowActive)}
              onClick={() => {
                onPick(c.id);
              }}
            >
              <span {...sx(s.title, active && s.titleActive)}>{c.title}</span>
              <span {...sx(s.when)}>
                {formatWhen(c.lastMessageAt, tweaks.lang)}
              </span>
            </button>
          );
        })}
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
    borderColor: "transparent",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 2,
    backgroundColor: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    textAlign: "left",
    width: "100%",
  },
  rowActive: {
    borderColor: colors.line,
    backgroundColor: colors.paper3,
  },
  title: {
    overflow: "hidden",
    color: colors.ink2,
    fontFamily: fonts.sans,
    fontSize: 12.5,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  titleActive: {
    color: colors.ink,
    fontWeight: 500,
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
