# Import Case Workbench — Frontend Plan

Status: Draft, 2026-05-12.
Owner: Frontend (`sentinel-fr`).
Source docs (backend repo):

- `sentinel/docs/BUSINESS_APP_IMPROVEMENT_PLAN.md`
- `sentinel/docs/FRONTEND_IMPORT_CASE_WORKBENCH.md`
- `sentinel/docs/superpowers/specs/2026-05-12-import-case-workbench-design.md`
- `sentinel/docs/superpowers/plans/2026-05-12-import-case-workbench.md`

This doc is the frontend-side mirror: which existing files change, which new files appear, in what order, behind which flag, with which decisions locked.

## 0. Progress

Snapshot of what's shipped against this plan. Tied to backend rollout.

| Phase  | Backend dep      | FE status   | Notes                                                                                                                                                                            |
| ------ | ---------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0      | none             | **done**    | `FEATURE_CASE_WORKBENCH_ENV` defaults to **on**. Legacy chat surface deleted; the env var is preserved as a future rollback hook but is a runtime no-op now.                     |
| 1      | Step 1 (fees)    | **done**    | Backend exposed structured surcharges (not fee-schedule metadata); FE renders them with source attribution. See §1.1 for what shipped vs plan.                                   |
| 2      | Step 2 (cases)   | **done**    | Wire-type aliases, `casesSlice` (`activeCaseId` only), facade (`useCases`, `useActiveCase`, …), `selectCaseStatus` selector. See §1.2.                                           |
| 3      | Step 2           | **done**    | `/cases`, `/cases/new`, `/cases/$caseId` routes. `Rail` flag-aware. `RailCaseList` + `RailCaseItem` + `CaseStatusChip` + `NewCaseForm`. See §1.3.                                |
| 4      | + classify       | **done**    | `CaseInspector` (Radix Tabs) + `CaseFactsPanel` (PATCH-on-blur) + `CaseLinesPanel` (add/remove + per-line `importCaseLineClassify`). See §1.4.                                   |
| 5      | Step 3 (quotes)  | **done**    | `CaseQuotePanel` (run / re-run / latest), `QuoteSummaryTable`, `QuoteLineRow` (expandable + surcharges + caveats), `FeeRow`. See §1.5.                                           |
| 6      | Step 4 (chat)    | **done**    | Keyed `chatSlice` (per-thread), `streamChat` `caseId` routing, `casePatchSuggestion` → `CasePatchTray`, `CaseChatSurface`. See §1.7.                                             |
| 7      | Step 5 (risk)    | **done**    | `CaseRiskPanel` (`importCaseRiskScreen*`), `RiskFlagRow` + severity tokens, "Cost estimate only" gate in `CaseQuotePanel`. See §1.8.                                             |
| 8      | Step 6 (rulings) | **done**    | `CaseEvidencePanel` (supports / conflicts / reference groups), `CaseRulingCard`, `RulingsSearchDialog` (Radix). See §1.9.                                                        |
| 9      | none             | **partial** | Workbench header now uses `selectCaseStatus(case, risk)` + Archive/Unarchive button. Sentry tags via `mutation.meta`. See §1.10 for ops deferrals.                               |
| polish | none             | **done**    | Click-to-scroll missing-fact chips, ruling refresh, ruling attach pin+note, quote history dropdown. See §1.12.                                                                   |
| diff   | none             | **done**    | Side-by-side quote diff (paired-row variants for summary / lines / entry fees, signed Δ$ + Δ% tinted by direction). See §1.13.                                                   |
| 10/11  | Phases 10–11     | **done**    | Bulk classify + unclassified chip, candidate review dialog, conversations-on-case rail, LLM usage widget. Thread switching + `casePatchSuggestion` rehydration shipped in §1.15. |

Cross-cutting work landed alongside Phase 1 (not tied to any single workbench phase):

- **`src/lib/utils/intl.ts`** — cached `Intl.NumberFormat` / `DateTimeFormat` / `RelativeTimeFormat` factories. `formatUsd`, `formatInteger`, `formatPercent`, `formatSeconds`, `formatMonthDay`, `formatRelativeDays`. Already used by `LandedCost.tsx`, `ThinkingPanel.tsx`, `CatalogStatsStrip.tsx`, `RailHistoryList.tsx`. Phases 4-7 should pull from here rather than hand-rolling.
- **`src/components/molecules/SourceLink.tsx`** — `{ label, url, effectiveDate? }` molecule. Listed in §6.3 as a future molecule; landed early because Phase 1 surcharge rendering needed it.
- **`src/lib/api/chatStream.ts`** — swapped hand-rolled `\n\n` SSE split for `eventsource-parser`'s `EventSourceParserStream`. Spec-compliant (multi-line `data:`, `event:`/`id:`/`retry:` fields, comments, CRLF). Paves the way for Phase 6 `casePatchSuggestion` event handling.
- **Deps pre-installed** (pinned exact, matching the established convention): `eventsource-parser 3.0.8` (in use now), `date-fns 4.1.0` (queued for Phase 4-7 effective-date math), `es-toolkit 1.46.1` (queued for Phase 4+ `debounce` / `partition` / etc. if a real consumer lands).

### 0.1 Auth side-effect from backend Phase 1

The Phase 1 backend PR renamed `SessionView` → `UserView` and `SessionEnvelope` → `UserEnvelope` (`{ user }` instead of `{ session }`) on `/auth/me`. Picked up via `gen:api`. FE follow-up applied: `authSlice.profile` is now `UserView | null`, `authThunks.fetchProfile` reads `r.data.user`. No behavior change.

## 1. Outcome

Turn the current chat-first UI into a three-zone import-case workbench. The shell is already in place — `Rail` (left, 240 px) / `<main>` (center) / `Inspector` (right, 380 px collapsible) — so most work is swapping chat-shaped data and rendering for case-shaped data and rendering, plus a case data layer.

The user prepares one import case at a time, with structured shipment context (facts, line items, candidate/selected HTS codes, landed-cost quote, risk flags, attached rulings) always visible. Chat acts on the case rather than carrying the facts in transcript prose.

### 1.1 Phase 1 — what shipped vs the plan

Original plan called for rendering MPF/HMF cap metadata, source URLs, and a stale-data chip on `LandedCostResponse.feeMetadata` / `verifiedAt`. **That wire surface did not ship.** Backend Phase 1 kept fee-schedule changes internal (constants updated to FY2026 values, new `fee_schedule` table, `referenceDate` resolution).

What did ship — and what FE now renders — is the **surcharge layer** (`LandedCostResponse.surcharges: AppliedSurcharge[]`), each with `program`, `chapter_99_code`, `rate_text`/`rate_pct`, `effective_from`, `source_url`, `source_notice`. `LandedCost.tsx` renders these as a "Surcharge sources" section under the existing rows table, using the new `SourceLink` molecule for attribution + effective date.

Empty surcharge array renders the verbatim copy from the workbench FE doc: `"No verified surcharge rule matched this case."` Caveats block unchanged.

Deferred to Phase 5 (quote panel) until backend exposes `feeMetadata` on the wire: MPF/HMF cap display, stale-data chip.

### 1.2 Phase 2 — what shipped vs the plan

