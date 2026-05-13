import type { ChatChunkT, ChatTurnT } from "@/lib/types";

import * as Sentry from "@sentry/react";
import { EventSourceParserStream } from "eventsource-parser/stream";

import { API_BASE_URL } from "@/lib/api/client";
import { getIdToken } from "@/lib/firebase/auth";

interface StreamOptionsT {
  provider?: "anthropic" | "openai";
  /** ISO 639-1 language code for assistant reasoning + reply (`en` | `fr`). */
  lang?: string;
  /** When set, the backend prepends the persisted thread server-side. */
  conversationId?: string;
  /**
   * When set, the stream is routed to the case-aware endpoint
   * (`POST /import-cases/{caseId}/chat/stream`). The backend injects
   * the case context — facts, line items, latest quote — before the
   * model's first user turn, and may emit `casePatchSuggestion` chunks.
   * Falls back to the un-cased `/chat/stream` when omitted.
   */
  caseId?: string;
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

const parseChunk = (data: string): ChatChunkT | null => {
  try {
    return JSON.parse(data) as ChatChunkT;
  } catch {
    // Don't capture — malformed SSE frames happen on truncated reads and
    // shouldn't page anyone. Breadcrumb so the next captured event has
    // context if the corruption is upstream of an actual failure.
    Sentry.addBreadcrumb({
      category: "sse",
      level: "warning",
      message: "Malformed SSE data line",
      data: { preview: data.slice(0, 120) },
    });
    return null;
  }
};

/**
 * POST `/chat/stream` (legacy) or `/import-cases/{caseId}/chat/stream`
 * (case-aware) — Server-Sent Events over fetch.
 *
 * EventSource isn't an option (we need POST), so we read the response body
 * as a stream and pipe through `TextDecoderStream` →
 * `EventSourceParserStream`. Yields parsed `ChatChunk` events one by one
 * until the stream finishes (`done` or `error`) or the `signal` aborts.
 */
export async function* streamChat(
  messages: ChatTurnT[],
  opts: StreamOptionsT = {},
): AsyncGenerator<ChatChunkT, void, undefined> {
  const base = opts.baseUrl ?? API_BASE_URL;
  const url = opts.caseId
    ? `${base}/import-cases/${opts.caseId}/chat/stream`
    : `${base}/chat/stream`;

  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-request-id": crypto.randomUUID(),
  };
  const token = await getIdToken();
  if (token) headers.authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    method: "POST",
    headers,
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

  const reader = res.body
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new EventSourceParserStream())
    .getReader();
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return;
      const chunk = parseChunk(value.data);
      if (chunk) yield chunk;
    }
  } finally {
    // Releases the underlying lock so an aborted/cancelled stream doesn't
    // pin the response body.
    reader.releaseLock();
  }
}
