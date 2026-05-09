import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { businesses, emailCampaigns, generatedSites } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { callKimi } from "../lib/openrouter";

export const emailRouter = createRouter({
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

      const site = db
        .select()
        .from(generatedSites)
        .where(eq(generatedSites.businessId, input.businessId))
        .orderBy(desc(generatedSites.generatedAt))
        .get();

      let personality: Record<string, unknown> = {};
      try {
        if (business.personalityProfile) {
          personality = JSON.parse(business.personalityProfile as string);
        }
      } catch { /* ignore */ }

      const prompt = `You are a cold outreach expert who writes emails that actually get replies. Write a short, punchy email to ${business.name}, a ${business.category} in ${business.city}.

PERSONALITY PROFILE:
${personality.tone ? `Tone: ${personality.tone}` : ""}
${personality.differentiator ? `Differentiator: ${personality.differentiator}` : ""}
${personality.audience ? `Audience: ${personality.audience}` : ""}

RULES:
- Subject line: 4-7 words, curiosity-driven, NOT "Website proposal" or "Quick question"
- First line: Show you did research. Reference something specific about their business type or city.
- Body: 2-3 short paragraphs max. Mention we built a mockup of their new website. No long sales pitch.
- CTA: One clear next step — "Take a look" or "Reply if you're curious"
- Sign as "Alex" — a real person, not a company.
- NO: "Dear Sir/Madam", "I hope this finds you well", "In today's digital world", "We are a leading", emojis, or fake urgency.
- YES: Specific details, conversational tone, genuine curiosity.

Return ONLY valid JSON:
{
  "subject": "The subject line",
  "body": "The full email body with line breaks as \\n"
}`;

      let result: { subject: string; body: string };
      try {
        const raw = await callKimi([{ role: "user", content: prompt }], {
          temperature: 0.8,
          max_tokens: 1000,
          jsonMode: true,
          apiKey,
        });
        result = JSON.parse(raw);
      } catch {
        result = {
          subject: `Your ${business.category} website could look sharper`,
          body: `Hi there,\n\nI came across ${business.name} while looking up ${business.category.toLowerCase()} in ${business.city}. I noticed your current online presence doesn't quite match what I imagine the in-person experience is like.\n\nI put together a quick mockup of what a new site could look like — no cost, no commitment, just wanted to share.\n\nCurious? Just reply and I'll send the link.\n\nAlex`,
        };
      }

      const campaign = db.insert(emailCampaigns)
        .values({
          businessId: input.businessId,
          siteId: site?.id ?? null,
          subject: result.subject,
          body: result.body,
          status: "draft",
        })
        .returning()
        .get();

      db.update(businesses)
        .set({ status: "email_ready" })
        .where(eq(businesses.id, input.businessId))
        .run();

      return { ...result, emailId: campaign.id };
    }),

  // Send email via user's connected platform
  send: publicQuery
    .input(z.object({ emailId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const apiUrl = ctx.apiKeys.emailApiUrl;
      if (!apiUrl) {
        throw new Error("No email sending platform configured. Add your API URL in Settings.");
      }

      const db = getDb();
      const email = db
        .select()
        .from(emailCampaigns)
        .where(eq(emailCampaigns.id, input.emailId))
        .get();

      if (!email) throw new Error("Email not found");

      const business = db
        .select()
        .from(businesses)
        .where(eq(businesses.id, email.businessId))
        .get();

      if (!business) throw new Error("Business not found");

      // POST to user's email platform
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: business.email || business.name,
          subject: email.subject,
          body: email.body,
          businessId: business.id,
          businessName: business.name,
          businessCategory: business.category,
          businessCity: business.city,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Email platform returned ${res.status}: ${text.slice(0, 200)}`);
      }

      // Mark as sent
      db.update(emailCampaigns)
        .set({ status: "sent", sentAt: new Date() })
        .where(eq(emailCampaigns.id, input.emailId))
        .run();

      db.update(businesses)
        .set({ status: "email_sent" })
        .where(eq(businesses.id, email.businessId))
        .run();

      return { success: true, status: res.status };
    }),

  list: publicQuery
    .input(
      z.object({
        businessId: z.number().optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
    )
    .query(async ({ input }) => {
      const limit = input.limit ?? 20;
      const offset = input.offset ?? 0;

      if (input.businessId) {
        return getDb()
          .select()
          .from(emailCampaigns)
          .where(eq(emailCampaigns.businessId, input.businessId))
          .orderBy(desc(emailCampaigns.createdAt))
          .limit(limit)
          .offset(offset)
          .all();
      }

      return getDb()
        .select()
        .from(emailCampaigns)
        .orderBy(desc(emailCampaigns.createdAt))
        .limit(limit)
        .offset(offset)
        .all();
    }),

  updateStatus: publicQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["draft", "sent", "replied", "bounced"]),
      }),
    )
    .mutation(async ({ input }) => {
      getDb()
        .update(emailCampaigns)
        .set({ status: input.status })
        .where(eq(emailCampaigns.id, input.id))
        .run();
      return { success: true };
    }),
});
