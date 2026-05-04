import { For, Show } from 'solid-js'
import * as stylex from '@stylexjs/stylex'
import { createQuery } from '@tanstack/solid-query'

import { Icon } from './Icons'
import { sx } from '~/lib/sx'
import { SUGGESTIONS  } from '~/lib/suggestions'
import type {Suggestion} from '~/lib/suggestions';
import { catalogStatsQuery } from '~/lib/queries'

interface EmptyStateProps {
  onPick: (suggestion: Suggestion) => void
}

export function EmptyState(props: EmptyStateProps) {
  const stats = createQuery(() => catalogStatsQuery())

  return (
    <div {...sx(s.root)}>
      <div {...sx(s.inner)}>
        <div {...sx(s.eyebrow)}>FR → US · Customs Classification Agent</div>
        <h1 {...sx(s.title)}>
          What are you <em {...sx(s.titleEm)}>shipping</em> today?
        </h1>
        <p {...sx(s.sub)}>
          Describe your product in plain language. I'll search the HTS catalog,
          check prior CBP rulings, and give you the right 10-digit code with
          the all-in landed cost.
        </p>

        <div {...sx(s.grid)}>
          <For each={SUGGESTIONS}>
            {(suggestion) => (
              <button
                type="button"
                {...sx(s.card)}
                onClick={() => props.onPick(suggestion)}
              >
                <span {...sx(s.tag)}>
                  <span {...sx(s.dot, dotStyleFor(suggestion.id))} />
                  {suggestion.tag}
                </span>
                <span {...sx(s.text)}>{suggestion.text}</span>
                <span {...sx(s.arrow)}>
                  <Icon.Arrow />
                </span>
              </button>
            )}
          </For>
        </div>

        <Show when={stats.data}>
          {(d) => (
            <div {...sx(s.meta)}>
              <span {...sx(s.metaItem)}>
                <Icon.Customs /> {d().hts_codes_indexed.toLocaleString('en-US')} HTS codes indexed
              </span>
              <span {...sx(s.metaItem)}>
                <Icon.Scroll /> CBP CROSS rulings since {d().cross_rulings_since}
              </span>
              <span {...sx(s.metaItem)}>
                <Icon.Bell /> {d().active_alerts} active alerts
              </span>
            </div>
          )}
        </Show>
      </div>
    </div>
  )
}

function dotStyleFor(id: Suggestion['id']) {
  if (id === 'cost') return s.dotCost
  if (id === 'alert') return s.dotAlert
  return s.dotClassify
}

const s = stylex.create({
  root: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: '24px 28px',
  },
  inner: { maxWidth: 720, margin: '0 auto', width: '100%' },
  eyebrow: {
    fontFamily: 'var(--mono)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--gold-deep)',
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    '::before': {
      content: '""',
      width: 18,
      height: 1,
      background: 'var(--gold)',
    },
  },
  title: {
    fontFamily: 'var(--serif)',
    fontSize: 32,
    fontWeight: 400,
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
    color: 'var(--ink)',
    margin: '0 0 8px',
  },
  titleEm: { fontStyle: 'italic', color: 'var(--gold-deep)' },
  sub: {
    fontSize: 14,
    color: 'var(--ink-3)',
    margin: '0 0 28px',
    maxWidth: 540,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 10,
  },
  card: {
    textAlign: 'left',
    background: 'var(--paper-2)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    padding: '14px 14px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    transition: 'all 160ms',
    minHeight: 132,
    cursor: 'pointer',
    color: 'var(--ink)',
    ':hover': {
      background: 'var(--paper)',
      borderColor: 'var(--line-strong)',
      transform: 'translateY(-1px)',
      boxShadow: 'var(--shadow)',
    },
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    fontFamily: 'var(--mono)',
    fontSize: 10,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--ink-4)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: 'var(--gold)',
  },
  dotClassify: { background: 'var(--gold)' },
  dotCost: { background: 'var(--ok)' },
  dotAlert: { background: 'oklch(0.65 0.12 280)' },
  text: {
    fontSize: 13.5,
    lineHeight: 1.45,
    color: 'var(--ink)',
  },
  arrow: {
    marginTop: 'auto',
    alignSelf: 'flex-end',
    color: 'var(--ink-4)',
    transition: 'transform 160ms, color 160ms',
  },
  meta: {
    marginTop: 24,
    display: 'flex',
    gap: 18,
    fontSize: 11.5,
    color: 'var(--ink-4)',
    fontFamily: 'var(--mono)',
    letterSpacing: '0.02em',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
})
