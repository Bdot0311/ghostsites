import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { businesses, generatedSites } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { callKimi } from "../lib/openrouter";
import { buildPage } from "../lib/impeccableDesign";

export const siteRouter = createRouter({
  generate: publicQuery
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input }) => {
      const rows = await getDb()
        .select()
        .from(businesses)
        .where(eq(businesses.id, input.businessId))
        .limit(1);

      const business = rows[0];
      if (!business) throw new Error("Business not found");

      // 1. Generate copy via Kimi
      const personalityPrompt = `You are a world-class copywriter writing for ${business.name}, a ${business.category} in ${business.city}.

Write punchy, specific website copy. NO generic filler. NO "Welcome to our website." NO "We are committed to excellence." NO "Your satisfaction is our priority."

Specificity rules. Use concrete nouns, active verbs, and sensory details. Write like a real person, not a brochure.

Output ONLY valid JSON in this exact format:
{
  "headline": "One bold headline (6-10 words)",
  "subheadline": "One sentence that explains what makes them different. Specific, not generic.",
  "cta": "Short call-to-action (2-4 words, e.g. 'Book a consultation', 'Get a free quote')",
  "story": "2-3 sentences about the business. Write as if you interviewed the owner. Include specific details about what they do and why they care.",
  "values": "1 sentence about their approach or values.",
  "servicesIntro": "1 sentence introducing their services.",
  "services": ["Service 1", "Service 2", "Service 3", "Service 4"],
  "contactCta": "A compelling reason to contact them now (1 sentence)"
}`;

      let copyJson: {
        headline: string;
        subheadline: string;
        cta: string;
        story: string;
        values: string;
        servicesIntro: string;
        services: string[];
        contactCta: string;
      };

      try {
        const raw = await callKimi(
          [{ role: "user", content: personalityPrompt }],
          { temperature: 0.8, max_tokens: 1500, jsonMode: true },
        );
        copyJson = JSON.parse(raw);
      } catch {
        // Fallback copy
        copyJson = {
          headline: `${business.name}: ${business.category} That Delivers`,
          subheadline: `Trusted ${business.category.toLowerCase()} serving ${business.city} with quality work and honest service.`,
          cta: "Get in Touch",
          story: `${business.name} has been serving the ${business.city} community with reliable ${business.category.toLowerCase()} services. We take pride in doing the job right the first time, every time.`,
          values: "We believe in transparent pricing, clear communication, and treating every customer like a neighbor.",
          servicesIntro: `Here is what ${business.name} offers:`,
          services: [
            `${business.category} Consultation`,
            `Professional ${business.category} Service`,
            `Ongoing ${business.category} Support`,
            `Emergency ${business.category} Assistance`,
          ],
          contactCta: `Ready to get started? Call ${business.name} today.`,
        };
      }

      // 2. Build the page using impeccable design system
      const result = buildPage({
        name: business.name,
        category: business.category,
        city: business.city,
        phone: business.phone ?? undefined,
        address: business.address ?? undefined,
        email: business.email ?? undefined,
        heroCopy: {
          headline: copyJson.headline,
          subheadline: copyJson.subheadline,
          cta: copyJson.cta,
        },
        aboutCopy: {
          story: copyJson.story,
          values: copyJson.values,
        },
        servicesCopy: {
          intro: copyJson.servicesIntro,
          services: copyJson.services.slice(0, 6),
        },
        contactCopy: {
          cta: copyJson.contactCta,
        },
      });

      // 3. Save to database
      const [siteRecord] = await getDb()
        .insert(generatedSites)
        .values({
          businessId: input.businessId,
          fullHtml: result.html,
          designArchetype: result.archetypeName,
          heroCopy: copyJson.headline + "\n" + copyJson.subheadline,
          aboutCopy: copyJson.story,
          servicesCopy: copyJson.services.join(", "),
          ctaCopy: copyJson.contactCta,
        })
        .$returningId();

      // 4. Update business status
      await getDb()
        .update(businesses)
        .set({ status: "site_generated" })
        .where(eq(businesses.id, input.businessId));

      return {
        siteId: siteRecord.id as number,
        archetype: result.archetypeName,
        hue: result.primaryHue,
        warnings: result.antiSlopWarnings,
        html: result.html,
      };
    }),

  getByBusiness: publicQuery
    .input(z.object({ businessId: z.number() }))
    .query(async ({ input }) => {
      const rows = await getDb()
        .select()
        .from(generatedSites)
        .where(eq(generatedSites.businessId, input.businessId))
        .orderBy(desc(generatedSites.generatedAt))
        .limit(1);
      return rows[0] ?? null;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await getDb()
        .select()
        .from(generatedSites)
        .where(eq(generatedSites.id, input.id))
        .limit(1);
      return rows[0] ?? null;
    }),

  list: publicQuery
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }).optional(),
    )
    .query(async ({ input }) => {
      const params = input ?? { limit: 20, offset: 0 };
      return getDb()
        .select()
        .from(generatedSites)
        .orderBy(desc(generatedSites.generatedAt))
        .limit(params.limit)
        .offset(params.offset);
    }),

  // Analyze personality via Kimi
  analyzePersonality: publicQuery
    .input(z.object({ businessId: z.number() }))
    .mutation(async ({ input }) => {
      const rows = await getDb()
        .select()
        .from(businesses)
        .where(eq(businesses.id, input.businessId))
        .limit(1);

      const business = rows[0];
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
          temperature: 0.7,
          max_tokens: 800,
          jsonMode: true,
        });
        const profile = JSON.parse(raw);

        await getDb()
          .update(businesses)
          .set({
            personalityProfile: JSON.stringify(profile),
          })
          .where(eq(businesses.id, input.businessId));

        return profile;
      } catch {
        return { tone: "professional", values: ["quality", "service"], differentiator: "", audience: "", style: "modern" };
      }
    }),
});
