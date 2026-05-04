/**
 * Wire types for the Sentinel chat SSE protocol.
 * Source of truth: /Users/mathieumoullec/work/sentinel/docs/CHAT_SSE_PROTOCOL.md
 */

export interface Usage {
  input_tokens: number
  output_tokens: number
  total_tokens: number
  cached_input_tokens: number
}

export type ToolName =
  | 'search_codes'
  | 'get_code_details'
  | 'get_landed_cost'
  | 'find_cross_rulings'
  | 'subscribe_watch'
  | 'list_alerts'

export type ChatChunk =
  | { type: 'delta'; text: string }
  | { type: 'reasoning'; id?: string; text: string }
  | { type: 'reasoning_delta'; id?: string; text: string }
  | { type: 'tool_call'; call_id: string; name: string; args: unknown }
  | {
      type: 'tool_call_delta'
      call_id: string
      delta: { kind: 'name'; name: string } | { kind: 'args'; text: string }
    }
  | { type: 'tool_result'; call_id: string; content: unknown }
  | { type: 'turn_end'; usage: Usage }
  | { type: 'error'; message: string }
  | { type: 'done'; usage?: Usage }

export interface ChatTurn {
  role: 'user' | 'assistant'
  content: string
}

/* ---------- UI-side message shape ---------- */

export type ToolCallStatus = 'in-flight' | 'complete' | 'failed'

export interface ToolCall {
  id: string
  tool: string
  args: unknown
  status: ToolCallStatus
  startedAt: number
  durationMs?: number
  result?: unknown
}

export interface AssistantMessageData {
  id: string
  role: 'assistant'
  thinking: string
  thinkingActive: boolean
  thinkingMs?: number
  thinkingStartedAt?: number
  calls: Array<ToolCall>
  reply: string
  streaming: boolean
  caveats?: Array<string>
  done: boolean
  error?: string
  usage?: Usage
}

export interface UserMessageData {
  id: string
  role: 'user'
  text: string
}

export type Message = UserMessageData | AssistantMessageData

/* ---------- Tool-result content shapes (best-effort, partial) ---------- */

export interface SearchCandidate {
  code: string
  desc_en?: string
  desc?: string
  fused_score?: number
  score?: number
}

export interface SearchCodesContent {
  candidates: Array<SearchCandidate>
}

export interface HierarchyNode {
  code: string
  desc_en?: string
  desc_fr?: string
  general_rate?: string | null
}

export interface CodeDetailsContent {
  found?: boolean
  code: string
  desc_en?: string
  desc_fr?: string
  desc?: string
  /** Backend-native shape: array of `{code, desc_en, desc_fr, general_rate}`. */
  hierarchy?: Array<HierarchyNode>
  /** Legacy/scenario shape: pre-rendered breadcrumb segments. */
  chain?: Array<string>
  general_rate?: string | null
  rate_text?: string
  mfn_rate?: string
  units?: string | null
  unit?: string
  section301?: string
  is_declarable?: boolean
}

export interface LandedCostRow {
  label: string
  amount: number
  sub?: string
}

export interface LandedCostContent {
  code?: string
  rows?: Array<LandedCostRow>
  declared_value_usd?: number
  customs_value_usd?: number
  duty_amount_usd?: number
  mpf_usd?: number
  hmf_usd?: number
  freight_usd?: number
  total_fees_usd?: number
  landed_cost_usd?: number
  total?: number
  rate_text?: string | null
  rate_source_code?: string | null
  duty_kind?: string
  transport?: string
  caveats?: Array<string>
}

export interface RulingItem {
  num: string
  date: string
  subject: string
  codes: Array<string>
  url?: string
}

export interface CrossRulingsContent {
  rulings: Array<RulingItem>
}

export interface SubscribeWatchContent {
  ok?: boolean
  subscription_id?: string
  email: string
  codes: Array<string>
  sources: Array<string>
  cadence?: string
  subscriptions?: Array<unknown>
}

export interface AlertItem {
  date: string
  code: string
  source: string
  status: string
  subject: string
}

export interface AlertsContent {
  alerts: Array<AlertItem>
}
