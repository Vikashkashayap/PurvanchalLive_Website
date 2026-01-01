import express from 'express';
import News from '../models/News'; // Adjust the import if using a different news model path

const router = express.Router();

// List of user-agents considered crawlers/social media scrapers
function isSocialCrawler(userAgent: string | undefined) {
  if (!userAgent) return false;
  return /(facebookexternalhit|Twitterbot|WhatsApp|telegrambot|slackbot|vkShare|Discordbot|LinkedInBot|Pinterest|SkypeUriPreview)/i.test(userAgent);
}

// Utility for returning absolute URLs
function getAbsoluteUrl(path: string) {
  if (!path) return '';
  return path.startsWith('http') ? path : `https://purvanchallive.in${path.startsWith('/') ? path : '/' + path}`;
}

// Route for bot/crawler fallback meta tags
router.get('/news/:slug', async (req, res) => {
  const userAgent = req.headers['user-agent'];
  const isBot = isSocialCrawler(userAgent);

  // For normal users, redirect to SPA
  if (!isBot) {
    return res.redirect(302, `/#/news/${req.params.slug}`); // Change to fit frontend router if needed
  }

  const slug = req.params.slug;
  let news: any = null;
  try {
    news = await News.findOne({ slug, isPublished: true }).lean();
  } catch (e) {}
  if (!news) {
    return res.status(404).send(`
      <!DOCTYPE html>
      <html lang=\"hi\">
      <head>
        <meta charset=\"UTF-8\"/>
        <meta name=\"robots\" content=\"noindex\"/>
        <title>समाचार नहीं मिला | Purvanchal Live</title>
        <meta property=\"og:title\" content=\"समाचार नहीं मिला | Purvanchal Live\"/>
        <meta property=\"og:description\" content=\"यह समाचार उपलब्ध नहीं है.\"/>
        <meta property=\"og:image\" content=\"https://purvanchallive.in/favicon.png\"/>
        <meta property=\"og:url\" content=\"https://purvanchallive.in/news/${slug}\"/>
      </head>
      <body>
        <h1>समाचार उपलब्ध नहीं है</h1>
      </body>
      </html>
    `);
  }

  const cleanTitle = (news.title || '').replace(/<[^>]+>/g, '').trim();
  const cleanDescription = (news.shortDescription || news.description || '').replace(/<[^>]+>/g, '').substring(0, 185).trim();
  const absImage = getAbsoluteUrl(news.imageUrl) || 'https://purvanchallive.in/favicon.png';
  const absUrl = `https://purvanchallive.in/news/${news.slug}`;
  const category = news.category || '';
  const publishedTime = news.createdAt ? new Date(news.createdAt).toISOString() : '';

  res.send(`
  <!DOCTYPE html>
  <html lang=\"hi\">
  <head>
    <meta charset=\"UTF-8\"/>
    <title>${cleanTitle} | Purvanchal Live</title>
    <meta name=\"description\" content=\"${cleanDescription}\"/>
    <meta property=\"og:type\" content=\"article\"/>
    <meta property=\"og:site_name\" content=\"Purvanchal Live\"/>
    <meta property=\"og:title\" content=\"${cleanTitle}\"/>
    <meta property=\"og:description\" content=\"${cleanDescription}\"/>
    <meta property=\"og:url\" content=\"${absUrl}\"/>
    <meta property=\"og:image\" content=\"${absImage}\"/>
    <meta property=\"og:image:width\" content=\"1200\"/>
    <meta property=\"og:image:height\" content=\"630\"/>
    <meta property=\"article:author\" content=\"Purvanchal Live\"/>
    <meta property=\"article:section\" content=\"${category}\"/>
    <meta property=\"article:published_time\" content=\"${publishedTime}\"/>
    <meta name=\"twitter:card\" content=\"summary_large_image\"/>
    <meta name=\"twitter:site\" content=\"@purvanchallive\"/>
    <meta name=\"twitter:title\" content=\"${cleanTitle}\"/>
    <meta name=\"twitter:description\" content=\"${cleanDescription}\"/>
    <meta name=\"twitter:image\" content=\"${absImage}\"/>
  </head>
  <body>
    <!-- Page only for social media preview-->
    <h1>${cleanTitle}</h1>
    <span>Meta tags summary page for bots</span>
  </body>
  </html>
  `);
});

export default router;

