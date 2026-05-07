import {
  isSupported as analyticsIsSupported,
  getAnalytics,
} from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth";

// Public web config — Firebase API keys identify the project, not authenticate
// callers. Safe to commit. Backend access is gated by Firebase Admin SDK
// verifying ID tokens server-side.
const firebaseConfig = {
  apiKey: "AIzaSyCcmkbamc6wJCmuQ12gdovdm6OGmDBzm4s",
  authDomain: "sentinel-8f3be.firebaseapp.com",
  projectId: "sentinel-8f3be",
  storageBucket: "sentinel-8f3be.firebasestorage.app",
  messagingSenderId: "356994978667",
  appId: "1:356994978667:web:b1aaa33fd2bfdfa659322e",
  measurementId: "G-7G9BN78DGH",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const googleProvider = new GoogleAuthProvider();

// Analytics requires a browser context with IndexedDB + measurementId
// recognised by Google. `isSupported()` keeps test runners and stripped-down
// environments (e.g. SSR previews) from crashing on import.
if (await analyticsIsSupported()) getAnalytics(firebaseApp);
