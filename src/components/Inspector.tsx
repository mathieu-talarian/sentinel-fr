import { For, Show } from 'solid-js'
import * as stylex from '@stylexjs/stylex'

import { Icon  } from './Icons'
import type {IconKey} from './Icons';
import { sx } from '~/lib/sx'
import { formatHtsCode } from '~/lib/format'
import type {
  AlertsContent,
  CodeDetailsContent,
  CrossRulingsContent,
  HierarchyNode,
  LandedCostContent,
  SearchCodesContent,
  SubscribeWatchContent,
  ToolCall,
} from '~/lib/types'

const TOOL_META: Record<string, { title: string; tag: string; icon: IconKey }> = {
  search_codes: { title: 'Catalog search', tag: 'search_codes', icon: 'Search' },
  get_code_details: { title: 'HTS code detail', tag: 'get_code_details', icon: 'Book' },
  get_landed_cost: { title: 'Landed cost', tag: 'get_landed_cost', icon: 'Coin' },
  find_cross_rulings: { title: 'CBP CROSS rulings', tag: 'find_cross_rulings', icon: 'Scroll' },
  subscribe_watch: { title: 'Alert subscription', tag: 'subscribe_watch', icon: 'Bell' },
  list_alerts: { title: 'Recent alerts', tag: 'list_alerts', icon: 'Clipboard' },
}

interface InspectorProps {
  open: boolean
  calls: Array<ToolCall>
  focusedCallId: string | null
  onFocusCall: (id: string) => void
  onClose: () => void
}

export function Inspector(props: InspectorProps) {
  const completed = () =>
    props.calls.filter((c) => c.status === 'complete' && c.result != null)

  return (
    <aside
      {...sx(s.aside, !props.open && s.collapsed)}
      aria-hidden={!props.open}
    >
      <div {...sx(s.head)}>
        <span {...sx(s.title)}>
          <Icon.Side /> Inspector
          <span {...sx(s.titleTag)}>tool results</span>
        </span>
        <button
          type="button"
          {...sx(s.close)}
          onClick={props.onClose}
          title="Collapse"
        >
          <Icon.X />
        </button>
      </div>
      <div {...sx(s.body)}>
        <Show
          when={completed().length > 0}
          fallback={
            <div {...sx(s.empty)}>
              <Icon.Sparkle />
              <div>
                When the agent calls a tool, structured results appear here.
                <div {...sx(s.emptySub)}>
                  catalog · code details · landed cost · CROSS rulings
                </div>
              </div>
            </div>
          }
        >
          <For each={completed()}>
            {(call) => (
              <div onClick={() => props.onFocusCall(call.id)}>
                <ResultCard call={call} highlight={call.id === props.focusedCallId} />
              </div>
            )}
          </For>
        </Show>
      </div>
    </aside>
  )
}

/* ---------- Card shell ---------- */

interface ResultCardProps {
  call: ToolCall
  highlight: boolean
}

function ResultCard(props: ResultCardProps) {
  const meta = () => {
    const m = TOOL_META[props.call.tool] as
      | { title: string; tag: string; icon: IconKey }
      | undefined
    return (
      m ?? {
        title: props.call.tool,
        tag: props.call.tool,
        icon: 'Sparkle' as IconKey,
      }
    )
  }
  const I = () => Icon[meta().icon]

  return (
    <div
      {...sx(c.card, props.highlight && c.cardHighlight)}
    >
      <div {...sx(c.head)}>
        <span {...sx(c.headIcon)}>{I()({})}</span>
        <span {...sx(c.headLabel)}>{meta().title}</span>
        <span {...sx(c.headStats)}>
          {meta().tag}
          {props.call.durationMs != null && ` · ${props.call.durationMs}ms`}
        </span>
      </div>
      <div {...sx(c.body)}>
        <RendererSwitch tool={props.call.tool} result={props.call.result} />
      </div>
    </div>
  )
}

