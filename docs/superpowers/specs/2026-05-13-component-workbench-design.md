# Component Workbench (Storybook 10) — Design Spec

**Date**: 2026-05-13 (created), revised 2026-05-14 (tool switched from Ladle to Storybook)
**Status**: Approved; implementation in progress
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

## Tool choice — Storybook 10

Selected `@storybook/react-vite` over Ladle. Initial pick was Ladle (faster
cold start, no StyleX duplication), but Mathieu trialed it 2026-05-13 and
switched to Storybook on 2026-05-14. The decisive factors:

- **Ecosystem**. `@storybook/addon-a11y` (axe-based inspector),
  `@storybook/addon-docs` (auto-generated docs + MDX), controls panel with
  prop introspection via `react-docgen-typescript`, future Chromatic
  visual regression hook. Ladle covers a11y and stories but its addon set
  and controls panel are noticeably thinner.
- **Standard**. Wider team familiarity, larger sample of patterns for
  Radix + StyleX integrations, broader compatibility window for future
  toolchain upgrades.
- **Toolchain compatibility**. Storybook 10 uses the project's own Vite
  8 (no bundled second copy) — avoids the `vite-react-refresh-wrapper`
  module-type clash that surfaced with Ladle's bundled Vite 6 ↔ this
  project's `@vitejs/plugin-react@6`.

Cost accepted: a separate `.storybook/main.ts` re-declares the StyleX
unplugin via `viteFinal`, so any future change to the workbench-relevant
StyleX options has to be mirrored in both `vite.config.ts` and
`.storybook/main.ts`. The block is small and obvious enough to spot during
review. If drift becomes a maintenance issue, extract the StyleX plugin
options into a shared module both configs import.

## Architecture

### Files added

| Path                                                | Purpose                                                                                          |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `.storybook/main.ts`                                | Storybook config: framework, story glob, addons, `viteFinal` injecting StyleX + alias            |
| `.storybook/preview.tsx`                            | Globals, parameters, and a theme decorator that applies `darkTheme` to `<html>`                  |
| `src/stories/fixtures.ts`                           | Typed sample data shared across stories (`sampleCaseRuling`, `sampleHtsCode`, `sampleFeeRow`, …) |
| `src/components/{atoms,molecules}/**/*.stories.tsx` | Colocated CSF v3 story files, one per component, including nested atom folders when useful       |

### Files modified

| Path                | Change                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `package.json`      | Add `storybook`, `@storybook/react-vite`, `@storybook/addon-a11y`, `@storybook/addon-docs`; add `storybook` and `build-storybook` scripts |
| `tsconfig.app.json` | Include `.storybook` so `main.ts` / `preview.tsx` get the `@/*` path alias and are type-checked                        |
| `.gitignore`        | Add `/storybook-static/`                                                                                               |

The project's `vite.config.ts` stays unchanged — Storybook spawns its own
Vite via `viteFinal` and we re-inject only StyleX + the `@` alias there.

### Storybook config

