import type { SubscribeWatchContentT } from "~/lib/types";

import * as stylex from "@stylexjs/stylex";
import { For, Show } from "solid-js";

import { sx } from "~/lib/sx";
import { borders, colors, fonts, radii } from "~/lib/tokens.stylex";

import { Icon } from "../Icons";

export function SubscribeConfirm(
  props: Readonly<{ result: SubscribeWatchContentT }>,
) {
  return (
    <div>
      <div {...sx(sb.banner)}>
        <Icon.Check />
        <div {...sx(sb.body)}>
          <strong>Subscription active</strong>
          <div {...sx(sb.line)}>
            Watching <strong>{props.result.codes.join(", ")}</strong> for{" "}
            <strong>{props.result.email}</strong>.
          </div>
        </div>
      </div>
      <div {...sx(sb.sources)}>
        <div {...sx(sb.sourcesLabel)}>Sources monitored</div>
        <ul {...sx(sb.sourcesList)}>
          <For each={props.result.sources}>{(src) => <li>{src}</li>}</For>
        </ul>
        <Show when={!!props.result.cadence || !!props.result.subscription_id}>
          <div {...sx(sb.tech)}>
            <Show when={props.result.cadence}>
              {(c) => (
                <>
                  cadence: {c()}
                  <br />
                </>
              )}
            </Show>
            <Show when={props.result.subscription_id}>
              {(id) => <>subscription: {id()}</>}
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
}

const sb = stylex.create({
  banner: {
    background: colors.okSoft,
    padding: "10px 12px",
    borderColor: colors.ok,
    borderRadius: radii.md,
    borderStyle: borders.solid,
    borderWidth: borders.thin,
    gap: 10,
    alignItems: "flex-start",
    color: colors.ok,
    display: "flex",
  },
  body: { color: colors.ink, fontSize: 12.5 },
  line: { color: colors.ink3, marginTop: 4 },
  sources: {
    color: colors.ink3,
    fontSize: 12,
    marginTop: 12,
  },
  sourcesLabel: {
    color: colors.ink2,
    fontWeight: 500,
    marginBottom: 4,
  },
  sourcesList: { margin: 0, paddingLeft: 18 },
  tech: {
    color: colors.ink4,
    fontFamily: fonts.mono,
    fontSize: 11,
    marginTop: 8,
  },
});