function RendererSwitch(props: { tool: string; result: unknown }) {
  switch (props.tool) {
    case 'search_codes':
      return <SearchResult result={props.result as SearchCodesContent} />
    case 'get_code_details':
      return <CodeDetails result={props.result as CodeDetailsContent} />
    case 'get_landed_cost':
      return <LandedCost result={props.result as LandedCostContent} />
    case 'find_cross_rulings':
      return <Rulings result={props.result as CrossRulingsContent} />
    case 'subscribe_watch':
      return <SubscribeConfirm result={props.result as SubscribeWatchContent} />
    case 'list_alerts':
      return <AlertList result={props.result as AlertsContent} />
    default:
      return <pre {...sx(c.pre)}>{JSON.stringify(props.result, null, 2)}</pre>
  }
}

/* ---------- Renderers ---------- */

function SearchResult(props: { result: SearchCodesContent }) {
  const candidates = () => props.result.candidates
  const scoreOf = (c: { fused_score?: number; score?: number }) =>
    c.fused_score ?? c.score ?? 0
  const max = () =>
    candidates().reduce((m, c) => Math.max(m, scoreOf(c)), 0) || 1
  const norm = (v: number) => Math.max(0, Math.min(1, v / max()))

  return (
    <div>
      <For each={candidates()}>
        {(cand) => {
          const score = scoreOf(cand)
          const isBest = score === max()
          return (
            <div {...sx(r.candidate, isBest && r.candidateBest)}>
              <div {...sx(r.row1)}>
                <span {...sx(r.code, isBest && r.codeBest)}>
                  {formatHtsCode(cand.code)}
                </span>
                <span {...sx(r.score)}>
                  {score.toFixed(score < 1 ? 3 : 2)}
                </span>
              </div>
              <div {...sx(r.bar)}>
                <div
                  {...sx(r.barFill, isBest && r.barFillBest)}
                  style={{ width: `${norm(score) * 100}%` }}
                />
              </div>
              <div {...sx(r.desc)}>{cand.desc_en ?? cand.desc ?? ''}</div>
            </div>
          )
        }}
      </For>
    </div>
  )
}

function CodeDetails(props: { result: CodeDetailsContent }) {
  // Two shapes: backend hierarchy = `[{code, desc_en, ...}]`, scenario = `[string]`.
  // Backend chain is leaf-to-root; reverse it for a top-down breadcrumb.
  type Crumb = { code?: string; label: string }
  const crumbs = (): Array<Crumb> => {
    if (props.result.hierarchy?.length) {
      return [...props.result.hierarchy]
        .reverse()
        .map((h: HierarchyNode) => ({
          code: h.code,
          label: h.desc_en ?? h.desc_fr ?? formatHtsCode(h.code),
        }))
    }
    if (props.result.chain?.length) {
      return props.result.chain.map((s) => ({ label: s }))
    }
    return []
  }

  const rateText = () =>
    props.result.general_rate ??
    props.result.rate_text ??
    props.result.mfn_rate ??
    '—'

  const units = () => props.result.units ?? props.result.unit

  const desc = () =>
    props.result.desc_en ?? props.result.desc_fr ?? props.result.desc ?? ''

  return (
    <div>
      <div {...sx(d.crumb)}>
        <For each={crumbs()}>
          {(seg, i) => (
            <>
              <span
                {...sx(
                  d.crumbItem,
                  i() === crumbs().length - 1 && d.crumbItemLast,
                )}
                title={seg.code ? formatHtsCode(seg.code) : undefined}
              >
                {seg.code ? formatHtsCode(seg.code) : seg.label}
              </span>
              <Show when={i() < crumbs().length - 1}>
                <span {...sx(d.crumbSep)}>›</span>
              </Show>
            </>
          )}
        </For>
      </div>
      <Show when={props.result.code}>
        {(code) => (
          <div {...sx(d.codeLine)}>{formatHtsCode(code())}</div>
        )}
      </Show>
      <div {...sx(d.desc)}>{desc()}</div>
      <div {...sx(d.rateRow)}>
        <span {...sx(d.rateLabel)}>MFN duty</span>
        <span {...sx(d.rateVal)}>{rateText()}</span>
      </div>
      <Show when={units()}>
        {(u) => (
          <div {...sx(d.unit)}>
            unit: {u()}
            {props.result.section301 ? ` · ${props.result.section301}` : ''}
          </div>
        )}
      </Show>
    </div>
  )
}

