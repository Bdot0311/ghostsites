import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { businesses, generatedSites } from "@db/schema";
import { like, desc, eq, and } from "drizzle-orm";

export const businessRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        search: z.string().optional(),
        status: z.string().optional(),
        city: z.string().optional(),
        category: z.string().optional(),
        limit: z.number().min(1).max(200).default(50),
        offset: z.number().min(0).default(0),
        noSite: z.boolean().optional(),
      }).optional(),
    )
    .query(async ({ input }) => {
      const params = input ?? { limit: 50, offset: 0 };
      const conditions = [];

      if (params.search) {
        conditions.push(like(businesses.name, `%${params.search}%`));
      }
      if (params.status) {
        conditions.push(eq(businesses.status, params.status));
      }
      if (params.city) {
        conditions.push(like(businesses.city, `%${params.city}%`));
      }
      if (params.category) {
        conditions.push(like(businesses.category, `%${params.category}%`));
      }

      let query;
      if (conditions.length > 0) {
        query = getDb()
          .select()
          .from(businesses)
          .where(and(...conditions))
          .orderBy(desc(businesses.createdAt))
          .limit(params.limit)
          .offset(params.offset);
      } else {
        query = getDb()
          .select()
          .from(businesses)
          .orderBy(desc(businesses.createdAt))
          .limit(params.limit)
          .offset(params.offset);
      }

      const rows = await query;

      // If noSite filter, filter in JS
      if (params.noSite) {
        const withSites = await getDb().select({ businessId: generatedSites.businessId }).from(generatedSites);
        const siteIds = new Set(withSites.map((s) => s.businessId));
        return rows.filter((r) => !siteIds.has(r.id));
      }

      return rows;
    }),

  count: publicQuery
    .input(
      z.object({
        status: z.string().optional(),
        city: z.string().optional(),
        category: z.string().optional(),
      }).optional(),
    )
    .query(async ({ input }) => {
      const params = input ?? {};
      const conditions = [];

      if (params.status) {
        conditions.push(eq(businesses.status, params.status));
      }
      if (params.city) {
        conditions.push(like(businesses.city, `%${params.city}%`));
      }
      if (params.category) {
        conditions.push(like(businesses.category, `%${params.category}%`));
      }

      let query;
      if (conditions.length > 0) {
        query = getDb().select().from(businesses).where(and(...conditions));
      } else {
        query = getDb().select().from(businesses);
      }

      const rows = await query;
      return rows.length;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const rows = await getDb()
        .select()
        .from(businesses)
        .where(eq(businesses.id, input.id))
        .limit(1);
      return rows[0] ?? null;
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        data: z.object({
          name: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          ownerName: z.string().optional(),
          status: z.string().optional(),
          personalityProfile: z.record(z.string(), z.unknown()).optional(),
        }),
      }),
    )
    .mutation(async ({ input }) => {
      const updateData: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(input.data)) {
        if (val !== undefined) {
          if (key === "personalityProfile") {
            updateData[key] = JSON.stringify(val);
          } else {
            updateData[key] = val;
          }
        }
      }

      await getDb()
        .update(businesses)
        .set(updateData)
        .where(eq(businesses.id, input.id));

      return { success: true };
    }),

  stats: publicQuery.query(async () => {
    const all = await getDb().select().from(businesses);

    const totalBusinesses = all.length;
    const noWebsite = all.filter((b) => b.websiteQuality === "none").length;
    const poorWebsite = all.filter((b) => b.websiteQuality === "poor").length;
    const basicWebsite = all.filter((b) => b.websiteQuality === "basic").length;
    const sitesGenerated = all.filter((b) => b.status === "site_generated" || b.status === "email_sent" || b.status === "email_ready").length;
    const emailsSent = all.filter((b) => b.status === "email_sent").length;
    const unsubscribed = all.filter((b) => b.unsubscribed).length;

    // Top cities
    const cityCounts: Record<string, number> = {};
    for (const b of all) {
      cityCounts[b.city] = (cityCounts[b.city] ?? 0) + 1;
    }
    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Top categories
    const catCounts: Record<string, number> = {};
    for (const b of all) {
      catCounts[b.category] = (catCounts[b.category] ?? 0) + 1;
    }
    const topCategories = Object.entries(catCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      totalBusinesses,
      noWebsite,
      poorWebsite,
      basicWebsite,
      sitesGenerated,
      emailsSent,
      unsubscribed,
      topCities,
      topCategories,
    };
  }),
});
