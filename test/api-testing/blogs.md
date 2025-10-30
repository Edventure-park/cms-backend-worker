
## Create Blog Post 
- Req Type: POST
- URL: http://127.0.0.1:8787/blog/create-post
```
{
  "title": "10 Proven Tips to Improve Web Performance in 2025",
  "slug": "improve-web-performance-2025",
  "excerpt": "Learn the most effective techniques to make your websites faster, more efficient, and user-friendly in 2025.",
  "content": "Web performance is one of the most important aspects of modern web development. In this guide, we'll explore caching strategies, image optimization, and lazy loading to make your site blazing fast.",
  "category": "Web Development",
  "tags": ["performance", "frontend", "optimization"],
  
  "authorName": "Jane Doe",
  "authorId": "jane.doe@example.com",
  "authorBio": "Jane is a senior front-end engineer with over 10 years of experience optimizing large-scale web applications.",
  "authorProfileImage": "https://cdn.example.com/authors/jane-doe.jpg",
  
  "featuredImage": "https://cdn.example.com/blogs/web-performance-2025.jpg",
  "featuredImageAltText": "A laptop with code showing web optimization tools",
  "featuredImageWidth": 1200,
  "featuredImageHeight": 628,
  
  "isFeatured": true,
  "isPublished": true,
  "isApproved": true,
  
  "seoTitle": "Improve Website Performance in 2025 | 10 Proven Tips",
  "seoDescription": "A complete guide to boosting your website’s speed and performance using modern techniques in 2025.",
  
  "postType": "regular",
  "relatedBlogs": ["BLOG-1234ABCD", "BLOG-5678EFGH"],
  "status": "published",
  "externalUrl": "https://example.com/full-guide",
  
  "scheduledAt": "2025-11-10T10:00:00.000Z",
  "publishedAt": "2025-10-31T12:30:00.000Z"
}
```

## Get-all blogs paginated API
- req. type: GET
- url: http://127.0.0.1:8787/blog/get-all
    -> Return the first 10 blog posts (because limit defaults to 10).
    -> Page number defaults to 1.
    -> Sorted by createdAt descending (newest first).
```
GET http://127.0.0.1:8787/blog/get-all?page=2&limit=5&category=AI&published=true
```
What happens:
- Connects to DB
- Filters: category = 'AI' AND isPublished = true
- Fetches 5 posts (page 2)
- Orders by newest
- Returns JSON with data + pagination info