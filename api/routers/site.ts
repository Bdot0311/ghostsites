import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { businesses, generatedSites } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { callKimi } from "../lib/openrouter";
import { buildPage } from "../lib/impeccableDesign";
import JSZip from "jszip";

export const siteRouter = createRouter({
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

      const categoryDisplay = business.category.charAt(0).toUpperCase() + business.category.slice(1);

      const prompt = `You are a world-class copywriter writing website copy for ${business.name}, a ${categoryDisplay} business in ${business.city}.

RULES:
- Be specific. Reference the city, the trade, real customer scenarios.
- NO generic filler: "Welcome to our website", "committed to excellence", "your satisfaction is our priority", "quality service", "years of experience"
- Write like a real person, not a marketing brochure.
- Headlines should be bold and specific (6-10 words). GOOD: "Pipes Fixed Before Dinner in ${business.city}" BAD: "Quality Plumbing Services"
- Services should be named as customers would say them, not industry jargon.

EXAMPLES:
- Hair salon headline: "The Cut That Actually Listens to Your Cowlicks"
- Cafe headline: "The Best $4 Latte This Side of Town"
- Gym headline: "Where You Show Up and Actually See Results"
- Plumber headline: "Floods, Leaks and Drips. We Handle It."

Output ONLY valid JSON in this exact format:
{
  "headline": "Bold, specific headline (6-10 words)",
  "subheadline": "One sentence that captures what makes this ${categoryDisplay} different in ${business.city}. Specific, not generic.",
  "cta": "Short call-to-action (2-4 words)",
  "story": "2-3 sentences. Write as if you interviewed the owner over coffee. Include a specific detail about how they work.",
  "values": "One sentence about what they actually believe in. Real, not corporate.",
  "servicesIntro": "One sentence introducing what they do.",
  "services": ["4 specific service names that real customers would search for"],
  "contactCta": "A compelling, conversational reason to reach out right now."
}`;

      let copyJson: {
        headline: string; subheadline: string; cta: string;
        story: string; values: string; servicesIntro: string;
        services: string[]; contactCta: string;
      };

      try {
        const raw = await callKimi([{ role: "user", content: prompt }], {
          temperature: 0.8, max_tokens: 1500, jsonMode: true, apiKey,
        });
        copyJson = JSON.parse(raw);
      } catch {
        copyJson = {
          headline: `${business.name} Makes ${categoryDisplay} Look Easy`,
          subheadline: `Real ${business.category.toLowerCase()} work done right in ${business.city}. No shortcuts, no surprises.`,
          cta: "Book a Visit",
          story: `${business.name} opened shop because they were tired of watching people in ${business.city} get overcharged for mediocre work. Every job gets the attention it deserves, start to finish.`,
          values: "Treat customers like neighbors, not invoices. Show up on time, do what you said you'd do, charge what's fair.",
          servicesIntro: `Here is what you can count on from ${business.name}:`,
          services: [
            `On-site ${business.category} Assessment`,
            `Full-service ${business.category} Work`,
            `Ongoing Maintenance and Support`,
            `Emergency ${business.category} Response`,
          ],
          contactCta: `Want to see what ${business.name} can do for you? Call or text anytime.`,
        };
      }

      const result = buildPage({
        name: business.name,
        category: business.category,
        city: business.city,
        phone: business.phone ?? undefined,
        address: business.address ?? undefined,
        email: business.email ?? undefined,
        heroCopy: { headline: copyJson.headline, subheadline: copyJson.subheadline, cta: copyJson.cta },
        aboutCopy: { story: copyJson.story, values: copyJson.values },
        servicesCopy: { intro: copyJson.servicesIntro, services: copyJson.services.slice(0, 6) },
        contactCopy: { cta: copyJson.contactCta },
      });

      // Build modular HTML (external CSS) for ZIP export
      const htmlModular = result.html.replace(/<style>[\s\S]*?<\/style>/, '<link rel="stylesheet" href="css/style.css">');

      const siteRecord = db
        .insert(generatedSites)
        .values({
          businessId: input.businessId,
          fullHtml: result.html,
          modularHtml: htmlModular,
          css: result.css,
          readme: result.readme,
          designArchetype: result.archetypeName,
          heroCopy: copyJson.headline + "\n" + copyJson.subheadline,
          aboutCopy: copyJson.story,
          servicesCopy: copyJson.services.join(", "),
          ctaCopy: copyJson.contactCta,
        })
        .returning()
        .get();

      db.update(businesses)
        .set({ status: "site_generated" })
        .where(eq(businesses.id, input.businessId))
        .run();

      return {
        siteId: siteRecord.id,
        archetype: result.archetypeName,
        hue: result.primaryHue,
        warnings: result.antiSlopWarnings,
        html: result.html,
      };
    }),

  // ZIP export — download editable site files
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
      zip.file("index.html", site.modularHtml || site.fullHtml);
      zip.file("css/style.css", site.css || "/* No CSS exported */");
      zip.file("README.md", site.readme || "# Generated Site");

      const blob = await zip.generateAsync({ type: "nodebuffer" });
      return {
        filename: `${site.designArchetype || "site"}-export.zip`,
        base64: blob.toString("base64"),
        size: blob.length,
      };
    }),

  // Live preview — serve generated site by ID
  preview: publicQuery
    .input(z.object({ siteId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const site = db
        .select()
        .from(generatedSites)
        .where(eq(generatedSites.id, input.siteId))
        .get();

      if (!site) throw new Error("Site not found");
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

  analyzePersonality: publicQuery
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const apiKey = ctx.apiKeys.openrouter;
      if (!apiKey && !process.env.OPENROUTER_API_KEY) {
        throw new Error("OpenRouter API key not configured. Add it in Settings.");
      }

      const db = getDb();
      const business = db.select().from(businesses).where(eq(businesses.id, input.businessId)).get();
      if (!business) throw new Error("Business not found");

      const prompt = `Analyze this local business and extract its personality profile for marketing purposes.

Business Name: ${business.name}
Category: ${business.category}
City: ${business.city}
${business.rating ? `Rating: ${business.rating}/5` : ""}
${business.reviewCount ? `Reviews: ${business.reviewCount}` : ""}

Return ONLY valid JSON:
{
  "tone": "One word: warm, professional, playful, serious, luxury, friendly, bold, etc.",
  "values": ["Value 1", "Value 2", "Value 3"],
  "differentiator": "What makes this business unique in 1 sentence",
  "audience": "Who their ideal customer is in 1 sentence",
  "style": "Visual style recommendation: minimalist, vibrant, elegant, rustic, modern, classic, etc."
}`;

      try {
        const raw = await callKimi([{ role: "user", content: prompt }], {
          temperature: 0.7, max_tokens: 800, jsonMode: true, apiKey,
        });
        const profile = JSON.parse(raw);
        db.update(businesses).set({ personalityProfile: JSON.stringify(profile) }).where(eq(businesses.id, input.businessId)).run();
        return profile;
      } catch {
        return { tone: "professional", values: ["quality", "service"], differentiator: "", audience: "", style: "modern" };
      }
    }),
});
