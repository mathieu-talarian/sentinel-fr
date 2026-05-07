import type { User } from "firebase/auth";

import { signOut as firebaseSignOut, signInWithPopup } from "firebase/auth";

import { firebaseAuth, googleProvider } from "@/lib/firebase";

export interface FirebaseUserT {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export const serializeFirebaseUser = (user: User): FirebaseUserT => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  emailVerified: user.emailVerified,
});

/**
 * Returns a fresh Firebase ID token for the current user, refreshing if it's
 * within five minutes of expiry. Callers (API client interceptor + the SSE
 * fetch in `chatStream`) attach it as `Authorization: Bearer ...` so the
 * Rust backend can verify via the Firebase Admin SDK.
 */
export const getIdToken = async (): Promise<string | null> => {
  const u = firebaseAuth.currentUser;
  if (!u) return null;
  return u.getIdToken();
};

export const signInWithGooglePopup = (): Promise<User> =>
  signInWithPopup(firebaseAuth, googleProvider).then((r) => r.user);

export const signOutFromFirebase = (): Promise<void> =>
  firebaseSignOut(firebaseAuth);

// Friendly copy for the popup-based Google flow. Codes from
// https://firebase.google.com/docs/reference/js/auth#autherrorcodes
export const POPUP_ERROR_COPY: Record<string, string> = {
  "auth/popup-closed-by-user":
    "Sign-in cancelled. Try again whenever you're ready.",
  "auth/cancelled-popup-request": "Another sign-in is already in progress.",
  "auth/popup-blocked":
    "Your browser blocked the sign-in popup. Allow popups and retry.",
  "auth/network-request-failed":
    "Network error. Check your connection and retry.",
  "auth/account-exists-with-different-credential":
    "This email is already linked to a different sign-in method.",
  "auth/unauthorized-domain":
    "This domain isn't authorized for sign-in. Contact support.",
};

export const popupErrorMessage = (err: unknown): string => {
  if (err && typeof err === "object" && "code" in err) {
    const code = (err).code;
    if (typeof code === "string" && code in POPUP_ERROR_COPY) {
      return POPUP_ERROR_COPY[code];
    }
  }
  return "Sign-in failed. Please try again.";
};
