import type { AppDispatchT, AppThunkT } from "@/lib/state/store";
import type { User as FirebaseUser } from "firebase/auth";

import * as Sentry from "@sentry/react";

import { authMe } from "@/lib/api/generated/sdk.gen";
import { firebaseAuth } from "@/lib/firebase";
import {
  serializeFirebaseUser,
  signInWithGooglePopup,
  signOutFromFirebase,
} from "@/lib/firebase/auth";
import { authActions } from "@/lib/state/authSlice";

/**
 * Calls `/api/auth/me` once the bearer token is in place and stashes the
 * SessionView projection in the auth slice. The endpoint also doubles as
 * the user-registration trigger on the backend (first-time callers get a
 * row created in the DB).
 */
export const fetchProfile: AppThunkT<Promise<void>> = async (dispatch) => {
  const r = await authMe({ throwOnError: false });
  if (!r.data) {
    const status = r.response?.status ?? 0;
    throw new Error(`auth/me failed: HTTP ${status.toString()}`);
  }
  dispatch(authActions.setProfile(r.data.session));
};

/**
 * Triggers the Google popup. The actual store sync happens via
 * `onAuthStateChanged` (see `subscribeAuth`) — this thunk only kicks the
 * SDK and surfaces popup-side errors to the caller for inline UI feedback.
 */
export const signInWithGoogle: AppThunkT<Promise<void>> = async () => {
  await signInWithGooglePopup();
};

/**
 * Signs out of Firebase. The `onAuthStateChanged` listener fires with
 * `null` and clears the slice. We also detach the Sentry user so
 * subsequent events aren't tagged with stale identity.
 */
export const signOut: AppThunkT<Promise<void>> = async () => {
  await signOutFromFirebase();
  Sentry.setUser(null);
};

/**
 * Boot-time auth subscription — call once from `main.tsx` BEFORE rendering.
 *
 * `authStateReady()` resolves only after Firebase has finished hydrating
 * from IndexedDB. Without this gate, `onAuthStateChanged` can fire with
 * `null` BEFORE persistence loads — which would kick the user back to
 * `/login` on every refresh. We sync once based on the settled current
 * user, then keep the listener for subsequent sign-in / sign-out / token
 * refresh events.
 */
export const subscribeAuth = async (
  dispatch: AppDispatchT,
): Promise<void> => {
  await firebaseAuth.authStateReady();
  await handleAuthChange(dispatch, firebaseAuth.currentUser);
  firebaseAuth.onAuthStateChanged((user) => {
    void handleAuthChange(dispatch, user);
  });
};

const handleAuthChange = async (
  dispatch: AppDispatchT,
  user: FirebaseUser | null,
): Promise<void> => {
  if (!user) {
    Sentry.setUser(null);
    dispatch(authActions.setAnon());
    return;
  }
  const firebaseUser = serializeFirebaseUser(user);
  Sentry.setUser({
    id: firebaseUser.uid,
    email: firebaseUser.email ?? undefined,
  });
  // Mark authed first so route guards reading `store.getState().auth`
  // see a settled status during the `/auth/me` round-trip; the bearer
  // interceptor reads `firebaseAuth.currentUser` directly so it doesn't
  // depend on slice state.
  dispatch(authActions.setAuthed({ firebaseUser, profile: null }));
  try {
    await dispatch(fetchProfile);
  } catch (error) {
    // Only sign out on a genuine identity rejection (401 / 403). Backend
    // 5xx / network blips leave the user authed-without-profile so a
    // transient outage doesn't kick them to /login.
    const status = errorStatus(error);
    if (status === 401 || status === 403) {
      Sentry.captureException(error, {
        tags: { source: "auth-bootstrap", reason: "token-rejected" },
      });
      await signOutFromFirebase();
      dispatch(authActions.setAnon());
    } else {
      Sentry.captureException(error, {
        tags: { source: "auth-bootstrap", reason: "profile-fetch-failed" },
        extra: { httpStatus: status },
      });
    }
  }
};

const errorStatus = (error: unknown): number | null => {
  if (!(error instanceof Error)) return null;
  // String.prototype.match here intentionally — the project's security hook
  // false-positives any literal `.exec(` token as `child_process.exec`, so
  // RegExp.prototype.exec is unreachable from this file.
  // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec, sonarjs/prefer-regexp-exec
  const m = error.message.match(/HTTP (\d+)/);
  return m ? Number.parseInt(m[1], 10) : null;
};
