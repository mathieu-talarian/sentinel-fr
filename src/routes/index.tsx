import { For, Show, createMemo, createSignal } from 'solid-js'
import { createFileRoute, redirect } from '@tanstack/solid-router'
import * as stylex from '@stylexjs/stylex'

import { sx } from '~/lib/sx'
import { useTweaks } from '~/lib/tweaks'
import { createChatStore } from '~/lib/chatStore'
import { meQueryOptions } from '~/lib/queries'
import { suggestionTitleFor  } from '~/lib/suggestions'
import type {Suggestion} from '~/lib/suggestions';
import { Rail } from '~/components/Rail'
import { Composer } from '~/components/Composer'
import { EmptyState } from '~/components/EmptyState'
import { AssistantMessage } from '~/components/AssistantMessage'
import { Inspector } from '~/components/Inspector'
import { TweaksPanel } from '~/components/TweaksPanel'
import { Icon } from '~/components/Icons'

export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(meQueryOptions())
    if (!session) throw redirect({ to: '/login' })
  },
  component: ChatPage,
})

function ChatPage() {
  const [tweaks, setTweaks] = useTweaks()
  const chat = createChatStore({
    autoOpenInspector: () => tweaks().inspectorAutoOpen,
    provider: () => tweaks().provider,
  })
  const [input, setInput] = createSignal('')
  const [tweaksOpen, setTweaksOpen] = createSignal(false)

  let threadEl: HTMLDivElement | undefined

  const isEmpty = () => chat.messages.length === 0

  const firstUserText = createMemo(() => {
    const u = chat.messages.find((m) => m.role === 'user')
    return u?.role === 'user' ? u.text : ''
  })

  const headerTitle = createMemo(() => {
    if (isEmpty()) return 'New chat'
    return suggestionTitleFor(firstUserText()) ?? 'Conversation'
  })

  const allCalls = createMemo(() =>
    chat.messages.flatMap((m) => (m.role === 'assistant' ? m.calls : [])),
  )
  const hasAnyResults = () => allCalls().some((c) => c.result != null)

  const send = (text: string) => {
    void chat.send({ text })
    queueMicrotask(() => {
      if (threadEl) threadEl.scrollTop = threadEl.scrollHeight
    })
  }

  const onPick = (suggestion: Suggestion) => send(suggestion.text)

  return (
    <>
      <Rail onNewChat={chat.reset} onOpenSettings={() => setTweaksOpen(true)} />

      <main {...sx(s.center)}>
        <div {...sx(s.topbar)}>
          <span {...sx(s.topbarTitle)}>{headerTitle()}</span>
          <div {...sx(s.spacer)} />
          <div
            {...sx(s.segToggle)}
            role="radiogroup"
            aria-label="LLM provider"
          >
            <button
              type="button"
              role="radio"
              aria-checked={tweaks().provider === 'anthropic'}
              {...sx(s.segBtn, tweaks().provider === 'anthropic' && s.segBtnOn)}
              onClick={() => setTweaks({ provider: 'anthropic' })}
              disabled={chat.running()}
              title="Use Anthropic Claude"
            >
              Anthropic
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={tweaks().provider === 'openai'}
              {...sx(s.segBtn, tweaks().provider === 'openai' && s.segBtnOn)}
              onClick={() => setTweaks({ provider: 'openai' })}
              disabled={chat.running()}
              title="Use OpenAI"
            >
              OpenAI
            </button>
          </div>
          <div {...sx(s.segToggle)} role="radiogroup" aria-label="Language">
            <button
              type="button"
              role="radio"
              aria-checked={tweaks().lang === 'en'}
              {...sx(s.segBtn, tweaks().lang === 'en' && s.segBtnOn)}
              onClick={() => setTweaks({ lang: 'en' })}
            >
              EN
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={tweaks().lang === 'fr'}
              {...sx(s.segBtn, tweaks().lang === 'fr' && s.segBtnOn)}
              onClick={() => setTweaks({ lang: 'fr' })}
            >
              FR
            </button>
          </div>
          <button
            type="button"
            {...sx(
              s.inspectorToggle,
              chat.inspectorOpen() && s.inspectorToggleOn,
            )}
            disabled={!hasAnyResults()}
            onClick={() => chat.setInspectorOpen(!chat.inspectorOpen())}
          >
            <Icon.Side /> Inspector
          </button>
        </div>

        <Show when={!isEmpty()} fallback={<EmptyState onPick={onPick} />}>
          <div {...sx(s.thread)} ref={threadEl}>
            <div {...sx(s.threadInner)}>
              <For each={chat.messages}>
                {(msg) =>
                  msg.role === 'user' ? (
                    <div {...sx(s.userRow)}>
                      <div {...sx(s.userBubble)}>{msg.text}</div>
                    </div>
                  ) : (
                    <AssistantMessage
                      msg={msg}
                      focusedCallId={chat.focusedCallId()}
                      onFocusCall={(id) => {
                        chat.setFocusedCall(id)
                        chat.setInspectorOpen(true)
                      }}
                      autoCollapseThinking={!tweaks().showThinkingByDefault}
                      defaultThinkingOpen={tweaks().showThinkingByDefault}
                    />
                  )
                }
              </For>
            </div>
          </div>
        </Show>

        <Composer
          value={input()}
          setValue={setInput}
          onSend={send}
          onStop={chat.abort}
          running={chat.running()}
        />
      </main>

      <Inspector
        open={chat.inspectorOpen()}
        calls={allCalls()}
        focusedCallId={chat.focusedCallId()}
        onClose={() => chat.setInspectorOpen(false)}
        onFocusCall={chat.setFocusedCall}
      />

      <TweaksPanel
        open={tweaksOpen()}
        onOpenChange={setTweaksOpen}
        onReplay={(text) => {
          chat.reset()
          // give reset() a tick before sending so the reset state lands first
          queueMicrotask(() => send(text))
        }}
      />
    </>
  )
}

