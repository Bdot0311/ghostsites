import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export interface ApiKeys {
  openrouter?: string;
  googlePlaces?: string;
  emailApiUrl?: string;
}

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  apiKeys: ApiKeys;
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const req = opts.req;
  const headers = req.headers;

  const apiKeys: ApiKeys = {};
  const openrouterKey = headers.get("x-openrouter-key");
  const googleKey = headers.get("x-google-places-key");
  const emailApiUrl = headers.get("x-email-api-url");

  if (openrouterKey) apiKeys.openrouter = openrouterKey;
  if (googleKey) apiKeys.googlePlaces = googleKey;
  if (emailApiUrl) apiKeys.emailApiUrl = emailApiUrl;

  return { req, resHeaders: opts.resHeaders, apiKeys };
}
