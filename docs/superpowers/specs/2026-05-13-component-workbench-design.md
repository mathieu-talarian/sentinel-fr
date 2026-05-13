# Component Workbench (Ladle) — Design Spec

**Date**: 2026-05-13
**Status**: Approved for implementation planning
**Author**: brainstorming session with Mathieu

## Goal

Add a component workbench so atoms and molecules can be styled and visually
verified in isolation — without booting the app, signing in, or navigating to
the right case. Pair the workbench setup with an opportunistic refactor pass
that pushes presentational subtrees out of organisms into reusable, story-able
molecules.

## Non-goals (v1)

- **Organism stories**: not in scope. Organisms keep their Redux / TanStack
  Query / TanStack Router wiring and stay tested live in the app. If a story
  needs `useAppSelector` / `useQuery` / `useNavigate`, the unit is the wrong
  layer.
- **Interaction tests, a11y CI, visual regression**: Ladle supports all of
  these via Playwright/axe/Lost Pixel, but layering them in is a follow-up,
  not part of the v1 install.
- **Public/deployed catalog**: workbench runs locally only. No Firebase
  Hosting deploy, no Chromatic.
- **MSW or network mocking**: stories take props, not data. No MSW setup.
- **Refactor beyond the top-10 target list**: deeper sub-component extraction
  only happens when a candidate has multiple consumers or three or more
  visual states worth covering.

## Tool choice — Ladle

Selected `@ladle/react` over Storybook 10 because:

- **StyleX integration is free**. Ladle reads the project's existing
  `vite.config.ts`, so the `@stylexjs/unplugin/vite` transform, the `@`
  alias, and `@vitejs/plugin-react` all carry over with no duplication.
  Storybook would require a separate `.storybook/main.ts` with `viteFinal`
  re-declaring the StyleX unplugin — drift risk every time `vite.config.ts`
  changes.
- **Speed**. Cold start ~1s vs Storybook ~8s; HMR <500ms vs ~2s.
- **Footprint**. One devDependency, one config file, ~10 lines of edits.
- **Aligned with the goal**. The user picked "style atoms/molecules in
  isolation" as the primary use case. Storybook's controls/MDX/Chromatic
  ecosystem is overkill for that and pays off only at a scale we're not
  targeting.

Tradeoff accepted: if the project later wants a public design-system site,
Chromatic visual regression, or rich MDX docs, we'd migrate to Storybook
then. Ladle stories are CSF-compatible, so the migration cost is low.

## Architecture

### Files added

| Path | Purpose |
|---|---|
| `ladle.config.mjs` | Ladle config: story glob, port, addon defaults |
| `.ladle/components.tsx` | Global `Provider` exporting theme + padding decorators (Ladle convention) |
| `src/stories/fixtures.ts` | Typed sample data shared across stories (`sampleCaseRuling`, `sampleHtsCode`, `sampleFeeRow`, …) |
| `src/components/{atoms,molecules}/*.stories.tsx` | Colocated story files, one per component |

### Files modified

| Path | Change |
|---|---|
| `package.json` | Add `@ladle/react` devDependency; add `ladle` and `ladle:build` scripts |
| `vite.config.ts` | Gate the TanStack Router plugin and Sentry plugin behind a `process.env.LADLE` check so they don't run in the workbench |
| `tsconfig.app.json` | Ensure `.stories.tsx` files are included (likely already covered by the existing `src/**` include) |
| `eslint.config.js` | Allow `.stories.tsx` to be exempt from `noBarrelFiles` only if needed (likely no change required) |
| `.gitignore` | Add `.ladle/build/` |

### Story file convention

```tsx
// src/components/atoms/Button.stories.tsx
import { type Story, type StoryDefault } from "@ladle/react";

import { Button, type ButtonPropsT } from "./Button";

export default {
  title: "atoms/Button",
} satisfies StoryDefault;

export const Primary: Story<ButtonPropsT> = (props) => <Button {...props} />;
Primary.args = { variant: "primary", children: "Sign in" };

export const Disabled: Story<ButtonPropsT> = () => (
  <Button variant="primary" disabled>Sign in</Button>
);
```

Rules:

- Title segment matches folder: `atoms/Button`, `molecules/CaseStatusChip`.
  Ladle builds the sidebar tree from these.
- Each story is one named export. `args`-driven stories get auto-generated
  controls from TypeScript props; static stories skip controls.
- Each component covers at minimum a **default** story plus one per closed-enum
  variant (`tone`, `size`, `state`).
- `args` types come from the component's exported `*PropsT` type — no
  hand-written `argTypes` boilerplate unless we need to constrain a value.

### Global decorators (`.ladle/components.tsx`)

Three decorators applied to every story:

1. **Theme decorator**: applies the StyleX `darkTheme` class to
   `document.documentElement` (mirroring `__root.tsx`) plus the `s.root`
   style on a wrapper div. Necessary so Radix `Dialog.Portal` and any
   future Tooltip/Popover/Toast inherit the theme — CSS custom properties
   only flow through ancestors, and portaled descendants mount into
   `document.body`.
2. **Padding decorator**: wraps the story in a `padding: 24, display: grid,
   placeItems: start` container so atoms aren't pinned to the top-left edge.
3. **Density toggle**: Ladle global that flips `data-density="compact"` on
   the wrapper — exposed via Ladle's `globalState`. Optional, only matters
   for components that read the attribute.

No Redux / TanStack Query / TanStack Router providers. By construction,
atoms and molecules shouldn't reach for them.

### Fixtures

