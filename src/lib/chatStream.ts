import type { ChatChunkT, ChatTurnT } from "./types";

interface StreamOptionsT {
  provider?: "anthropic" | "openai";
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
 * POST /chat/stream — Server-Sent Events over fetch (POST is required, so
 * EventSource is not an option). Yields parsed ChatChunk events one by one
 * to `onChunk` until the stream finishes (`done` or `error`) or the signal
 * aborts.
 */
export async function streamChat(
  messages: ChatTurnT[],
  onChunk: (chunk: ChatChunkT) => void,
  opts: StreamOptionsT = {},
): Promise<void> {
  const base = opts.baseUrl ?? "";
  const url = `${base}/chat/stream`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-request-id": crypto.randomUUID(),
    },
    body: JSON.stringify({
      messages,
      provider: opts.provider,
    }),
    signal: opts.signal,
  });

  if (!res.ok) throw new Error(await readProblem(res));
  if (!res.body) throw new Error("Empty response body from /chat/stream");

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buf += value;
    // SSE event boundary is "\n\n"
    const events = buf.split("\n\n");
    buf = events.pop() ?? "";
    for (const evt of events) {
      const chunk = parseEvent(evt);
      if (chunk) onChunk(chunk);
    }
  }
}
