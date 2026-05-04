import { For, Show, createEffect, createSignal } from 'solid-js'
import * as stylex from '@stylexjs/stylex'

import { Icon  } from './Icons'
import type {IconKey} from './Icons';
import { sx } from '~/lib/sx'
import { formatHtsCode, truncate } from '~/lib/format'
import type {
  AssistantMessageData,
  ToolCall,
  ToolCallStatus,
} from '~/lib/types'

interface AssistantMessageProps {
  msg: AssistantMessageData
  focusedCallId: string | null
  onFocusCall: (id: string) => void
  autoCollapseThinking: boolean
  defaultThinkingOpen: boolean
}

export function AssistantMessage(props: AssistantMessageProps) {
  return (
    <div {...sx(s.row)}>
      <div {...sx(s.icon)}>S</div>
      <div {...sx(s.body)}>
        <Show when={props.msg.thinking || props.msg.thinkingActive}>
          <ThinkingPanel
            text={props.msg.thinking}
            active={props.msg.thinkingActive}
            ms={props.msg.thinkingMs}
            autoCollapse={props.autoCollapseThinking}
            defaultOpen={props.defaultThinkingOpen || props.msg.thinkingActive}
          />
        </Show>

        <Show when={props.msg.calls.length > 0}>
          <div {...sx(s.pills)}>
            <For each={props.msg.calls}>
              {(call) => (
                <ToolPill
                  call={call}
                  active={call.id === props.focusedCallId}
                  onClick={() => props.onFocusCall(call.id)}
                />
              )}
            </For>
          </div>
        </Show>

        <Show when={props.msg.reply}>
          {(() => {
            const replyStyle = sx(s.reply)
            return (
              <div
                class={`reply-html ${replyStyle.class}`}
                style={replyStyle.style}
                innerHTML={
                  props.msg.reply +
                  (props.msg.streaming ? '<span class="cursor"></span>' : '')
                }
              />
            )
          })()}
        </Show>

        <Show when={props.msg.error}>
          {(err) => <div {...sx(s.error)}>Stream error: {err()}</div>}
        </Show>

        <Show when={props.msg.caveats?.length}>
          <div {...sx(s.caveats)}>
            <div {...sx(s.caveatsLabel)}>Caveats</div>
            <ul {...sx(s.caveatsList)}>
              <For each={props.msg.caveats}>
                {(c) => <li {...sx(s.caveatsItem)}>{c}</li>}
              </For>
            </ul>
          </div>
        </Show>

        <Show when={props.msg.done && !props.msg.streaming}>
          <div {...sx(s.actions)}>
            <button type="button" {...sx(s.actionBtn)} title="Copy">
              <Icon.Copy />
            </button>
            <button type="button" {...sx(s.actionBtn)} title="Regenerate">
              <Icon.Refresh />
            </button>
            <button type="button" {...sx(s.actionBtn)} title="Good">
              <Icon.ThumbUp />
            </button>
            <button type="button" {...sx(s.actionBtn)} title="Bad">
              <Icon.ThumbDown />
            </button>
          </div>
        </Show>
      </div>
    </div>
  )
}

/* ---------- Thinking disclosure ---------- */

interface ThinkingPanelProps {
  text: string
  active: boolean
  ms?: number
  autoCollapse: boolean
  defaultOpen: boolean
}

function ThinkingPanel(props: ThinkingPanelProps) {
  const [open, setOpen] = createSignal(props.defaultOpen)
  let userToggled = false
  let bodyRef: HTMLDivElement | undefined

  createEffect(() => {
    if (props.autoCollapse && !props.active && !userToggled) setOpen(false)
  })
  createEffect(() => {
    void props.text
    if (open() && bodyRef && props.active) {
      bodyRef.scrollTop = bodyRef.scrollHeight
    }
  })

  const tokens = () =>
    props.text ? Math.round(props.text.length / 3.5) : null

  return (
    <div
      {...sx(t.root, props.active && t.rootActive, open() && t.rootOpen)}
    >
      <div
        {...sx(t.head)}
        onClick={() => {
          setOpen((o) => !o)
          userToggled = true
        }}
      >
        <span {...sx(t.chev, open() && t.chevOpen)}>
          <Icon.Chevron />
        </span>
        <span {...sx(t.label)}>
          <Show when={props.active}>
            <span {...sx(t.pulse)} />
          </Show>
          <span {...sx(t.labelText)}>
            {props.active ? 'Thinking…' : 'Thought'}
          </span>
        </span>
        <span {...sx(t.stats)}>
          {props.ms != null && `${(props.ms / 1000).toFixed(1)}s`}
          {tokens() != null && ` · ${tokens()} tokens`}
        </span>
      </div>
      <Show when={open()}>
        <div ref={bodyRef} {...sx(t.body)}>
          {props.text}
        </div>
      </Show>
    </div>
  )
}

