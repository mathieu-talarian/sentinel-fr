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

| Phase | Backend dep    | FE status   | Notes                                                                                                                                             |
| ----- | -------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | none           | **done**    | `caseWorkbench: boolean` on `tweaksSlice` (default `false`, persisted). `src/lib/features.ts` OR-es it with `VITE_FEATURE_CASE_WORKBENCH`.        |
| 1     | Step 1 (fees)  | **done**    | Backend exposed structured surcharges (not fee-schedule metadata); FE renders them with source attribution. See §1.1 for what shipped vs plan.    |
| 2     | Step 2 (cases) | **done**    | Wire-type aliases, `casesSlice` (`activeCaseId` only), facade (`useCases`, `useActiveCase`, …), `selectCaseStatus` selector. See §1.2.            |
| 3     | Step 2         | **done**    | `/cases`, `/cases/new`, `/cases/$caseId` routes. `Rail` flag-aware. `RailCaseList` + `RailCaseItem` + `CaseStatusChip` + `NewCaseForm`. See §1.3. |
| 4-9   | per the table  | not started |                                                                                                                                                   |

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
