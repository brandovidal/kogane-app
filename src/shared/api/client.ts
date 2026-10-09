import createClient from "openapi-fetch";

import { loginUrl } from "@/shared/lib/auth-redirect";
import type { components, paths } from "./schema";

function recoveryPageUrl() {
  if (
    typeof window === "undefined" ||
    window.location.pathname.startsWith("/servicio-no-disponible")
  )
    return;
  const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  window.location.replace(
    `/servicio-no-disponible?returnTo=${encodeURIComponent(returnTo)}`,
  );
}

export const apiFetch: typeof fetch = async (input, init) => {
  if (typeof window === "undefined") {
    return Response.json(
      {
        success: false,
        code: "API_UNAVAILABLE",
        message: "La API se consulta desde el navegador.",
      },
      { status: 503 },
    );
  }

  try {
    const response = await fetch(input, init);
    if (
      response.status === 401 &&
      !window.location.pathname.startsWith("/entrar")
    ) {
      const body = (await response
        .clone()
        .json()
        .catch(() => null)) as { code?: string } | null;
      if (body?.code === "SESSION_REQUIRED") {
        window.location.replace(
          loginUrl(`${window.location.pathname}${window.location.search}`),
        );
        return response;
      }
    }
    if (response.status === 503) {
      const body = (await response
        .clone()
        .json()
        .catch(() => null)) as { code?: string } | null;
      if (body?.code === "API_UNAVAILABLE") recoveryPageUrl();
    }
    return response;
  } catch {
    recoveryPageUrl();
    throw new Error(
      "No se pudo conectar con Kogane. Se abrirá la página de recuperación.",
    );
  }
};

export const api = createClient<paths>({ baseUrl: "/api", fetch: apiFetch });

export type Schemas = components["schemas"];

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type ApiResult = { data?: unknown; error?: unknown; response: Response };

type Payload<R> = R extends { data: infer D }
  ? D extends { data: infer X }
    ? X
    : undefined
  : never;

export async function unwrap<R extends ApiResult>(
  call: Promise<R>,
): Promise<Payload<R>> {
  const { data, error, response } = await call;
  if (response.ok)
    return (data as { data?: unknown } | undefined)?.data as Payload<R>;

  const body = (error ?? {}) as {
    code?: string;
    message?: string;
    details?: unknown;
  };
  throw new ApiError(
    response.status,
    body.code ?? "UNKNOWN_ERROR",
    body.message ?? response.statusText,
    body.details,
  );
}
