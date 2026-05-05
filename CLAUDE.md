# Sentinel FR — Project Facts

- Stack: React 19 + Vite + StyleX + Radix UI primitives + TanStack Router/Query/Form + Redux Toolkit + @tabler/icons-react
- Package manager: yarn (`yarn run build`, `yarn run lint`, `yarn run format`, `yarn run check` for read-only prettier); never `npm`
- `yarn run format` (prettier + eslint `--fix`) auto-renames type identifiers to `T` suffix (e.g. `Suggestion` → `SuggestionT`). When you rename a type, expect import sites to surface as fresh diagnostics until they're fixed too
- Path alias: `@/` → `src/`. Wired into Vite, TS **and** StyleX babel (`aliases` option in `vite.config.ts`) — use `@/...` everywhere, including `.stylex.ts` imports
- `sx(...)` helper in `src/lib/styles/sx.ts` wraps `stylex.props()` for React; spread: `<div {...sx(s.foo, cond && s.bar)} />`. Returns `{ className, style }`. Style args are typed as `unknown` because StyleX's `Theme<…>` is invariant
- Type names use `T` suffix: `SessionT`, `SuggestionT`, `ToolCallT`
- Icons: `src/components/atoms/Icons.tsx` is a thin namespace over `@tabler/icons-react` (`Icon.Search`, `Icon.Bell`, etc.). Add new icons by importing the `Icon*` named export from `@tabler/icons-react` and wrapping with `wrap(...)`. Default size is 16 with `stroke={1.75}` to scale Tabler's 24-px grid down without looking chunky. Single-purpose SVGs live in `src/components/atoms/icons/<Name>.tsx`

## StyleX Conventions

- Colocate `stylex.create` in the component `.tsx` (zero-runtime). Never split into a `.styles.ts`
- `.stylex.ts` files: ONLY `defineVars` / `defineConsts` — no components, no helpers, no themes
  - `src/lib/styles/tokens.stylex.ts`: `colors` (defineVars, themed), `fonts`/`radii`/`shadows` (defineConsts, static)
  - `src/lib/styles/animations.stylex.ts`: `animations.spin`, `animations.pulse`, `animations.blink`
- `createTheme` returns regular styles → lives in plain `.ts`: `src/lib/styles/themes.ts` exports `darkTheme`. Applied to `<html>` in `__root.tsx` via a `useEffect` that toggles the StyleX-generated class on `document.documentElement` — NOT on a single subtree. CSS custom properties only flow through ancestors, and Radix `Dialog.Portal` (and any future Tooltip/Popover/Toast) mounts into `document.body`. Scoping the theme to `<html>` keeps portaled descendants in the same variable scope as the in-tree app
- `data-theme` attribute on `<html>` is still set by `__root.tsx` — only because `.reply-html` (innerHTML) descendant rules in `src/styles.css` can't be reached by StyleX
- Conditional styles: nest per-property with `default` key, NOT top-level pseudo-class blocks
- Radix UI primitives expose `data-state="checked|unchecked|open|closed"` on every part — match via `':is([data-state="checked"])'` instead of conditional class merging. Same idea for native `aria-checked`, `aria-hidden`. Import from the `radix-ui` umbrella (`import { Dialog, Switch, RadioGroup } from "radix-ui"`) — tree-shakable, matches the official docs, and avoids picking individual `@radix-ui/react-*` packages one at a time
- Shorthands StyleX rejects: `border`, `borderTop/Bottom/Left/Right`, `outline`, multi-corner `borderRadius`. Decompose to longhand (`borderTopColor`/`Style`/`Width`, etc.). `flex` numeric values must be strings (`'1'`)
- For focus rings, prefer `outline-*` longhand over `boxShadow: '0 0 0 Npx <color>'` so the color can come from `colors.*`
- Avoid compound CSS strings that embed a token — StyleX has no template-literal support. If you need a gradient/shadow with theming, define it as a `defineConsts` constant or add it to `colors` and reference directly
- Variant maps vs dynamic functions: closed enum props (`tone: "gold"|"ink"`, `size: "sm"|"md"|"lg"`) → separate `stylex.create({a:{...}, b:{...}})` indexed by the prop (atomic class per variant, supports `:hover`/media/pseudo-elements). Continuous numeric props (`maxHeight: number`, `size: number`) → arrow-function entry `(n: number) => ({...})` inside `stylex.create`. Function args must be simple identifiers, body must be an object literal — no destructuring, defaults, or `return`

## Component Architecture

