import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/react-query";

import { RailConvoItem } from "@/components/molecules/RailConvoItem";
import { conversationsListOptions } from "@/lib/api/generated/@tanstack/react-query.gen";
import { sx } from "@/lib/styles/sx";
import { colors, fonts } from "@/lib/styles/tokens.stylex";

const ONE_DAY_MS = 86_400_000;

// Format an ISO timestamp into a rail-friendly relative label.
// "Today" / "Yesterday" for the most recent two days, otherwise short
// month-day. The backend serves UTC ISO 8601; toLocaleDateString picks the
// browser's locale.
const formatWhen = (iso: string): string => {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / ONE_DAY_MS);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export function RailHistoryList() {
  const convos = useQuery(conversationsListOptions());
  const items = convos.data?.conversations ?? [];

  return (
    <>
      <div {...sx(s.section)}>Recent</div>
      <div {...sx(s.list)}>
        <RailConvoItem title="New chat" when="Now" active />
        {items.map((c) => (
          <RailConvoItem
            key={c.id}
            title={c.title}
            when={formatWhen(c.lastMessageAt)}
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
