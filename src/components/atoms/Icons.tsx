import type { Icon as TablerIconCmpT } from "@tabler/icons-react";

import {
  IconArrowRight,
  IconBell,
  IconBook,
  IconBuildingBank,
  IconCheck,
  IconChevronRight,
  IconClipboard,
  IconCoins,
  IconCopy,
  IconFileDescription,
  IconHash,
  IconLayoutSidebarRight,
  IconPaperclip,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSend,
  IconSettings,
  IconSparkles,
  IconSquareFilled,
  IconThumbDown,
  IconThumbUp,
  IconX,
} from "@tabler/icons-react";

interface IconPropsT {
  size?: number;
  className?: string;
}

// Match the original 16-px lucide visual weight: scale Tabler's 24-px grid down
// and tighten the stroke proportionally so glyphs don't look chunky next to
// surrounding 12–14 px text.
const wrap = (Component: TablerIconCmpT) => (p?: IconPropsT) => (
  <Component size={p?.size ?? 16} stroke={1.75} className={p?.className} />
);

export const Icon = {
  Plus: wrap(IconPlus),
  Search: wrap(IconSearch),
  Book: wrap(IconBook),
  Coin: wrap(IconCoins),
  Scroll: wrap(IconFileDescription),
  Bell: wrap(IconBell),
  Clipboard: wrap(IconClipboard),
  Send: wrap(IconSend),
  Stop: wrap(IconSquareFilled),
  Paperclip: wrap(IconPaperclip),
  Sparkle: wrap(IconSparkles),
  Chevron: wrap(IconChevronRight),
  Check: wrap(IconCheck),
  X: wrap(IconX),
  Side: wrap(IconLayoutSidebarRight),
  Settings: wrap(IconSettings),
  Hash: wrap(IconHash),
  Copy: wrap(IconCopy),
  Refresh: wrap(IconRefresh),
  ThumbUp: wrap(IconThumbUp),
  ThumbDown: wrap(IconThumbDown),
  Arrow: wrap(IconArrowRight),
  Customs: wrap(IconBuildingBank),
};

export type IconKeyT = keyof typeof Icon;
