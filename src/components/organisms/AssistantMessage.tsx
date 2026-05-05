import type { AssistantMessageDataT } from "~/lib/types";

import * as stylex from "@stylexjs/stylex";
import { For, Show } from "solid-js";

import { AssistantAvatar } from "~/components/molecules/AssistantAvatar";
import { MessageActions } from "~/components/molecules/MessageActions";
import { MessageCaveats } from "~/components/molecules/MessageCaveats";
import { MessageError } from "~/components/molecules/MessageError";
import { Reply } from "~/components/molecules/Reply";
import { ThinkingPanel } from "~/components/molecules/ThinkingPanel";
import { ToolPill } from "~/components/molecules/ToolPill";
import { sx } from "~/lib/styles/sx";

interface AssistantMessagePropsT {
  msg: AssistantMessageDataT;
  focusedCallId: string | null;
  onFocusCall: (id: string) => void;
  autoCollapseThinking: boolean;
  defaultThinkingOpen: boolean;
}

export function AssistantMessage(props: Readonly<AssistantMessagePropsT>) {
  const showThinking = () => !!props.msg.thinking || props.msg.thinkingActive;
  const showActions = () => props.msg.done && !props.msg.streaming;

  return (
    <div {...sx(s.row)}>
      <AssistantAvatar />
      <div {...sx(s.body)}>
        <Show when={showThinking()}>
          <ThinkingPanel
            text={props.msg.thinking}
            active={props.msg.thinkingActive}
            ms={props.msg.thinkingMs}
            autoCollapse={props.autoCollapseThinking}
            defaultOpen={props.defaultThinkingOpen || props.msg.thinkingActive}
          />
        </Show>

        <Show when={props.msg.calls.length > 0}>
          <div {...sx(s.pills)}>
            <For each={props.msg.calls}>
              {(call) => (
                <ToolPill
                  call={call}
                  active={call.id === props.focusedCallId}
                  onClick={() => {
                    props.onFocusCall(call.id);
                  }}
                />
              )}
            </For>
          </div>
        </Show>

        <Show when={props.msg.reply}>
          <Reply text={props.msg.reply} streaming={props.msg.streaming} />
        </Show>

        <Show when={props.msg.error}>
          {(err) => <MessageError message={err()} />}
        </Show>

        <Show when={props.msg.caveats?.length}>
          <MessageCaveats items={props.msg.caveats ?? []} />
        </Show>

        <Show when={showActions()}>
          <MessageActions />
        </Show>
      </div>
    </div>
  );
}

const s = stylex.create({
  row: {
    gap: 12,
    alignItems: "flex-start",
    display: "flex",
  },
  body: {
    flex: "1",
    gap: 10,
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
  },
  pills: {
    gap: 6,
    display: "flex",
    flexWrap: "wrap",
  },
});
