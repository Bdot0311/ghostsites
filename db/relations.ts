import { relations } from "drizzle-orm";
import { campaigns, businesses, generatedSites, emailCampaigns } from "./schema";

export const campaignsRelations = relations(campaigns, ({ many }) => ({
  businesses: many(businesses),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [businesses.campaignId],
    references: [campaigns.id],
  }),
  generatedSites: many(generatedSites),
  emailCampaigns: many(emailCampaigns),
}));

export const generatedSitesRelations = relations(generatedSites, ({ one }) => ({
  business: one(businesses, {
    fields: [generatedSites.businessId],
    references: [businesses.id],
  }),
}));

export const emailCampaignsRelations = relations(emailCampaigns, ({ one }) => ({
  business: one(businesses, {
    fields: [emailCampaigns.businessId],
    references: [businesses.id],
  }),
  site: one(generatedSites, {
    fields: [emailCampaigns.siteId],
    references: [generatedSites.id],
  }),
}));