function LandedCost(props: { result: LandedCostContent }) {
  // Two possible shapes: client-rolled `rows`/`total`, or backend `*_usd` fields.
  const rows = () => {
    if (props.result.rows?.length) return props.result.rows
    const r = props.result
    const out: Array<{ label: string; amount: number; sub?: string }> = []
    const declared = r.declared_value_usd ?? r.customs_value_usd
    if (declared != null)
      out.push({ label: 'Customs value', amount: declared, sub: 'declared FOB' })
    if (r.duty_amount_usd != null) {
      const sub = [r.rate_text, r.code ? formatHtsCode(r.code) : null]
        .filter(Boolean)
        .join(' · ')
      out.push({ label: 'Duty', amount: r.duty_amount_usd, sub: sub || undefined })
    }
    if (r.mpf_usd != null)
      out.push({ label: 'MPF', amount: r.mpf_usd, sub: '0.3464%, capped' })
    if (r.hmf_usd != null)
      out.push({ label: 'HMF', amount: r.hmf_usd, sub: '0.125%, ocean only' })
    if (r.freight_usd != null && r.freight_usd > 0)
      out.push({ label: 'Freight', amount: r.freight_usd })
    return out
  }
  const total = () =>
    props.result.total ?? props.result.landed_cost_usd ?? rows().reduce((s, r) => s + r.amount, 0)
  const fmt = (n: number) =>
    n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div>
      <table {...sx(lc.table)}>
        <tbody>
          <For each={rows()}>
            {(row) => (
              <tr>
                <td {...sx(lc.cell, lc.cellLeft)}>
                  {row.label}
                  <Show when={row.sub}>
                    {(sub) => <span {...sx(lc.sub)}>{sub()}</span>}
                  </Show>
                </td>
                <td {...sx(lc.cell, lc.cellRight)}>${fmt(row.amount)}</td>
              </tr>
            )}
          </For>
          <tr>
            <td {...sx(lc.cell, lc.totalLeft)}>Landed cost</td>
            <td {...sx(lc.cell, lc.totalRight)}>${fmt(total())}</td>
          </tr>
        </tbody>
      </table>
      <Show when={props.result.caveats?.length}>
        <div {...sx(lc.caveats)}>
          <div {...sx(lc.caveatsLabel)}>Caveats</div>
          <ul {...sx(lc.caveatsList)}>
            <For each={props.result.caveats}>
              {(item) => <li {...sx(lc.caveatsItem)}>{item}</li>}
            </For>
          </ul>
        </div>
      </Show>
    </div>
  )
}

function Rulings(props: { result: CrossRulingsContent }) {
  return (
    <div>
      <For each={props.result.rulings}>
        {(rg) => (
          <div {...sx(rl.ruling)}>
            <div {...sx(rl.row1)}>
              <span {...sx(rl.num)}>{rg.num}</span>
              <span {...sx(rl.date)}>{rg.date}</span>
            </div>
            <div {...sx(rl.subj)}>{rg.subject}</div>
            <div {...sx(rl.codes)}>
              <For each={rg.codes}>
                {(code) => <span {...sx(rl.code)}>{code}</span>}
              </For>
            </div>
          </div>
        )}
      </For>
    </div>
  )
}

function SubscribeConfirm(props: { result: SubscribeWatchContent }) {
  return (
    <div>
      <div {...sx(sb.banner)}>
        <Icon.Check />
        <div {...sx(sb.body)}>
          <strong>Subscription active</strong>
          <div {...sx(sb.line)}>
            Watching <strong>{props.result.codes.join(', ')}</strong> for{' '}
            <strong>{props.result.email}</strong>.
          </div>
        </div>
      </div>
      <div {...sx(sb.sources)}>
        <div {...sx(sb.sourcesLabel)}>Sources monitored</div>
        <ul {...sx(sb.sourcesList)}>
          <For each={props.result.sources}>{(src) => <li>{src}</li>}</For>
        </ul>
        <Show when={props.result.cadence || props.result.subscription_id}>
          <div {...sx(sb.tech)}>
            <Show when={props.result.cadence}>
              {(c) => <>cadence: {c()}<br /></>}
            </Show>
            <Show when={props.result.subscription_id}>
              {(id) => <>subscription: {id()}</>}
            </Show>
          </div>
        </Show>
      </div>
    </div>
  )
}

