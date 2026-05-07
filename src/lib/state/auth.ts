import { useAppSelector } from "@/lib/state/hooks";

/**
 * Selector hook for the auth slice. Read-only — sign-in/out callers use the
 * thunks in `authThunks.ts` directly through `useAppDispatch`.
 */
export const useAuth = () => useAppSelector((s) => s.auth);