Backend Phase 2 shipped `/api/import-cases` (list/create/get/patch/delete) + line-item CRUD. SDK regen brought `ImportCaseSummary`, `ImportCaseResponse`, `ImportCaseLineItemResponse`, `CreateCaseBody`, `PatchCaseBody`, `CreateLineItemBody`, `PatchLineItemBody`, and TanStack helpers (`importCaseListOptions`, `importCaseGetOptions`, `importCaseCreateMutation`, etc.).

**Note:** the case response carries `lastQuotedAt` / `lastRiskScreenedAt` timestamps only — the full quote / risk summaries don't ship until backend Phase 3 / Phase 5. `selectCaseStatus` treats the timestamps as "ran successfully" for now; Phase 7 will tighten this when the risk summary lands.

**Slice scope intentionally narrowed.** The plan listed three slice fields (`activeCaseId`, `draftLineEdits`, `pendingPatches`). Only `activeCaseId` ships now — the other two have no Phase 2 consumer and adding empty scaffolding without a consumer is exactly the anti-pattern CLAUDE.md flags. Pulled forward when their consumers arrive:

- `draftLineEdits` → Phase 4 (`CaseLinesPanel` inline editing).
- `pendingPatches` → Phase 6 (`casePatchSuggestion` SSE events).

**Thunks deferred.** The plan listed `casesThunks.ts` for case + line-item CRUD. Skipped for Phase 2 — TanStack `useMutation({ ...importCaseCreateMutation(), onSuccess })` already gives components an ergonomic call site, and `onSuccess` is the natural place to invalidate the list cache + dispatch `setActiveCaseId`. A `casesThunks` file becomes useful in Phase 6 when SSE chunks need to refetch the active case from a non-React context; revisit then with a hoisted `QueryClient` singleton.

**Chat thread keying deferred.** Plan listed refactoring `chatSlice.threads: Record<caseId, …>` as Phase 2 work. Deferred to Phase 6 (case-aware chat) when there's a real consumer — refactoring chat state without a UI to validate it is churn-without-benefit.

### 1.3 Phase 3 — what shipped vs the plan

Routes (TanStack file-based):

- `routes/cases.tsx` — `/cases` discovery / index page. `validateSearch` with a zod-typed `?status=` filter (`all|draft|ready_for_review|archived`). Filter chips are a horizontal segmented control. Rows are buttons that navigate to `/cases/$caseId`.
- `routes/cases.new.tsx` — `/cases/new` intake form route shell; the form itself lives in `src/components/organisms/NewCaseForm.tsx`. Required fields: case title + first line description. Optional: transport, country of origin, declared value USD. Submits via the generated `importCaseCreateMutation`, sets the new id as active, redirects to `/cases/$caseId`.
- `routes/cases.$caseId.tsx` — workbench shell. Loads the case via `useActiveCase()`, shows title + `CaseStatusChip` (derived via `selectCaseStatus`) + a dashed-border placeholder noting that Phase 4 fills in the panels. `useEffect` syncs the URL param into `activeCaseId`.

`routes/index.tsx` — `beforeLoad` now reads `selectFeatureCaseWorkbench(state)` and redirects authed users to `/cases/$activeCaseId` (when one is persisted) or `/cases` otherwise. The legacy chat page stays as the route `component` so flipping the flag back off restores it without code changes.

`Rail` (`src/components/organisms/Rail.tsx`) — internally branches on `useFeatureCaseWorkbench()`:

- Flag on: `RailNewCaseButton` (navigates to `/cases/new`) + `RailCaseList` (lists `useCases()` rows via `RailCaseItem`, marks the row matching `activeCaseId`).
- Flag off: legacy `RailNewChatButton` + `RailHistoryList`.

The `onNewChat` prop stays on `Rail` for the legacy `/` route; it's ignored when the flag is on.

New molecules: `CaseStatusChip` (accepts both the persisted 3-value enum and the derived 7-value enum), `RailNewCaseButton`, `RailCaseItem`.

Tweaks panel: `BehaviourSection` gains a "Import-case workbench (preview)" toggle that flips `tweaks.caseWorkbench`. The toggle is hidden when `VITE_FEATURE_CASE_WORKBENCH=true` is set at build time — the env wins and the runtime toggle would only be confusing.

**Deferred from the original plan §6.1:** segmented status filter inside the rail itself. The filter lives on the `/cases` index page only — keeping the rail unfiltered shares one TanStack Query cache between rail and index, and the rail already shows the active case as a strong "you are here" affordance. Phase 4 can revisit if the rail grows long enough to need filtering.

### 1.4 Phase 4 — what shipped vs the plan

Backend dependency: Phase 2 `import-cases` CRUD + the freshly-shipped `POST /import-cases/{caseId}/line-items/{lineId}/classify` (`importCaseLineClassify`) which persists candidates / selected code onto the line.

Workbench layout (`routes/cases.$caseId.tsx`) — three-zone: `Rail` left, main center, `CaseInspector` right. Header strip shows the case title, derived `CaseStatusChip`, and a `MissingFieldChip` row for case-level missing facts (`transport`, `countryOfOrigin`, `declaredValueUsd`, `lineItems`). Inspector tab persisted via `?tab=` search param (`facts | lines | quote | risks | evidence`), defaults to `facts`.

`CaseInspector` (`Radix Tabs`):

- **Facts** — `CaseFactsPanel` with one editable input per case field (`title`, `transport`, `countryOfOrigin`, `originCountry`, `destinationCountry`, `incoterm`, `currency`, `declaredValueUsd`, `freightUsd`, `notes`). Each input is a "draft-then-commit" field (`CaseFactsFields.tsx`): typing fills a local `draft`, blur commits via `importCasePatchMutation` when `draft !== initial`, then clears the draft so subsequent server pushes (Phase 6 accepted patches) flow through. PATCH success invalidates both the detail and list queries.
- **Lines** — `CaseLinesPanel` with one `CaseLineItemRow` per line (sorted by `position`), an "Add a line" composer below. Each row shows description, `ClassificationStateChip`, selected `HtsCodeBadge` when present, rate text, customs value, qty/unit, country (with "case default" hint when no line override). Line-level `MissingFieldChip` row when `selectedHtsCode` or `customsValueUsd` is missing. Per-row "Classify" button kicks `importCaseLineClassifyMutation` and the case query refetches on success.
- **Quote / Risks / Evidence** — `CasePlaceholderPanel` empty states pointing at Phases 5 / 7 / 8 respectively. Tab structure stays in place across phases so the UX doesn't shift as panels turn on.

`selectMissingCaseFacts(case)` and `selectMissingLineFacts(line)` added to `caseStatus.ts` (returning typed key arrays) — they drive both the workbench header strip and the per-panel "missing fields" chips.

Center column is a dashed-border note pointing at Phase 6 for case-aware chat; the legacy chat surface isn't mounted here. Phase 6 will replace this with a `CaseTimeline` + `Composer` + `CasePatchTray`.

**Read-only mode:** when `case_.status === "archived"` (persisted-status check, NOT the derived `ImportCaseStatusT`), every editable affordance receives `disabled` / `isReadOnly` and skips the PATCH dispatch. Archive / unarchive UI itself is deferred to Phase 4.5 polish or Phase 9.

**Deferred from the original plan §6.2:**

