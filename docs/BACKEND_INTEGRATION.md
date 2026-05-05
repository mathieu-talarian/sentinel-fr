# Sentinel — Backend Integration Notes

Audience: backend engineers. This doc captures everything the **sentinel-fr** frontend
needs from the API to fully turn on the screens it already ships. It is grounded in
the wire types (`src/lib/types.ts`), the query layer (`src/lib/api/queries.ts`,
`src/lib/api/auth.ts`, `src/lib/api/chatStream.ts`), and the renderer organisms
(`src/components/organisms/results/*`).

It is organised by **shippable change**, with a request/response shape for each.
Each section ends with a "frontend payoff" line so you can prioritise.

---

## 0 · Hard wire convention: **camelCase, everywhere**

> **Every JSON property on every request body, response body, SSE chunk, query
> parameter (where applicable), header value, and persisted cookie payload —
> sent OR received — must be `camelCase`. No exceptions. No `snake_case`,
> no `kebab-case`, no `PascalCase`.**

That includes:

- response bodies for every endpoint in this doc
- request bodies (`/auth/sign-in`, `/chat/stream`, …)
- every SSE chunk on `/chat/stream` (chunk type discriminator stays `type`,
  field names underneath are camelCase: `callId`, `messageId`,
  `conversationId`, `inputTokens`, …)
- nested objects, arrays of objects, error envelopes — all the way down

HTTP header names follow standard HTTP casing (`X-Request-Id`, `X-Csrf-Token`,
`Server-Timing`) — those are not JSON and stay as-is. Cookie names
(`sentinelSession`) are camelCase too; they are not user-facing, but keeping
the convention everywhere removes the only spot the team has to remember an
exception.

### Coordinated cutover (breaks today's wire)

Today's FE types still mix conventions because the original Rust/Python
backend leaks `snake_case` (`input_tokens`, `desc_en`, `general_rate`,
`expires_at`, `remember_me`, …). When the backend switches, **`src/lib/types.ts`,
the SSE reducer in `src/lib/state/chatSlice.ts`, the auth schemas in
`src/lib/api/auth.ts`, and the renderer organisms all change in lock-step**.
Plan it as one PR pair (BE + FE) rather than dual-writing.

If a transition window is unavoidable, expose `Accept-Version: 2` on the FE
side and have the backend serve camelCase only on that header — never serve
both shapes from the same response.

### How errors look — RFC 9457 Problem Details

