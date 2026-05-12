import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";

import { RailConvoItem } from "@/components/molecules/RailConvoItem";
import { conversationsListOptions } from "@/lib/api/generated/@tanstack/react-query.gen";
import { loadConversation, resetChat } from "@/lib/state/chatThunks";
import { useAppDispatch, useAppSelector } from "@/lib/state/hooks";
import { useTweaks } from "@/lib/state/tweaks";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";
import { formatMonthDay, formatRelativeDays } from "@/lib/utils/intl";

const ONE_DAY_MS = 86_400_000;

// Format an ISO timestamp into a rail-friendly label. The most recent two
// days get the natural-language relative form via `Intl.RelativeTimeFormat`
// ("today" / "yesterday" in en, "aujourd'hui" / "hier" in fr); older items
// fall back to a short month-day via `Intl.DateTimeFormat`. The backend
// serves UTC ISO 8601.
const formatWhen = (iso: string, lang: "en" | "fr"): string => {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / ONE_DAY_MS);
  if (days <= 1) return formatRelativeDays(-Math.max(days, 0), lang);
  return formatMonthDay(d, lang);
};

export function RailHistoryList() {
  const [tweaks] = useTweaks();
  const convos = useQuery(conversationsListOptions());
  const conversationId = useAppSelector((s) => s.chat.conversationId);
  const dispatch = useAppDispatch();
  const items = convos.data?.conversations ?? [];

  const onPick = (id: string) => {
    if (id === conversationId) return;
    dispatch(loadConversation(id)).catch(() => undefined);
  };
  const onNew = () => {
    if (conversationId === null) return;
    dispatch(resetChat);
  };

  return (
    <>
      <div {...sx(s.section)}>Recent</div>
      <div {...sx(s.list)}>
        <RailConvoItem
          title="New chat"
          when="Now"
          active={conversationId === null}
          onClick={onNew}
        />
        {items.map((c) => (
          <RailConvoItem
            key={c.id}
            title={c.title}
            when={formatWhen(c.lastMessageAt, tweaks.lang)}
            active={c.id === conversationId}
            onClick={() => {
              onPick(c.id);
            }}
          />
        ))}
        {convos.isError && <div {...sx(s.error)}>Couldn't load history</div>}
      </div>
    </>
  );
}

const s = stylex.create({
  section: {
    padding: "14px 14px 4px",
    color: colors.ink4,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
  list: {
    padding: "0 6px 12px",
    flex: "1",
    gap: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  error: {
    padding: "8px 10px",
    color: colors.err,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
});
