import { Hono } from 'hono';
import { createBlogPost } from '../controllers/blogs/create';
import { getAllBlogs, getBlogBySlug, getBlogsByCategory } from '../controllers/blogs/fetch';

const blogRoutes = new Hono();

blogRoutes.post('/create-post', createBlogPost);
blogRoutes.get('/get-all', getAllBlogs);
blogRoutes.get('/get/:slug', getBlogBySlug);
blogRoutes.get('/category/:category', getBlogsByCategory);
// blogRoutes.put('/update/:slug', updateBlogPost);
// blogRoutes.delete('/delete/:slug', deleteBlogPost);

export default blogRoutes;