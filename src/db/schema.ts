import { sqliteTable, text, integer, real, index, unique } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const blogs = sqliteTable("blogs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  
  // Unique blog identifier
  blogId: text("blog_id").notNull().unique(),

  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),

  excerpt: text("excerpt"),
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

  // New fields
  comments: integer("comments").default(0).notNull(),
  upvotes: integer("upvotes").default(0).notNull(),
  downvotes: integer("downvotes").default(0).notNull(),
  publishedAt: text("published_at").notNull(),
  shares: integer("shares").default(0).notNull(),
  authorBio: text("author_bio"),
  authorProfileImage: text("author_profile_image"),
  postType: text("post_type").default("regular").notNull(),
  relatedBlogs: text("related_blogs"),
  status: text("status").default("draft").notNull(),
  externalUrl: text("external_url"),
  language: text("language").default("en").notNull(),
  featuredImageWidth: integer("featured_image_width"),
  featuredImageHeight: integer("featured_image_height"),
  authorTwitter: text("author_twitter"),
  authorLinkedIn: text("author_linkedin"),
  translatedBlogs: text("translated_blogs"),
  isApproved: integer("is_approved", { mode: "boolean" }).default(false).notNull(),
});
