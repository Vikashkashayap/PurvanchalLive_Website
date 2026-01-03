import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { type News, newsAPI } from '../services/api';

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        const newsData = await newsAPI.getBySlug(slug);
        setNews(newsData);
      } catch (err) {
        console.error(err);
        setError('समाचार लोड करने में त्रुटि हुई।');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [slug]);

  /* ---------- UTILITIES ---------- */

  const stripHtml = (html: string = ''): string =>
    html.replace(/<[^>]*>?/gm, '').trim();

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600">लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600 px-4">
        <div className="text-center">
          <div className="text-4xl sm:text-6xl mb-4">😞</div>
          <p className="text-base sm:text-lg font-medium mb-4">{error || 'समाचार नहीं मिला'}</p>
          <Link to="/" className="btn-primary touch-target inline-block">
            मुखपृष्ठ पर जाएं
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- SEO SAFE VALUES ---------- */

  const cleanTitle = stripHtml(news.title);
  const cleanDescription = stripHtml(
    news.shortDescription || news.description
  ).slice(0, 155);

  const newsUrl = `${window.location.origin}/news/${news.slug}`;

  // For social sharing, we need absolute URLs
  const getAbsoluteUrl = (relativePath: string) => {
    // Ensure the path starts with / if it doesn't already
    const path = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
    // Remove any double slashes
    const cleanPath = path.replace(/\/+/g, '/');
    return `${window.location.origin}${cleanPath}`;
  };

  // Ensure image URL is properly formatted for social sharing
  const imageUrl = news.imageUrl
    ? getAbsoluteUrl(news.imageUrl)
    : undefined;
  const videoFileUrl = news.videoFileUrl
    ? getAbsoluteUrl(news.videoFileUrl)
    : undefined;

  // Helper function to get image MIME type from URL
  const getImageMimeType = (url: string): string => {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg'; // fallback
    }
  };


  /* ---------- SHARE ---------- */

  const shareOnWhatsApp = () => {
    let text = `${cleanTitle}\n\n`;

    // Add image URL if available for better preview
    if (imageUrl) {
      text += `${imageUrl}\n\n`;
    }

    text += `${newsUrl}`;

    // Add short description if available
    if (news.shortDescription) {
      const shortDesc = stripHtml(news.shortDescription);
      if (shortDesc.length > 100) {
        text += `\n\n${shortDesc.substring(0, 100)}...`;
      } else {
        text += `\n\n${shortDesc}`;
      }
    }

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(newsUrl);
    alert('लिंक कॉपी हो गई है!');
  };

  return (
    <>
      {/* ---------- SEO / OG TAGS ---------- */}
      <Helmet>
        <title>{cleanTitle} | Purvanchal Live</title>
        <meta name="description" content={cleanDescription} />

        {/* Open Graph - News Article */}
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Purvanchal Live" />
        <meta property="og:title" content={cleanTitle} />
        <meta property="og:description" content={cleanDescription} />
        <meta property="og:url" content={newsUrl} />
        <meta property="og:locale" content="hi_IN" />
        <meta property="article:author" content="Purvanchal Live" />
        <meta property="article:section" content={news.category} />
        <meta property="article:published_time" content={news.createdAt} />

        {/* News thumbnail - always try to use news image */}
        {imageUrl ? (
          <>
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:secure_url" content={imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:type" content={getImageMimeType(imageUrl)} />
            <meta property="og:image:alt" content={cleanTitle} />
          </>
        ) : (
          // Fallback to company logo only if no news image at all
          <>
            <meta property="og:image" content={`${window.location.origin}/favicon.png`} />
            <meta property="og:image:secure_url" content={`${window.location.origin}/favicon.png`} />
            <meta property="og:image:width" content="512" />
            <meta property="og:image:height" content="512" />
            <meta property="og:image:type" content="image/png" />
            <meta property="og:image:alt" content="Purvanchal Live" />
          </>
        )}

        {/* Twitter Cards - Large image for better engagement */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@purvanchallive" />
        <meta name="twitter:title" content={cleanTitle} />
        <meta name="twitter:description" content={cleanDescription} />
        {imageUrl && <meta name="twitter:image" content={imageUrl} />}
        {imageUrl && <meta name="twitter:image:alt" content={cleanTitle} />}
      </Helmet>

      {/* ---------- PAGE ---------- */}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:py-8">

          {/* Breadcrumb */}
          <nav className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-600">
            <Link to="/" className="text-blue-600 hover:underline">मुखपृष्ठ</Link> › <span className="text-gray-500">{news.category}</span>
          </nav>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight">{cleanTitle}</h1>

          {/* Short desc */}
          {news.shortDescription && (
            <p className="italic text-gray-700 border-l-4 border-blue-500 pl-3 sm:pl-4 mb-3 sm:mb-4 text-sm sm:text-base">
              {stripHtml(news.shortDescription)}
            </p>
          )}

          <p className="text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base">
            प्रकाशित: {formatDate(news.createdAt)}
          </p>

          {/* Share */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
            <button onClick={shareOnWhatsApp} className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors touch-target flex-1 sm:flex-none">
              📱 WhatsApp
            </button>
            <button onClick={copyLink} className="bg-gray-600 hover:bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors touch-target flex-1 sm:flex-none">
              🔗 कॉपी करें
            </button>
          </div>

          {/* Image */}
          {imageUrl && (
            <div className="mb-4 sm:mb-6">
              <img
                src={imageUrl}
                alt={cleanTitle}
                className="w-full rounded-lg shadow-sm"
                loading="lazy"
              />
            </div>
          )}

          {/* Content */}
          <article
            className="prose max-w-none bg-white p-4 sm:p-6 rounded-lg shadow-sm"
            dangerouslySetInnerHTML={{ __html: news.description }}
          />

          {/* Video */}
          {(news.videoUrl || videoFileUrl) && (
            <div className="mt-4 sm:mt-6">
              {news.videoUrl ? (
                // YouTube or external video URL
                <div className="relative w-full bg-gray-200 rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={news.videoUrl}
                    title={cleanTitle}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : videoFileUrl ? (
                // Uploaded video file
                <video
                  controls
                  className="w-full rounded-lg shadow-sm max-h-64 sm:max-h-96"
                  poster={imageUrl} // Use the news image as poster if available
                  preload="metadata"
                >
                  <source src={videoFileUrl} type="video/mp4" />
                  <source src={videoFileUrl} type="video/avi" />
                  <source src={videoFileUrl} type="video/mov" />
                  <source src={videoFileUrl} type="video/wmv" />
                  <source src={videoFileUrl} type="video/flv" />
                  <source src={videoFileUrl} type="video/webm" />
                  <source src={videoFileUrl} type="video/mkv" />
                  Your browser does not support the video tag.
                </video>
              ) : null}
            </div>
          )}

          <div className="mt-6 sm:mt-8 text-center">
            <Link to="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors touch-target">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              और समाचार देखें
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsDetail;