- `CaseTopbar` as a dedicated organism — instead the title + status + missing-fields strip live inline in the route, since the topbar's only Phase 4-relevant content is what's already there.
- `MissingFieldChip` click-to-scroll behavior — the chip accepts an `onClick`, but no callers wire it for Phase 4. Easy to add when the workbench grows long enough for scroll-into-view to matter.
- Severity-color tokens (`risk.bg.*` / `risk.fg.*`) — defer to Phase 7 risk panel when they have a consumer.

### 1.5 Phase 5 — what shipped vs the plan

Backend dependency: `POST /import-cases/{caseId}/landed-cost/quote` + `GET .../quotes` + `GET .../quotes/{quoteId}`. Wire shapes: `LandedCostQuoteResponseT`, `LandedCostQuoteLineResponseT`, `QuoteSummaryT`, `LandedCostQuoteSummaryItemT`, `FeeScheduleRefViewT`, `CreateQuoteBodyT` — all aliased in `src/lib/types.ts`.

`CaseQuotePanel` (replaces the `CasePlaceholderPanel` under the Quote tab):

- **Header** — "Landed cost" eyebrow + "Captured <relative-date> at <HH:mm> · immutable snapshot" (or "No quote yet." when empty). "Run quote" / "Re-run quote" CTA on the right.
- **Gate** — the CTA stays disabled until `selectCaseStatus(case)` returns `readyForQuote` or later. The backend re-enforces with a friendly `Problem` so this is belt + suspenders.
- **`QuoteSummaryTable`** — the canonical 7-row breakdown from the FE doc: customs value · duty · surcharges · MPF · HMF (suppressed when `transport !== "ocean"`) · freight · insurance (only when non-zero) · landed cost on a thicker rule line.
- **Per-line breakdown** — `QuoteLineRow` per line, sorted by `position`. Collapsed: position + HTS badge + description + line total. Expanded: key-value list of customs value, country of origin (snapshot), quantity/unit, ad-valorem duty, specific duty (when non-zero), surcharges subtotal, rate text, rate-source code. Below that, the `LineSurchargesList` molecule renders each surcharge with `SourceLink` attribution (or the verbatim "No verified surcharge rule matched this case." copy when empty). Line-level caveats render via the new `CaveatsList` molecule.
- **Entry fees** — two `FeeRow`s (MPF + HMF when ocean) each paired with a `SourceLink` from `feeScheduleRefs` (effective date + source URL).
- **Caveats** — `CaveatsList` molecule, reused across panel + per-line + the legacy `LandedCost.tsx`.

PATCH side-effects: `importCaseQuoteCreateMutation.onSuccess` invalidates both the quote-list query and the case-detail query so `selectCaseStatus` flips from `readyForQuote` → `quoted` and the workbench header chip updates immediately.

**Deferred from the original plan §6.2:**

- **Quote history switcher + side-by-side diff.** Phase 5 always shows the most recent quote. A history dropdown can hang off the captured-at line when there's real UX demand for comparing two quotes; the shape is straightforward (sort `quotesList.data.quotes` desc, dropdown + `quoteId` state, second `useQuery` for the comparison quote).
- **"Cost estimate only" banner.** Per the plan it gates on the risk screen having run. Defer to Phase 7 when `lastRiskScreenedAt` actually drives a real risk summary.

### 1.6 Backend Phase 4 ready for FE Phase 6

The same SDK regen brought case-aware chat endpoints (`POST /import-cases/{caseId}/chat` + `/stream`) and a new `casePatchSuggestion` chunk type on `ChatChunkT` carrying `CasePatchT[]` (`{ op, path, value?, reason }`, RFC-6902-shaped). Aliased as `CasePatchT` in `src/lib/types.ts`. FE Phase 6 (case-aware chat surface + `CasePatchTray`) is unblocked whenever we want to start it.

### 1.7 Phase 6 — what shipped vs the plan

**Keyed chat slice.** `chatSlice` is now keyed by thread id: `state.chat.threads: Partial<Record<string, ChatThreadStateT>>`. Threads are materialised lazily on first dispatch (see `getOrInit`). Thread ids in use:

- `LEGACY_THREAD_ID = "legacy"` for the `/` route's free-form chat.
- The case id for each case workbench's case-aware chat.

Only one stream is allowed in-flight site-wide (`anyRunning` early-return in `sendChat`); `running` is per-thread so the UI can show which thread is currently streaming.

All `chatActions` payloads now include `threadId`. `useChatStore(threadId)` scopes the facade to a specific thread. Two consumers reading the same thread id share state by construction. Sentry redux-enhancer scrubs all threads' messages.

**Case-aware streaming.** `streamChat` gained a `caseId?: string` option. When set, the request POSTs to `${base}/import-cases/${caseId}/chat/stream` instead of the legacy `/chat/stream`; backend prepends the case's facts, line items, latest quote, and risk summary before the model's first user turn, so the assistant uses known facts and doesn't re-ask. `sendChat(threadId, text)` resolves `caseId` from the thread id (`undefined` for legacy).

**Case-patch suggestions.** When a `casePatchSuggestion` chunk arrives, the chat reducer is a no-op for that case (keeps its scope pure) and `sendChat` instead dispatches `casesActions.pushPendingPatches(chunk.patches)`. The new `CasePatchTray` organism above the composer renders one `CasePatchSuggestionRow` per pending patch, each with Accept / Dismiss.

Accept routes through the new `applyCasePatch` thunk: parses the JSON pointer `path` and splits into either `PATCH /import-cases/{caseId}` (single segment, e.g. `/countryOfOrigin`) or `PATCH /import-cases/{caseId}/line-items/{lineId}` (three segments, e.g. `/lineItems/0/quantityUnit` — position → line id resolved via a `Map<number, string>` the tray builds from the active case). Unsupported paths are logged and dismissed without a network call. On success: invalidate the case-detail + list queries, then drop the patch from the tray. Failure leaves the patch in the tray so the user can retry.

`casesSlice` grew `pendingPatches: CasePatchT[]` + actions `pushPendingPatches`, `resolvePatch(index)`, `clearPendingPatches`. Switching `activeCaseId` clears pending patches — they were scoped to that case's chat.

**Workbench chat surface.** New `CaseChatSurface` organism mounted in `cases.$caseId.tsx` between the missing-facts strip and the inspector. Renders the case-scoped `ChatThread`, the `CasePatchTray`, and the existing `Composer`. Empty state explains the case-aware assistant up front. The dashed "Phase 6 placeholder" center column is gone.

**Deferred from the original plan §6.2:**

- **`CaseTimeline` organism** — listed as a chronological merge of chat messages + tool calls + quote/risk/ruling events + accepted case-patch events. Phase 6 reuses the existing `ChatThread` rendering instead; the unified timeline UX is a polish task once we have data to merge.
- **Tool-result-driven full case refetch.** The plan called for `sendChat` to invalidate Query keys when `quote_landed_cost` / `run_risk_screen` / `attach_ruling` tool results arrive. The quote panel already refetches via its own mutation `onSuccess`; risk + ruling tools don't exist yet (Phase 7/8 backend). Revisit when those land.
- **Single-stream cross-thread aborts.** Today starting a chat in thread A while thread B is streaming is a no-op (`anyRunning` early-return). The plan's intent was abort-and-replace; we picked the simpler no-op for Phase 6.

### 1.8 Phase 7 — what shipped vs the plan