/* ---------- Tool pill ---------- */

const TOOLS: Record<string, { label: string; icon: IconKey }> = {
  search_codes: { label: 'Searching catalog', icon: 'Search' },
  get_code_details: { label: 'Looking up', icon: 'Book' },
  get_landed_cost: { label: 'Computing landed cost', icon: 'Coin' },
  find_cross_rulings: { label: 'Checking prior rulings', icon: 'Scroll' },
  subscribe_watch: { label: 'Setting up alert', icon: 'Bell' },
  list_alerts: { label: 'Reading alert queue', icon: 'Clipboard' },
}

interface ToolPillProps {
  call: ToolCall
  active: boolean
  onClick: () => void
}

function ToolPill(props: ToolPillProps) {
  const meta = () => {
    const m = TOOLS[props.call.tool] as
      | { label: string; icon: IconKey }
      | undefined
    return m ?? { label: props.call.tool, icon: 'Sparkle' as IconKey }
  }
  const I = () => Icon[meta().icon]

  /** Per-tool, surface the most informative arg as a small monospace suffix. */
  const suffix = () => {
    const args = (props.call.args ?? {}) as Record<string, unknown>
    switch (props.call.tool) {
      case 'get_code_details':
      case 'get_landed_cost':
        return typeof args.code === 'string' ? formatHtsCode(args.code) : undefined
      case 'search_codes':
        return typeof args.description === 'string'
          ? `“${truncate(args.description, 36)}”`
          : undefined
      case 'find_cross_rulings':
        return typeof args.query === 'string'
          ? `“${truncate(args.query, 36)}”`
          : undefined
      case 'subscribe_watch': {
        const code =
          typeof args.code_prefix === 'string'
            ? args.code_prefix
            : typeof args.code === 'string'
              ? args.code
              : undefined
        return code ? formatHtsCode(code) : undefined
      }
      case 'list_alerts': {
        const cp = args.code_prefix
        return typeof cp === 'string' ? formatHtsCode(cp) : undefined
      }
      default:
        return undefined
    }
  }

  const label = () => {
    if (props.call.tool === 'get_code_details') return 'Looking up'
    return meta().label
  }

  return (
    <button
      type="button"
      {...sx(p.pill, statusStyle(props.call.status), props.active && p.active)}
      onClick={props.onClick}
      aria-live="polite"
    >
      <span {...sx(p.iconSlot, statusIconColor(props.call.status))}>
        {props.call.status === 'in-flight' ? (
          <span {...sx(p.spinner)} />
        ) : props.call.status === 'complete' ? (
          <Icon.Check />
        ) : (
          <Icon.X />
        )}
      </span>
      <span {...sx(p.body)}>
        <span {...sx(p.toolIcon)}>{I()({})}</span>
        <span>{label()}</span>
        <Show when={suffix()}>
          {(c) => <span {...sx(p.code)}>{c()}</span>}
        </Show>
      </span>
    </button>
  )
}

function statusStyle(status: ToolCallStatus) {
  if (status === 'failed') return p.failed
  return undefined
}

function statusIconColor(status: ToolCallStatus) {
  if (status === 'in-flight') return p.iconInFlight
  if (status === 'complete') return p.iconComplete
  return p.iconFailed
}

/* ---------- Styles ---------- */

