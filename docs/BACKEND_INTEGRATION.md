# Sentinel — Backend Integration Notes

Audience: backend engineers. This doc captures the contract the
**sentinel-fr** frontend depends on. It is grounded in the live OpenAPI
schema at `/api-doc/openapi.json` (auto-mirrored to
`src/lib/api/generated/` on every `yarn run gen:api`) and the SSE protocol
in `docs/CHAT_SSE_PROTOCOL.md` (sentinel repo).

It is organised as **shipped reality first, gaps last**:

- §§ 0–1 — naming + error conventions (frozen contract)
- § 2 — endpoints already shipped, with the actual response shapes the FE
  reads. Treat these as a "please don't break" list
- § 3 — drift between today's spec and the canonical shapes the FE wants.
  These are bugs to fix before doubling down on tool result rendering
- § 4 — SSE additions still pending (the spec doesn't model SSE bodies, so
  these gaps survive the OpenAPI roundtrip)
- §§ 5–6 — quality-of-life signals + auth/plumbing nice-to-haves
- § 7 — quick-win order

---

## 0 · Hard wire convention: **camelCase, everywhere**

> **Every JSON property on every request body, response body, SSE chunk, query
> parameter (where applicable), header value, and persisted cookie payload —
> sent OR received — must be `camelCase`. No exceptions. No `snake_case`,
> no `kebab-case`, no `PascalCase`.**

That includes:

- response bodies for every endpoint in this doc
- request bodies (`/auth/sign-in`, `/chat/stream`, `/landed-cost`,
  `/classify`, …)
- every SSE chunk on `/chat/stream` (chunk type discriminator stays `type`,
  field names underneath are camelCase: `callId`, `messageId`,
  `conversationId`, `inputTokens`, …)
- nested objects, arrays of objects, error envelopes — all the way down

HTTP header names follow standard HTTP casing (`X-Request-Id`,
`X-Csrf-Token`, `Server-Timing`) — those are not JSON and stay as-is.
Cookie names (`sentinelSession`) are camelCase too; they are not
user-facing, but keeping the convention everywhere removes the only spot
the team has to remember an exception.

Tool-registry identifiers (`get_code_details`, `find_cross_rulings`,
`subscribe_watch`, …) are **enum string values** the model emits, not
field names. They stay `snake_case` because changing them is an
LLM-prompt-engineering question, not a wire question. Field names that
*carry* them (`tool`, `name`) are camelCase as usual.

### How errors look — RFC 9457 Problem Details

The backend serves [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html)
(successor to RFC 7807) with the standard `application/problem+json`
content type. The FE reads this shape via the generated `Problem` type.

```http
HTTP/1.1 504 Gateway Timeout
Content-Type: application/problem+json
X-Request-Id: req_01H8E…

{
  "type": "https://sentinel.example/problems/upstream-timeout",
  "title": "Catalog index timed out",
  "status": 504,
  "detail": "search_codes took 8.2s, threshold 5s",
  "instance": "/chat/stream/req_01H8E…",
  "code": "upstreamTimeout",
  "requestId": "req_01H8E…"
}
```

Standard members (`type`, `title`, `status`, `detail`, `instance`) keep
their RFC-defined names. Extension members (`code`, `requestId`) follow
§ 0:

- `code` *(extension)* — stable machine identifier, camelCase enum string
  (`"upstreamTimeout"`, `"emailUnverified"`, `"stateMismatch"`).
- `requestId` *(extension)* — echoes the inbound `X-Request-Id` header.

Streaming errors on `/chat/stream` follow the existing `error` SSE chunk
(`{"type":"error","message":"…"}`), not the JSON Problem shape — once the
stream opens (`200 + text/event-stream`), problem details only apply to
*pre-stream* failures.

---

## 1 · Frontend wiring — how the spec is consumed

The FE pulls the OpenAPI document via `@hey-api/openapi-ts` codegen. The
generated SDK lives at `src/lib/api/generated/` and is git-tracked but
eslint-ignored. Three artifacts the FE reads from there:

- `sdk.gen.ts` — typed fetch functions (`authMe()`, `conversationsList()`,
  `landedCost()`, …)
- `types.gen.ts` — every request/response shape
- `@tanstack/react-query.gen.ts` — `*Options` for `useQuery`, `*Mutation`
  for `useMutation`

The **runtime client** is bootstrapped in `src/lib/api/client.ts`:

- `baseUrl: ""` overrides the spec-derived `https://localhost:8888` so the
  Vite dev proxy + production reverse-proxy stay seamless
- `credentials: "include"` for the HttpOnly `sentinelSession` cookie
- per-request `X-Request-Id` interceptor so every call gets a correlation
  id

`yarn run gen:api` regenerates the SDK whenever `/api-doc/openapi.json`
drifts. **Spec changes ARE the contract** — once a shape lands in the
schema, treat the FE as bound to it.

---

## 2 · Endpoints already shipped — current contracts

Every endpoint listed here is in the live spec and the FE consumes the
generated SDK directly. Treat these shapes as "frozen unless we coordinate
a cutover".

### 2.1 `GET /auth/me`, `POST /auth/sign-in`, `POST /auth/sign-out`

Existing auth endpoints. `signIn` accepts `{ email, password, rememberMe?
}`; `me`/`signIn` return `{ session: { email, expiresAt, rememberMe } }`.
The FE wraps `meQueryOptions` in `src/lib/api/queries.ts` so a 401 maps to
`null` (the route guards rely on this) and the envelope is unwrapped to a
flat `SessionView | null`.

### 2.2 `GET /conversations`

Lists prior conversations for the rail.

```json
{
  "conversations": [
    {
      "id": "conv_01H8E…",
      "title": "Wine import duty — 2023 vintage Bordeaux",
      "lastMessageAt": "2026-05-05T09:14:22Z",
      "summary": "Classification + duty rate for FR→US Bordeaux"
    }
  ],
  "nextCursor": null
}
```

Query params: `limit?`, `cursor?`. ✅ Matches FE expectations.

### 2.3 `GET /conversations/{id}` + `PATCH /conversations/{id}` + `DELETE /conversations/{id}`

`GET` returns `{ id, title, messages, createdAt }`. `PATCH` takes
`{ title }`. `DELETE` is empty-body. ✅ All present, and
`ConversationMessage.toolCalls` / `.usage` are now typed
(`Array<ToolCallView>` / `UsageView`) — the FE can rehydrate saved
threads end-to-end. The rail-item-click "open saved thread" feature is
unblocked.

### 2.4 `GET /alerts` (`frontendAlerts`)

```json
{
  "alerts": [
    {
      "date": "2026-04-22",
      "code": "8517.13",
      "source": "CSMS #59812",
      "status": "sent",
      "subject": "USMCA: clarification on smartphone country-of-origin marking",
      "url": "https://content.govdelivery.com/bulletins/…"
    }
  ]
}
```

✅ Matches. `url` is optional, FE handles missing.

### 2.5 `GET /catalog/stats`

```json
{
  "htsCodesIndexed": 13847,
  "crossRulingsSince": 2002,
  "activeAlerts": 3,
  "lastIndexedAt": "2026-05-04T03:00:00Z"
}
```

✅ Matches.

### 2.6 `POST /chat/stream` and `POST /chat`

Body (`ChatBody`):

```jsonc
{
  "messages": [
    { "role": "user", "content": "What's the duty on a leather handbag?" }
  ],
  "provider": "anthropic",       // optional — falls back to server default
  "lang": "fr",                  // optional — controls assistant output language
  "conversationId": "conv_01H8E…" // optional — server prepends persisted history
}
```

✅ Backend accepts both `lang` and `conversationId`. The FE now sends
`lang` from `tweaks.lang` (`chatStream.ts` + `chatThunks.ts`).
`conversationId` is wired but not yet populated — FE waits for a
`turnStart` SSE chunk to learn the id (§ 4.4).

`/chat/stream` returns `200 + text/event-stream`. Chunk shapes are
**not** in the OpenAPI schema (response is typed `unknown`); see § 4.