Backend Phase 5 shipped `POST /import-cases/{caseId}/risk-screen` + `GET /import-cases/{caseId}/risk-screen/latest` plus the wire shapes (`RiskFlagT`, `RiskFlagCodeT` 12-value union, `RiskScreenT` aka `RiskScreenResponseT`, `RiskScreenStatusT`, `RiskSeverityT`, `SourceRefT`). Aliased in `src/lib/types.ts`.

Severity tokens (`tokens.stylex.ts`): `risk.bg.*` / `risk.fg.*` as `defineConsts` — severity coloring is semantic, not themed. Red is reserved for blocking only; review = amber; info = neutral.

New molecules:

- `RiskStatusChip` — header chip with `clear | needsReview | incomplete | notRun` tones.
- `RiskFlagRow` — severity icon + title + "Affects line #N" link (resolved via a `Map<lineId, position>`) + reason + `Next:` action + `SourceLink`. Severity drives the left-rule color via the new `risk.*` tokens.

`CaseRiskPanel` (replaces the `CasePlaceholderPanel` under the Risks tab):

- Header: eyebrow + `RiskStatusChip` (or `"notRun"` chip when no screen) + "Ran <relative-date> at <HH:mm>" when present. "Run screen" / "Re-run screen" CTA on the right.
- Empty: a short note explaining what the screen looks for (Chapter 99, Section 232/301, AD/CVD, quotas, PGA flags, missing facts) and that it's decision support, not a binding determination.
- Cleared: green panel with the verbatim "Risk Clear" copy from the FE doc.
- Flagged: groups by severity (blocking → review → info), each `RiskFlagRow` with its own left-rule color. `screen.summary` renders inline above the groups.
- `importCaseRiskScreenRunMutation.onSuccess` invalidates both the latest-risk-screen query and the case-detail query so `lastRiskScreenedAt` ticks and any selector that reads it gets the fresh value.

`CaseQuotePanel` — "cost estimate only" gate:

- Adds a `useQuery({ ...importCaseRiskScreenLatestOptions() })` alongside the existing quote query. 404 is treated as "no screen yet" via `throwOnError: false`.
- Banner shows when `quote != null` and `(screen == null || screen.status === "incomplete" || screen.createdAt < quote.createdAt)`. Copy varies — `needsReview` says "flagged items may change the final amount due"; otherwise "run the risk screen to confirm trade-remedy and compliance exposure".
- A risk screen that ran AT or AFTER the quote's `createdAt` AND came back `clear` or `needsReview` settles the gate. Re-running a quote invalidates the gate again until the next risk run.

`selectCaseStatus` refinement: now takes an optional `riskScreen?: RiskScreenT | null` second argument. When supplied:

- `needsReview` → `"needsReview"`
- `clear` → `"readyForBroker"`
- `incomplete` → `"quoted"`

Without the argument, the old `lastRiskScreenedAt` timestamp behaviour kicks in — every existing caller still works, the new behaviour is opt-in for surfaces that have the risk-latest query handy.

**Deferred from the original plan:**

- **Wiring `selectCaseStatus` to risk data in the workbench header.** The header still calls `selectCaseStatus(data)` (no risk arg), so the status chip stays timestamp-only for now. Plumb the latest risk query into the route component when the polish pass lands.
- **`MissingFieldChip` click-to-scroll behaviour.** Still un-wired; risk flags' `lineItemId` linking would benefit too.

### 1.9 Phase 8 — what shipped vs the plan

Backend Phase 6 shipped `GET /rulings/search?q=&limit=`, `GET /rulings/{rulingNumber}`, `POST /import-cases/{caseId}/rulings`, `DELETE .../rulings/{rulingNumber}`, plus a refresh endpoint. Wire shapes: `RulingViewT` (search result, with `tariffs: HtsCodeFormsT[]`), `CaseRulingViewT` (attached, with `assignedHtsCodes[]` + `supportsSelectedCode: "yes"|"no"|"unknown"` + `attachedAt` + optional `matchNote` / `lineItemId`), `AttachRulingBodyT`, and `ImportCaseResponseT.rulings?: CaseRulingViewT[]` populated by the GET handler.

New molecules:

- `CaseRulingCard` — ruling number, date, support-state badge (`Supports` / `Conflicts` / `Reference` with green / red / neutral tones), subject, HTS-code badges, optional "Pinned to line #N" label, optional match-note block, `SourceLink` to CROSS, Detach button.
- `RulingsSearchResult` — one search-result row with three verdict buttons (Supports / Conflicts / Reference) and an "Attached" hint after success.

New organisms:

- `RulingsSearchDialog` — Radix `Dialog` mirroring `TweaksDialogShell`'s positioning. Search input fires `rulingsSearchOptions({ query: { q, limit: 10 } })` only after submit (no per-keystroke noise). Each result row calls `importCaseRulingAttachMutation` with the chosen verdict; success invalidates the case-detail query so the panel below picks the new card up immediately and the row collapses to "Attached." The dialog stays open so the user can keep attaching.
- `CaseEvidencePanel` — replaces the placeholder under the Evidence tab. Reads `case_.rulings ?? []`, groups by support verdict, renders each group with a count header + list of `CaseRulingCard`s. Empty state uses the FE-doc "Ruling Evidence" copy.

`CaseInspector` wires the real panel in, dropping the placeholder import.

**Deferred from the original plan:**

- **Pin-to-line on attach.** `AttachRulingBodyT` accepts an optional `lineItemId`; Phase 8 always attaches at the case level. A line-item picker on the search dialog row is a Phase 8.5 enhancement when there's UX demand. Card already shows "Pinned to line #N" when the backend reports one.
- **Match-note on attach.** Same — `matchNote` slot is rendered on the card when present (Phase 6 patch suggestions or backend-side auto-notes can fill it) but the search dialog doesn't yet collect one.
- **Refresh action.** `importCaseRulingRefresh` is in the SDK; we haven't surfaced a refresh button on the card. Add when a ruling that's been updated upstream becomes a real workflow.

### 1.10 Phase 9 — what shipped vs the plan

Pure FE polish from the Phase 9 list landed; ops-side items wait on product / release decisions.

**Header status chip now reflects real risk verdicts.** `cases.$caseId.tsx` fetches `importCaseRiskScreenLatest` and passes the result to `selectCaseStatus(case, riskScreen)`. The chip flips `quoted` → `needsReview` (amber) or `readyForBroker` (green) immediately after the panel's "Run screen" finishes, no refresh needed. 404 / no screen yet falls through to the timestamp-only path the selector already handled.

**Archive / Unarchive lifecycle.** New inline `WorkbenchHeader` subcomponent renders next to the title with a single Archive ↔ Unarchive button. PATCHes `status` between `archived` and `ready_for_review` via `importCasePatchMutation`. Invalidates both the case-detail and list queries so the rail row repaints. Read-only flag (`case.status === "archived"`) was already wired through every panel from Phase 4; this just gives the user a way to flip it.

**Sentry case tagging via `mutation.meta`.** `main.tsx` mutation cache now merges `mutation.options.meta?.tags` into the `Sentry.captureException` tags. Every case-aware mutation in the workbench (`CaseFactsPanel`, `CaseLinesPanel` × 3, `CaseQuotePanel`, `CaseRiskPanel`, `CaseEvidencePanel`, `RulingsSearchDialog`, and the new archive mutation in the header) sets `meta: { tags: { "import_case.id": case_.id } }`. Every failure that bubbles up to Sentry now carries the case id without each panel touching Sentry directly. `chatThunks.reportStreamError` also tags `import_case.id` when the thread is case-scoped.

