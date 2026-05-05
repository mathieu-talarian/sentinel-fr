import { client } from "@/lib/api/generated/client.gen";

/**
 * Bootstrap for the generated `@hey-api/client-fetch` runtime.
 *
 * The generated `client.gen.ts` is auto-overwritten on every `yarn run gen:api`,
 * so we re-configure the singleton from here at app boot rather than editing
 * the generated file:
 *   - same-origin baseUrl ('') so the Vite dev proxy (`/auth`, `/chat`,
 *     `/conversations`, …) and a future production reverse-proxy both see
 *     relative URLs. The generated default is `https://localhost:8888` from
 *     the spec — fine for SDK codegen, wrong for runtime.
 *   - `credentials: "include"` so the HttpOnly `sentinelSession` cookie rides
 *     along with every request (matches the legacy fetch helpers).
 *   - per-request `X-Request-Id` interceptor so server logs and the RFC 9457
 *     problem `requestId` extension can correlate.
 */
export function configureApiClient() {
  client.setConfig({
    baseUrl: "/api",
    credentials: "include",
    headers: {
      "content-type": "application/json",
    },
  });

  client.interceptors.request.use((req) => {
    if (!req.headers.has("x-request-id")) {
      req.headers.set("x-request-id", crypto.randomUUID());
    }
    return req;
  });
}
