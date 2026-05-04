import * as stylex from "@stylexjs/stylex";
import { createQuery } from "@tanstack/solid-query";
import { For, Show, Suspense } from "solid-js";

import { priorConvosQuery } from "~/lib/queries";
import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii } from "~/lib/tokens.stylex";

import { Icon } from "./Icons";

interface RailPropsT {
  onNewChat: () => void;
  onOpenSettings: () => void;
}

export function Rail(props: Readonly<RailPropsT>) {
  const convos = createQuery(() => priorConvosQuery());

  return (
    <aside {...sx(s.rail)}>
      <div {...sx(s.head)}>
        <div {...sx(s.brand)}>
          <span {...sx(s.brandMark)}>S</span>
          <span>Sentinel</span>
        </div>
        <span {...sx(s.brandTag)}>v1.4</span>
      </div>

      <button
        type="button"
        {...sx(s.newChat)}
        onClick={() => { props.onNewChat(); }}
      >
        <Icon.Plus /> New chat
      </button>

      <div {...sx(s.section)}>Recent</div>
      <div {...sx(s.list)}>
        <div {...sx(s.convo, s.convoActive)}>
          <span {...sx(s.convoTitle, s.convoTitleActive)}>New chat</span>
          <span {...sx(s.convoMeta)}>Now</span>
        </div>
        <Suspense>
          <For each={convos.data ?? []}>
            {(c) => (
              <div {...sx(s.convo)}>
                <span {...sx(s.convoTitle)}>{c.title}</span>
                <span {...sx(s.convoMeta)}>{c.when}</span>
              </div>
            )}
          </For>
        </Suspense>
        <Show when={convos.isError}>
          <div {...sx(s.error)}>Couldn't load history</div>
        </Show>
      </div>

      <div {...sx(s.foot)}>
        <div {...sx(s.avatar)}>M</div>
        <div {...sx(s.userMeta)}>
          <span {...sx(s.userName)}>Marie L.</span>
          <span {...sx(s.userOrg)}>Atelier Vague · ops</span>
        </div>
        <button
          type="button"
          {...sx(s.iconBtn)}
          onClick={() => { props.onOpenSettings(); }}
          title="Settings"
        >
          <Icon.Settings />
        </button>
      </div>
    </aside>
  );
}

const s = stylex.create({
  rail: {
    background: colors.paper2,
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    borderRightColor: colors.line,
    borderRightStyle: borders.solid,
    borderRightWidth: borders.thin,
    minWidth: 0,
    width: 240,
  },
  head: {
    padding: "16px 14px 10px",
    gap: 8,
    alignItems: "center",
    display: "flex",
  },
  brand: {
    gap: 8,
    alignItems: "center",
    color: colors.ink,
    display: "flex",
    fontFamily: fonts.serif,
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  brandMark: {
    background: colors.ink,
    borderRadius: 5,
    placeItems: "center",
    color: colors.paper,
    display: "grid",
    fontFamily: fonts.serif,
    fontSize: 13,
    fontStyle: "italic",
    fontWeight: 600,
    height: 22,
    width: 22,
  },
  brandTag: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 10,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    marginLeft: "auto",
  },
  newChat: {
    background: {
      default: colors.paper,
      ":hover": colors.paper3,
    },
    margin: "4px 10px 8px",
    padding: "8px 10px",
    borderColor: {
      default: colors.line,
      ":hover": colors.lineStrong,
    },
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 8,
    transition: "background 120ms, border-color 120ms",
    alignItems: "center",
    color: colors.ink,
    display: "flex",
    fontSize: 13,
    fontWeight: 500,
  },
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
  convo: {
    background: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    padding: "8px 10px",
    borderColor: "transparent",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 2,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
  },
  convoActive: {
    background: colors.paper3,
    borderColor: colors.line,
  },
  convoTitle: {
    overflow: "hidden",
    color: colors.ink2,
    fontSize: 13,
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  convoTitleActive: {
    color: colors.ink,
    fontWeight: 500,
  },
  convoMeta: {
    color: colors.ink4,
    fontSize: 11,
    fontVariantNumeric: "tabular-nums",
  },
  error: {
    padding: "8px 10px",
    color: colors.err,
    fontFamily: fonts.mono,
    fontSize: 12,
  },
  foot: {
    padding: 10,
    gap: 10,
    alignItems: "center",
    display: "flex",
    borderTopColor: colors.line,
    borderTopStyle: borders.solid,
    borderTopWidth: borders.thin,
  },
  avatar: {
    background: colors.goldSoft,
    borderRadius: "50%",
    placeItems: "center",
    color: colors.goldDeep,
    display: "grid",
    fontSize: 12,
    fontWeight: 600,
    height: 28,
    width: 28,
  },
  userMeta: {
    display: "flex",
    flexDirection: "column",
    lineHeight: 1.2,
    minWidth: 0,
  },
  userName: { color: colors.ink, fontSize: 13, fontWeight: 500 },
  userOrg: { color: colors.ink4, fontSize: 11 },
  iconBtn: {
    background: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    borderColor: "transparent",
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    placeItems: "center",
    color: {
      default: colors.ink3,
      ":hover": colors.ink,
    },
    display: "grid",
    height: 28,
    marginLeft: "auto",
    width: 28,
  },
});
