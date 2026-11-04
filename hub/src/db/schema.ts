import { boolean, integer, jsonb, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  activeProducts: jsonb("active_products").$type<string[]>().notNull().default([]),
  plan: text("plan").notNull().default("free"),
  role: text("role").$type<"admin" | "member">().notNull().default("member"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<Record<string, unknown>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pricingConfigurations = pgTable(
  "pricing_configurations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    targetId: text("target_id").notNull(),
    patternId: text("pattern_id").notNull(),
    stripePriceId: text("stripe_price_id").notNull(),
    currency: text("currency").notNull(),
    trialDays: integer("trial_days").notNull().default(0),
    isActive: boolean("is_active").notNull().default(false),
  },
  (table) => [unique("pricing_configurations_target_pattern").on(table.targetId, table.patternId)],
);

export const productBundles = pgTable("product_bundles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  includedProductIds: jsonb("included_product_ids").$type<string[]>().notNull(),
  description: text("description").notNull().default(""),
});

export const abTests = pgTable("ab_tests", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  targetId: text("target_id").notNull(),
  status: text("status").$type<"draft" | "running" | "paused" | "finished">().notNull().default("draft"),
  trafficRatioA: integer("traffic_ratio_a").notNull().default(50),
  variantAPatternId: text("variant_a_pattern_id").notNull(),
  variantAPriceId: text("variant_a_price_id").notNull(),
  variantBPatternId: text("variant_b_pattern_id").notNull(),
  variantBPriceId: text("variant_b_price_id").notNull(),
});

export const abTestEvents = pgTable("ab_test_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  testId: text("test_id").notNull(),
  userId: text("user_id"),
  visitorId: text("visitor_id"),
  variant: text("variant").$type<"A" | "B">().notNull(),
  eventType: text("event_type").$type<"impression" | "checkout_start" | "conversion">().notNull(),
  amountCents: integer("amount_cents"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type PricingConfigurationRow = typeof pricingConfigurations.$inferSelect;
export type ProductBundleRow = typeof productBundles.$inferSelect;
export type AbTestRow = typeof abTests.$inferSelect;
export type AbTestEventRow = typeof abTestEvents.$inferSelect;