`src/stories/fixtures.ts` exports typed sample objects for use across
stories. Naming: `sample<Type>` (singular), `sample<Type>s` (plural).
Examples:

- `sampleCaseRuling: CaseRulingResponseT` (wire type)
- `sampleHtsCode: HtsCodeT` (wire type)
- `sampleConversationListResponse: ConversationListResponseT` (wire type)
- `sampleFeeRow: FeeRowPropsT` (UI prop shape from the consumer molecule)

For shapes that exist on the wire, fixtures use the generated counterpart
from `@/lib/api/generated/types.gen` verbatim — never hand-roll a parallel
type. For UI-only shapes (component prop types, FE-side narrowed enums
from `@/lib/types`), fixtures use the same UI type the component exports.

## Refactor pass

### The rule (story-eligible)

A component qualifies for a story if it reads only `props`. Specifically:

- **Banned hooks**: `useAppSelector`, `useAppDispatch`, `useQuery`,
  `useMutation`, `useNavigate`, `useParams`, `useChatStore`, `useTweaks`,
  any future hook that wraps global state, network, or routing.
- **Allowed state**: local UI state (`useState` for hover/expand/focus).
- **Allowed effects**: DOM-only `useEffect` (focus management, scroll,
  textarea autosize).

### Pre-flight cleanup

Three components currently in `src/components/molecules/` break the rule
and must be fixed before story authoring starts:

- `BulkClassifyBar.tsx`
- `CatalogStatsStrip.tsx`
- `ThinkingPanel.tsx`

For each: peel the hook calls out into a thin organism wrapper
(`BulkClassifyBarContainer`, etc.) that lives in `organisms/` and passes
props down to the existing molecule. This keeps the molecule's name stable
and existing import sites mostly unchanged (one rename per consumer).

### Audit method

A one-shot `rg` grep enumerates every file under `src/components/molecules/`
and `src/components/atoms/` that matches the banned-hook regex. The same
script enumerates `src/components/organisms/` and reports line count, so we
can confirm extraction candidates are the largest files.

### Extraction pattern

When an organism `Foo` extracts a presentational child, the child is named
`FooView` (or `FooBody` for dialog interiors) and lives in
`src/components/molecules/`. The organism keeps the hooks + handlers and
passes data + callbacks down via props.

Naming convention (binding):

- `<Foo>` (organism) → wires hooks, owns mutations/dispatches
- `<FooView>` (molecule) → pure render, all inputs via props
- `<FooBody>` (molecule, dialog only) → dialog interior, pure render

The `-View` / `-Body` suffix is intentional: it makes the "wiring vs view"
split obvious at every import site and `rg`-able.

### Target list (top 10, ordered by leverage)

1. `Composer` → `ComposerView` (high reuse, many visual states)
2. `CandidatesReviewDialog` → `CandidatesReviewDialogBody`
3. `RulingsSearchDialog` → `RulingsSearchDialogBody`
4. `NewCaseForm` → `NewCaseFormFields`
5. `CaseQuotePanel` → `CaseQuoteView`
6. `CaseEvidencePanel` → `CaseEvidenceView`
7. `CaseRiskPanel` → `CaseRiskView`
8. `CaseLinesPanel` → `CaseLinesView`
9. `CaseFactsPanel` → `CaseFactsView`
10. `LlmUsageSection` → `LlmUsageView`

Each extraction is a self-contained mini-PR: extract → wire organism to
pass props → add stories → land. Independent and reorderable.

### Skip list

Small organisms that are already ~90% wiring with negligible JSX surface
do not get split:

- `Rail.tsx`, `AccountSection.tsx`, `AppearanceSection.tsx`,
  `BehaviourSection.tsx`, and similar — wrappers that already delegate to
  molecules they include.

Decide on a case-by-case basis once we hit them.

## Developer flow

```bash
yarn ladle          # Local workbench on http://localhost:61000
yarn ladle:build    # Static build → .ladle/build/ (for manual sharing)
```

Port 61000 chosen to stay clear of `yarn dev` on 3000 and the API on 8888.

Story authoring loop:

1. Touch a component in `atoms/` or `molecules/`.
2. Open or create the colocated `.stories.tsx`.
3. Add or adjust a named export per visual state.
4. HMR reflects the change in <500ms.

No build step required during normal authoring; `ladle:build` only runs
ahead of sharing a snapshot.

## Test plan

- **Smoke**: `yarn ladle` starts, sidebar lists every story, each story
  renders without console errors.
- **Theme correctness**: open a Dialog-using story (e.g. once
  `CandidatesReviewDialogBody` exists); confirm the portaled content
  paints with `colors.*` tokens, not browser defaults.
- **HMR**: edit a story's `args`, confirm the preview updates without a
  full reload.
- **Build**: `yarn ladle:build` produces a static `.ladle/build/` that can
  be served with `npx serve .ladle/build` and works offline.
- **Lint/type**: `yarn lint` and `yarn type` pass with the new files.
- **No regressions**: `yarn build` still produces a working app bundle —
  the env-gated plugin block in `vite.config.ts` must not break the normal
  build.

## Open questions

None at design time. Implementation will surface details (e.g. how
exactly the TanStack Router plugin tolerates being absent during the Ladle
build, whether any molecule needs a one-off context provider) which are
plan-level concerns, not spec-level.

## Out-of-scope follow-ups (post-v1)

- **Visual regression** via Lost Pixel against `ladle:build` output.
- **A11y addon** (`ladle`'s built-in axe integration) wired into stories.
- **Organism stories** with Redux + Query decorators, once we've got
  conviction the workbench is paying off.
- **Public deploy** to Firebase Hosting if stakeholders want to browse.