function AlertList(props: { result: AlertsContent }) {
  return (
    <div>
      <For each={props.result.alerts}>
        {(a) => (
          <div {...sx(rl.ruling)}>
            <div {...sx(rl.row1)}>
              <span {...sx(rl.num)}>{a.source}</span>
              <span {...sx(rl.date)}>{a.date}</span>
            </div>
            <div {...sx(rl.subj)}>{a.subject}</div>
            <div {...sx(rl.codes)}>
              <span {...sx(rl.code)}>{a.code}</span>
              <span
                {...sx(
                  rl.code,
                  a.status === 'sent' ? rl.codeOk : rl.codeWarn,
                )}
              >
                {a.status}
              </span>
            </div>
          </div>
        )}
      </For>
    </div>
  )
}

/* ---------- Styles ---------- */

const s = stylex.create({
  aside: {
    width: 380,
    borderLeft: '1px solid var(--line)',
    background: 'var(--paper-2)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    transition: 'width 220ms cubic-bezier(0.4, 0, 0.2, 1), opacity 220ms',
    overflow: 'hidden',
  },
  collapsed: { width: 0, borderLeft: 0, opacity: 0 },
  head: {
    height: 48,
    padding: '0 16px',
    borderBottom: '1px solid var(--line)',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    flexShrink: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--ink)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  titleTag: {
    fontFamily: 'var(--mono)',
    fontSize: 10,
    padding: '2px 6px',
    background: 'var(--gold-soft)',
    color: 'var(--gold-deep)',
    borderRadius: 3,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  close: {
    marginLeft: 'auto',
    width: 26,
    height: 26,
    display: 'grid',
    placeItems: 'center',
    background: 'transparent',
    border: 0,
    borderRadius: 'var(--radius-sm)',
    color: 'var(--ink-3)',
    ':hover': { background: 'var(--paper-3)', color: 'var(--ink)' },
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
  },
  empty: {
    color: 'var(--ink-4)',
    fontSize: 13,
    textAlign: 'center',
    padding: '60px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  emptySub: {
    marginTop: 6,
    fontSize: 11,
    color: 'var(--ink-5)',
    fontFamily: 'var(--mono)',
  },
})

const c = stylex.create({
  card: {
    background: 'var(--paper)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
  },
  cardHighlight: { boxShadow: '0 0 0 2px var(--gold)' },
  head: {
    padding: '8px 12px',
    borderBottom: '1px solid var(--line)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--paper-2)',
  },
  headIcon: {
    width: 18,
    height: 18,
    display: 'grid',
    placeItems: 'center',
    color: 'var(--ink-3)',
  },
  headLabel: { fontSize: 12, fontWeight: 500, color: 'var(--ink)' },
  headStats: {
    marginLeft: 'auto',
    fontFamily: 'var(--mono)',
    fontSize: 10.5,
    color: 'var(--ink-4)',
  },
  body: { padding: 12 },
  pre: { fontSize: 11, fontFamily: 'var(--mono)', whiteSpace: 'pre-wrap' },
})

const r = stylex.create({
  candidate: {
    padding: '8px 0',
    borderBottom: '1px solid var(--line)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    ':last-child': { borderBottom: 0, paddingBottom: 0 },
    ':first-child': { paddingTop: 0 },
  },
  candidateBest: {},
  row1: { display: 'flex', alignItems: 'center', gap: 8 },
  code: {
    fontFamily: 'var(--serif)',
    fontWeight: 600,
    fontSize: 13,
    color: 'var(--ink)',
    fontVariantNumeric: 'tabular-nums',
  },
  codeBest: {
    background: 'var(--gold-soft)',
    color: 'var(--gold-deep)',
    padding: '1px 5px',
    borderRadius: 3,
  },
  score: {
    marginLeft: 'auto',
    fontFamily: 'var(--mono)',
    fontSize: 11,
    color: 'var(--ink-3)',
  },
  bar: {
    height: 3,
    background: 'var(--paper-3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: { height: '100%', background: 'var(--ink-3)', borderRadius: 2 },
  barFillBest: { background: 'var(--gold)' },
  desc: { fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.45 },
})

const d = stylex.create({
  crumb: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px 6px',
    fontFamily: 'var(--mono)',
    fontSize: 11,
    color: 'var(--ink-3)',
    marginBottom: 8,
  },
  crumbItem: { whiteSpace: 'nowrap' },
  crumbItemLast: { color: 'var(--ink)', fontWeight: 600 },
  crumbSep: { color: 'var(--ink-5)' },
  codeLine: {
    fontFamily: 'var(--serif)',
    fontWeight: 600,
    fontSize: 14,
    color: 'var(--ink)',
    marginBottom: 4,
    fontVariantNumeric: 'tabular-nums',
  },
  desc: {
    fontSize: 13,
    color: 'var(--ink-2)',
    lineHeight: 1.45,
    marginBottom: 8,
  },
  rateRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  rateLabel: {
    fontSize: 11.5,
    color: 'var(--ink-4)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  rateVal: {
    fontFamily: 'var(--serif)',
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--ink)',
  },
  unit: {
    fontFamily: 'var(--mono)',
    fontSize: 11,
    color: 'var(--ink-4)',
    marginTop: 6,
  },
})

