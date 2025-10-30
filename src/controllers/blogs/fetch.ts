import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, like } from 'drizzle-orm';
import { blogs } from '../../db/schema';
import type { Context } from 'hono';

export const getAllBlogs = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);

    //  Parse query params
    const page = Math.max(Number(c.req.query('page')) || 1, 1);
    const limit = Math.min(Number(c.req.query('limit')) || 10, 100); // Cap at 100
    const category = c.req.query('category');
    const isPublished = c.req.query('published');
    const isFeatured = c.req.query('featured');
    const search = c.req.query('search'); // Optional text search

    //  Build conditions dynamically
    const conditions = [];

    if (category) conditions.push(eq(blogs.category, category));
    if (isPublished !== undefined) conditions.push(eq(blogs.isPublished, isPublished === 'true'));
    if (isFeatured !== undefined) conditions.push(eq(blogs.isFeatured, isFeatured === 'true'));
    if (search) conditions.push(like(blogs.title, `%${search}%`));

    // Base query with optional filtering
    const baseQuery = db.select().from(blogs);
    const query = conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    // Count total records
    const allBlogs = await query.all();
    const totalCount = allBlogs.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Paginated query (DB-level)
    const offset = (page - 1) * limit;
    const paginatedBlogs = await query
      .orderBy(desc(blogs.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    return c.json({
      success: true,
      message: `Fetched ${paginatedBlogs.length} blog posts`,
      data: paginatedBlogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error('Error fetching blogs:', error);
    return c.json({
      success: false,
      message: 'Internal Server Error',
    }, 500);
  }
};


export const getBlogBySlug = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const slug = c.req.param('slug');

    if (!slug) {
      return c.json({
        success: false,
        message: 'Slug parameter is required',
      }, 400);
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugRegex.test(slug)) {
      return c.json({
        success: false,
        message: 'Invalid slug format',
      }, 400);
    }

    const blog = await db
      .select()
      .from(blogs)
      .where(eq(blogs.slug, slug))
      .limit(1)
      .then(res => res.at(0));

    if (!blog) {
      return c.json({
        success: false,
        message: `Blog post with slug '${slug}' not found`,
      }, 404);
    }

    // Parse tags if they exist
    let parsedTags: any = null;
    if (blog.tags) {
      try {
        parsedTags = JSON.parse(blog.tags);
      } catch (error) {
        console.warn('Failed to parse blog tags:', error);
        parsedTags = blog.tags;
      }
    }

    return c.json({
      success: true,
      message: 'Blog post fetched successfully',
      data: {
        ...blog,
        tags: parsedTags,
      },
    });

  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    return c.json({
      success: false,
      message: 'Internal Server Error',
    }, 500);
  }
};


export const getBlogsByCategory = async (c: Context) => {
  try {
    const db = drizzle(c.env.DB);
    const category = c.req.param('category');

    if (!category) {
      return c.json({
        success: false,
        message: 'Category parameter is required',
      }, 400);
    }

    const page = Number(c.req.query('page')) || 1;
    const limit = Math.min(Number(c.req.query('limit')) || 10, 100);
    const isPublished = c.req.query('published');

    let query = db
      .select()
      .from(blogs)
      .where(eq(blogs.category, category));

    // Apply additional filters
    if (isPublished !== undefined) {
      // Note: You may need to chain multiple .where() calls depending on Drizzle version
      // This is a simplified approach
    }

    const result = await query.orderBy(desc(blogs.createdAt)).all();

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBlogs = result.slice(startIndex, endIndex);

    const totalCount = result.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Parse tags for each blog
    const blogsWithParsedTags = paginatedBlogs.map((blog: any) => {
      let parsedTags: any = null;
      if (blog.tags) {
        try {
          parsedTags = JSON.parse(blog.tags);
        } catch (error) {
          parsedTags = blog.tags;
        }
      }
      return { ...blog, tags: parsedTags };
    });

    return c.json({
      success: true,
      message: `Fetched ${paginatedBlogs.length} blog posts for category '${category}'`,
      data: blogsWithParsedTags,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (error) {
    console.error('Error fetching blogs by category:', error);
    return c.json({
      success: false,
      message: 'Internal Server Error',
    }, 500);
  }
};
