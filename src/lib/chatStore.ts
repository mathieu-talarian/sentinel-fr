import { batch, createSignal } from 'solid-js'
import { createStore, produce } from 'solid-js/store'

import { streamChat } from './chatStream'
import type {
  AssistantMessageData,
  ChatTurn,
  Message,
  ToolCall,
  UserMessageData,
} from './types'
import type { Provider } from './tweaks'

interface SendArgs {
  text: string
}

const newId = (prefix: string) =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`

const blankAssistant = (id: string): AssistantMessageData => ({
  id,
  role: 'assistant',
  thinking: '',
  thinkingActive: true,
  thinkingMs: undefined,
  thinkingStartedAt: Date.now(),
  calls: [],
  reply: '',
  streaming: true,
  caveats: undefined,
  done: false,
})

export interface ChatStore {
  messages: ReadonlyArray<Message>
  running: () => boolean
  focusedCallId: () => string | null
  inspectorOpen: () => boolean
  send: (args: SendArgs) => Promise<void>
  abort: () => void
  reset: () => void
  setFocusedCall: (id: string | null) => void
  setInspectorOpen: (open: boolean) => void
}

interface ChatStoreOpts {
  /** Auto-open the inspector + focus the first tool result that arrives. */
  autoOpenInspector?: () => boolean
  /** Provider to send with each request — read at send-time so it stays live. */
  provider?: () => Provider
}

export function createChatStore(opts: ChatStoreOpts = {}): ChatStore {
  const [messages, setMessages] = createStore<Array<Message>>([])
  const [running, setRunning] = createSignal(false)
  const [focusedCallId, setFocusedCallId] = createSignal<string | null>(null)
  const [inspectorOpen, setInspectorOpen] = createSignal(false)
  let abortCtrl: AbortController | null = null

  const updateAssistant = (
    id: string,
    fn: (m: AssistantMessageData) => void,
  ) => {
    setMessages(
      produce((arr) => {
        const idx = arr.findIndex((m) => m.id === id)
        if (idx === -1) return
        const m = arr[idx]
        if (m.role !== 'assistant') return
        fn(m)
      }),
    )
  }

  const send = async ({ text }: SendArgs) => {
    if (running()) return

    // Snapshot history BEFORE mutating, otherwise the new user/assistant rows
    // would land in `turns` and the backend would see the user message twice
    // plus an empty assistant turn.
    const turns: Array<ChatTurn> = messages
      .filter((m) => m.role === 'user' || m.reply)
      .map((m) =>
        m.role === 'user'
          ? { role: 'user' as const, content: m.text }
          : { role: 'assistant' as const, content: m.reply },
      )
    turns.push({ role: 'user', content: text })

    const userMsg: UserMessageData = { id: newId('u'), role: 'user', text }
    const asstId = newId('a')
    const asstMsg = blankAssistant(asstId)

    batch(() => {
      setMessages([...messages, userMsg, asstMsg])
      setFocusedCallId(null)
      setRunning(true)
    })

    abortCtrl = new AbortController()

    try {
      await streamChat(
        turns,
        (chunk) => {
          // chunk-handler is a closure on the active assistant id — switch:
          switch (chunk.type) {
            case 'reasoning':
              updateAssistant(asstId, (m) => {
                m.thinking = chunk.text
                m.thinkingActive = true
                if (m.thinkingStartedAt == null) m.thinkingStartedAt = Date.now()
              })
              break
            case 'reasoning_delta':
              updateAssistant(asstId, (m) => {
                m.thinking = m.thinking + chunk.text
                m.thinkingActive = true
                if (m.thinkingStartedAt == null) m.thinkingStartedAt = Date.now()
              })
              break
            case 'tool_call': {
              // First non-reasoning event closes the thinking window.
              updateAssistant(asstId, (m) => {
                if (m.thinkingActive && m.thinkingStartedAt != null) {
                  m.thinkingMs = Date.now() - m.thinkingStartedAt
                  m.thinkingActive = false
                }
                const call: ToolCall = {
                  id: chunk.call_id,
                  tool: chunk.name,
                  args: chunk.args,
                  status: 'in-flight',
                  startedAt: Date.now(),
                }
                m.calls.push(call)
              })
              break
            }
            case 'tool_result': {
              updateAssistant(asstId, (m) => {
                const call = m.calls.find((c) => c.id === chunk.call_id)
                if (!call) return
                call.status = 'complete'
                call.result = chunk.content
                call.durationMs = Date.now() - call.startedAt
                // Heuristic: surface caveats from any landed-cost result.
                const c = chunk.content as
                  | { caveats?: Array<string> }
                  | undefined
                if (c?.caveats?.length) m.caveats = c.caveats
              })
              if (opts.autoOpenInspector?.() ?? true) {
                batch(() => {
                  setInspectorOpen(true)
                  if (focusedCallId() == null) setFocusedCallId(chunk.call_id)
                })
              }
              break
            }
            case 'delta':
              updateAssistant(asstId, (m) => {
                if (m.thinkingActive && m.thinkingStartedAt != null) {
                  m.thinkingMs = Date.now() - m.thinkingStartedAt
                  m.thinkingActive = false
                }
                m.reply = m.reply + chunk.text
              })
              break
            case 'turn_end':
              updateAssistant(asstId, (m) => {
                m.usage = chunk.usage
              })
              break
            case 'error':
              updateAssistant(asstId, (m) => {
                m.error = chunk.message
                m.streaming = false
                m.thinkingActive = false
                m.done = true
              })
              break
            case 'done':
              updateAssistant(asstId, (m) => {
                m.streaming = false
                m.thinkingActive = false
                m.done = true
                if (chunk.usage) m.usage = chunk.usage
              })
              break
          }
        },
        { signal: abortCtrl.signal, provider: opts.provider?.() },
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      // Aborts are user-driven — surface anything else as a stream error.
      if (msg !== 'AbortError' && !msg.includes('aborted')) {
        updateAssistant(asstId, (m) => {
          m.error = msg
        })
      }
      updateAssistant(asstId, (m) => {
        m.streaming = false
        m.thinkingActive = false
        m.done = true
      })
    } finally {
      abortCtrl = null
      setRunning(false)
    }
  }

  const abort = () => {
    abortCtrl?.abort()
  }

  const reset = () => {
    if (running()) abort()
    batch(() => {
      setMessages([])
      setFocusedCallId(null)
      setInspectorOpen(false)
    })
  }

  return {
    get messages() {
      return messages
    },
    running,
    focusedCallId,
    inspectorOpen,
    send,
    abort,
    reset,
    setFocusedCall: setFocusedCallId,
    setInspectorOpen,
  }
}
