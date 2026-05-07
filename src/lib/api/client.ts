import { client } from "@/lib/api/generated/client.gen";
import { getIdToken } from "@/lib/firebase/auth";

/**
 * Bootstrap for the generated `@hey-api/client-fetch` runtime.
 *
 * The generated `client.gen.ts` is auto-overwritten on every `yarn run gen:api`,
 * so we re-configure the singleton from here at app boot rather than editing
 * the generated file:
 *   - same-origin baseUrl (`/api`) so the Vite dev proxy + Firebase Hosting
 *     Cloud Run rewrite both forward to the Rust backend at the same path.
 *   - per-request `Authorization: Bearer <firebase-id-token>` interceptor —
 *     `getIdToken()` auto-refreshes when the cached token is within five
 *     minutes of expiry. The Rust backend verifies via the Firebase Admin
 *     SDK; cookies are no longer in play.
 *   - per-request `X-Request-Id` interceptor so server logs can correlate.
 */
export function configureApiClient() {
  client.setConfig({
    baseUrl: "/api",
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