- Atomic Design layout: `src/components/{atoms,molecules,organisms,templates}/`. Routes (`src/routes/`) are pages. ESLint `noBarrelFiles` is on — no `index.ts` re-exports; `Foo/index.tsx` is only allowed when it IS the component
- Lib layout: `src/lib/{api,state,styles,utils}/` — api (auth/queries/chatStream), state (chatStore/tweaks), styles (sx/tokens/animations/themes), utils (format/suggestions). Wire types stay at `src/lib/types.ts`
- Atom contract: `extends Omit<ComponentProps<"div">, "style">` (from `react`), add `style?: StyleXStyles` (from `@stylexjs/stylex`), pass `style` as the LAST arg to `sx(...)` so callers override. Destructure own props off `props` and spread the rest as `<el {...rest} {...sx(...)} />` — stylex's `className`/`style` win over rest. No manual `className` merge; if a caller wants extra styling, that's what `style?: StyleXStyles` is for
- React event handlers for value-bearing inputs use `ChangeEvent<HTMLInputElement>`/`ChangeEvent<HTMLTextAreaElement>` from `react`. Atoms expose an `onValueChange?: (v: string) => void` convenience and forward the original `onChange` so callers can still hook in

## State (Redux Toolkit)

- Global state lives in Redux Toolkit slices under `src/lib/state/` and is wired via `<Provider store={store}>` in `src/main.tsx`. Two slices today: `tweaksSlice` (theme/density/lang/provider/inspectorAutoOpen/showThinkingByDefault) and `chatSlice` (messages/running/focusedCallId/inspectorOpen + the streaming-chunk reducer). Types `RootStateT` / `AppDispatchT` / `AppThunkT<R>` are exported from `store.ts`; typed `useAppDispatch` / `useAppSelector` live in `hooks.ts` (use those, not the raw `react-redux` exports)
- Async work is plain thunks (`AppThunkT`), not `createAsyncThunk` — see `chatThunks.ts` for the SSE streaming pattern. The `AbortController` lives at module scope (non-serializable, so it stays out of state); `sendChat(text)` reads `tweaks.provider` / `tweaks.inspectorAutoOpen` lazily via `getState()` so toggling tweaks mid-stream is honoured
- Consumer ergonomics: `useTweaks()` (`src/lib/state/tweaks.ts`) and `useChatStore()` (`src/lib/state/chatStore.ts`) are thin `useCallback`-wrapped facades over the typed hooks. Component code uses these — it should NOT import slice actions or thunks directly unless dispatching something the facade doesn't expose
- Persistence: `tweaksSlice` initial state is loaded from `localStorage`, and `store.ts` subscribes once to mirror tweaks → `localStorage` on every change (reference-equality short-circuit). Don't put non-serializable values in any slice — RTK's serializable-state middleware will scream

## Workflow Gotchas

