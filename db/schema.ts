import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const campaigns = sqliteTable("campaigns", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  query: text("query").notNull(),
  city: text("city").notNull(),
  category: text("category").notNull(),
  status: text("status").default("pending").notNull(),
  businessesFound: integer("businesses_found", { mode: "number" }).default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});

export const businesses = sqliteTable("businesses", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  address: text("address"),
  city: text("city").notNull(),
  phone: text("phone"),
  email: text("email"),
  websiteUrl: text("website_url"),
  websiteQuality: text("website_quality"),
  description: text("description"),
  hours: text("hours"),
  rating: integer("rating", { mode: "number" }),
  reviewCount: integer("review_count", { mode: "number" }),
  photos: text("photos", { mode: "json" }),
  personalityProfile: text("personality_profile", { mode: "json" }),
  status: text("status").default("scraped").notNull(),
  campaignId: integer("campaign_id", { mode: "number" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});

export const generatedSites = sqliteTable("generated_sites", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  businessId: integer("business_id", { mode: "number" }).notNull(),
  fullHtml: text("full_html").notNull(),
  modularHtml: text("modular_html"),
  css: text("css"),
  readme: text("readme"),
  designArchetype: text("design_archetype"),
  heroCopy: text("hero_copy"),
  aboutCopy: text("about_copy"),
  servicesCopy: text("services_copy"),
  ctaCopy: text("cta_copy"),
  generatedAt: integer("generated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});

export const emailCampaigns = sqliteTable("email_campaigns", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  businessId: integer("business_id", { mode: "number" }).notNull(),
  siteId: integer("site_id", { mode: "number" }),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").default("draft").notNull(),
  sentAt: integer("sent_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});
