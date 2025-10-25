import { customAlphabet } from 'nanoid';
import { eq, and } from 'drizzle-orm';
import { blogs } from '../../db/schema';
import { drizzle } from 'drizzle-orm/d1';
import type { Context } from 'hono';

// Create a custom nanoid generator: 8 characters, A-Z + 0-9
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);

// Type definitions
interface BlogData {
  title: string;
  slug?: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string | string[] | any;
  authorName: string;
  authorId?: string;
  authorBio?: string;
  authorProfileImage?: string;
  authorTwitter?: string;
  authorLinkedIn?: string;
  featuredImage?: string;
  featuredImageAltText?: string;
  featuredImageWidth?: number;
  featuredImageHeight?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
  isApproved?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  postType?: string;
  relatedBlogs?: string | string[];
  status?: string;
  externalUrl?: string;
  translatedBlogs?: string | string[];
  publishedAt?: string;
}

// Valid status values
const VALID_STATUSES = ['draft', 'published', 'archived', 'scheduled'] as const;
const VALID_POST_TYPES = ['regular', 'video', 'gallery', 'quote', 'link'] as const;

// Validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const validateSlugFormat = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug) && slug.length <= 200;
};

const generateSlugFromTitle = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 200);
};

const parseJsonArray = (data: string | string[] | any, fieldName: string): string | null => {
  try {
    if (!data) return null;
    
    if (typeof data === 'string') {
      // Check if it's already JSON
      if (data.trim().startsWith('[')) {
        JSON.parse(data); // Validate JSON
        return data;
      }
      // Parse as CSV
      const items = data.split(',').map((item: string) => item.trim()).filter((item: string) => item.length > 0);
      return items.length > 0 ? JSON.stringify(items) : null;
    } else if (Array.isArray(data)) {
      const items = data.filter((item: any) => typeof item === 'string' && item.trim().length > 0);
      return items.length > 0 ? JSON.stringify(items) : null;
    } else if (typeof data === 'object') {
      return JSON.stringify(data);
    }
    
    throw new Error(`Invalid ${fieldName} format`);
  } catch (error) {
    throw new Error(`Failed to parse ${fieldName}: ${error instanceof Error ? error.message : 'Invalid format'}`);
  }
};

