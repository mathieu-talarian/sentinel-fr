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
 * Wires the Firebase listener so every auth state change (sign-in, sign-out,
 * token refresh) syncs to Redux. Returns a promise that resolves the FIRST
 * time auth state is known so the app can mount with a settled
 * `auth.status` (no flash of "loading" routes).
 */
export const subscribeAuth = (dispatch: AppDispatchT): Promise<void> => {
  let resolved = false;
  const settle = (resolve: () => void) => {
    if (!resolved) {
      resolved = true;
      resolve();
    }
  };
  return new Promise<void>((resolve) => {
    firebaseAuth.onAuthStateChanged((user) => {
      void handleAuthChange(dispatch, user).finally(() => {
        settle(resolve);
      });
    });
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
  try {
    // Mark authed first so route guards reading `store.getState().auth`
    // see a settled status during the `/auth/me` round-trip; the bearer
    // interceptor reads `firebaseAuth.currentUser` directly so it doesn't
    // depend on slice state.
    dispatch(authActions.setAuthed({ firebaseUser, profile: null }));
    await dispatch(fetchProfile);
  } catch (error) {
    // Backend rejected the bearer token (or is down). Sign out so the user
    // can retry; the listener will fire again with null and reset the slice.
    Sentry.captureException(error, { tags: { source: "auth-bootstrap" } });
    await signOutFromFirebase();
    dispatch(authActions.setAnon());
  }
};
