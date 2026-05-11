import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { getDb } from "./queries/connection";
import { generatedSites } from "@db/schema";
import { eq, desc } from "drizzle-orm";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Live preview — serve generated site by business ID (latest)
// Supports multi-page sites via ?page= parameter
app.get("/preview/business/:businessId", async (c) => {
  const businessId = parseInt(c.req.param("businessId"));
  if (isNaN(businessId)) return c.text("Invalid business ID", 400);

  const site = getDb()
    .select()
    .from(generatedSites)
    .where(eq(generatedSites.businessId, businessId))
    .orderBy(desc(generatedSites.generatedAt))
    .get();

  if (!site) return c.text("No site found for this business. Generate one first.", 404);

  const requestedPage = c.req.query("page") || "index.html";

  // Multi-page site
  if (site.pagesJson) {
    try {
      const pages = JSON.parse(site.pagesJson) as { filename: string; html: string }[];
      const page = pages.find(p => p.filename === requestedPage) || pages[0];
      if (page) {
        c.header("Content-Type", "text/html");
        return c.body(page.html);
      }
    } catch {
      // fall through
    }
  }

  // Legacy single-page site
  c.header("Content-Type", "text/html");
  return c.body(site.fullHtml);
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext: (opts) => createContext(opts),
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
