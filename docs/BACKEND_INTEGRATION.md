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
_carry_ them (`tool`, `name`) are camelCase as usual.

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

- `code` _(extension)_ — stable machine identifier, camelCase enum string
  (`"upstreamTimeout"`, `"emailUnverified"`, `"stateMismatch"`).
- `requestId` _(extension)_ — echoes the inbound `X-Request-Id` header.

Streaming errors on `/chat/stream` follow the existing `error` SSE chunk
(`{"type":"error","message":"…"}`), not the JSON Problem shape — once the
stream opens (`200 + text/event-stream`), problem details only apply to
_pre-stream_ failures.

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
    { "role": "user", "content": "What's the duty on a leather handbag?" },
  ],
  "provider": "anthropic", // optional — falls back to server default
  "lang": "fr", // optional — controls assistant output language
  "conversationId": "conv_01H8E…", // optional — server prepends persisted history
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

| Endpoint                | SDK function     | Notes                                                                                             |
| ----------------------- | ---------------- | ------------------------------------------------------------------------------------------------- |
| `GET /code/{code}`      | `getCode`        | ✅ canonical `CommodityBody` (§ 3.2)                                                              |
| `POST /search`          | `search`         | ✅ canonical `SearchCandidate` (§ 3.1). Now POST + body — `searchOptions` became `searchMutation` |
| `POST /landed-cost`     | `landedCost`     | ✅ canonical shape (§ 3.3)                                                                        |
| `GET /watch/alerts`     | `watchAlerts`    | List recent alerts                                                                                |
| `POST /watch/check`     | `watchCheck`     | One-shot alert check                                                                              |
| `POST /watch/subscribe` | `watchSubscribe` | Create an alert subscription                                                                      |
| `POST /classify`        | `classify`       | ✅ camelCase request body (§ 3.4)                                                                 |

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
    {
      "code": "4202",
      "description": { "en": "…", "fr": "…" },
      "isDeclarable": false
    }
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
  "subscriptions": [
    /* all of the user's WatchSubscriptionView entries */
  ]
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

## 4 · `/chat/stream` SSE protocol

The SSE chunks are now first-class OpenAPI schemas (`ChatChunk`,
`ToolCallDeltaPayload`, `UsageInfo`) with `/chat/stream`'s response typed
as `text/event-stream` of `ChatChunk`. Codegen consumes them — `ChatChunkT`
in `src/lib/types.ts` is now an alias of the generated `ChatChunk` and
`UsageT` is `UsageInfo`.

### 4.1 `toolError` chunk — ✅ shipped & FE-wired

```text
data: {"type":"toolError","callId":"call_…","tool":"search_codes","message":"Catalog index timeout","code":"upstreamTimeout","requestId":"req_…"}
```

Reducer in `chatSlice.ts` flips the call to `status: "failed"` and stores
`code` + `message` on the call (`call.errorCode`, `call.errorMessage`).
The UI's existing `failed` style on `ToolPill` already paints red.

### 4.2 `toolCallDelta` — ✅ shipped & FE-wired

`ToolCallDeltaPayload` is a clean `{kind: "name" | "args"; …}`
discriminated union. The reducer applies `kind: "name"` deltas to
`call.tool` immediately so the pill text live-updates; `kind: "args"`
fragments are JSON-partial and ignored until `toolResult` arrives with
the parsed object.

### 4.3 Carry `tool` on `toolResult` — ✅ shipped

`ChatChunk.toolResult` now has `tool` (and `toolError` carries `tool?`),
so the inspector can route on the chunk directly. Today the FE still
looks the call up by `callId` because the message-side renderer needs
the start time for `durationMs`; can switch to direct `tool` if a
followup ever wants to render results without a matching `toolCall` on
record.

### 4.4 `turnStart` — ✅ shipped & FE-wired

Backend emits `{ type: "turnStart", conversationId, messageId }` at the
top of every stream. Reducer captures `state.conversationId` and the
assistant message's `serverId`. `sendChat` now forwards
`state.conversationId` on every subsequent turn — the rail can finally
resume saved threads (next FE step).

### 4.5 Chunk-type discriminator: camelCase — ✅ shipped & FE-wired