- `yarn run format` (prettier + eslint --fix) auto-resolves import-order, blank-line, and most stylex grouping errors — always run it before manually fixing lint
- macOS APFS is case-insensitive: renaming a directory `Foo` → `foo` is a no-op. Two-step it: `mv Foo __tmp && mv __tmp foo`
- Paths starting with `-` (e.g. TanStack Router's `-private` folders) need `--` to disambiguate from flags: `git mv -- src/routes/-login/foo ...`. Without `--`, the command fails silently in an `&&` chain

---

# Claude Code Configuration - RuFlo V3

## Behavioral Rules (Always Enforced)

- Do what has been asked; nothing more, nothing less
- NEVER create files unless they're absolutely necessary for achieving your goal
- ALWAYS prefer editing an existing file to creating a new one
- NEVER proactively create documentation files (\*.md) or README files unless explicitly requested
- NEVER save working files, text/mds, or tests to the root folder
- Never continuously check status after spawning a swarm — wait for results
- ALWAYS read a file before editing it
- NEVER commit secrets, credentials, or .env files

## File Organization

- NEVER save to root folder — use the directories below
- Use `/src` for source code files
- Use `/tests` for test files
- Use `/docs` for documentation and markdown files
- Use `/config` for configuration files
- Use `/scripts` for utility scripts
- Use `/examples` for example code

## Project Architecture

- Follow Domain-Driven Design with bounded contexts
- Keep files under 500 lines
- Use typed interfaces for all public APIs
- Prefer TDD London School (mock-first) for new code
- Use event sourcing for state changes
- Ensure input validation at system boundaries

### Project Config

- **Topology**: hierarchical-mesh
- **Max Agents**: 15
- **Memory**: hybrid
- **HNSW**: Enabled
- **Neural**: Enabled

## Build & Test

```bash
# Build
npm run build

# Test
npm test

# Lint
npm run lint
```

- ALWAYS run tests after making code changes
- ALWAYS verify build succeeds before committing

## Security Rules

- NEVER hardcode API keys, secrets, or credentials in source files
- NEVER commit .env files or any file containing secrets
- Always validate user input at system boundaries
- Always sanitize file paths to prevent directory traversal
- Run `npx @claude-flow/cli@latest security scan` after security-related changes

## Concurrency: 1 MESSAGE = ALL RELATED OPERATIONS

- All operations MUST be concurrent/parallel in a single message
- Use Claude Code's Agent tool for spawning agents, not just MCP
- ALWAYS spawn ALL agents in ONE message with full instructions via Agent tool
- ALWAYS batch ALL file reads/writes/edits in ONE message
- ALWAYS batch ALL Bash commands in ONE message

## Swarm Orchestration

- MUST initialize the swarm using CLI tools when starting complex tasks
- MUST spawn concurrent agents using Claude Code's Agent tool
- Never use CLI tools alone for execution — Agent tool agents do the actual work
- MUST call CLI tools AND Agent tool in ONE message for complex work

### 3-Tier Model Routing (ADR-026)

| Tier  | Handler              | Latency | Cost         | Use Cases                                           |
| ----- | -------------------- | ------- | ------------ | --------------------------------------------------- |
| **1** | Agent Booster (WASM) | <1ms    | $0           | Simple transforms (var→const, add types) — Skip LLM |
| **2** | Haiku                | ~500ms  | $0.0002      | Simple tasks, low complexity (<30%)                 |
| **3** | Sonnet/Opus          | 2-5s    | $0.003-0.015 | Complex reasoning, architecture, security (>30%)    |

- For Tier 1 simple transforms, use Edit tool directly — no LLM agent needed

## Swarm Configuration & Anti-Drift

- ALWAYS use hierarchical topology for coding swarms
- Keep maxAgents at 6-8 for tight coordination
- Use specialized strategy for clear role boundaries
- Use `raft` consensus for hive-mind (leader maintains authoritative state)
- Run frequent checkpoints via `post-task` hooks
- Keep shared memory namespace for all agents

```bash
npx @claude-flow/cli@latest swarm init --topology hierarchical --max-agents 8 --strategy specialized
```

## Swarm Execution Rules

- ALWAYS use `run_in_background: true` for all Agent tool calls
- ALWAYS put ALL Agent calls in ONE message for parallel execution
- After spawning, STOP — do NOT add more tool calls or check status
- Never poll agent status repeatedly — trust agents to return
- When agent results arrive, review ALL results before proceeding

## V3 CLI Commands

### Core Commands

| Command     | Subcommands | Description                        |
| ----------- | ----------- | ---------------------------------- |
| `init`      | 4           | Project initialization             |
| `agent`     | 8           | Agent lifecycle management         |
| `swarm`     | 6           | Multi-agent swarm coordination     |
| `memory`    | 11          | AgentDB memory with HNSW search    |
| `task`      | 6           | Task creation and lifecycle        |
| `session`   | 7           | Session state management           |
| `hooks`     | 17          | Self-learning hooks + 12 workers   |
| `hive-mind` | 6           | Byzantine fault-tolerant consensus |

### Quick CLI Examples

```bash
npx @claude-flow/cli@latest init --wizard
npx @claude-flow/cli@latest agent spawn -t coder --name my-coder
npx @claude-flow/cli@latest swarm init --v3-mode
npx @claude-flow/cli@latest memory search --query "authentication patterns"
npx @claude-flow/cli@latest doctor --fix
```

## Available Agents (16 Roles + Custom)

### Core Development

`coder`, `reviewer`, `tester`, `planner`, `researcher`

### Specialized

`security-architect`, `security-auditor`, `memory-specialist`, `performance-engineer`

### Coordination

`hierarchical-coordinator`, `mesh-coordinator`, `adaptive-coordinator`

### GitHub & Repository

`pr-manager`, `code-review-swarm`, `issue-tracker`, `release-manager`

Any string can be used as a custom agent type — these are the typed roles with specialized behavior.

## Memory & Vector Search

### MCP Tools (use via ToolSearch to discover)

| Tool                    | Description                                                         |
| ----------------------- | ------------------------------------------------------------------- |
| `memory_store`          | Store value with ONNX 384-dim vector embedding                      |
| `memory_search`         | Semantic vector search by query                                     |
| `memory_retrieve`       | Get entry by key                                                    |
| `memory_list`           | List entries in namespace                                           |
| `memory_delete`         | Delete entry                                                        |
| `memory_import_claude`  | Import Claude Code memories into AgentDB (allProjects=true for all) |
| `memory_search_unified` | Search across ALL namespaces (Claude + AgentDB + patterns)          |
| `memory_bridge_status`  | Show bridge health, vectors, SONA, intelligence                     |

### CLI Commands

```bash
# Store with vector embedding
npx @claude-flow/cli@latest memory store --key "pattern-auth" --value "JWT with refresh" --namespace patterns

# Semantic search
npx @claude-flow/cli@latest memory search --query "authentication patterns"

# Import all Claude Code memories into AgentDB
node .claude/helpers/auto-memory-hook.mjs import-all
```

### Claude Code ↔ AgentDB Bridge

Claude Code auto-memory files (`~/.claude/projects/*/memory/*.md`) are automatically imported into AgentDB with ONNX vector embeddings on session start. Use `memory_search_unified` to search across both stores.

## Key MCP Tools (314 available — use ToolSearch to discover)

### Most Used Tools

| Category          | Tools                                                      | What They Do                             |
| ----------------- | ---------------------------------------------------------- | ---------------------------------------- |
| **Memory**        | `memory_store`, `memory_search`, `memory_search_unified`   | Store/search with ONNX vector embeddings |
| **Claude Bridge** | `memory_import_claude`, `memory_bridge_status`             | Import Claude memories into AgentDB      |
| **Swarm**         | `swarm_init`, `swarm_status`, `swarm_health`               | Multi-agent coordination                 |
| **Agents**        | `agent_spawn`, `agent_list`, `agent_status`                | Agent lifecycle                          |
| **Hive-Mind**     | `hive-mind_init`, `hive-mind_spawn`, `hive-mind_consensus` | Byzantine/Raft consensus                 |
| **Hooks**         | `hooks_route`, `hooks_session-start`, `hooks_post-task`    | Task routing + learning                  |
| **Workers**       | `hooks_worker-list`, `hooks_worker-dispatch`               | 12 background workers                    |
| **Security**      | `aidefence_scan`, `aidefence_is_safe`                      | Prompt injection detection               |
| **Intelligence**  | `hooks_intelligence`, `neural_status`                      | Pattern learning + SONA                  |

### Swarm Capabilities

- **Topologies**: hierarchical (anti-drift), mesh, ring, star, adaptive
- **Consensus**: Raft (leader-based), Byzantine (PBFT), Gossip (eventual)
- **Hive-Mind**: Queen-led coordination with spawn, broadcast, consensus voting, shared memory
- **12 Background Workers**: audit, optimize, testgaps, map, deepdive, document, refactor, benchmark, ultralearn, consolidate, predict, preload

### Memory Capabilities

- **ONNX Embeddings**: all-MiniLM-L6-v2, 384 dimensions — real neural vectors
- **DiskANN**: SSD-friendly vector search (8,000x faster insert than HNSW, perfect recall at 1K)
- **sql.js**: Cross-platform SQLite (WASM, no native compilation)
- **Claude Code Bridge**: Auto-imports MEMORY.md files into AgentDB on session start
- **Unified Search**: `memory_search_unified` searches Claude memories + AgentDB + patterns
- **SONA Learning**: Trajectory recording → pattern extraction → file persistence

### How to Discover Tools

Use ToolSearch to find specific tools:

```
ToolSearch("memory search")     → memory_store, memory_search, memory_search_unified
ToolSearch("swarm")             → swarm_init, swarm_status, swarm_health, swarm_shutdown
ToolSearch("hive consensus")    → hive-mind_consensus, hive-mind_status
ToolSearch("+aidefence")        → aidefence_scan, aidefence_is_safe, aidefence_has_pii
```

## Quick Setup

```bash
claude mcp add claude-flow -- npx -y @claude-flow/cli@latest
npx @claude-flow/cli@latest daemon start
npx @claude-flow/cli@latest doctor --fix
```

## Claude Code vs MCP Tools

- **Claude Code Agent tool** handles execution: agents, file ops, code generation, git
- **MCP tools** (via ToolSearch) handle coordination: swarm, memory, hooks, routing, hive-mind
- **CLI commands** (via Bash) are the same tools with terminal output
- Use `ToolSearch("keyword")` to discover available MCP tools

## Support

- Documentation: https://github.com/ruvnet/ruflo
- Issues: https://github.com/ruvnet/ruflo/issues