export const createBlogPost = async (c: Context) => {
  try {
    // Initialize database connection
    const db = drizzle(c.env.DB);
    
    // Parse request body
    let body: BlogData;
    try {
      body = await c.req.json();
    } catch (error) {
      return c.json({
        success: false,
        message: 'Invalid JSON in request body',
        error: 'INVALID_JSON'
      }, 400);
    }

    const {
      title,
      slug,
      content,
      excerpt,
      category,
      tags,
      authorName,
      authorId,
      authorBio,
      authorProfileImage,
      authorTwitter,
      authorLinkedIn,
      featuredImage,
      featuredImageAltText,
      featuredImageWidth,
      featuredImageHeight,
      isFeatured,
      isPublished,
      isApproved,
      seoTitle,
      seoDescription,
      postType,
      relatedBlogs,
      status,
      externalUrl,
      translatedBlogs,
      publishedAt
    } = body;

    // Validate required fields
    if (!title?.trim()) {
      return c.json({
        success: false,
        message: 'Title is required',
        error: 'MISSING_TITLE'
      }, 400);
    }

    if (!content?.trim()) {
      return c.json({
        success: false,
        message: 'Content is required',
        error: 'MISSING_CONTENT'
      }, 400);
    }

    if (!category?.trim()) {
      return c.json({
        success: false,
        message: 'Category is required',
        error: 'MISSING_CATEGORY'
      }, 400);
    }

    if (!authorName?.trim()) {
      return c.json({
        success: false,
        message: 'Author name is required',
        error: 'MISSING_AUTHOR_NAME'
      }, 400);
    }

    // Validate field lengths
    if (title.trim().length > 500) {
      return c.json({
        success: false,
        message: 'Title must be 500 characters or less',
        error: 'TITLE_TOO_LONG'
      }, 400);
    }

    if (excerpt && excerpt.trim().length > 1000) {
      return c.json({
        success: false,
        message: 'Excerpt must be 1000 characters or less',
        error: 'EXCERPT_TOO_LONG'
      }, 400);
    }

    // Generate or validate slug
    let finalSlug: string;
    if (slug) {
      if (!validateSlugFormat(slug)) {
        return c.json({
          success: false,
          message: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only (max 200 characters)',
          error: 'INVALID_SLUG_FORMAT'
        }, 400);
      }
      finalSlug = slug;
    } else {
      finalSlug = generateSlugFromTitle(title);
      
      if (!finalSlug) {
        return c.json({
          success: false,
          message: 'Unable to generate slug from title. Please provide a valid slug',
          error: 'SLUG_GENERATION_FAILED'
        }, 400);
      }
    }

    // Ensure slug uniqueness
    let isSlugUnique = false;
    let attemptCount = 0;
    let uniqueSlug = finalSlug;

    while (!isSlugUnique && attemptCount <= 10) {
      try {
        const existingBlog = await db
          .select({ id: blogs.id })
          .from(blogs)
          .where(eq(blogs.slug, uniqueSlug))
          .limit(1)
          .then(res => res.at(0));

        if (!existingBlog) {
          isSlugUnique = true;
        } else {
          attemptCount++;
          uniqueSlug = `${finalSlug}-${nanoid(4).toLowerCase()}`;
        }
      } catch (dbError) {
        console.error('Database error checking slug uniqueness:', dbError);
        return c.json({
          success: false,
          message: 'Database error while checking slug uniqueness',
          error: 'DB_QUERY_ERROR'
        }, 500);
      }
    }

    if (!isSlugUnique) {
      return c.json({
        success: false,
        message: 'Unable to generate unique slug after multiple attempts',
        error: 'SLUG_GENERATION_EXHAUSTED'
      }, 500);
    }

    // Validate and parse tags
    let parsedTags: string | null = null;
    if (tags) {
      try {
        parsedTags = parseJsonArray(tags, 'tags');
      } catch (error) {
        return c.json({
          success: false,
          message: error instanceof Error ? error.message : 'Invalid tags format',
          error: 'INVALID_TAGS'
        }, 400);
      }
    }

    // Validate and parse relatedBlogs
    let parsedRelatedBlogs: string | null = null;
    if (relatedBlogs) {
      try {
        parsedRelatedBlogs = parseJsonArray(relatedBlogs, 'relatedBlogs');
      } catch (error) {
        return c.json({
          success: false,
          message: error instanceof Error ? error.message : 'Invalid relatedBlogs format',
          error: 'INVALID_RELATED_BLOGS'
        }, 400);
      }
    }

    // Validate and parse translatedBlogs
    let parsedTranslatedBlogs: string | null = null;
    if (translatedBlogs) {
      try {
        parsedTranslatedBlogs = parseJsonArray(translatedBlogs, 'translatedBlogs');
      } catch (error) {
        return c.json({
          success: false,
          message: error instanceof Error ? error.message : 'Invalid translatedBlogs format',
          error: 'INVALID_TRANSLATED_BLOGS'
        }, 400);
      }
    }

    // Validate authorId email format if provided
    if (authorId && authorId.includes('@')) {
      if (!validateEmail(authorId)) {
        return c.json({
          success: false,
          message: 'Invalid email format for authorId',
          error: 'INVALID_AUTHOR_EMAIL'
        }, 400);
      }
    }

    // Validate URLs
    if (featuredImage && !validateUrl(featuredImage)) {
      return c.json({
        success: false,
        message: 'Invalid featured image URL',
        error: 'INVALID_FEATURED_IMAGE_URL'
      }, 400);
    }

    if (authorProfileImage && !validateUrl(authorProfileImage)) {
      return c.json({
        success: false,
        message: 'Invalid author profile image URL',
        error: 'INVALID_AUTHOR_PROFILE_IMAGE_URL'
      }, 400);
    }

    if (externalUrl && !validateUrl(externalUrl)) {
      return c.json({
        success: false,
        message: 'Invalid external URL',
        error: 'INVALID_EXTERNAL_URL'
      }, 400);
    }

    // Validate image dimensions
    if (featuredImageWidth !== undefined && (featuredImageWidth < 1 || featuredImageWidth > 10000)) {
      return c.json({
        success: false,
        message: 'Featured image width must be between 1 and 10000 pixels',
        error: 'INVALID_IMAGE_WIDTH'
      }, 400);
    }

    if (featuredImageHeight !== undefined && (featuredImageHeight < 1 || featuredImageHeight > 10000)) {
      return c.json({
        success: false,
        message: 'Featured image height must be between 1 and 10000 pixels',
        error: 'INVALID_IMAGE_HEIGHT'
      }, 400);
    }

    // Validate status
    const finalStatus = status?.toLowerCase() || 'draft';
    if (!VALID_STATUSES.includes(finalStatus as any)) {
      return c.json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        error: 'INVALID_STATUS'
      }, 400);
    }

    // Validate postType
    const finalPostType = postType?.toLowerCase() || 'regular';
    if (!VALID_POST_TYPES.includes(finalPostType as any)) {
      return c.json({
        success: false,
        message: `Invalid post type. Must be one of: ${VALID_POST_TYPES.join(', ')}`,
        error: 'INVALID_POST_TYPE'
      }, 400);
    }

    // Validate publishedAt date format
    let finalPublishedAt: string;
    if (publishedAt) {
      try {
        const date = new Date(publishedAt);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        finalPublishedAt = date.toISOString();
      } catch {
        return c.json({
          success: false,
          message: 'Invalid publishedAt date format. Use ISO 8601 format',
          error: 'INVALID_PUBLISHED_DATE'
        }, 400);
      }
    } else {
      finalPublishedAt = new Date().toISOString();
    }

    // Generate blog ID
    const blogId = `BLOG-${nanoid()}`;
    const now = new Date().toISOString();

    // Prepare blog data
    const blogData = {
      blogId,
      title: title.trim(),
      slug: uniqueSlug,
      content: content.trim(),
      excerpt: excerpt?.trim() || null,
      category: category.trim(),
      tags: parsedTags,
      authorName: authorName.trim(),
      authorId: authorId?.trim() || null,
      authorBio: authorBio?.trim() || null,
      authorProfileImage: authorProfileImage?.trim() || null,
      authorTwitter: authorTwitter?.trim() || null,
      authorLinkedIn: authorLinkedIn?.trim() || null,
      featuredImage: featuredImage?.trim() || null,
      featuredImageAltText: featuredImageAltText?.trim() || null,
      featuredImageWidth: featuredImageWidth || null,
      featuredImageHeight: featuredImageHeight || null,
      isFeatured: isFeatured ?? false,
      isPublished: isPublished ?? false,
      isApproved: isApproved ?? false,
      views: 0,
      comments: 0,
      upvotes: 0,
      downvotes: 0,
      shares: 0,
      seoTitle: seoTitle?.trim() || null,
      seoDescription: seoDescription?.trim() || null,
      postType: finalPostType,
      relatedBlogs: parsedRelatedBlogs,
      status: finalStatus,
      externalUrl: externalUrl?.trim() || null,
      language: 'en',
      translatedBlogs: parsedTranslatedBlogs,
      publishedAt: finalPublishedAt,
      createdAt: now,
      updatedAt: now,
    };

    // Insert new blog post
    let result;
    try {
      result = await db.insert(blogs).values(blogData).returning();
    } catch (dbError: any) {
      console.error('Database error creating blog post:', dbError);
      
      // Handle specific database errors
      if (dbError?.message?.includes('UNIQUE constraint failed')) {
        return c.json({
          success: false,
          message: 'A blog with this slug or ID already exists',
          error: 'DUPLICATE_ENTRY'
        }, 409);
      }
      
      return c.json({
        success: false,
        message: 'Database error while creating blog post',
        error: 'DB_INSERT_ERROR'
      }, 500);
    }

    if (!result || result.length === 0) {
      return c.json({
        success: false,
        message: 'Failed to create blog post',
        error: 'INSERT_FAILED'
      }, 500);
    }

    // Return success response
    return c.json({
      success: true,
      message: 'Blog post created successfully',
      data: {
        id: result[0].id,
        blogId,
        slug: uniqueSlug,
        title: title.trim(),
        status: finalStatus,
        isPublished: isPublished ?? false,
        createdAt: now,
      },
    }, 201);

  } catch (error) {
    console.error('Unexpected error creating blog post:', error);
    return c.json({
      success: false,
      message: 'An unexpected error occurred',
      error: 'INTERNAL_SERVER_ERROR'
    }, 500);
  }
};