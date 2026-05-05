import type { AlertsContentT } from "~/lib/types";

import { For } from "solid-js";

import { sx } from "~/lib/styles/sx";

import { rl } from "./Rulings";

export function AlertList(props: Readonly<{ result: AlertsContentT }>) {
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
                {...sx(rl.code, a.status === "sent" ? rl.codeOk : rl.codeWarn)}
              >
                {a.status}
              </span>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}
