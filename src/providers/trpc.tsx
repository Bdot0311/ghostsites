import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../api/router";
import type { ReactNode } from "react";

export const trpc = createTRPCReact<AppRouter>();

const queryClient = new QueryClient();
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        const keysRaw = localStorage.getItem("ghostsites_api_keys");
        const headers: Record<string, string> = {};
        if (keysRaw) {
          try {
            const keys = JSON.parse(keysRaw) as {
              openrouter?: string;
              googlePlaces?: string;
              emailApiUrl?: string;
            };
            if (keys.openrouter) headers["x-openrouter-key"] = keys.openrouter;
            if (keys.googlePlaces) headers["x-google-places-key"] = keys.googlePlaces;
            if (keys.emailApiUrl) headers["x-email-api-url"] = keys.emailApiUrl;
          } catch {
            // ignore
          }
        }
        return headers;
      },
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

export function TRPCProvider({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
