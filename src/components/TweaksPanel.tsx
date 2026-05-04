import { Show  } from 'solid-js'
import type {JSX} from 'solid-js';
import * as stylex from '@stylexjs/stylex'
import { Dialog, RadioGroup, Switch } from '@ark-ui/solid'
import { useNavigate } from '@tanstack/solid-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/solid-query'

import { Icon } from './Icons'
import { sx } from '~/lib/sx'
import { useTweaks } from '~/lib/tweaks'
import { SUGGESTIONS } from '~/lib/suggestions'
import { signOut } from '~/lib/auth'
import type { Session } from '~/lib/auth'
import { ME_QUERY_KEY, meQueryOptions } from '~/lib/queries'

interface TweaksPanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onReplay: (text: string) => void
}

export function TweaksPanel(props: TweaksPanelProps) {
  const [tweaks, setTweaks] = useTweaks()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const meQuery = useQuery(() => meQueryOptions())

  const signOutMutation = useMutation(() => ({
    mutationFn: signOut,
    onSettled: () => {
      queryClient.setQueryData<Session | null>(ME_QUERY_KEY, null)
    },
  }))

  const handleSignOut = async () => {
    await signOutMutation.mutateAsync()
    props.onOpenChange(false)
    void navigate({ to: '/login' })
  }

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={(d) => props.onOpenChange(d.open)}
      modal
      lazyMount
      unmountOnExit
    >
      <Dialog.Backdrop {...sx(s.backdrop)} />
      <Dialog.Positioner {...sx(s.positioner)}>
        <Dialog.Content {...sx(s.content)}>
          <div {...sx(s.head)}>
            <Dialog.Title {...sx(s.title)}>Tweaks</Dialog.Title>
            <Dialog.CloseTrigger {...sx(s.close)} aria-label="Close tweaks">
              <Icon.X />
            </Dialog.CloseTrigger>
          </div>

          <div {...sx(s.body)}>
            <Section label="Appearance">
              <SegmentedRadio
                label="Theme"
                value={tweaks().theme}
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                ]}
                onChange={(v) => setTweaks({ theme: v as 'light' | 'dark' })}
              />
              <SegmentedRadio
                label="Density"
                value={tweaks().density}
                options={[
                  { value: 'comfortable', label: 'Comfortable' },
                  { value: 'compact', label: 'Compact' },
                ]}
                onChange={(v) =>
                  setTweaks({ density: v as 'comfortable' | 'compact' })
                }
              />
            </Section>

            <Section label="Behaviour">
              <ToggleRow
                label="Show thinking by default"
                checked={tweaks().showThinkingByDefault}
                onChange={(v) => setTweaks({ showThinkingByDefault: v })}
              />
              <ToggleRow
                label="Auto-open inspector on tool result"
                checked={tweaks().inspectorAutoOpen}
                onChange={(v) => setTweaks({ inspectorAutoOpen: v })}
              />
            </Section>

            <Section label="Replay">
              <button
                type="button"
                {...sx(s.replayBtn)}
                onClick={() => props.onReplay(SUGGESTIONS[0].text)}
              >
                ▶ Replay: leather handbag
              </button>
              <button
                type="button"
                {...sx(s.replayBtn)}
                onClick={() => props.onReplay(SUGGESTIONS[1].text)}
              >
                ▶ Replay: cotton t-shirts
              </button>
              <button
                type="button"
                {...sx(s.replayBtn)}
                onClick={() => props.onReplay(SUGGESTIONS[2].text)}
              >
                ▶ Replay: tariff alert
              </button>
            </Section>

            <Show when={meQuery.data}>
              {(session) => (
                <Section label="Account">
                  <div {...sx(s.accountRow)}>
                    <span {...sx(s.accountEmail)}>{session().email}</span>
                  </div>
                  <button
                    type="button"
                    {...sx(s.signoutBtn)}
                    onClick={handleSignOut}
                    disabled={signOutMutation.isPending}
                  >
                    {signOutMutation.isPending ? 'Signing out…' : 'Sign out'}
                  </button>
                </Section>
              )}
            </Show>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

/* ---------- helpers ---------- */

function Section(props: { label: string; children: JSX.Element }) {
  return (
    <div {...sx(s.section)}>
      <div {...sx(s.sectionLabel)}>{props.label}</div>
      <div {...sx(s.sectionBody)}>{props.children}</div>
    </div>
  )
}

interface SegOption {
  value: string
  label: string
}