### 2.7 Tool-registry endpoints (REST mirrors of the LLM tools)

These power the agent's tool calls; the FE doesn't call them directly
today but the SDK is generated for future use:

| Endpoint | SDK function | Notes |
|---|---|---|
| `GET /code/{code}` | `getCode` | ✅ canonical `CommodityBody` (§ 3.2) |
| `POST /search` | `search` | ✅ canonical `SearchCandidate` (§ 3.1). Now POST + body — `searchOptions` became `searchMutation` |
| `POST /landed-cost` | `landedCost` | ✅ canonical shape (§ 3.3) |
| `GET /watch/alerts` | `watchAlerts` | List recent alerts |
| `POST /watch/check` | `watchCheck` | One-shot alert check |
| `POST /watch/subscribe` | `watchSubscribe` | Create an alert subscription |
| `POST /classify` | `classify` | ✅ camelCase request body (§ 3.4) |

### 2.8 Infra endpoints

`GET /health`, `GET /db/info` — present, FE doesn't consume.

---

## 3 · Drift — closed in the latest spec

Most of this section was a list of shapes that ship'd in snake_case or
typed `unknown`. The backend has since **closed all the major drift items**;
this section now records the current state for future regression-tracking.

### 3.1 `POST /search` — ✅ canonical `SearchCandidate`, FE migrated

```json
{
  "candidates": [
    {
      "code": "4202.21.00.00",
      "description": { "en": "Handbags, leather…", "fr": "Sacs à main, cuir…" },
      "score": 0.873,
      "scoreComponents": { "lexical": 0.65, "semantic": 0.91 }
    }
  ]
}
```

`Hit` is gone. `SearchCandidate` carries `description: LocalizedDescription`
(`{en?, fr?}`) and a single `score` (the fused one), with optional
`scoreComponents` for a future power-user tooltip. `SearchResult.tsx` now
consumes the canonical shape and honours `tweaks.lang` for label selection.

Note: `/search` is now POST-with-body (`SearchRequest = { q, lang?, k? }`).
The generated tanstack helper is `searchMutation` (no `searchOptions`).

### 3.2 `GET /code/{code}` — ✅ canonical `CommodityBody`, FE migrated

```json
{
  "code": "4202.21.00.00",
  "found": true,
  "description": { "en": "…", "fr": "…" },
  "hierarchy": [
    { "code": "4202", "description": { "en": "…", "fr": "…" }, "isDeclarable": false }
  ],
  "rate": { "value": "8.0%", "kind": "adValorem", "sourceCode": "MFN" },
  "unit": "kg",
  "section301": "List 1, +25%",
  "isDeclarable": true
}
```

Old `CommodityEntry` (with `desc_en` / `desc_fr` / `hier_pos` /
`is_declarable`) is gone — replaced by `CommodityHierarchyEntry` and a
top-level `CommodityRate`. `CodeDetails.tsx` now reads `description`,
`rate.value`, `unit`, `hierarchy` directly (no fallback chain) and honours
`tweaks.lang`.

### 3.3 `POST /landed-cost` — ✅ canonical, FE migrated

`LandedCostResponse = { code, currency, rows, total, transport, caveats }`.
`LandedCost.tsx` reads from the generated alias; ~25 lines of `*_usd`
fallback reconstruction were dropped.

### 3.4 `POST /classify` — ✅ camelCase request body

`ClassifyBody = { description, declaredValueUsd?, freightUsd?, refDate?,
destination?, transport?, lang? }`. No FE consumer today (the agent calls
the tool internally), but the spec is now in line with § 0.

### 3.5 `ConversationMessage.toolCalls` and `.usage` — ✅ typed

```ts
toolCalls?: Array<ToolCallView> | null;
usage?: null | UsageView;
```

`ToolCallView = { id, tool, args, code?, durationMs?, message?, result?, status }`,
`UsageView = { cachedInputTokens, inputTokens, outputTokens, totalTokens }`.
Replaying a saved thread is now wire-typed end-to-end.

### 3.6 `subscribe_watch` — ✅ canonical, FE migrated