const s = stylex.create({
  row: {
    display: 'flex',
    gap: 12,
    alignItems: 'flex-start',
  },
  icon: {
    width: 26,
    height: 26,
    borderRadius: 6,
    background: 'var(--ink)',
    color: 'var(--paper)',
    display: 'grid',
    placeItems: 'center',
    fontFamily: 'var(--serif)',
    fontStyle: 'italic',
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
    marginTop: 2,
  },
  body: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  pills: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  },
  reply: {
    fontSize: 14.5,
    lineHeight: 1.65,
    color: 'var(--ink)',
  },
  error: {
    padding: '8px 12px',
    background: 'var(--err-soft)',
    border: '1px solid var(--err)',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--err)',
    fontFamily: 'var(--mono)',
    fontSize: 12,
  },
  caveats: {
    marginTop: 4,
    padding: '8px 12px',
    background: 'var(--paper-2)',
    borderLeft: '2px solid var(--line-strong)',
    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
  },
  caveatsLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--ink-4)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  caveatsList: { margin: 0, paddingLeft: 18 },
  caveatsItem: {
    fontSize: 12.5,
    fontStyle: 'italic',
    color: 'var(--ink-3)',
    margin: '2px 0',
  },
  actions: {
    display: 'flex',
    gap: 2,
    marginTop: 2,
  },
  actionBtn: {
    width: 26,
    height: 26,
    display: 'grid',
    placeItems: 'center',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-sm)',
    background: 'transparent',
    color: 'var(--ink-4)',
    ':hover': {
      background: 'var(--paper-3)',
      color: 'var(--ink-2)',
      borderColor: 'var(--line)',
    },
  },
})

const t = stylex.create({
  root: {
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    background: 'var(--paper-2)',
    fontSize: 13,
    overflow: 'hidden',
  },
  rootActive: {},
  rootOpen: {},
  head: {
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    userSelect: 'none',
    color: 'var(--ink-3)',
    ':hover': { color: 'var(--ink)' },
  },
  chev: { transition: 'transform 180ms', flexShrink: 0, display: 'inline-flex' },
  chevOpen: { transform: 'rotate(90deg)' },
  label: { display: 'flex', alignItems: 'center', gap: 8 },
  labelText: { fontWeight: 500 },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--gold)',
    position: 'relative',
    flexShrink: 0,
    '::before': {
      content: '""',
      position: 'absolute',
      inset: -3,
      borderRadius: '50%',
      background: 'var(--gold)',
      opacity: 0.35,
      animationName: 'pulse',
      animationDuration: '1.6s',
      animationTimingFunction: 'ease-out',
      animationIterationCount: 'infinite',
    },
  },
  stats: {
    marginLeft: 'auto',
    fontFamily: 'var(--mono)',
    fontSize: 11,
    color: 'var(--ink-4)',
    letterSpacing: '0.02em',
  },
  body: {
    borderTop: '1px solid var(--line)',
    background: 'var(--paper)',
    fontFamily: 'var(--mono)',
    fontSize: 12,
    lineHeight: 1.65,
    color: 'var(--ink-3)',
    padding: '12px 14px',
    whiteSpace: 'pre-wrap',
    maxHeight: 280,
    overflowY: 'auto',
  },
})

const p = stylex.create({
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px 4px 8px',
    borderRadius: 999,
    background: 'var(--paper-2)',
    border: '1px solid var(--line)',
    fontSize: 12,
    color: 'var(--ink-2)',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 140ms',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
    ':hover': {
      background: 'var(--paper-3)',
      borderColor: 'var(--line-strong)',
    },
  },
  active: {
    borderColor: 'var(--gold)',
    background: 'var(--gold-soft)',
    color: 'var(--ink)',
  },
  failed: {
    background: 'var(--err-soft)',
    borderColor: 'var(--err)',
    color: 'var(--err)',
  },
  iconSlot: {
    width: 14,
    height: 14,
    display: 'grid',
    placeItems: 'center',
    flexShrink: 0,
    color: 'var(--ink-3)',
  },
  iconInFlight: { color: 'var(--gold-deep)' },
  iconComplete: { color: 'var(--ok)' },
  iconFailed: { color: 'var(--err)' },
  body: { display: 'inline-flex', alignItems: 'center', gap: 4 },
  toolIcon: { opacity: 0.85, display: 'inline-flex' },
  code: { fontFamily: 'var(--mono)', fontSize: 11 },
  spinner: {
    width: 12,
    height: 12,
    borderStyle: 'solid',
    borderWidth: 1.5,
    borderColor: 'var(--gold)',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animationName: 'spin',
    animationDuration: '0.8s',
    animationTimingFunction: 'linear',
    animationIterationCount: 'infinite',
  },
})