The remaining ops-side items from the plan are deliberately out of scope here:

- **Flip `VITE_FEATURE_CASE_WORKBENCH=true` as build default + remove `tweaks.caseWorkbench`** — shipped. The slice field has been removed entirely (no longer in `TweaksT`). `selectFeatureCaseWorkbench` / `useFeatureCaseWorkbench` deleted alongside the legacy callers. `FEATURE_CASE_WORKBENCH_ENV` constant is kept as an env hook for a future rollback / scratchpad mode, but is a runtime no-op — no UI branches on it.
- **French copy pass** — no translation system in the repo; copy lives inline. Defer until a real `lang` consumer (props, i18n lib) lands and the workbench has enough static copy to translate consistently.
- **Demote `/` to flagged scratchpad** — collapsed into a hard redirect. `routes/index.tsx` is now just a `beforeLoad` that bounces authed users to `/cases/$activeCaseId` (or `/cases`); unauthed users hit `/login`. No component, no chat surface.

### 1.11 Legacy chat surface deletion

The Phase 9 flag flip made the legacy chat unreachable at runtime; this cleanup removes the dead code. Deleted:

- **Route component**: `routes/index.tsx` shrinks from ~200 lines of `ChatPage` to a redirect-only `Route` config.
- **Organisms**: `Inspector` (legacy tool-result inspector), `ChatTopbar`, `EmptyState`, `RailHistoryList`, `ResultCard`, `ResultRenderer`, `ReplaySection`, and every renderer under `organisms/results/` (`AlertList`, `CodeDetails`, `LandedCost`, `Rulings`, `SearchResult`, `SubscribeConfirm`).
- **Molecules**: `RailNewChatButton`, `RailConvoItem`, `EmptyStateHero`, `SuggestionCard`, `InspectorHeader`, `InspectorEmpty`, `InspectorToggleButton`.
- **Lib**: `loadConversation` thunk + `chatActions.loadConversation` reducer (only the conversation-replay path used them); `selectFeatureCaseWorkbench` / `useFeatureCaseWorkbench`; `src/lib/utils/suggestions.ts`.
- **`Rail`**: drops the `caseWorkbench` flag branch and the `onNewChat` / `onOpenSettings` props — it now owns the `TweaksPanel` mount internally. Route call sites simplified to `<Rail />`.
- **`TweaksPanel`**: drops the `onReplay` prop + `ReplaySection`; theme/density/behaviour/sign-out remain accessible via the rail footer's settings button in every case route.
- **`tweaksSlice`**: drops the `caseWorkbench` field; `BehaviourSection` no longer has the preview toggle.
- **`chatThunks`**: drops `loadConversation`, `toFECall`, `toFEMessage`, `callStatus`, and the no-longer-needed `conversationGet` import. `LEGACY_THREAD_ID` stays as a constant but the only path that resolves to it is the `caseId ?? undefined` branch in `streamChat` — kept for safety in case a future surface needs a non-case chat.

Net: 18 deleted files, ~1500 fewer lines of FE code, single mounted chat path (case-aware) site-wide. The `LEGACY_THREAD_ID` constant + `FEATURE_CASE_WORKBENCH_ENV` env hook are the two intentional stubs left behind so a future scratchpad / rollback mode can grow back without re-introducing plumbing.

Smaller deferrals still pending across Phases 4-8 (intentionally not pulled into Phase 9):

- `CaseTimeline` chronological merge in `CaseChatSurface`.

### 1.12 Polish batch — what shipped

Small affordances that were carried as deferrals across Phases 4-8. Bundled together post-Phase 9 to keep the workbench feeling finished rather than functional:

- **`MissingFieldChip` click-to-scroll.** `cases.$caseId.tsx` builds an `onMissingFieldClick` that navigates to the right inspector tab and, for case-level facts, calls `scrollMissingFact(field)` from `src/lib/utils/scrollMissingFact.ts`. The util waits two `requestAnimationFrame`s so a freshly-switched tab has mounted before we measure layout, then `scrollIntoView({ block: "center" })` + `.focus()` on the matching input. Field-id map (`case-transport`, `case-coo`, `case-value`) lives in the util; `lineItems` deficiencies just switch tabs.
- **Ruling refresh button.** `CaseRulingCard` now exposes Refresh alongside Detach. `CaseEvidencePanel` wires it to `importCaseRulingRefreshMutation` with `meta.tags`; per-card `refreshingNumber` state mirrors the existing `detachingNumber` so only the in-flight card shows the spinner copy.
- **Ruling attach: pin-to-line + match-note.** `RulingsSearchResult` grew a `<select>` of `case_.lineItems` (default "Case-level") and a `<Textarea>` for an optional match note. `RulingsSearchDialog` forwards both into `importCaseRulingAttachMutation`'s body. The card's existing "Pinned to line #N" / match-note rendering surfaces them on the attached side.
- **Quote history dropdown.** `CaseQuotePanel` keeps a `selectedQuoteId` state and an `orderedQuotes` memo (desc by `createdAt`). When the case has more than one quote, `QuoteHistoryDropdown` (new molecule) renders a `<select>` labelled by `formatCaptured(...)` — choosing one swaps `activeId` and the existing `importCaseQuoteGetOptions` query refetches that quote. Running a new quote clears the selection so the user lands on the fresh one. A small banner ("Viewing a historical snapshot…") shows when `activeId` isn't the latest.
- **CaseQuotePanel refactor.** Extracting the lines + entry-fees sections out (`QuoteLinesList`, `QuoteEntryFees`) kept the panel under the 250-line lint cap once the dropdown + banner landed.

Side-by-side quote diff is the one piece of the original "quote history" polish that did not ship — the dropdown swaps which quote is rendered, but rendering two quotes simultaneously with per-row deltas needs more design and stays deferred.

### 1.13 Side-by-side quote diff

The §1.12 deferral closed. When the user picks a non-latest quote via `QuoteHistoryDropdown`, `HistoricalQuoteBanner` now exposes a "Compare to latest" checkbox. With it on, `CaseQuotePanel` fires a second `importCaseQuoteGetOptions` query for the latest quote alongside the selected one, and routes both into the new `QuoteBody` molecule. `QuoteBody` is a thin switch: regular mode renders the existing `QuoteSummaryTable` / `QuoteLinesList` / `QuoteEntryFees`; compare mode renders the paired-row variants `QuoteDiffSummaryTable` / `QuoteDiffLinesList` / `QuoteDiffEntryFees`. Caveats always come from the selected quote — they're metadata about that capture, not part of the diff.

Diff math lives in `src/lib/utils/quoteDiff.ts`: `computeDelta(selected, latest)` returns `{ amountUsd, pct, direction }`, `pairLines` joins two line arrays by `position`, `pairEntryFees` joins fees by `feeCode`. The shared `QuoteDeltaCell` molecule renders a signed `$` amount + (when meaningful) a signed `%`, tinted green when the selected quote was cheaper and red when more expensive. Lines added or removed between captures get an `Added` / `Removed` chip and a `—` on the missing side; the Δ cell stays blank rather than reading "+$0.00" so empty rows don't bias the visual scan.

