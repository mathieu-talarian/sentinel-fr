import type { SessionView } from "@/lib/api/generated/types.gen";
import type { FirebaseUserT } from "@/lib/firebase/auth";
import type { PayloadAction } from "@reduxjs/toolkit";

import { createSlice } from "@reduxjs/toolkit";

export type AuthStatusT = "loading" | "authed" | "anon";

export interface AuthStateT {
  status: AuthStatusT;
  /**
   * Serialized projection of `firebase.User` — Firebase's class instance
   * isn't serializable so we never put it in the store directly.
   */
  firebaseUser: FirebaseUserT | null;
  /** Backend `/auth/me` response — populated after Firebase sign-in. */
  profile: SessionView | null;
}

const INITIAL: AuthStateT = {
  status: "loading",
  firebaseUser: null,
  profile: null,
};

const slice = createSlice({
  name: "auth",
  initialState: INITIAL,
  reducers: {
    setLoading(state) {
      state.status = "loading";
    },
    setAuthed(
      state,
      action: PayloadAction<{
        firebaseUser: FirebaseUserT;
        profile: SessionView | null;
      }>,
    ) {
      state.status = "authed";
      state.firebaseUser = action.payload.firebaseUser;
      state.profile = action.payload.profile;
    },
    setProfile(state, action: PayloadAction<SessionView | null>) {
      state.profile = action.payload;
    },
    setAnon(state) {
      state.status = "anon";
      state.firebaseUser = null;
      state.profile = null;
    },
  },
});

export const authActions = slice.actions;
export const authReducer = slice.reducer;
