import { Show, createEffect } from 'solid-js'
import * as stylex from '@stylexjs/stylex'

import { Icon } from './Icons'
import { sx } from '~/lib/sx'

interface ComposerProps {
  value: string
  setValue: (v: string) => void
  onSend: (text: string) => void
  onStop: () => void
  running: boolean
}

export function Composer(props: ComposerProps) {
  let ta!: HTMLTextAreaElement

  // Grow textarea up to 160px as content arrives.
  createEffect(() => {
    void props.value
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(160, ta.scrollHeight)}px`
  })

  const submit = () => {
    const v = props.value.trim()
    if (!v || props.running) return
    props.onSend(v)
    props.setValue('')
  }

  return (
    <div {...sx(s.wrap)}>
      <div {...sx(s.shell)}>
        <textarea
          ref={ta}
          {...sx(s.textarea)}
          value={props.value}
          onInput={(e) => props.setValue(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
            if (e.key === 'Escape' && props.running) {
              e.preventDefault()
              props.onStop()
            }
          }}
          placeholder="Describe your product, ask for a landed cost, or set up a tariff alert…"
          rows={1}
        />
        <div {...sx(s.foot)}>
          <button type="button" {...sx(s.tool)} title="Attach">
            <Icon.Paperclip />
          </button>
          <button type="button" {...sx(s.tool)} title="Tools">
            <Icon.Hash />
          </button>
          <span {...sx(s.hint)}>Enter to send · Shift+Enter newline · Esc to stop</span>
          <Show
            when={props.running}
            fallback={
              <button
                type="button"
                {...sx(s.send)}
                disabled={!props.value.trim()}
                onClick={submit}
                title="Send"
              >
                <Icon.Send />
              </button>
            }
          >
            <button
              type="button"
              {...sx(s.send, s.sendStop)}
              onClick={props.onStop}
              title="Stop"
            >
              <Icon.Stop />
            </button>
          </Show>
        </div>
      </div>
      <div {...sx(s.disclaimer)}>
        Sentinel surfaces best-effort classifications
        <span {...sx(s.dot)}>·</span>
        Always confirm with your customs broker before entry
        <span {...sx(s.dot)}>·</span>
        Section 301/232 not modelled
      </div>
    </div>
  )
}

const s = stylex.create({
  wrap: {
    padding: '12px 28px 18px',
    background: 'linear-gradient(to bottom, transparent, var(--paper) 30%)',
    flexShrink: 0,
  },
  shell: {
    maxWidth: 760,
    margin: '0 auto',
    border: '1px solid var(--line-strong)',
    borderRadius: 'var(--radius-lg)',
    background: 'var(--paper)',
    boxShadow: 'var(--shadow)',
    transition: 'border-color 140ms, box-shadow 140ms',
    ':focus-within': {
      borderColor: 'var(--ink-3)',
      boxShadow: 'var(--shadow-lg)',
    },
  },
  textarea: {
    width: '100%',
    border: 0,
    background: 'transparent',
    resize: 'none',
    padding: '12px 14px 4px',
    fontFamily: 'var(--sans)',
    fontSize: 14,
    lineHeight: 1.55,
    color: 'var(--ink)',
    outline: 'none',
    minHeight: 28,
    maxHeight: 160,
    '::placeholder': { color: 'var(--ink-4)' },
  },
  foot: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 8px 8px',
  },
  tool: {
    width: 30,
    height: 30,
    display: 'grid',
    placeItems: 'center',
    border: 0,
    background: 'transparent',
    borderRadius: 'var(--radius-sm)',
    color: 'var(--ink-4)',
    ':hover': { background: 'var(--paper-3)', color: 'var(--ink-2)' },
  },
  hint: {
    marginLeft: 'auto',
    fontSize: 11,
    color: 'var(--ink-4)',
    fontFamily: 'var(--mono)',
    letterSpacing: '0.02em',
  },
  send: {
    width: 30,
    height: 30,
    display: 'grid',
    placeItems: 'center',
    border: 0,
    borderRadius: 'var(--radius-sm)',
    background: 'var(--ink)',
    color: 'var(--paper)',
    transition: 'opacity 140ms',
    ':disabled': { opacity: 0.3, cursor: 'not-allowed' },
  },
  sendStop: { background: 'var(--err)' },
  disclaimer: {
    maxWidth: 760,
    margin: '8px auto 0',
    textAlign: 'center',
    fontSize: 11,
    color: 'var(--ink-4)',
  },
  dot: { color: 'var(--ink-5)', margin: '0 6px' },
})