Running a new quote (`Re-run quote`) clears `compareMode` and `selectedQuoteId` so the user lands on the fresh quote in regular mode. Navigating back to "Latest" in the dropdown also short-circuits compare mode via `effectiveCompareMode = compareMode && isHistorical`, so the diff render never collapses into identical Selected/Latest columns.

To stay under the 250-line lint cap, the panel handed off three pieces: `formatCaptured` → `src/lib/utils/quoteCapture.ts`, the historical banner UI → `HistoricalQuoteBanner` molecule, and the render branching → `QuoteBody` molecule. Each is < 80 lines and independently testable.

### 1.14 Phases 10-11 — what shipped vs the plan

Backend Phases 10 and 11 introduced bulk classify, candidate review, per-case affordances on existing payloads, a case-scoped conversation filter, and the LLM usage report. FE pulled the new wire types via `gen:api` and landed four surfaces.

- **Bulk classify.** `BulkClassifyBar` molecule (in `CaseLinesPanel`) calls `importCaseClassifyBulk` with `{ onlyUnclassified: true, attachCandidates: true }` via a fresh `AbortController` per click; the existing per-line `Classify` button still does the single-line path. Progress is a single spinner because the endpoint returns one envelope (5–60 s wall-clock by design); the user can hit Cancel mid-flight. After-run summary is a dashed banner showing `N classified · N skipped · N failed` plus the per-line `error` strings. Transport-level failures bubble through `onError` to the panel's `ErrorBanner`.
- **`unclassifiedLineCount` chips.** `RailCaseItem` (rail) and `CaseIndexRow` (`/cases` index) both surface the count as a small warn-tinted pill; hidden when zero. The actual classify trigger lives inside the workbench (one click to open, one click to fire) instead of doubling up the button on every card.
- **Candidate review surface.** New `CandidateReviewChip` molecule on each `CaseLineItemRow` surfaces `candidateSummary.{ pending, accepted, rejected }` as click-target pills (`total === 0` hides the chip). Clicking opens `CandidatesReviewDialog` (new organism, Radix Dialog), which lists candidates with Accept / Reject / Delete per row. The dialog uses a small `useCandidateReviewActions` hook for the four mutations + busy state so the component stays under the line-cap. When the user rejects the candidate whose code matches the line's current `selectedHtsCode`, a `ClearSelectionPrompt` banner appears with a "Clear selection" action that PATCHes the line to `{ selectedHtsCode: null, classificationState: "unclassified" }`. Reject never auto-clears — the user always confirms.
- **Conversations on this case (display-only).** `RailCaseConversations` queries `conversationsList({ caseId })` whenever a case is active and renders a "Conversations on this case" rail section below the cases list. Each row shows the conversation title + a relative date. Rows aren't clickable yet — see deferral below.
- **LLM cost widget.** `LlmUsageSection` in the Tweaks panel (between Behaviour and Account) queries `adminLlmUsage` with `from` / `to` defaulting to the last 30 days. Date range editable via two native `<input type="date">`s. Renders a horizontal stacked bar (one segment per provider, four-tone palette: ink / ok / warn / err) plus a per-provider table with token totals. No dollars (the wire only carries token counts).

Already-shipped pieces from this batch that the prompt called out but didn't require new work:

- **Ruling refresh.** Shipped in §1.12; `CaseRulingCard` exposes a Refresh button wired to `importCaseRulingRefresh` via `CaseEvidencePanel`.
- **`casePatchSuggestion` SSE chunks.** Wire shape already matches §3.9 of the SSE protocol doc — `chatThunks.sendChat` routes the chunk into `casesSlice.pendingPatches` which `CasePatchTray` renders as reviewable chips. The wire `CasePatchT` has `op | path | value | reason` per the spec.

Deferrals from this batch (both closed in §1.15 once backend Phase 12 surfaced the markers):

- ~~Thread switching on the conversations rail.~~
- ~~`casePatchSuggestion` rehydration from `tool_calls`.~~

### 1.15 Thread switching + `casePatchSuggestion` rehydration

Backend Phase 12 exposed the markers as a dedicated `ConversationMessage.casePatchSuggestions: CasePatchSuggestionView[]` field — lifted out of the heterogeneous `tool_calls` jsonb so the FE no longer has to parse it. With that on the wire the rehydration path is straightforward.

- **`loadConversation(threadId, conversationId)` thunk** (`src/lib/state/chatThunks.ts`). Fetches via `conversationGet({ path: { id } })`, maps each `ConversationMessage` back to `MessageT` (assistant `calls` reconstructed from `toolCalls` with `startedAt: 0` as the "loaded, not streamed" sentinel; `streaming` / `thinkingActive` settled to `false`), and dispatches a new `chatActions.loadMessages({ threadId, conversationId, messages })` reducer that replaces the thread wholesale. Any in-flight stream on the same thread is aborted first via the existing module-scoped `abortCtrl`.
- **Rehydration.** After the messages land, the thunk walks each message's `casePatchSuggestions` and pushes their patches into `casesSlice.pendingPatches` so `CasePatchTray` shows the chips. It clears `pendingPatches` once before appending so re-picking the same conversation doesn't double-stack.
- **`RailCaseConversations` click.** Now an active button per row that dispatches `loadConversation(activeCaseId, c.id)`. The currently-loaded conversation is marked active by reading `chat.threads[activeCaseId].conversationId` — same source-of-truth the `sendChat` thunk writes on each `turnStart` chunk, so a freshly-streamed conversation also lights up the matching row once its id arrives.
- **Wholesale replace vs merge.** Loading a past conversation discards any unsent draft state in the thread (the composer state lives in component-local `useState`, not the slice). The persisted transcript is settled, so merging into a half-streamed live state would just leave the UI inconsistent. Re-picking the live conversation no-ops at the start of the thunk (`existing?.conversationId === conversationId`).
- **Codegen.** Phase 12 isn't deployed to Cloud Run yet, so a one-off `OPENAPI_URL=file://…/openapi.snapshot.json yarn run gen:api` pulled the new types (`CasePatchSuggestionViewT`, `ConversationMessageT.casePatchSuggestions`). Once the next backend deploy lands, the cloud spec will carry them and routine regens will work without the override.

## 2. Constraints

- Backend rollout is phased (fee schedule → cases → quotes → chat → risk → rulings). Each FE phase ships behind a `caseWorkbench` flag until backend Phase 6 polish.
- Wire types come from `yarn run gen:api` (`@hey-api/openapi-ts`) into `src/lib/api/generated/`. We re-alias them in `src/lib/types.ts` with the `T` suffix. No hand-written wire types unless an endpoint hasn't shipped yet.
- Reads stay on TanStack Query (`importCasesListOptions`, `importCasesGetOptions`); Redux holds cross-component UI state only — active case id, draft line edits, pending case-patch suggestions. Same split as today's chat (conversations on Query, in-flight stream in Redux).
- Routes become case-centric. New TanStack file routes: `cases.tsx`, `cases.new.tsx`, `cases.$caseId.tsx`. `routes/index.tsx` redirects authed users to `/cases` when the flag is on.
- StyleX conventions stay: colocated `stylex.create`, longhand only, no shorthand props, conditional styles via `default` key, `':is([data-state="..."])'` for Radix variants. Type names end in `T`.

## 3. Decisions (locked)

