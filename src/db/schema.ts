import { sqliteTable, text, integer, real, index, unique } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const blogs = sqliteTable("blogs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Unique blog identifier
  blogId: text("blog_id").notNull().unique(),

  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),

  excerpt: text("excerpt"), // short intro or summary of the blog post
  content: text("content").notNull(),

  category: text("category").notNull(),
  tags: text("tags"),

  authorName: text("author_name").notNull(),
  authorId: text("author_id"),

  featuredImage: text("featured_image"),
  featuredImageAltText: text("featured_image_alt_text"),

  isFeatured: integer("is_featured", { mode: "boolean" }).default(false).notNull(),
  isPublished: integer("is_published", { mode: "boolean" }).default(false).notNull(),

  views: integer("views").default(0).notNull(),

  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),

  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),

  estimatedReadTime: integer("estimated_read_time"),  
  scheduledAt: text("scheduled_at"),

  // New fields
  comments: integer("comments").default(0).notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  publishedAt: text("published_at").notNull(),
  shares: integer("shares").default(0).notNull(),
  authorBio: text("author_bio"),
  authorProfileImage: text("author_profile_image"),
  relatedBlogs: text("related_blogs"),
  status: text("status").default("draft").notNull(),
  externalUrl: text("external_url"),
});

export const mailServers = sqliteTable("mail_servers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Server identification
  serverId: text("server_id").notNull().unique(), // e.g., "MAIL-SERVER-001"
  name: text("name").notNull(), // e.g., "mail-server-1"
  hostname: text("hostname").notNull(), // 'resend', 'mailtrap'
  
  // Limits and usage
  dailyLimit: integer("daily_limit").notNull(),
  monthlyLimit: integer("monthly_limit").notNull(),
  dailySent: integer("daily_sent").default(0).notNull(), // sent in a day
  monthlySent: integer("monthly_sent").default(0).notNull(), // sent in a month
  
  // Reset tracking
  lastDailyReset: text("last_daily_reset").notNull(),
  lastMonthlyReset: text("last_monthly_reset").notNull(),
  
  // Server status
  status: text("status").default("active").notNull(), // active, cooldown, disabled, maintenance
  priority: integer("priority").default(0).notNull(), // Higher priority servers used first
  
  // Health tracking
  consecutiveFailures: integer("consecutive_failures").default(0).notNull(),
  
  // Metadata
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
}, (table) => ({
  statusIdx: index("idx_mail_servers_status").on(table.status),
  priorityIdx: index("idx_mail_servers_priority").on(table.priority),
}));