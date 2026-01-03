import express from 'express';
import News from '../models/News'; // Adjust the import if using a different news model path

const router = express.Router();

// Utility for returning absolute URLs - ensures full public URLs
function getAbsoluteUrl(path: string) {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // Ensure path starts with / and prepend domain
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  return `https://purvanchallive.in${cleanPath}`;
}

// Route for news SEO preview with OG meta tags
// Serves meta tags to ALL requests (bots and users) then redirects users to React frontend
router.get('/news/:slug', async (req, res) => {
  const slug = req.params.slug;

  // Fetch news by slug from MongoDB
  let news: any = null;
  try {
    news = await News.findOne({ slug, isPublished: true }).lean();
  } catch (e) {
    console.error('Error fetching news for SEO preview:', e);
  }

  // Handle 404 case
  if (!news) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang="hi">
      <head>
        <meta charset="UTF-8"/>
        <meta name="robots" content="noindex"/>
        <title>समाचार नहीं मिला | Purvanchal Live</title>
        <meta property="og:title" content="समाचार नहीं मिला | Purvanchal Live"/>
        <meta property="og:description" content="यह समाचार उपलब्ध नहीं है।"/>
        <meta property="og:image" content="https://purvanchallive.in/uploads/Purvanchal%20Live%20logo%20design-1767028215963-99748220.png"/>
        <meta property="og:url" content="https://purvanchallive.in/news/${slug}"/>
        <meta property="og:type" content="article"/>
        <meta name="twitter:card" content="summary_large_image"/>
        <script>window.location.href = "/#/news/${slug}";</script>
      </head>
      <body>
        <h1>समाचार उपलब्ध नहीं है</h1>
      </body>
      </html>
    `);
  }

  // Clean and prepare meta data
  const cleanTitle = (news.title || '').replace(/<[^>]+>/g, '').trim();

  // Use shortDescription or first 160 chars of description as fallback
  let cleanDescription = '';
  if (news.shortDescription) {
    cleanDescription = news.shortDescription.replace(/<[^>]+>/g, '').trim();
  } else {
    cleanDescription = (news.description || '').replace(/<[^>]+>/g, '').substring(0, 160).trim();
  }

  // Ensure absolute image URL with fallback to logo
  const absImage = getAbsoluteUrl(news.imageUrl) || 'https://purvanchallive.in/uploads/Purvanchal%20Live%20logo%20design-1767028215963-99748220.png';
  const absUrl = `https://purvanchallive.in/news/${news.slug}`;
  const category = news.category || '';
  const publishedTime = news.createdAt ? new Date(news.createdAt).toISOString() : '';

  // Return minimal HTML with OG meta tags + JavaScript redirect
  return res.send(`
  <!DOCTYPE html>
  <html lang="hi">
  <head>
    <meta charset="UTF-8"/>
    <title>${cleanTitle} | Purvanchal Live</title>
    <meta name="description" content="${cleanDescription}"/>

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article"/>
    <meta property="og:site_name" content="Purvanchal Live"/>
    <meta property="og:title" content="${cleanTitle}"/>
    <meta property="og:description" content="${cleanDescription}"/>
    <meta property="og:url" content="${absUrl}"/>
    <meta property="og:image" content="${absImage}"/>
    <meta property="og:image:width" content="1200"/>
    <meta property="og:image:height" content="630"/>
    <meta property="article:author" content="Purvanchal Live"/>
    <meta property="article:section" content="${category}"/>
    <meta property="article:published_time" content="${publishedTime}"/>

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="${cleanTitle}"/>
    <meta name="twitter:description" content="${cleanDescription}"/>
    <meta name="twitter:image" content="${absImage}"/>

    <!-- Redirect to React frontend -->
    <script>
      // Redirect to React SPA after meta tags are loaded
      if (window.location.pathname === '/news/${slug}') {
        window.location.href = '/#/news/${slug}';
      }
    </script>
  </head>
  <body>
    <!-- Minimal content for SEO bots -->
    <h1>${cleanTitle}</h1>
    <p>${cleanDescription}</p>
  </body>
  </html>
  `);
});

export default router;

