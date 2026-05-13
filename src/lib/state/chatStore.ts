import type { MessageT } from "@/lib/types";

import { useCallback } from "react";

import { chatActions } from "@/lib/state/chatSlice";
import { abortChat, resetChat, sendChat } from "@/lib/state/chatThunks";
import { useAppDispatch, useAppSelector } from "@/lib/state/hooks";

interface SendArgsT {
  text: string;
}

export interface ChatStoreT {
  threadId: string;
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

const EMPTY_MESSAGES: readonly MessageT[] = [];

/**
 * Scoped chat hook. Pass `LEGACY_THREAD_ID` for the `/` route or the
 * active case id for the workbench. Two callers reading the same
 * thread id share state by construction.
 */
export function useChatStore(threadId: string): ChatStoreT {
  const messages = useAppSelector(
    (s) => s.chat.threads[threadId]?.messages ?? EMPTY_MESSAGES,
  );
  const running = useAppSelector(
    (s) => s.chat.threads[threadId]?.running ?? false,
  );
  const focusedCallId = useAppSelector(
    (s) => s.chat.threads[threadId]?.focusedCallId ?? null,
  );
  const inspectorOpen = useAppSelector(
    (s) => s.chat.threads[threadId]?.inspectorOpen ?? false,
  );
  const dispatch = useAppDispatch();

  const send = useCallback(
    ({ text }: SendArgsT) => {
      dispatch(sendChat(threadId, text)).catch(() => undefined);
    },
    [dispatch, threadId],
  );
  const abort = useCallback(() => {
    dispatch(abortChat);
  }, [dispatch]);
  const reset = useCallback(() => {
    dispatch(resetChat(threadId));
  }, [dispatch, threadId]);
  const setFocusedCall = useCallback(
    (id: string | null) => {
      dispatch(chatActions.setFocusedCall({ threadId, callId: id }));
    },
    [dispatch, threadId],
  );
  const setInspectorOpen = useCallback(
    (open: boolean) => {
      dispatch(chatActions.setInspectorOpen({ threadId, open }));
    },
    [dispatch, threadId],
  );

  return {
    threadId,
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