```ts
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/react-vite";
import { fileURLToPath } from "node:url";

import stylexPlugin from "@stylexjs/unplugin/vite";
import { mergeConfig } from "vite";

const srcDir = fileURLToPath(new URL("../src", import.meta.url));

const config: StorybookConfig = {
  framework: "@storybook/react-vite",
  stories: ["../src/components/{atoms,molecules}/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  typescript: { reactDocgen: "react-docgen-typescript" },
  viteFinal: (cfg) =>
    mergeConfig(cfg, {
      resolve: { alias: { "@": srcDir } },
      plugins: [
        stylexPlugin({
          useCSSLayers: true,
          unstable_moduleResolution: { type: "commonJS" },
          aliases: { "@/*": [`${srcDir}/*`] },
        }),
      ],
    }),
};

export default config;
```

Notes:

- Story glob lives under `src/components/{atoms,molecules}/**` — organisms
  and templates stay out of the workbench (see Non-goals).
- StyleX babel-style transform must run, otherwise `stylex.create({...})`
  stays a runtime no-op and every story renders unstyled. The `viteFinal`
  hook is the only sanctioned place to add it.
- App-only plugins (`tanstackRouter`, `mkcert`, `sentryVitePlugin`) are
  intentionally NOT re-injected here — the workbench needs none of them.

### Story file convention (CSF v3)

```tsx
// src/components/atoms/Button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./Button";

const meta = {
  title: "atoms/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      options: ["primary", "secondary", "danger"],
      control: { type: "radio" },
    },
    fullWidth: { control: { type: "boolean" } },
    disabled: { control: { type: "boolean" } },
  },
  args: { children: "Sign in", variant: "primary" },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Disabled: Story = { args: { disabled: true } };
```

Rules:

- Title segment matches folder: `atoms/Button`, `molecules/CaseStatusChip`.
  Storybook builds the sidebar tree from these.
- Each story is a `StoryObj` literal with `args` (and optionally
  `decorators`). No render function unless the story needs custom JSX.
- `satisfies Meta<typeof Component>` gives the args full type safety and
  drives controls via `react-docgen-typescript` introspection.
- `tags: ["autodocs"]` opts each component into an auto-generated docs page
  alongside its stories. MDX pages can be added later for design-system
  narrative.
- Each component covers at minimum a **default** story plus one per
  closed-enum variant (`tone`, `size`, `state`).
- Do not export `*PropsT` solely for stories. `Meta<typeof Component>`
  already pulls props from the component signature.
- Closed-enum controls require `argTypes.options`; primitive values can
  be controlled from `args` alone.

### Global decorators (`.storybook/preview.tsx`)

`.storybook/preview.tsx` imports `@/styles.css` so the workbench gets the
same body font, focus ring, scrollbar, and density reset as the app.

One global decorator wraps every story:

1. **Theme decorator**: applies the StyleX `darkTheme` class to
   `document.documentElement` (mirroring `__root.tsx`) plus the `s.root`
   style on a wrapper div. Necessary so Radix `Dialog.Portal` and any
   future Tooltip/Popover/Toast inherit the theme — CSS custom properties
   only flow through ancestors, and portaled descendants mount into
   `document.body`.
2. **Padding wrapper**: wraps the story in a padded grid container
   (`padding: 24`, `display: grid`, `placeItems: start`) so atoms aren't
   pinned to the top-left edge.
3. **Theme toggle**: a Storybook `globalTypes.theme` toolbar entry
   (`dark` / `light`) drives the wrapper. Default is `dark` to match the
   app.
4. **Document attributes**: sets `data-theme` and `lang` on
   `document.documentElement` from the active Storybook global.

No Redux / TanStack Query / TanStack Router providers. By construction,
atoms and molecules shouldn't reach for them.

### Fixtures

`src/stories/fixtures.ts` exports typed sample objects for use across
stories. Naming: `sample<Type>` (singular), `sample<Type>s` (plural).
Examples:

- `sampleCaseRuling: CaseRulingViewT` (wire type)
- `sampleHtsCode: HtsCodeFormsT` (wire type)
- `sampleConversationListResponse: ConversationListResponseT` (wire type)
- `sampleFeeRow: ComponentProps<typeof FeeRow>` (UI prop shape inferred from
  the consumer molecule)

For shapes that exist on the wire, fixtures use the generated counterpart
from `@/lib/api/generated/types.gen` verbatim — never hand-roll a parallel
type. For UI-only shapes, fixtures use either an already-public UI type or a
local `ComponentProps<typeof Component>` type. Do not export prop interfaces
just to type fixtures.

## Refactor pass

### The rule (story-eligible)

A component qualifies for a story if it reads only `props`. Specifically:

- **Banned hooks**: `useAppSelector`, `useAppDispatch`, `useQuery`,
  `useMutation`, `useQueryClient`, `useNavigate`, `useParams`,
  `useChatStore`, `useTweaks`, any future hook that wraps global state,
  network, or routing.
- **Banned imports in story-eligible files**: `@tanstack/react-query`,
  `@tanstack/react-router`, `@/lib/state/*`, `@/lib/api/generated/sdk.gen`,
  and `@sentry/react`.
- **Allowed state**: local UI state (`useState` for hover/expand/focus).
- **Allowed effects**: DOM-only `useEffect` (focus management, scroll,
  textarea autosize).

### Pre-flight cleanup

Three components currently in `src/components/molecules/` break the rule
and must be fixed before story authoring starts:

- `BulkClassifyBar.tsx`
- `CatalogStatsStrip.tsx`
- `ThinkingPanel.tsx`

For each: peel global state / network / routing / observability out into a
thin organism wrapper (`BulkClassifyBarContainer`, etc.) that lives in
`organisms/` and passes props down to the existing molecule. This keeps the
molecule's name stable and existing import sites mostly unchanged (one rename
per consumer).

Specific split:

- `BulkClassifyBarContainer` owns `useQueryClient`, `AbortController`, SDK
  calls, Sentry breadcrumbs, and result state. `BulkClassifyBar` receives
  `running`, `result`, `onClassify`, `onCancel`, `unclassifiedCount`,
  `isReadOnly`, and `onError` as props.
- `CatalogStatsStripContainer` owns `useQuery(catalogStatsOptions())` and
  `useTweaks`. `CatalogStatsStrip` receives stats data and `lang`.
- `ThinkingPanelContainer` owns `useTweaks`. `ThinkingPanel` keeps its local
  open/closed state and DOM scroll effects, and receives `lang`.

### Audit method

A one-shot `rg` grep enumerates every file under `src/components/molecules/`
and `src/components/atoms/` that matches the banned hook/import regexes. The
same script enumerates `src/components/organisms/` and reports line count, so
we can confirm extraction candidates are the largest files.

Suggested audit:

```bash
rg -n "use(AppSelector|AppDispatch|Query|Mutation|QueryClient|Navigate|Params|ChatStore|Tweaks)\b|@tanstack/react-query|@tanstack/react-router|@/lib/state/|@/lib/api/generated/sdk\.gen|@sentry/react" src/components/atoms src/components/molecules
find src/components/organisms -maxdepth 1 -type f -name "*.tsx" -print0 | xargs -0 wc -l | sort -n
```

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

`package.json` scripts:

```json
{
  "scripts": {
    "storybook": "storybook dev -p 61000 --no-open",
    "build-storybook": "storybook build"
  }
}
```

```bash
yarn storybook         # Local workbench on http://localhost:61000
yarn build-storybook   # Static build → storybook-static/ (for manual sharing)
```

Port 61000 chosen to stay clear of `yarn dev` on 3000 and the API on 8888.
`--no-open` prevents Storybook from auto-launching a browser tab on every start.

Story authoring loop:

1. Touch a component in `atoms/` or `molecules/`.
2. Open or create the colocated `.stories.tsx`.
3. Add or adjust a named export per visual state.
4. HMR reflects the change in <500ms.

No build step required during normal authoring; `ladle:build` only runs
ahead of sharing a snapshot.

## Test plan

- **Smoke**: `yarn storybook` starts, sidebar lists every story, each story
  renders without console errors.
- **Theme correctness**: open a Dialog-using story (e.g. once
  `CandidatesReviewDialogBody` exists); confirm the portaled content
  paints with `colors.*` tokens, not browser defaults.
- **HMR**: edit a story's `args`, confirm the preview updates without a
  full reload.
- **Build**: `yarn build-storybook` produces a static `storybook-static/`
  that can be served with `npx serve storybook-static` and works offline.
- **Lint/type**: `yarn lint` and `yarn type` pass with the new files.
- **No regressions**: `yarn build` still produces a working app bundle —
  `vite.config.ts` is untouched by the workbench setup, so this should
  remain green.

## Resolved decisions

- **Story prop typing**: use `Meta<typeof Component>` + `StoryObj<typeof meta>`
  (CSF v3). Storybook derives prop shapes from `react-docgen-typescript`,
  so components don't need to export internal prop interfaces.
- **Controls**: use Storybook `args` for primitives and `argTypes.options`
  for closed enums. Auto-introspection picks up `boolean` / `string` /
  `number` props without explicit `argTypes`, but enum unions need
  `options` to render as radios/selects.
- **Nested atoms**: the story glob is recursive, so files under
  `src/components/atoms/icons/` can have stories when useful. Do not force a
  story for every one-off SVG; add one when the icon has visual states or is
  likely to be styled/reused.
- **Workbench isolation**: `vite.config.ts` is unchanged. Storybook spawns
  its own Vite instance via `@storybook/react-vite` and gets only StyleX +
  the `@` alias re-injected via `viteFinal`. App-only plugins (TanStack
  Router codegen, mkcert, Sentry) do not run in the workbench.
- **Context providers**: no global Redux / Query / Router providers in v1. If
  a story requires one, the component is not story-eligible until its wiring is
  moved up into an organism.
- **Drift mitigation**: the StyleX plugin options live in two places now
  (`vite.config.ts` and `.storybook/main.ts`). The block is small and
  visible; if it grows, extract to a shared module and import in both.

## Out-of-scope follow-ups (post-v1)

- **Chromatic** visual regression hooked into PRs, using the same stories.
- **MDX docs pages** for design-system narrative (the `addon-docs` install
  already supports this; we just haven't authored any).
- **Organism stories** with Redux + Query decorators, once we've got
  conviction the workbench is paying off.
- **Public deploy** of `storybook-static/` to Firebase Hosting if
  stakeholders want to browse.
