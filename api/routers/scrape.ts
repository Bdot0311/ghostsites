import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { campaigns, businesses } from "@db/schema";
import { searchPlaces, assessWebsiteQuality } from "../lib/googlePlaces";
import { eq } from "drizzle-orm";

export const scrapeRouter = createRouter({
  start: publicQuery
    .input(
      z.object({
        query: z.string().min(1),
        city: z.string().min(1),
        category: z.string().min(1),
        maxResults: z.number().min(1).max(50).default(20),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // 1. Create campaign
      const result = db
        .insert(campaigns)
        .values({
          query: input.query,
          city: input.city,
          category: input.category,
          status: "scraping",
        })
        .returning()
        .get();

      const campaignId = result.id;

      // 2. Scrape Google Places (use user's key if provided)
      const places = await searchPlaces(
        input.query,
        input.city,
        input.maxResults,
        ctx.apiKeys.googlePlaces,
      );

      // 3. Filter for businesses with poor/no websites
      const filtered = places.filter((place) => {
        const quality = assessWebsiteQuality(place.website);
        return quality === "none" || quality === "poor" || quality === "basic";
      });

      // 4. Insert businesses
      let inserted = 0;
      for (const place of filtered) {
        try {
          db.insert(businesses)
            .values({
              name: place.name,
              category: input.category,
              address: place.formatted_address ?? place.vicinity ?? "",
              city: input.city,
              phone: place.formatted_phone_number ?? "",
              websiteUrl: place.website,
              websiteQuality: assessWebsiteQuality(place.website),
              rating: place.rating ? Math.round(place.rating) : null,
              reviewCount: place.user_ratings_total ?? 0,
              photos: place.photos?.map((p) => p.photo_reference) ?? [],
              hours: place.opening_hours?.weekday_text?.join("\n") ?? "",
              campaignId: campaignId,
              status: "scraped",
            })
            .run();
          inserted++;
        } catch (err) {
          console.warn("Failed to insert business:", place.name, err);
        }
      }

      // 5. Update campaign
      db.update(campaigns)
        .set({ status: "completed", businessesFound: inserted })
        .where(eq(campaigns.id, campaignId))
        .run();

      return {
        campaignId,
        totalFound: places.length,
        filteredCount: filtered.length,
        inserted,
      };
    }),

  status: publicQuery
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(campaigns)
        .where(eq(campaigns.id, input.campaignId))
        .get() ?? null;
    }),

  listCampaigns: publicQuery.query(async () => {
    return getDb().select().from(campaigns).all();
  }),

  deleteCampaign: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      getDb().delete(businesses).where(eq(businesses.campaignId, input.id)).run();
      getDb().delete(campaigns).where(eq(campaigns.id, input.id)).run();
      return { success: true };
    }),
});