The backend serves [RFC 9457 Problem Details](https://www.rfc-editor.org/rfc/rfc9457.html)
(successor to RFC 7807) with the standard `application/problem+json` content
type. The FE already reads this shape (see `throwAsProblem()` in
`src/lib/api/auth.ts` and `readProblem()` in `src/lib/api/chatStream.ts`),
so there is no change needed on the wire — this section just pins the
contract so neither side drifts.

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

The five **standard** RFC 9457 members — `type`, `title`, `status`,
`detail`, `instance` — keep their RFC-defined names (single lowercase
tokens, no separator, so the camelCase rule is naturally satisfied). All
five are optional per the RFC, but please always send `title` + `status`,
and `detail` whenever the title alone isn't actionable.

Any **extension members** the backend adds (`code`, `requestId`, …) follow
§ 0 — camelCase, always:

- `code` _(extension)_ — stable machine identifier, camelCase enum string
  (e.g. `"upstreamTimeout"`, `"emailUnverified"`, `"stateMismatch"`). The
  FE can switch on this without parsing free-text titles.
- `requestId` _(extension)_ — echoes the inbound `X-Request-Id` header so
  the FE can put a copyable correlation id in the error UI without parsing
  headers.

Streaming errors on `/chat/stream` follow the existing `error` SSE chunk
(`{"type":"error","message":"…"}`), not the JSON Problem shape — the
response is already 200 with an `text/event-stream` body once the stream
opens, so problem details only apply to _pre-stream_ failures (4xx/5xx
returned before the first SSE frame).

---

## 1 · Status quo

What already works against a real backend:

| Endpoint                        | Method              | Used by                                                  |
| ------------------------------- | ------------------- | -------------------------------------------------------- |
| `/auth/me`                      | GET                 | Route guards (`__root` ↔ `login`) — see `meQueryOptions` |
| `/auth/sign-in`                 | POST                | Email/password form (`signIn` in `auth.ts`)              |
| `/auth/sign-out`                | POST                | Tweaks panel sign-out button                             |
| `/auth/google/start?returnTo=…` | top-level GET       | "Continue with Google"                                   |
| `/auth/google/callback`         | top-level GET → 302 | Google OAuth redirect                                    |
| `/chat/stream`                  | POST (SSE)          | Assistant streaming — see `streamChat()`                 |

Wire contracts for the auth endpoints live in `src/lib/api/auth.ts` (zod
schemas `SessionSchema` and `SignInSchema`). The chat SSE protocol is
documented at `docs/CHAT_SSE_PROTOCOL.md` in the **sentinel** repo (the comment
at the top of `src/lib/types.ts` points there). **Both contracts need a
camelCase pass** — see § 5.4 below.

---

## 2 · Endpoints currently mocked client-side

`src/lib/api/queries.ts:13-65` literally hardcodes data with a fake `setTimeout`
delay. Query keys and TS shapes are stable; just point them at real endpoints.

### 2.1 `GET /conversations`

Lists prior conversations for the rail.

**Query params**

| Name     | Type   | Default | Notes                         |
| -------- | ------ | ------- | ----------------------------- |
| `limit`  | int    | 20      | cap at 50                     |
| `cursor` | string | —       | opaque, for "load more" later |

**Response 200**

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

- `title` should be a **server-derived** session title, not the user's first
  message truncated. Today the FE falls back to
  `suggestionTitleFor(firstUserText)` in `routes/index.tsx`. The server has
  more context (full thread, tool results) and can pick a better label.
- `lastMessageAt` is **ISO 8601 UTC**. The FE renders relative time (`Today`,
  `Yesterday`, `Apr 28`) per the user's locale; do not pre-format on the server.
- `summary` is optional; if present, used as a tooltip on the rail item.

**Frontend payoff**: `priorConvosQuery()` becomes a real fetch; the
`PRIOR_CONVOS` constant in `queries.ts` is deleted.

### 2.2 `GET /conversations/:id`

Fetch full message history when a rail item is clicked. Today rail items are
no-ops.

**Response 200**

```json
{
  "id": "conv_01H8E…",
  "title": "Wine import duty — 2023 vintage Bordeaux",
  "messages": [
    { "id": "msg_…", "role": "user", "content": "What is the duty on…" },
    {
      "id": "msg_…",
      "role": "assistant",
      "content": "The MFN duty is …",
      "toolCalls": [
        {
          "id": "call_…",
          "tool": "get_code_details",
          "args": { "code": "2204.21.50" },
          "result": {
            /* see § 3 */
          },
          "status": "complete",
          "durationMs": 432
        }
      ],
      "usage": {
        "inputTokens": 1284,
        "outputTokens": 540,
        "totalTokens": 1824,
        "cachedInputTokens": 800
      }
    }
  ],
  "createdAt": "2026-05-05T09:14:22Z"
}
```

- `toolCalls` mirrors `ToolCallT` in `src/lib/types.ts` (after the camelCase
  cutover) — same field names so the reducer in `chatSlice.ts` can rehydrate
  without remapping.
- Tool **discriminator names** (`get_code_details`, `find_cross_rulings`, …)
  are _enum string values_, not field names. They are intentionally
  `snake_case` because they're the model's tool registry identifiers and
  changing them is an LLM-prompt-engineering question, not a wire question.
  Field names around them (`tool`, `callId`, …) are camelCase as usual.

**Frontend payoff**: clicking a rail item replaces the empty state with the
saved thread. Doable in ~50 lines of FE code once the endpoint exists.

### 2.3 `PATCH /conversations/:id` and `DELETE /conversations/:id`

Standard rename + delete. Body: `{ "title": "string" }`. No body on delete.

### 2.4 `GET /alerts`

Powers the (currently mocked) `alertsQuery()`. Also feeds the `list_alerts`
tool result via the LLM agent.

**Query params**: `code` (HTS prefix, optional), `since` (ISO date, optional),
`limit` (default 20).

**Response 200**

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

- `url` is **new** vs the current `AlertItemT`. With a URL the row becomes
  clickable. Drop it if not always available.

### 2.5 `GET /catalog/stats`

Powers the `CatalogStatsStrip` on the empty state.

**Response 200**

```json
{
  "htsCodesIndexed": 13847,
  "crossRulingsSince": 2002,
  "activeAlerts": 3,
  "lastIndexedAt": "2026-05-04T03:00:00Z"
}
```

- `lastIndexedAt` is **new**. Lets the strip show data freshness ("indexed 2
  days ago"), which is reassuring for a customs tool.
- Field names switch from today's `hts_codes_indexed` /`cross_rulings_since` /
  `active_alerts` to camelCase per § 0.

---

## 3 · Tool-result wire shapes — pick canonical names

The FE has `try-canonical-then-fall-back` defenses everywhere because each
tool result currently allows two or three legacy shapes. Each cleanup below
lets a renderer drop a branch.

### 3.1 `get_code_details`

**Current** (`src/lib/types.ts:100-117`) — accepts:

- description: `desc_en | desc_fr | desc`
- rate: `general_rate | rate_text | mfn_rate`
- units: `units | unit`
- hierarchy: `hierarchy[]` (rich) **or** `chain[]` (pre-stringified)

**Canonical**

```json
{
  "code": "4202.21.00.00",
  "found": true,
  "description": {
    "en": "Handbags, with outer surface of leather",
    "fr": "Sacs à main, à surface extérieure en cuir"
  },
  "hierarchy": [
    { "code": "4202", "description": { "en": "Trunks, suit-cases…" } },
    {
      "code": "4202.21",
      "description": { "en": "With outer surface of leather…" }
    },
    {
      "code": "4202.21.00",
      "description": { "en": "Handbags, leather, valued ≤ $20" }
    }
  ],
  "rate": { "value": "8.0%", "kind": "adValorem", "sourceCode": "MFN" },
  "unit": "kg",
  "section301": "List 1, +25%",
  "isDeclarable": true
}
```

- One name for description (`description` object with locale keys) — drop
  `desc_en/desc_fr/desc` aliases.
- One name for rate (`rate.value`) — drop `general_rate/rate_text/mfn_rate`.
- One name for unit — drop `units` plural.
- Hierarchy is **always** an array of `{ code, description }`. Drop `chain`
  pre-stringified shape — the FE in `CodeDetails.tsx` already prefers
  `hierarchy` and only falls back when missing.
- `rate.kind` is a camelCase enum string: `adValorem | specific | compound`.

**Frontend payoff**: `buildCrumbs`, `description()`, `rateText()` collapse to
direct field reads. ~25 lines removed from `CodeDetails.tsx`.

### 3.2 `get_landed_cost`

**Current** allows either pre-built `rows[]` **or** a flat soup of `*_usd`
fields that `LandedCost.tsx:28-52` reassembles.

**Canonical** — always ship `rows[]` and a `total`. The server picks labels
(and can localise them); the client just renders.

```json
{
  "code": "4202.21.00.00",
  "currency": "USD",
  "rows": [
    { "label": "Customs value", "amount": 20000.0, "sub": "declared FOB" },
    {
      "label": "Duty",
      "amount": 1800.0,
      "sub": "9.0% MFN · 4202.21.00.00",
      "kind": "duty"
    },
    {
      "label": "MPF",
      "amount": 69.28,
      "sub": "0.3464%, capped at $614.35",
      "kind": "fee"
    },
    {
      "label": "HMF",
      "amount": 25.0,
      "sub": "0.125%, ocean only",
      "kind": "fee"
    },
    { "label": "Freight", "amount": 1450.0 }
  ],
  "total": 23344.28,
  "transport": "ocean",
  "caveats": ["Section 301 not applied", "Anti-dumping not modelled"]
}
```

- `kind` (optional) lets the FE colour duty vs fees differently in a future
  style pass. No-op today — safe to add. Enum: `duty | fee | freight | other`.
- Drop the flat `declared_value_usd / duty_amount_usd / mpf_usd / hmf_usd /
freight_usd / landed_cost_usd / total_fees_usd / rate_text /
rate_source_code / duty_kind` fields. They survive only as fallback.

**Frontend payoff**: ~25 lines deleted from `LandedCost.tsx`.

### 3.3 `search_codes`

**Current** allows `desc_en | desc` and `fused_score | score`.

**Canonical**

```json
{
  "candidates": [
    {
      "code": "4202.21.00.00",
      "description": { "en": "Handbags, with outer surface of leather" },
      "score": 0.873,
      "scoreComponents": { "lexical": 0.65, "semantic": 0.91 }
    }
  ]
}
```

- Single `score` (the fused one). `scoreComponents` optional, for power-user
  inspection (drives a future tooltip).

### 3.4 `find_cross_rulings`

Already minimal. Add `excerpt: string` (≤ 240 chars) so the result card can
show a one-liner under the subject without another fetch.

```json
{
  "rulings": [
    {
      "num": "N339192",
      "date": "2024-03-01",
      "subject": "Classification of leather handbag with detachable strap",
      "codes": ["4202.21.00.00"],
      "url": "https://rulings.cbp.gov/ruling/N339192",
      "excerpt": "The applicable subheading for the subject merchandise will be 4202.21.00.00…"
    }
  ]
}
```

### 3.5 `subscribe_watch`

`SubscribeWatchContentT.subscriptions: unknown[]` is currently typed as
opaque. Either remove it or spec it:

```json
{
  "ok": true,
  "subscriptionId": "sub_01H8E…",
  "email": "marie@exporter.fr",
  "codes": ["8517.13"],
  "sources": ["CSMS", "Federal Register"],
  "cadence": "daily",
  "subscriptions": [
    {
      "id": "sub_…",
      "email": "marie@exporter.fr",
      "codes": ["8517.13"],
      "sources": ["CSMS"],
      "cadence": "daily",
      "createdAt": "2026-04-22T09:00:00Z"
    }
  ]
}
```

If `subscriptions` is "all of this user's subscriptions including the new
one", say so in the field doc — today the FE doesn't render it because the
shape isn't clear.

---

## 4 · `/chat/stream` SSE protocol additions

The current chunks live in `src/lib/types.ts:21-34` and the reducer in
`chatSlice.ts:80-130`. After § 0's camelCase pass, every `call_id`,
`message_id`, `conversation_id`, `input_tokens`, etc. on the wire becomes
`callId` / `messageId` / `conversationId` / `inputTokens`.

Eight concrete additions:

### 4.1 `toolError` chunk (must-have)

A failing tool currently never emits `tool_result`, leaving the pill stuck on
`"in-flight"` forever. Add:

```text
data: {"type":"toolError","callId":"call_…","message":"Catalog index timeout","code":"upstreamTimeout"}
```

Reducer matches existing `toolResult` branch but flips the call to
`status: "failed"` with the message. UI changes are 5 lines.

### 4.2 `toolCallDelta` is declared but unused

`ChatChunkT` has `toolCallDelta` (args streamed in pieces). The reducer
ignores it. **Either** remove the chunk type from the protocol, **or** start
emitting it and we'll wire a reducer to live-update `call.args` so the pill
suffix ("Searching catalog 'leather handbag…'") populates as the model writes.

### 4.3 Carry `tool` on `toolResult`

Today `toolResult` only has `callId`, so the FE has to look up the matching
`toolCall` to figure out which renderer to use (`ResultRenderer.tsx`). Add
`tool` (or `name`) directly:

```text
data: {"type":"toolResult","callId":"call_…","tool":"get_code_details","content":{…}}
```

Saves a `find` per chunk and lets us drop ToolPill→ResultCard
cross-references.

### 4.4 `turnStart` — server-issued message id

Today the FE mints `newId("a")` in `chatThunks.ts:60`. A server-issued id is
required to persist conversations and resume them.

```text
data: {"type":"turnStart","messageId":"msg_…","conversationId":"conv_…"}
```

Emit once at the top of the stream. The reducer threads `messageId` into the
assistant message it creates.

### 4.5 Chunk-type discriminator: rename `tool_call` etc.

After the camelCase cutover, every chunk's `type` value goes camelCase too:

| today                | new              |
| -------------------- | ---------------- |
| `delta`              | `delta`          |
| `reasoning`          | `reasoning`      |
| `reasoning_delta`    | `reasoningDelta` |
| `tool_call`          | `toolCall`       |
| `tool_call_delta`    | `toolCallDelta`  |
| `tool_result`        | `toolResult`     |
| `tool_error` _(new)_ | `toolError`      |
| `turn_start` _(new)_ | `turnStart`      |
| `turn_end`           | `turnEnd`        |
| `error`              | `error`          |
| `done`               | `done`           |

### 4.6 Heartbeat

Long tool calls (CROSS rulings can take 3–5 s) plus an idle-30 s nginx /
Cloudflare timeout = orphaned streams. Send an SSE comment frame every 15 s:

```text
: heartbeat

```

The FE's reader discards comment frames already (it splits on `\n\n` and
parses only `data:` lines).

### 4.7 Pick one home for `usage`

`turnEnd` carries `usage` mandatorily; `done` carries it optionally. Drop one
— preferably `done.usage` so `done` is just a terminator. The FE writes
whichever arrives last so dropping `done.usage` is invisible.

### 4.8 Abort propagation

When `AbortController.abort()` fires on the FE, `chatStream.ts` cancels the
body read. The backend should propagate the cancellation upstream (LLM
provider) so we stop spending tokens. This is a backend-only change.

### 4.9 Echo `requestId`

The FE sends `X-Request-Id` (`chatStream.ts:57`). Echo it back as a header on
the SSE response (`X-Request-Id: <same>`) and optionally inline a `requestId`
field on every chunk so the inspector can correlate a tool call to a
Sentry/Loki trace without bookkeeping.

---

## 5 · New per-request signals to make the UI smarter

### 5.1 Send `lang` to `/chat/stream`

The frontend has `tweaks.lang ∈ "en" | "fr"` but only sends `provider`
(`chatStream.ts:60-63`). Wire it up: include `lang` in the JSON body and have
the model honour it for reasoning + final reply. Turns the EN/FR toggle in
the topbar from cosmetic into functional.

```jsonc
// POST /chat/stream body
{
  "messages": [
    /* […] */
  ],
  "provider": "anthropic",
  "lang": "fr",
  "conversationId": "conv_…", // optional, for continuing a saved thread
}
```

`conversationId` is also new — when present, the backend prepends the
persisted history server-side so the FE doesn't have to round-trip the full
thread.

### 5.2 Optional `toolCall.estimatedDurationMs`

```text
data: {"type":"toolCall","callId":"…","name":"find_cross_rulings","args":{…},"estimatedDurationMs":4500}
```

Lets the pill show a determinate progress bar instead of an indeterminate
spinner. Skip if the model can't predict it — purely additive.

### 5.3 Caveats on `toolResult`, not on the assistant message

Today `chatSlice.ts:106-108` lifts caveats off `toolResult.content` and pins
them to the assistant message. Only `landed_cost` actually populates them.
Per-tool caveats should live on each tool result so the inspector can show
them next to the relevant card. This already works structurally — just stop
merging into the message.

### 5.4 Server-side suggestion bank (optional)

`src/lib/utils/suggestions.ts` is hardcoded. Expose:

```text
GET /suggestions?lang=en
→ { "suggestions": [ { "id": "classify", "tag": "CLASSIFY", "text": "…" }, … ] }
```

Lets you A/B prompts, localise them, and personalise (e.g. ones that use the
user's recent codes). Pure client refactor once shipped.

---

## 6 · Auth + plumbing nice-to-haves

### 6.1 Cookie lifetime contract

`signIn` accepts `rememberMe: boolean` (post camelCase cutover) but the
server's cookie-lifetime behaviour isn't documented anywhere accessible to
the FE. Add a section to `docs/AUTH.md` (sentinel repo) and surface the
resolved expiry in `/auth/me`:

```json
{
  "session": {
    "email": "marie@exporter.fr",
    "expiresAt": "2026-12-31T00:00:00Z",
    "rememberMe": true
  }
}
```

The FE can then warn the user before silent logout.

### 6.2 `/auth/sign-in` request body — camelCase cutover

Today the FE posts `{ email, password, remember_me }`. After the cutover the
backend MUST accept `{ email, password, rememberMe }`. The FE patch is
one-line in `auth.ts`; do them in lock-step.

### 6.3 CSRF posture

The FE sends `credentials: "include"` on every same-origin fetch. If the
backend isn't pairing the HttpOnly `sentinelSession` cookie with a CSRF token
(double-submit pattern, or `SameSite=Strict` + a custom header check), it
should — current setup is implicitly trusting `SameSite=Lax`.

If a CSRF token is required, expose `/auth/csrf` returning
`{ "csrfToken": "…" }` and have it accepted in either an `X-Csrf-Token`
header or a `csrf` field. The FE wraps `buildHeaders()` in `auth.ts` to add it.

### 6.4 `Server-Timing` headers

On `/auth/me`, `/conversations`, `/chat/stream`. Cheap and feeds straight
into Chrome's Network panel and any future RUM:

```
Server-Timing: db;dur=12, llmFirstToken;dur=420, total;dur=512
```

(Note: `Server-Timing` _names_ are a header-value convention, but per § 0 we
camelCase them too — they end up in code as object keys.)

---

## 7 · Quick-win order

If you only have an afternoon:

1. **Lock down camelCase across every endpoint and chunk.** Coordinate the
   FE PR; do not dual-serve. Without this the rest of the work introduces
   yet another shape to support.
2. **Ship `/conversations`, `/conversations/:id`, `/alerts`, `/catalog/stats`**
   as real endpoints with the shapes in § 2. Kills the mocks in `queries.ts`.
3. **Add `toolError` chunk** (§ 4.1). Fixes the worst observable bug
   (forever-spinning pill on a tool failure).
4. **Pick canonical names in `get_code_details` / `get_landed_cost`** (§ 3).
   Drop the legacy aliases. ~50 lines deleted from frontend renderers.
5. **Honour `lang` on `/chat/stream`** (§ 5.1). Activates the topbar toggle.

---

## Appendix A · Wire-types reference

The FE source of truth for every chunk + tool-result shape is
`src/lib/types.ts`. When you ship a new shape, please update **that** file as
the canonical contract — the renderer organisms, the slice reducer, and the
SSE generator (`streamChat`) all import from there.

Naming convention:

- Every TypeScript type ends in `T` (`ChatChunkT`, `ToolCallT`, …).
- Every JSON field on the wire is `camelCase` (see § 0).
- Tool registry identifiers (`get_code_details`, `find_cross_rulings`, …) are
  **enum string values** the model emits, not field names. They stay
  `snake_case` because changing them is an LLM-prompt-engineering question,
  not a wire question. Field names that _carry_ them (`tool`, `name`) are
  camelCase.

## Appendix B · Mock-data file map

These constants exist solely because the endpoints in § 2 don't yet:

| Mock            | File                           | Lines |
| --------------- | ------------------------------ | ----- |
| `PRIOR_CONVOS`  | `src/lib/api/queries.ts`       | 17–29 |
| `ALERTS`        | `src/lib/api/queries.ts`       | 31–53 |
| `CATALOG_STATS` | `src/lib/api/queries.ts`       | 61–65 |
| `SUGGESTIONS`   | `src/lib/utils/suggestions.ts` | 7–23  |

Once each backend endpoint lands, the corresponding mock + the `sleep()`
helper can be deleted.