const s = stylex.create({
  center: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    background: 'var(--paper)',
    flex: 1,
  },
  topbar: {
    height: 48,
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderBottom: '1px solid var(--line)',
    flexShrink: 0,
  },
  topbarTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--ink-2)',
  },
  spacer: { flex: 1 },
  segToggle: {
    display: 'flex',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  },
  segBtn: {
    background: 'transparent',
    border: 0,
    padding: '4px 10px',
    fontSize: 11,
    fontFamily: 'var(--mono)',
    color: 'var(--ink-4)',
    letterSpacing: '0.04em',
    cursor: 'pointer',
    ':hover:not(:disabled)': { color: 'var(--ink-2)' },
    ':disabled': { opacity: 0.55, cursor: 'not-allowed' },
  },
  segBtnOn: { background: 'var(--paper-3)', color: 'var(--ink)' },
  inspectorToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 10px',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-sm)',
    background: 'var(--paper)',
    fontSize: 12,
    color: 'var(--ink-2)',
    cursor: 'pointer',
    ':hover': { background: 'var(--paper-3)' },
    ':disabled': { opacity: 0.45, cursor: 'not-allowed' },
  },
  inspectorToggleOn: {
    background: 'var(--ink)',
    color: 'var(--paper)',
    borderColor: 'var(--ink)',
  },
  thread: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 0 8px',
    scrollBehavior: 'smooth',
  },
  threadInner: {
    maxWidth: 760,
    margin: '0 auto',
    padding: '0 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 28,
  },
  userRow: { alignSelf: 'flex-end', maxWidth: '78%' },
  userBubble: {
    background: 'var(--ink)',
    color: 'var(--paper)',
    padding: '10px 14px',
    borderRadius: '14px 14px 4px 14px',
    fontSize: 14,
    lineHeight: 1.55,
  },
})