| chunk `type`     | what it carries                                   |
| ---------------- | ------------------------------------------------- |
| `turnStart`      | `conversationId, messageId, requestId?`           |
| `delta`          | `text, requestId?`                                |
| `reasoning`      | `id?, text, requestId?`                           |
| `reasoningDelta` | `id?, text, requestId?`                           |
| `toolCall`       | `callId, name, args, requestId?`                  |
| `toolCallDelta`  | `callId, delta: ToolCallDeltaPayload, requestId?` |
| `toolResult`     | `callId, tool, content, requestId?`               |
| `toolError`      | `callId, tool?, code, message, requestId?`        |
| `turnEnd`        | `usage: UsageInfo, requestId?`                    |
| `error`          | `message, requestId?`                             |
| `done`           | `requestId?`                                      |

`chatSlice.ts` switches on these directly.

### 4.6 Heartbeat — pending

Long tool calls (CROSS rulings can take 3–5 s) plus an idle-30 s nginx /
Cloudflare timeout = orphaned streams. Send an SSE comment frame every
15 s:

```text
: heartbeat

```

The FE reader already discards comment frames — the only remaining
backend change.

### 4.7 `usage` on `turnEnd` only — ✅ shipped

`turnEnd.usage` is mandatory; `done.usage` is gone. The FE reducer no
longer reads usage off `done`.

### 4.8 Abort propagation — pending

FE side already cancels the body read on `AbortController.abort()`.
Backend should propagate the cancellation upstream (LLM provider) so we
stop spending tokens. Verify with a curl that aborts mid-stream.

### 4.9 `requestId` echo — ✅ shipped

Every chunk carries an optional `requestId?: string | null` matching the
inbound `X-Request-Id`. The FE doesn't surface it in the UI yet — easy
follow-up to render a copyable correlation id on error toasts and the
inspector header.

---

## 5 · New per-request signals

### 5.1 `lang` on `/chat/stream` — ✅ shipped & FE-wired

Backend accepts `lang` in `ChatBody`; FE sends `tweaks.lang`. Topbar
EN/FR toggle is now functional.

### 5.2 `conversationId` on `/chat/stream` — ✅ end-to-end

Backend accepts it in `ChatBody`. FE captures it from the `turnStart`
chunk (§ 4.4) into `chatSlice.state.conversationId` and `sendChat`
forwards it on every subsequent turn. Server-side history resume is
live; "open saved thread" from the rail is the next FE step
(`GET /conversations/{id}` is already typed and ready).

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

## 6 · Auth + plumbing

### 6.1 CSRF — ✅ shipped

Backend enforces a custom-header check on every cookie-authenticated
mutating route: it accepts the existing `X-Request-Id` (which the FE
already sends — see `src/lib/api/client.ts` interceptor and
`chatStream.ts`) or a future `X-Csrf-Token` header. Mutating routes
(`POST /chat`, `POST /chat/stream`, `POST /auth/sign-out`,
`DELETE /conversations/{id}`, …) now respond `403 Problem` with
`code: "csrfHeaderMissing"` if neither header is present. No FE change
needed today.

The cookie was also renamed `sentinel_session` → `sentinelSession`
(SameSite=Strict). Backend still reads + clears the legacy name during
the migration window so existing sessions don't get evicted.

### 6.2 `Server-Timing` headers — ✅ shipped

Backend ships `Server-Timing` on `/auth/me`, `/chat/stream`, and the
conversation routes. Visible in Chrome's Network panel; ready for any
future RUM hookup.

---

## 7 · Quick-win order

Most of § 3 / § 4 / § 6 is closed. Remaining list:

1. **Heartbeat on `/chat/stream`** (§ 4.6). One-liner, kills orphaned
   streams behind nginx / Cloudflare.
2. **Verify upstream abort propagation** (§ 4.8). Curl an in-flight
   stream and confirm the LLM call is cancelled when the FE aborts.
3. **Specify `subscribe_watch` SSE content** (§ 3.6 — _update_: REST
   shape was canonicalised, but confirm the SSE `toolResult.content` for
   `subscribe_watch` carries the same `WatchSubscribeResponse`). Once
   confirmed, no FE change.
4. **Surface `requestId`** in the FE error UI (§ 4.9). Pure FE follow-up
   — copy the correlation id onto error toasts + the inspector header.
5. **Wire "open saved thread" from the rail** (§ 5.2). Backend ready;
   FE just needs the click handler to call `conversationGet` and
   replay `messages` into the chat slice.

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
