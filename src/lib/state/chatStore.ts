import type { MessageT } from "@/lib/types";

import { useCallback } from "react";

import { chatActions } from "@/lib/state/chatSlice";
import { abortChat, resetChat, sendChat } from "@/lib/state/chatThunks";
import { useAppDispatch, useAppSelector } from "@/lib/state/hooks";

interface SendArgsT {
  text: string;
}

export interface ChatStoreT {
  messages: readonly MessageT[];
  running: boolean;
  focusedCallId: string | null;
  inspectorOpen: boolean;
  send: (args: SendArgsT) => void;
  abort: () => void;
  reset: () => void;
  setFocusedCall: (id: string | null) => void;
  setInspectorOpen: (open: boolean) => void;
}

export function useChatStore(): ChatStoreT {
  const messages = useAppSelector((s) => s.chat.messages);
  const running = useAppSelector((s) => s.chat.running);
  const focusedCallId = useAppSelector((s) => s.chat.focusedCallId);
  const inspectorOpen = useAppSelector((s) => s.chat.inspectorOpen);
  const dispatch = useAppDispatch();

  const send = useCallback(
    ({ text }: SendArgsT) => {
      dispatch(sendChat(text)).catch(() => undefined);
    },
    [dispatch],
  );
  const abort = useCallback(() => {
    dispatch(abortChat);
  }, [dispatch]);
  const reset = useCallback(() => {
    dispatch(resetChat);
  }, [dispatch]);
  const setFocusedCall = useCallback(
    (id: string | null) => {
      dispatch(chatActions.setFocusedCall(id));
    },
    [dispatch],
  );
  const setInspectorOpen = useCallback(
    (open: boolean) => {
      dispatch(chatActions.setInspectorOpen(open));
    },
    [dispatch],
  );

  return {
    messages,
    running,
    focusedCallId,
    inspectorOpen,
    send,
    abort,
    reset,
    setFocusedCall,
    setInspectorOpen,
  };
}