function SegmentedRadio(props: {
  label: string
  value: string
  options: Array<SegOption>
  onChange: (v: string) => void
}) {
  return (
    <div {...sx(s.row)}>
      <span {...sx(s.rowLabel)}>{props.label}</span>
      <RadioGroup.Root
        value={props.value}
        onValueChange={(d) => {
          if (d.value != null) props.onChange(d.value)
        }}
        {...sx(s.seg)}
      >
        {props.options.map((opt) => (
          <RadioGroup.Item value={opt.value} {...sx(s.segItem)}>
            <RadioGroup.ItemControl />
            <RadioGroup.ItemText
              {...sx(
                s.segItemText,
                opt.value === props.value && s.segItemTextActive,
              )}
            >
              {opt.label}
            </RadioGroup.ItemText>
            <RadioGroup.ItemHiddenInput />
          </RadioGroup.Item>
        ))}
      </RadioGroup.Root>
    </div>
  )
}

function ToggleRow(props: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div {...sx(s.row, s.rowSplit)}>
      <span {...sx(s.rowLabel)}>{props.label}</span>
      <Switch.Root
        checked={props.checked}
        onCheckedChange={(d) => props.onChange(d.checked)}
      >
        <Switch.Control {...sx(s.switchCtrl, props.checked && s.switchCtrlOn)}>
          <Switch.Thumb {...sx(s.switchThumb, props.checked && s.switchThumbOn)} />
        </Switch.Control>
        <Switch.HiddenInput />
        <Show when={false}>
          <Switch.Label />
        </Show>
      </Switch.Root>
    </div>
  )
}

const s = stylex.create({
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'oklch(0 0 0 / 0.36)',
    backdropFilter: 'blur(2px)',
    zIndex: 1000,
  },
  positioner: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    zIndex: 1001,
  },
  content: {
    pointerEvents: 'auto',
    width: 'min(420px, calc(100vw - 32px))',
    maxHeight: 'calc(100vh - 32px)',
    background: 'var(--paper)',
    border: '1px solid var(--line-strong)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  head: {
    height: 48,
    padding: '0 14px 0 18px',
    borderBottom: '1px solid var(--line)',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  title: {
    fontFamily: 'var(--serif)',
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--ink)',
    margin: 0,
  },
  close: {
    marginLeft: 'auto',
    width: 28,
    height: 28,
    display: 'grid',
    placeItems: 'center',
    border: 0,
    background: 'transparent',
    color: 'var(--ink-3)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    ':hover': { background: 'var(--paper-3)', color: 'var(--ink)' },
  },
  body: {
    overflowY: 'auto',
    padding: '14px 18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: 18,
  },
  section: { display: 'flex', flexDirection: 'column', gap: 10 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--ink-4)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    fontFamily: 'var(--mono)',
  },
  sectionBody: { display: 'flex', flexDirection: 'column', gap: 10 },
  row: { display: 'flex', flexDirection: 'column', gap: 6 },
  rowSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowLabel: { fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 500 },
  seg: {
    display: 'flex',
    background: 'var(--paper-3)',
    borderRadius: 8,
    padding: 2,
  },
  segItem: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: '5px 8px',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--ink-3)',
    transition: 'background 140ms, color 140ms',
    ':hover': { color: 'var(--ink-2)' },
  },
  segItemText: { color: 'inherit' },
  segItemTextActive: {
    background: 'var(--paper)',
    color: 'var(--ink)',
    boxShadow: '0 1px 2px oklch(0.24 0.04 255 / 0.08)',
    padding: '5px 8px',
    margin: '-5px -8px',
    borderRadius: 6,
  },
  switchCtrl: {
    width: 32,
    height: 18,
    borderRadius: 999,
    background: 'var(--line-strong)',
    position: 'relative',
    transition: 'background 140ms',
    cursor: 'pointer',
    border: 0,
  },
  switchCtrlOn: { background: 'var(--ok)' },
  switchThumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 14,
    height: 14,
    borderRadius: '50%',
    background: 'var(--paper)',
    boxShadow: '0 1px 2px oklch(0 0 0 / 0.25)',
    transition: 'transform 140ms',
  },
  switchThumbOn: { transform: 'translateX(14px)' },
  replayBtn: {
    textAlign: 'left',
    padding: '8px 10px',
    background: 'var(--paper-2)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 12.5,
    color: 'var(--ink-2)',
    fontFamily: 'var(--mono)',
    cursor: 'pointer',
    ':hover': {
      background: 'var(--paper-3)',
      borderColor: 'var(--line-strong)',
      color: 'var(--ink)',
    },
  },
  accountRow: {
    padding: '6px 10px',
    background: 'var(--paper-2)',
    border: '1px solid var(--line)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
  },
  accountEmail: {
    fontFamily: 'var(--mono)',
    fontSize: 12,
    color: 'var(--ink-2)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  signoutBtn: {
    textAlign: 'left',
    padding: '8px 10px',
    background: 'transparent',
    border: '1px solid var(--err)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 12.5,
    color: 'var(--err)',
    fontFamily: 'var(--sans)',
    fontWeight: 500,
    cursor: 'pointer',
    ':hover': {
      background: 'var(--err-soft)',
    },
  },
})
