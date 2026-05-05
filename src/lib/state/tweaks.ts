import type { TweaksT } from "@/lib/state/tweaksSlice";

import { useCallback } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/state/hooks";
import { tweaksActions } from "@/lib/state/tweaksSlice";

export function useTweaks() {
  const tweaks = useAppSelector((s) => s.tweaks);
  const dispatch = useAppDispatch();
  const setTweaks = useCallback(
    (patch: Partial<TweaksT>) => {
      dispatch(tweaksActions.setTweaks(patch));
    },
    [dispatch],
  );
  return [tweaks, setTweaks] as const;
}
