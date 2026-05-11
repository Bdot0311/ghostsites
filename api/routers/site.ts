import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { businesses, generatedSites } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { buildSite } from "../lib/siteGen";
import JSZip from "jszip";

export const siteRouter = createRouter({
  // Generate a complete multi-page site
  generate: publicQuery
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const apiKey = ctx.apiKeys.openrouter;
      if (!apiKey && !process.env.OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key not configured. Add it in Settings.");
      }

      const db = getDb();
      const business = db
        .select()
        .from(businesses)
        .where(eq(businesses.id, input.businessId))
        .get();

      if (!business) throw new Error("Business not found");

      // Build the complete multi-page site
      const site = await buildSite(
        {
          id: business.id,
          name: business.name,
          category: business.category,
          city: business.city,
          phone: business.phone,
          email: business.email,
          address: business.address,
          description: business.description,
          hours: business.hours,
          rating: business.rating,
          reviewCount: business.reviewCount,
        },
        { apiKey }
      );

      // Store index.html as fullHtml for backwards compatibility
      const indexPage = site.pages.find(p => p.filename === "index.html");
      const pagesJson = JSON.stringify(
        site.pages.map(p => ({ filename: p.filename, html: p.html }))
      );

      const siteRecord = db
        .insert(generatedSites)
        .values({
          businessId: input.businessId,
          fullHtml: indexPage?.html ?? site.pages[0].html,
          css: site.css,
          js: site.js,
          pagesJson: pagesJson,
          readme: site.readme,
          designArchetype: site.designSystem.layout.heroStyle,
          heroCopy: site.copy.hero.headline + "\n" + site.copy.hero.subheadline,
          aboutCopy: site.copy.about.story,
          servicesCopy: site.copy.services.items.map(s => s.name).join(", "),
          ctaCopy: site.copy.cta.headline,
        })
        .returning()
        .get();

      db.update(businesses)
        .set({ status: "site_generated" })
        .where(eq(businesses.id, input.businessId))
        .run();

      return {
        siteId: siteRecord.id,
        pages: site.pages.map(p => p.filename),
        archetype: site.designSystem.layout.heroStyle,
        previewUrl: `/preview/business/${business.id}`,
      };
    }),

  // ZIP export — download all files
  exportZip: publicQuery
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const site = db
        .select()
        .from(generatedSites)
        .where(eq(generatedSites.businessId, input.businessId))
        .orderBy(desc(generatedSites.generatedAt))
        .get();

      if (!site) throw new Error("No site found. Generate a site first.");

      const zip = new JSZip();

      // Add all pages
      if (site.pagesJson) {
        const pages = JSON.parse(site.pagesJson) as { filename: string; html: string }[];
        for (const page of pages) {
          zip.file(page.filename, page.html);
        }
      } else {
        // Fallback for old sites
        zip.file("index.html", site.fullHtml);
      }

      // Add CSS
      if (site.css) {
        zip.file("css/style.css", site.css);
      }

      // Add JS
      if (site.js) {
        zip.file("js/main.js", site.js);
      }

      // Add README
      zip.file("README.md", site.readme ?? "# Generated Site");

      // Add placeholder images directory with a note
      zip.file("images/README.txt", `Place your images here:
- hero.jpg — Hero image (recommended: 1600x900)
- about.jpg — About page image (recommended: 800x600)
- favicon.svg — Site favicon
`);

      const blob = await zip.generateAsync({ type: "nodebuffer" });
      return {
        filename: `${site.designArchetype || "site"}-export.zip`,
        base64: blob.toString("base64"),
        size: blob.length,
      };
    }),

  // Preview — serve a specific page from the multi-page site
  preview: publicQuery
    .input(z.object({ siteId: z.number(), page: z.string().optional() }))
    .query(async ({ input }) => {
      const db = getDb();
      const site = db
        .select()
        .from(generatedSites)
        .where(eq(generatedSites.id, input.siteId))
        .get();

      if (!site) throw new Error("Site not found");

      const pageName = input.page || "index.html";

      // If it's a multi-page site, serve the requested page
      if (site.pagesJson) {
        const pages = JSON.parse(site.pagesJson) as { filename: string; html: string }[];
        const page = pages.find(p => p.filename === pageName);
        if (page) return { html: page.html };
        // Fallback to first page
        return { html: pages[0]?.html ?? site.fullHtml };
      }

      // Legacy single-page site
      return { html: site.fullHtml };
    }),

  getByBusiness: publicQuery
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(generatedSites)
        .where(eq(generatedSites.businessId, input.businessId))
        .orderBy(desc(generatedSites.generatedAt))
        .get() ?? null;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(generatedSites)
        .where(eq(generatedSites.id, input.id))
        .get() ?? null;
    }),

  list: publicQuery
    .input(z.object({ limit: z.number().min(1).max(100).default(20), offset: z.number().min(0).default(0) }).optional())
    .query(async ({ input }) => {
      const p = input ?? { limit: 20, offset: 0 };
      return getDb().select().from(generatedSites).orderBy(desc(generatedSites.generatedAt)).limit(p.limit).offset(p.offset).all();
    }),
});