1. **Case list lives in both rail and `/cases` index.** Rail is the in-workbench switcher; `/cases` is the discovery/landing page. Both consume the same `importCasesListOptions()` cache.
2. **Archived cases are read-only with unarchive.** Unarchive is a `PATCH` of `status` back to `ready_for_review`; no special endpoint. All edit affordances read a single `isReadOnly` flag derived from persisted status and disable submits/blur-PATCHes.
3. **No public unauthed quote view.** Out of scope per backend spec §2. The "compare to previous quote" diff is an in-workbench affordance inside `CaseQuotePanel`, not a standalone route. Defer a shareable route until a real broker-share workflow lands.
4. **Status is server-persisted (3) + client-derived (7).** Persisted enum (`draft | ready_for_review | archived`) is the user's filing decision, set explicitly via PATCH. The 7-value `ImportCaseStatusT` (`draft | classifying | readyForQuote | quoted | needsReview | readyForBroker | archived`) is derived client-side from line classification state, quote presence, risk result. **Asymmetry:** when persisted status is `archived`, the derived value is also `archived` regardless of data — archived is the only persisted value that overrides derivation. Selector is pure, colocated with `casesSlice`, unit-tested.
5. **`caseWorkbench` flag: tweaks slice (dev) OR-ed with `VITE_FEATURE_CASE_WORKBENCH` (prod rollout).** Build-time env var for staged rollout, tweaks-slice toggle for dev override without rebuilds. No backend-driven entitlement until per-user gating is a real requirement.

## 4. Data and state layer

### 4.1 Wire type aliases — `src/lib/types.ts`

After `yarn run gen:api` picks up Phase 2 of the backend, add aliases for:

```
ImportCaseT
ImportCaseLineItemT
HtsCandidateT
LandedCostQuoteT
LandedCostQuoteLineT
LandedCostQuoteSummaryT
QuoteFeeT
RiskScreenSummaryT
RiskFlagT
CaseRulingT
SourceRefT
TransportModeT
RiskSeverityT
SupportsSelectedCodeT
ImportCaseStatusT
CasePatchSuggestionT
```

`ImportCaseStatusT` is the FE-derived 7-value union; backend ships the 3-value persisted enum under a different name (e.g. `ImportCasePersistedStatusT`). Use the project's `import type … ; export type FooT = Foo;` workaround to satisfy `no-barrel-files`.

Drop the hand-written `RulingItemT` / `CrossRulingsContentT` once `find_cross_rulings` returns the new `CaseRulingT` shape.

### 4.2 Slice — `src/lib/state/casesSlice.ts`

```ts
interface CasesStateT {
  activeCaseId: string | null;
  draftLineEdits: Record<string, Partial<ImportCaseLineItemT>>;
  pendingPatches: CasePatchSuggestionT[];
}
```

Actions: `setActiveCase`, `editLineDraft`, `commitLineDraft`, `pushPendingPatches`, `resolvePatch`. Wire `casesReducer` into `store.ts`. Persist `activeCaseId` to localStorage via the same `store.subscribe` shim `tweaksSlice` uses, so refresh keeps the workbench focused.

### 4.3 Thunks — `src/lib/state/casesThunks.ts`

```
createCase, patchCase, deleteCase
addLineItem, patchLineItem, removeLineItem
classifyLine
quoteCase, runRiskScreen
attachRulingToCase, removeRulingFromCase
applyCasePatch
```

Each thunk hits the generated SDK and invalidates the matching TanStack Query key.

### 4.4 Facade — `src/lib/state/cases.ts`

Thin `useCases()` / `useActiveCase()` / `usePendingPatches()` hooks. Same shape as `useChatStore` / `useTweaks`.

### 4.5 Status selector

```ts
selectCaseStatus(caseId: string): ImportCaseStatusT
```

Pure function over `{ persistedStatus, lineItems, latestQuote, latestRiskScreen }`. First check: `if (persistedStatus === 'archived') return 'archived'`. Otherwise derive per `FRONTEND_IMPORT_CASE_WORKBENCH.md` §Case Status Model.

### 4.6 Chat scoping — `src/lib/state/chatSlice.ts`

Refactor threads to be keyed by case id:

```ts
interface ChatStateT {
  threads: Record<string, ChatThreadStateT>;
  activeThreadId: string | null; // mirrors casesSlice.activeCaseId
}
```

Existing fields (`messages`, `running`, `focusedCallId`, `inspectorOpen`, `conversationId`) move under `ChatThreadStateT`. Only one stream at a time site-wide; `running` per-thread makes that constraint explicit.

## 5. Routes

| Path             | File                           | Notes                                                                                                                          |
| ---------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `/`              | `src/routes/index.tsx`         | When flag is on, redirect authed users to `/cases` (or last `activeCaseId`).                                                   |
| `/cases`         | `src/routes/cases.tsx`         | Index/discovery. Lists `useCases()` with status filter from `?status=`.                                                        |
| `/cases/new`     | `src/routes/cases.new.tsx`     | Intake form via TanStack Form. Min save = title + ≥1 line description. On submit: `createCase` → navigate to `/cases/$caseId`. |
| `/cases/$caseId` | `src/routes/cases.$caseId.tsx` | The workbench. Inspector default tab from `?tab=`.                                                                             |
| `/login`         | `src/routes/login.tsx`         | Unchanged.                                                                                                                     |

No standalone quote route (decision 3). Quote diff lives inside `CaseQuotePanel`.

## 6. Components

### 6.1 Modified organisms

- `src/components/organisms/Rail.tsx`
  - Rename `RailNewChatButton` → `RailNewCaseButton`, wire to `/cases/new`.
  - Replace `RailHistoryList` with `RailCaseList`: `useQuery({ ...importCasesListOptions() })`, rows are `RailCaseItem`.
  - Add segmented status filter above the list, state held in `?status=`.
- `src/components/organisms/Inspector.tsx` stays mounted on the legacy `/` route only; the case workbench mounts the new `CaseInspector` instead. They coexist behind the route boundary until flag removal.
- `src/components/organisms/results/LandedCost.tsx` (Phase 1, **shipped**): renders surcharges as a "Surcharge sources" section with `program` / `chapter_99_code` / rate text / `SourceLink` (label + effective date). Empty surcharge array shows the verbatim no-rule-matched copy. Amounts and percentages go through `formatUsd` / `formatPercent` from `src/lib/utils/intl.ts`. MPF/HMF cap display + stale-data chip are deferred to Phase 5 until backend exposes fee metadata on the wire.

### 6.2 New organisms

- `CaseTopbar.tsx` — editable case title, `CaseStatusChip`, missing-fields count, overflow menu (Archive / Unarchive / Delete).
- `CaseTimeline.tsx` — chronological merge of chat messages, tool calls, quote/risk/ruling events, accepted case-patch events.
- `CasePatchTray.tsx` — sticky above composer; rows from `state.cases.pendingPatches`. Empty when none. Never silently apply.
- `CaseInspector.tsx` — Radix `Tabs` with `Facts | Lines | Quote | Risks | Evidence`. Default tab from `?tab=` search param.
- `CaseFactsPanel.tsx` — header form, inline edits, PATCH on blur. Missing-required-facts rendered in place via `MissingFieldChip`.
- `CaseLinesPanel.tsx` — list of `CaseLineItemRow` molecules.
- `CaseQuotePanel.tsx` — `QuoteSummaryTable` + expandable `QuoteLineRow`s + entry-level `FeeRow`s + caveats. "Cost estimate only" banner until risk screen has run on the latest quote's reference date. History dropdown for previous quotes with side-by-side diff.
- `CaseRiskPanel.tsx` — header status (`not checked` / `clear` / `needsReview`) + flag groups by severity. Severity coloring: blocking = red, review = amber, info = neutral. **Do not** use red for every flag.
- `CaseEvidencePanel.tsx` — three groups (`supports` / `conflicts` / `reference`) of `CaseRulingCard`. "Add ruling" opens `RulingsSearchDialog`.

