import type { AssistantMessageDataT } from "@/lib/types";

import * as stylex from "@stylexjs/stylex";

import { AssistantAvatar } from "@/components/molecules/AssistantAvatar";
import { MessageActions } from "@/components/molecules/MessageActions";
import { MessageCaveats } from "@/components/molecules/MessageCaveats";
import { MessageError } from "@/components/molecules/MessageError";
import { Reply } from "@/components/molecules/Reply";
import { ToolPill } from "@/components/molecules/ToolPill";
import { ThinkingPanelContainer } from "@/components/organisms/ThinkingPanelContainer";
import { sx } from "@/lib/styles/sx";

interface AssistantMessagePropsT {
  msg: AssistantMessageDataT;
  focusedCallId: string | null;
  onFocusCall: (id: string) => void;
  autoCollapseThinking: boolean;
  defaultThinkingOpen: boolean;
}

export function AssistantMessage(props: Readonly<AssistantMessagePropsT>) {
  const showThinking = !!props.msg.thinking || props.msg.thinkingActive;
  const showActions = props.msg.done && !props.msg.streaming;

  return (
    <div {...sx(s.row)}>
      <AssistantAvatar />
      <div {...sx(s.body)}>
        {showThinking && (
          <ThinkingPanelContainer
            text={props.msg.thinking}
            active={props.msg.thinkingActive}
            ms={props.msg.thinkingMs}
            autoCollapse={props.autoCollapseThinking}
            defaultOpen={props.defaultThinkingOpen || props.msg.thinkingActive}
          />
        )}

        {props.msg.calls.length > 0 && (
          <div {...sx(s.pills)}>
            {props.msg.calls.map((call) => (
              <ToolPill
                key={call.id}
                call={call}
                active={call.id === props.focusedCallId}
                onClick={() => {
                  props.onFocusCall(call.id);
                }}
              />
            ))}
          </div>
        )}

        {props.msg.reply && (
          <Reply text={props.msg.reply} streaming={props.msg.streaming} />
        )}

        {props.msg.error && <MessageError message={props.msg.error} />}

        {props.msg.caveats?.length ? (
          <MessageCaveats items={props.msg.caveats} />
        ) : null}

        {showActions && <MessageActions />}
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