`WatchSubscribeResponse` is now the confirmation envelope:

```json
{
  "ok": true,
  "subscriptionId": "sub_01H8E…",
  "email": "marie@exporter.fr",
  "codes": ["8517.13"],
  "sources": ["CSMS", "Federal Register"],
  "cadence": "daily",
  "createdAt": "2026-04-22T09:00:00Z",
  "subscriptions": [/* all of the user's WatchSubscriptionView entries */]
}
```

`WatchSubscriptionView` carries `{ id, email, codePrefix, sources,
cadence, active, createdAt }` so the future "Manage subscriptions" pane
can display each watch in full. The SSE tool-result content for
`subscribe_watch` carries the same shape — REST = SSE rule preserved.

`SubscribeConfirm.tsx` reads from the alias; `SubscribeWatchContentT` in
`src/lib/types.ts` is now `WatchSubscribeResponse`. The hand-written
tool-result type list now contains exactly one entry: `CrossRulingsContentT`.

This is the only place where the SSE tool-result shape and the REST
shape diverge.

---

## 4 · `/chat/stream` SSE protocol — still pending

OpenAPI doesn't model SSE bodies, so these gaps don't show up in the spec
roundtrip. Each one is a backend-only change.

### 4.1 `toolError` chunk (must-have)

A failing tool currently never emits `tool_result`, leaving the pill
stuck on `"in-flight"` forever. Add:

```text
data: {"type":"toolError","callId":"call_…","message":"Catalog index timeout","code":"upstreamTimeout"}
```

Reducer matches existing `toolResult` branch but flips the call to
`status: "failed"` with the message. UI changes are 5 lines.

### 4.2 `toolCallDelta` is declared but unused

The FE reducer ignores it. Either remove the chunk type from the
protocol, or start emitting it and we'll wire a reducer to live-update
`call.args` so the pill suffix populates as the model writes.

### 4.3 Carry `tool` on `toolResult`

Today `toolResult` only has `callId`. Adding `tool` (or `name`) inline
saves a `find` per chunk and lets us drop ToolPill→ResultCard
cross-references:

```text
data: {"type":"toolResult","callId":"call_…","tool":"get_code_details","content":{…}}
```

### 4.4 `turnStart` — server-issued message id

Today the FE mints `newId("a")` in `chatThunks.ts:60`. A server-issued id
is required to populate `conversationId` for follow-up turns:

```text
data: {"type":"turnStart","messageId":"msg_…","conversationId":"conv_…"}
```

### 4.5 Chunk-type discriminator: camelCase

After the camelCase pass, every chunk's `type` value goes camelCase too:

| today | new |
|---|---|
| `delta` | `delta` |
| `reasoning` | `reasoning` |
| `reasoning_delta` | `reasoningDelta` |
| `tool_call` | `toolCall` |
| `tool_call_delta` | `toolCallDelta` |
| `tool_result` | `toolResult` |
| `tool_error` *(new)* | `toolError` |
| `turn_start` *(new)* | `turnStart` |
| `turn_end` | `turnEnd` |
| `error` | `error` |
| `done` | `done` |

The reducer in `src/lib/state/chatSlice.ts` currently switches on the
snake_case forms — the FE will rename them in lock-step with the BE PR.

### 4.6 Heartbeat

Long tool calls (CROSS rulings can take 3–5 s) plus an idle-30 s nginx /
Cloudflare timeout = orphaned streams. Send an SSE comment frame every
15 s:

```text
: heartbeat

```

The FE reader already discards comment frames.

### 4.7 Pick one home for `usage`

`turnEnd` carries `usage` mandatorily; `done` carries it optionally. Drop
`done.usage` so `done` is just a terminator.

### 4.8 Abort propagation

When `AbortController.abort()` fires on the FE, `chatStream.ts` cancels
the body read. The backend should propagate the cancellation upstream
(LLM provider) so we stop spending tokens.

### 4.9 Echo `requestId`

The FE sends `X-Request-Id`. Echo it as a response header AND optionally
inline `requestId` on every chunk so the inspector can correlate a tool
call to a Sentry/Loki trace.

