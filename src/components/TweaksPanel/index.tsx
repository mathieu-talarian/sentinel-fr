import { Dialog } from "@ark-ui/solid";
import * as stylex from "@stylexjs/stylex";
import { useQuery } from "@tanstack/solid-query";
import { For, Show } from "solid-js";

import { meQueryOptions } from "~/lib/queries";
import { SUGGESTIONS } from "~/lib/suggestions";
import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii, shadows } from "~/lib/tokens.stylex";
import { useTweaks } from "~/lib/tweaks";

import { Icon } from "../Icons";

import { AccountSection } from "./AccountSection";
import { Section } from "./Section";
import { SegmentedRadio } from "./SegmentedRadio";
import { ToggleRow } from "./ToggleRow";

interface TweaksPanelPropsT {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplay: (text: string) => void;
}

const THEME_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const DENSITY_OPTIONS = [
  { value: "comfortable", label: "Comfortable" },
  { value: "compact", label: "Compact" },
];

const REPLAY_LABELS = [
  "▶ Replay: leather handbag",
  "▶ Replay: cotton t-shirts",
  "▶ Replay: tariff alert",
] as const;

export function TweaksPanel(props: Readonly<TweaksPanelPropsT>) {
  const [tweaks, setTweaks] = useTweaks();
  const meQuery = useQuery(() => meQueryOptions());

  const close = () => {
    props.onOpenChange(false);
  };

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={(d) => {
        props.onOpenChange(d.open);
      }}
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
                options={THEME_OPTIONS}
                onChange={(v) => {
                  setTweaks({ theme: v as "light" | "dark" });
                }}
              />
              <SegmentedRadio
                label="Density"
                value={tweaks().density}
                options={DENSITY_OPTIONS}
                onChange={(v) => {
                  setTweaks({ density: v as "comfortable" | "compact" });
                }}
              />
            </Section>

            <Section label="Behaviour">
              <ToggleRow
                label="Show thinking by default"
                checked={tweaks().showThinkingByDefault}
                onChange={(v) => {
                  setTweaks({ showThinkingByDefault: v });
                }}
              />
              <ToggleRow
                label="Auto-open inspector on tool result"
                checked={tweaks().inspectorAutoOpen}
                onChange={(v) => {
                  setTweaks({ inspectorAutoOpen: v });
                }}
              />
            </Section>

            <Section label="Replay">
              <For each={REPLAY_LABELS}>
                {(label, i) => (
                  <button
                    type="button"
                    {...sx(s.replayBtn)}
                    onClick={() => {
                      props.onReplay(SUGGESTIONS[i()].text);
                    }}
                  >
                    {label}
                  </button>
                )}
              </For>
            </Section>

            <Show when={meQuery.data}>
              {(session) => (
                <AccountSection email={session().email} onSignedOut={close} />
              )}
            </Show>
          </div>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

const s = stylex.create({
  backdrop: {
    background: "oklch(0 0 0 / 0.36)",
    inset: 0,
    backdropFilter: "blur(2px)",
    position: "fixed",
    zIndex: 1000,
  },
  positioner: {
    inset: 0,
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
    position: "fixed",
    zIndex: 1001,
  },
  content: {
    background: colors.paper,
    borderColor: colors.lineStrong,
    borderRadius: radii.lg,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    overflow: "hidden",
    boxShadow: shadows.lg,
    display: "flex",
    flexDirection: "column",
    pointerEvents: "auto",
    maxHeight: "calc(100vh - 32px)",
    width: "min(420px, calc(100vw - 32px))",
  },
  head: {
    padding: "0 14px 0 18px",
    alignItems: "center",
    display: "flex",
    flexShrink: 0,
    borderBottomColor: colors.line,
    borderBottomStyle: borders.solid,
    borderBottomWidth: borders.thin,
    height: 48,
  },
  title: {
    margin: 0,
    color: colors.ink,
    fontFamily: fonts.serif,
    fontSize: 16,
    fontWeight: 600,
  },
  close: {
    background: {
      default: "transparent",
      ":hover": colors.paper3,
    },
    borderRadius: radii.sm,
    borderStyle: "none",
    borderWidth: 0,
    placeItems: "center",
    color: {
      default: colors.ink3,
      ":hover": colors.ink,
    },
    cursor: "pointer",
    display: "grid",
    height: 28,
    marginLeft: "auto",
    width: 28,
  },
  body: {
    padding: "14px 18px 20px",
    gap: 18,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  replayBtn: {
    background: {
      default: colors.paper2,
      ":hover": colors.paper3,
    },
    padding: "8px 10px",
    borderColor: {
      default: colors.line,
      ":hover": colors.lineStrong,
    },
    borderRadius: radii.sm,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    color: {
      default: colors.ink2,
      ":hover": colors.ink,
    },
    cursor: "pointer",
    fontFamily: fonts.mono,
    fontSize: 12.5,
    textAlign: "left",
  },
});
