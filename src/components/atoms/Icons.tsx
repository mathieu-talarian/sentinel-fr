import type { Component, JSX } from "solid-js";

import {
  ArrowRight,
  Bell,
  Book,
  Check,
  ChevronRight,
  Clipboard,
  Coins,
  Copy,
  Hash,
  Landmark,
  PanelRight,
  Paperclip,
  Plus,
  RotateCw,
  ScrollText,
  Search,
  Send,
  Settings,
  Sparkle,
  Square,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-solid/icons";

interface IconPropsT {
  size?: number;
  class?: string;
}

const wrap =
  // Solid components from lucide are typed permissively; cast to a thin
  // signature that matches what we use at call sites.
  (
      Component: Component<{
        size?: number;
        class?: string;
        fill?: string;
      }>,
      extra?: { fill?: string },
    ) =>
    (p?: IconPropsT): JSX.Element => (
      <Component size={p?.size ?? 16} class={p?.class} fill={extra?.fill} />
    );

export const Icon = {
  Plus: wrap(Plus),
  Search: wrap(Search),
  Book: wrap(Book),
  Coin: wrap(Coins),
  Scroll: wrap(ScrollText),
  Bell: wrap(Bell),
  Clipboard: wrap(Clipboard),
  Send: wrap(Send),
  Stop: wrap(Square, { fill: "currentColor" }),
  Paperclip: wrap(Paperclip),
  Sparkle: wrap(Sparkle),
  Chevron: wrap(ChevronRight),
  Check: wrap(Check),
  X: wrap(X),
  Side: wrap(PanelRight),
  Settings: wrap(Settings),
  Hash: wrap(Hash),
  Copy: wrap(Copy),
  Refresh: wrap(RotateCw),
  ThumbUp: wrap(ThumbsUp),
  ThumbDown: wrap(ThumbsDown),
  Arrow: wrap(ArrowRight),
  Customs: wrap(Landmark),
};

export type IconKeyT = keyof typeof Icon;
