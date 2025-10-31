import { Hono } from 'hono';
import { createBlogPost } from '../controllers/blogs/create';
import { getAllBlogs, getBlogById, getBlogBySlug, getBlogsByAuthor, getBlogsByCategory, getFeaturedBlogs } from '../controllers/blogs/fetch';

const blogRoutes = new Hono();

blogRoutes.post('/create-post', createBlogPost);
blogRoutes.get('/get-all', getAllBlogs);
blogRoutes.get('/get/:slug', getBlogBySlug);
blogRoutes.get('/category/:category', getBlogsByCategory);
blogRoutes.get('/get-by-id/:blogId',getBlogById);
blogRoutes.get('/get-by-author/:authorId',getBlogsByAuthor); // fetches all the blogs by a specific author
blogRoutes.get('/featured',getFeaturedBlogs);
// blogRoutes.put('/update/:slug', updateBlogPost);
// blogRoutes.delete('/delete/:slug', deleteBlogPost);

export default blogRoutes;