### 6.3 New molecules

Pending: `CaseStatusChip`, `MissingFieldChip`, `HtsCodeBadge`, `CaseLineItemRow`, `CaseRulingCard`, `RiskFlagRow`, `QuoteSummaryTable`, `QuoteLineRow`, `FeeRow`, `CasePatchSuggestionRow`, `RailCaseItem`, `GlossaryTerm`.

Shipped: `SourceLink` (label + url + optional effective date — used by the Phase 1 surcharge rendering and reused by Phases 4-7).

### 6.4 Tokens

Extend `src/lib/styles/tokens.stylex.ts` with severity colors as `defineConsts` (static, not themed):

```
risk.bg.blocking, risk.fg.blocking
risk.bg.review,   risk.fg.review
risk.bg.info,     risk.fg.info
```

Status chip colors live under themed `colors` if they need to follow dark/light mode.

### 6.5 Copy

Verbatim copy blocks from the backend FE doc live in `src/lib/copy/caseCopy.ts`:

- Empty State, Quote Caveat, Risk Clear, Risk Review, Ruling Evidence, Binding Ruling.
- The surcharge empty-state string is exactly `"No verified surcharge rule matched this case."` Never `"no surcharge applies."`

Glossary tooltips for MPF, HMF, AD/CVD, CBP, CROSS live in `src/lib/copy/glossary.ts`, mirroring the backend `GLOSSARY.md`.

## 7. Chat protocol changes

`src/lib/api/chatStream.ts` (parser **already swapped** — see §0):

- Body now pipes through `TextDecoderStream → EventSourceParserStream` (from `eventsource-parser`). Spec-compliant, ready for Phase 6 typed events.
- Add `caseId?: string`, `includeCaseContext?: boolean` to `StreamOptionsT` (Phase 6).
- When `caseId` is set, POST to `${base}/import-cases/${caseId}/chat/stream` with `includeCaseContext: true` by default. Fallback `/chat/stream` stays for non-case scratchpad chat until backend deprecates.

`src/lib/state/chatSlice.ts`:

- Handle new `casePatchSuggestion` chunk type. It does not mutate `chatSlice` directly.

`src/lib/state/chatThunks.ts → sendChat`:

- Read `state.cases.activeCaseId`, pass to `streamChat`.
- On `casePatchSuggestion`: `dispatch(casesActions.pushPendingPatches(chunk.patches))`.
- On `toolResult` for `quote_landed_cost` | `run_risk_screen` | `attach_ruling`: invalidate matching Query keys and refetch the active case.

`CasePatchSuggestionRow`:

- Renders op + path + value + reason. Accept → `applyCasePatch` thunk → PATCH the case/line/ruling, then `resolvePatch`. Dismiss → `resolvePatch` only.

## 8. Build order

Each phase ships behind the flag.

| Phase | Backend dep      | FE work                                                                                                                                                                                                    | Done when                                                                                        |
| ----- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 0     | none             | Add `VITE_FEATURE_CASE_WORKBENCH` to vite config, `caseWorkbench` to `tweaksSlice`, `src/lib/features.ts` exposes OR-ed boolean. **Pending** — will land with Phase 2.                                     | Flag toggles a no-op feature surface.                                                            |
| 1     | Step 1 (fees)    | Render structured surcharges in `LandedCost.tsx` with `SourceLink` attribution + verbatim no-rule-matched empty state. **Done.** MPF/HMF cap display + stale-data chip deferred to Phase 5.                | Quote shows surcharge source links + effective dates.                                            |
| 2     | Step 2 (cases)   | Wire type aliases, `casesSlice`, `casesThunks`, facade, status selector, chat thread keying.                                                                                                               | `dispatch(createCase(...))` round-trips, no UI yet.                                              |
| 3     | Step 2           | New routes + Rail rewrite (status filter, case list, new-case button). `/cases/new` form.                                                                                                                  | User can list cases and create one; case opens an empty workbench.                               |
| 4     | Step 2           | Workbench layout + `CaseInspector` tabs + `CaseFactsPanel` + `CaseLinesPanel` (with classify action stubbed if Step 3 not yet shipped).                                                                    | Two-line case shows editable facts, line rows, classification state, missing-field chips.        |
| 5     | Step 3 (quotes)  | `CaseQuotePanel` full implementation, `QuoteSummaryTable`, line rows, entry-fee rows, quote history + diff.                                                                                                | Two-line shipment renders one MPF row, one HMF row when ocean, separate duty/surcharge per line. |
| 6     | Step 4 (chat)    | `chatStream` `caseId` support, `casePatchSuggestion` handling, `CasePatchTray`, `CaseTimeline` patch events, tool-result-driven case refetch.                                                              | Chat reuses known case facts and never re-asks; patches surface as reviewable rows.              |
| 7     | Step 5 (risk)    | `CaseRiskPanel`, severity coloring, "cost estimate only" gating banner in `CaseQuotePanel`.                                                                                                                | Quote is never shown as "complete" without a risk screen.                                        |
| 8     | Step 6 (rulings) | `RulingsSearchDialog`, `CaseEvidencePanel` groups, attach/detach actions. Update legacy `Rulings.tsx` to new shape once `find_cross_rulings` ships it.                                                     | Selected HTS shows "supported by N rulings" / "conflicts with M" with links.                     |
| 9     | none             | Sentry tags (`import_case.id`, `quote.id`, `risk_screen.id`), French copy pass, flip `VITE_FEATURE_CASE_WORKBENCH=true` as build default, remove `tweaks.caseWorkbench`, demote `/` to flagged scratchpad. | Flag removed; `/cases` is the default landing.                                                   |

Phases 2 and 3 can start in parallel with backend Step 2 by stubbing generated types if needed; everything else gates on its respective backend phase.

## 9. Observability

Tag thunks and stream events with:

```
import_case.id
line_item.id
quote.id
risk_screen.id
selected_hts_code
```

Same tag shape as backend tracing in spec §9, so a Sentry → backend trace join is one click.

## 10. Acceptance (FE slice)

Lifted from `FRONTEND_IMPORT_CASE_WORKBENCH.md` §Frontend Acceptance Criteria:

- User can create a case with one incomplete line item.
- The UI clearly shows missing facts before quote.
- User can classify a line and choose a candidate.
- User can generate a quote and see entry-level fees separately from line duties.
- User can run risk screen and see flags by severity.
- User can search and attach a ruling.
- Chat answers using known case facts.
- UI never says a cost is "complete" if risk screen is missing or unresolved.

## 11. Out of scope

- Public unauthed quote view (decision 3).
- French translation pass for new copy (deferred to Phase 9; English in the interim).
- Backend-driven entitlement for the workbench flag (decision 5).
- Broker-grade surcharge population, full AD/CVD computation, TRQ inventory — these are out of scope per backend spec §2.