const lc = stylex.create({
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12.5 },
  cell: { padding: '7px 0', borderBottom: '1px solid var(--line)' },
  cellLeft: {},
  cellRight: {
    textAlign: 'right',
    fontFamily: 'var(--mono)',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--ink)',
  },
  totalLeft: {
    borderBottom: 0,
    borderTop: '1.5px solid var(--ink)',
    paddingTop: 9,
    fontWeight: 600,
    color: 'var(--ink)',
    fontSize: 13,
  },
  totalRight: {
    borderBottom: 0,
    borderTop: '1.5px solid var(--ink)',
    paddingTop: 9,
    fontWeight: 600,
    color: 'var(--ink)',
    fontSize: 14,
    fontFamily: 'var(--serif)',
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
  },
  sub: {
    fontFamily: 'var(--mono)',
    fontSize: 10.5,
    color: 'var(--ink-4)',
    display: 'block',
    marginTop: 1,
  },
  caveats: {
    marginTop: 12,
    padding: '8px 12px',
    background: 'var(--paper-2)',
    borderLeft: '2px solid var(--line-strong)',
    borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
  },
  caveatsLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--ink-4)',
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  caveatsList: { margin: 0, paddingLeft: 18 },
  caveatsItem: {
    fontSize: 12.5,
    fontStyle: 'italic',
    color: 'var(--ink-3)',
    margin: '2px 0',
  },
})

const rl = stylex.create({
  ruling: {
    padding: '10px 0',
    borderBottom: '1px solid var(--line)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    ':last-child': { borderBottom: 0, paddingBottom: 0 },
    ':first-child': { paddingTop: 0 },
  },
  row1: { display: 'flex', alignItems: 'center', gap: 8 },
  num: {
    fontFamily: 'var(--mono)',
    fontSize: 11.5,
    fontWeight: 600,
    color: 'var(--ink)',
  },
  date: {
    marginLeft: 'auto',
    fontFamily: 'var(--mono)',
    fontSize: 11,
    color: 'var(--ink-4)',
  },
  subj: { fontSize: 12.5, color: 'var(--ink-2)', lineHeight: 1.4 },
  codes: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  code: {
    fontFamily: 'var(--serif)',
    fontSize: 10.5,
    fontWeight: 600,
    background: 'var(--paper-3)',
    padding: '1px 5px',
    borderRadius: 3,
    color: 'var(--ink-2)',
  },
  codeOk: { background: 'var(--ok-soft)', color: 'var(--ok)' },
  codeWarn: { background: 'var(--warn-soft)', color: 'var(--warn)' },
})

const sb = stylex.create({
  banner: {
    background: 'var(--ok-soft)',
    border: '1px solid var(--ok)',
    borderRadius: 'var(--radius)',
    padding: '10px 12px',
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    color: 'var(--ok)',
  },
  body: { fontSize: 12.5, color: 'var(--ink)' },
  line: { marginTop: 4, color: 'var(--ink-3)' },
  sources: {
    marginTop: 12,
    fontSize: 12,
    color: 'var(--ink-3)',
  },
  sourcesLabel: {
    fontWeight: 500,
    color: 'var(--ink-2)',
    marginBottom: 4,
  },
  sourcesList: { margin: 0, paddingLeft: 18 },
  tech: {
    marginTop: 8,
    fontFamily: 'var(--mono)',
    fontSize: 11,
    color: 'var(--ink-4)',
  },
})
