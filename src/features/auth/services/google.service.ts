import { api, unwrap } from "@/shared/api/client";

export async function googleSignInUrl(returnTo: string, invite: string | null): Promise<string> {
  const { url } = await unwrap(api.GET("/v1/auth/google", { params: { query: { returnTo, ...(invite ? { invite } : {}) } } }));
  return url;
}

export async function googleLinkUrl(): Promise<string> {
  const { url } = await unwrap(api.GET("/v1/auth/google/link"));
  return url;
}

