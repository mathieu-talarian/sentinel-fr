import { client } from "@/lib/api/generated/client.gen";
import { getIdToken } from "@/lib/firebase/auth";

/**
 * Absolute Cloud Run URL for the Rust backend. Used here as the generated
 * SDK's baseUrl and re-exported for hand-rolled fetches (e.g. SSE streaming
 * in `chatStream.ts`) so every HTTP call lands on the same origin.
 */
export const API_BASE_URL =
  "https://sentinel-server-356994978667.europe-west1.run.app/api";

/**
 * Bootstrap for the generated `@hey-api/client-fetch` runtime.
 *
 * The generated `client.gen.ts` is auto-overwritten on every `yarn run gen:api`,
 * so we re-configure the singleton from here at app boot rather than editing
 * the generated file:
 *   - cross-origin baseUrl pointed at the Cloud Run backend directly (no
 *     Firebase Hosting rewrite, no Vite proxy).
 *   - per-request `Authorization: Bearer <firebase-id-token>` interceptor —
 *     `getIdToken()` auto-refreshes when the cached token is within five
 *     minutes of expiry. The Rust backend verifies via the Firebase Admin
 *     SDK; cookies are no longer in play.
 *   - per-request `X-Request-Id` interceptor so server logs can correlate.
 */
export function configureApiClient() {
  client.setConfig({
    baseUrl: API_BASE_URL,
    headers: {
      "content-type": "application/json",
    },
  });

  client.interceptors.request.use(async (req) => {
    const token = await getIdToken();
    if (token) req.headers.set("authorization", `Bearer ${token}`);
    if (!req.headers.has("x-request-id")) {
      req.headers.set("x-request-id", crypto.randomUUID());
    }
    return req;
  });
}
