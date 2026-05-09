import { createRouter, publicQuery } from "./middleware";
import { scrapeRouter } from "./routers/scrape";
import { businessRouter } from "./routers/business";
import { siteRouter } from "./routers/site";
import { emailRouter } from "./routers/email";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),

  scrape: scrapeRouter,
  business: businessRouter,
  site: siteRouter,
  email: emailRouter,
});

export type AppRouter = typeof appRouter;