---

## 5 · New per-request signals

### 5.1 `lang` on `/chat/stream` — ✅ shipped & FE-wired

Backend accepts `lang` in `ChatBody`; FE sends `tweaks.lang`. Topbar
EN/FR toggle is now functional.

### 5.2 `conversationId` on `/chat/stream` — ✅ shipped, FE half-wired

Backend accepts it; FE only sends it once a `turnStart` chunk has
populated it (still pending — § 4.4). Until then continuing a thread
means re-sending the full `messages` array.

### 5.3 Optional `toolCall.estimatedDurationMs`

```text
data: {"type":"toolCall","callId":"…","name":"find_cross_rulings","args":{…},"estimatedDurationMs":4500}
```

Lets the pill show a determinate progress bar instead of an
indeterminate spinner. Skip if the model can't predict it — purely
additive.

### 5.4 Caveats on `toolResult`, not on the assistant message

Today `chatSlice.ts:106-108` lifts caveats off `toolResult.content` and
pins them to the assistant message. Only `landed_cost` actually
populates them. Per-tool caveats should live on each tool result so the
inspector can show them next to the relevant card.

### 5.5 Server-side suggestion bank (optional)

`src/lib/utils/suggestions.ts` is hardcoded. Expose:

```text
GET /suggestions?lang=en
→ { "suggestions": [ { "id": "classify", "tag": "CLASSIFY", "text": "…" }, … ] }
```

Lets you A/B prompts, localise them, and personalise.

---

## 6 · Auth + plumbing nice-to-haves

### 6.1 CSRF posture

The FE sends `credentials: "include"` on every same-origin fetch. If the
backend isn't pairing the HttpOnly `sentinelSession` cookie with a CSRF
token (double-submit pattern, or `SameSite=Strict` + a custom header
check), it should — current setup is implicitly trusting `SameSite=Lax`.

If a CSRF token is required, expose `/auth/csrf` returning
`{ "csrfToken": "…" }` and have it accepted in either an `X-Csrf-Token`
header or a `csrf` field. The FE wraps `client.interceptors` in
`src/lib/api/client.ts` to add it.

### 6.2 `Server-Timing` headers

On `/auth/me`, `/conversations`, `/chat/stream`. Cheap and feeds straight
into Chrome's Network panel and any future RUM:

```
Server-Timing: db;dur=12, llmFirstToken;dur=420, total;dur=512
```

---

## 7 · Quick-win order

§ 3 drift is closed. The remaining list is all SSE / wire ergonomics:

1. **Add `toolError` chunk** (§ 4.1). Fixes the worst observable UI bug
   (forever-spinning pill on tool failure).
2. **Add `turnStart` chunk** (§ 4.4) so `conversationId` becomes useful
   end-to-end and the rail can finally open saved threads. § 5.2 is
   half-wired today and waiting on this.
3. **Document SSE chunk shapes** (§ 4.5) — the spec doesn't model them.
   A separate JSON Schema or an `application/x-ndjson` discriminated
   union in the OpenAPI extras would let `@hey-api/openapi-ts` generate
   the chunk types instead of the hand-written `ChatChunkT` in
   `src/lib/types.ts`.
4. **Heartbeat on `/chat/stream`** (§ 4.6). One-liner, kills orphaned
   streams behind nginx / Cloudflare.
5. **Specify `subscribe_watch` SSE content** (§ 3.6) so the last
   hand-written tool-result type can also become a generated alias.

---

## Appendix · Wire-types reference

The FE's source of truth for every chunk is `src/lib/types.ts` (plus
imports from `src/lib/api/generated/types.gen.ts`). When you ship a new
shape, the OpenAPI schema is the canonical contract — the FE will pick it
up via `yarn run gen:api`.

Naming convention recap:

- TypeScript types end in `T` (`ChatChunkT`, `ToolCallT`, …).
- Every JSON field on the wire is `camelCase` (see § 0).
- Tool-registry identifiers (`get_code_details`, `find_cross_rulings`,
  …) are `snake_case` enum string values, not field names.
