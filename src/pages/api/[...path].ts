import type { APIRoute } from "astro";
import {
  API_KEY,
  API_URL,
  DEV_LOGIN_IDENTIFIER,
  DEV_LOGIN_PASSWORD,
} from "astro:env/server";

import {
  apiUnavailableResponse,
  buildProxyRequest,
  notFoundResponse,
  toProxyResponse,
} from "@/shared/api/server/proxy";

export const prerender = false;

const SESSION_COOKIE = "kogane_session";
const MANUAL_AUTH_PATH = /^v1\/auth\/(login|logout|accept-invite|google)/;

let devLoginFailed = false;

async function devLogin(): Promise<string | null> {
  if (
    !import.meta.env.DEV ||
    !DEV_LOGIN_IDENTIFIER ||
    !DEV_LOGIN_PASSWORD ||
    devLoginFailed
  )
    return null;
  try {
    const response = await fetch(new URL("/v1/auth/login", API_URL), {
      method: "POST",
      headers: { "x-api-key": API_KEY, "content-type": "application/json" },
      body: JSON.stringify({
        identifier: DEV_LOGIN_IDENTIFIER,
        password: DEV_LOGIN_PASSWORD,
      }),
    });
    if (!response.ok) {
      devLoginFailed = true;
      console.warn(
        `[dev-login] ${response.status}: no se reintenta hasta reiniciar el servidor`,
      );
      return null;
    }
    return (
      response.headers
        .getSetCookie()
        .find((cookie) => cookie.startsWith(`${SESSION_COOKIE}=`)) ?? null
    );
  } catch {
    return null;
  }
}

// /api/v1/* → kogane-api with the x-api-key header (D56)
export const ALL: APIRoute = async ({ params, request }) => {
  const path = params.path ?? "";
  const config = { apiUrl: API_URL, apiKey: API_KEY };

  let devCookie: string | null = null;
  let upstream = buildProxyRequest(path, request, config);
  if (
    upstream &&
    !MANUAL_AUTH_PATH.test(path) &&
    !upstream.headers.get("cookie")?.includes(`${SESSION_COOKIE}=`)
  ) {
    devCookie = await devLogin();
    if (devCookie) {
      const headers = new Headers(request.headers);
      headers.set("cookie", devCookie.split(";")[0]);
      upstream = buildProxyRequest(
        path,
        new Request(request, { headers }),
        config,
      );
    }
  }
  if (!upstream) return notFoundResponse();
  try {
    const response = await fetch(upstream);
    if ([502, 503, 504].includes(response.status))
      return apiUnavailableResponse();
    const proxied = toProxyResponse(response);
    if (devCookie) proxied.headers.append("set-cookie", devCookie);
    return proxied;
  } catch {
    return apiUnavailableResponse();
  }
};
