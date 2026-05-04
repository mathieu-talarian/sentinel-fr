import { For, Show, Suspense } from 'solid-js'
import * as stylex from '@stylexjs/stylex'
import { createQuery } from '@tanstack/solid-query'

import { Icon } from './Icons'
import { sx } from '~/lib/sx'
import { priorConvosQuery } from '~/lib/queries'

interface RailProps {
  onNewChat: () => void
  onOpenSettings: () => void
}

export function Rail(props: RailProps) {
  const convos = createQuery(() => priorConvosQuery())

  return (
    <aside {...sx(s.rail)}>
      <div {...sx(s.head)}>
        <div {...sx(s.brand)}>
          <span {...sx(s.brandMark)}>S</span>
          <span>Sentinel</span>
        </div>
        <span {...sx(s.brandTag)}>v1.4</span>
      </div>

      <button type="button" {...sx(s.newChat)} onClick={props.onNewChat}>
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
          onClick={props.onOpenSettings}
          title="Settings"
        >
          <Icon.Settings />
        </button>
      </div>
    </aside>
  )
}

const s = stylex.create({
  rail: {
    background: 'var(--paper-2)',
    borderRight: '1px solid var(--line)',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    width: 240,
    flexShrink: 0,
  },
  head: {
    padding: '16px 14px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'var(--serif)',
    fontSize: 17,
    fontWeight: 600,
    letterSpacing: '-0.01em',
    color: 'var(--ink)',
  },
  brandMark: {
    width: 22,
    height: 22,
    borderRadius: 5,
    background: 'var(--ink)',
    color: 'var(--paper)',
    display: 'grid',
    placeItems: 'center',
    fontFamily: 'var(--serif)',
    fontSize: 13,
    fontWeight: 600,
    fontStyle: 'italic',
  },
  brandTag: {
    marginLeft: 'auto',
    fontFamily: 'var(--mono)',
    fontSize: 10,
    color: 'var(--ink-4)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  newChat: {
    margin: '4px 10px 8px',
    padding: '8px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    color: 'var(--ink)',
    fontSize: 13,
    fontWeight: 500,
    transition: 'background 120ms, border-color 120ms',
    ':hover': {
      background: 'var(--paper-3)',
      borderColor: 'var(--line-strong)',
    },
  },
  section: {
    padding: '14px 14px 4px',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--ink-4)',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    padding: '0 6px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
  },
  convo: {
    padding: '8px 10px',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    border: '1px solid transparent',
    ':hover': { background: 'var(--paper-3)' },
  },
  convoActive: {
    background: 'var(--paper-3)',
    borderColor: 'var(--line)',
  },
  convoTitle: {
    fontSize: 13,
    color: 'var(--ink-2)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  convoTitleActive: {
    color: 'var(--ink)',
    fontWeight: 500,
  },
  convoMeta: {
    fontSize: 11,
    color: 'var(--ink-4)',
    fontVariantNumeric: 'tabular-nums',
  },
  error: {
    padding: '8px 10px',
    fontSize: 12,
    color: 'var(--err)',
    fontFamily: 'var(--mono)',
  },
  foot: {
    padding: 10,
    borderTop: '1px solid var(--line)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: '50%',
    background: 'var(--gold-soft)',
    color: 'var(--gold-deep)',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 600,
    fontSize: 12,
  },
  userMeta: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: 1.2,
    minWidth: 0,
  },
  userName: { fontSize: 13, fontWeight: 500, color: 'var(--ink)' },
  userOrg: { fontSize: 11, color: 'var(--ink-4)' },
  iconBtn: {
    marginLeft: 'auto',
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    color: 'var(--ink-3)',
    ':hover': { background: 'var(--paper-3)', color: 'var(--ink)' },
  },
})
