import type { ChatChunkT, ChatTurnT } from "@/lib/types";

interface StreamOptionsT {
  provider?: "anthropic" | "openai";
  /** ISO 639-1 language code for assistant reasoning + reply (`en` | `fr`). */
  lang?: string;
  /** When set, the backend prepends the persisted thread server-side. */
  conversationId?: string;
  signal?: AbortSignal;
  baseUrl?: string;
}

interface ProblemT {
  title?: string;
  detail?: string;
}

async function readProblem(res: Response): Promise<string> {
  try {
    const problem = (await res.json()) as ProblemT;
    const head = problem.title ?? res.statusText;
    const tail = problem.detail;
    return tail ? `${head}: ${tail}` : head;
  } catch {
    return res.statusText;
  }
}

function parseEvent(evt: string): ChatChunkT | null {
  const line = evt.split("\n").find((l) => l.startsWith("data: "));
  if (!line) return null;
  try {
    return JSON.parse(line.slice(6)) as ChatChunkT;
  } catch {
    return null;
  }
}

/**
 * POST /chat/stream — Server-Sent Events over fetch.
 *
 * EventSource isn't an option (we need POST), so we read the response body
 * by hand. Yields parsed `ChatChunk` events one by one until the stream
 * finishes (`done` or `error`) or the `signal` aborts.
 *
 * Usage:
 *   for await (const chunk of streamChat(turns, { signal })) { ... }
 */
export async function* streamChat(
  messages: ChatTurnT[],
  opts: StreamOptionsT = {},
): AsyncGenerator<ChatChunkT, void, undefined> {
  const base = opts.baseUrl ?? "";
  const url = `${base}/chat/stream`;

  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
      "x-request-id": crypto.randomUUID(),
    },
    body: JSON.stringify({
      messages,
      provider: opts.provider,
      lang: opts.lang,
      conversationId: opts.conversationId,
    }),
    signal: opts.signal,
  });

  if (!res.ok) throw new Error(await readProblem(res));
  if (!res.body) throw new Error("Empty response body from /chat/stream");

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      buf += value;
      // SSE event boundary is "\n\n"
      const events = buf.split("\n\n");
      buf = events.pop() ?? "";
      for (const evt of events) {
        const chunk = parseEvent(evt);
        if (chunk) yield chunk;
      }
    }
  } finally {
    // Releases the underlying lock so an aborted/cancelled stream doesn't
    // pin the response body.
    reader.releaseLock();
  }
}
