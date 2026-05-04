import type { ChatChunk, ChatTurn } from './types'

interface StreamOptions {
  provider?: 'anthropic' | 'openai'
  signal?: AbortSignal
  baseUrl?: string
}

/**
 * POST /chat/stream — Server-Sent Events over fetch (POST is required, so
 * EventSource is not an option). Yields parsed ChatChunk events one by one
 * to `onChunk` until the stream finishes (`done` or `error`) or the signal
 * aborts.
 */
export async function streamChat(
  messages: Array<ChatTurn>,
  onChunk: (chunk: ChatChunk) => void,
  opts: StreamOptions = {},
): Promise<void> {
  const base = opts.baseUrl ?? ''
  const url = `${base}/chat/stream`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-request-id': crypto.randomUUID(),
    },
    body: JSON.stringify({
      messages,
      provider: opts.provider,
    }),
    signal: opts.signal,
  })

  if (!res.ok) {
    let detail = res.statusText
    try {
      const problem = (await res.json()) as { title?: string; detail?: string }
      detail = `${problem.title ?? res.statusText}${problem.detail ? `: ${problem.detail}` : ''}`
    } catch {
      // body wasn't JSON — keep the status text
    }
    throw new Error(detail)
  }

  if (!res.body) throw new Error('Empty response body from /chat/stream')

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
  let buf = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) return
    buf += value
    // SSE event boundary is "\n\n"
    const events = buf.split('\n\n')
    buf = events.pop() ?? ''
    for (const evt of events) {
      const line = evt.split('\n').find((l) => l.startsWith('data: '))
      if (!line) continue
      try {
        const chunk = JSON.parse(line.slice(6)) as ChatChunk
        onChunk(chunk)
      } catch {
        // ignore unparseable line — protocol allows future event types
      }
    }
  }
}
