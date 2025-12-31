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
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error || !news) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error || 'समाचार नहीं मिला'}
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
    return `${window.location.origin}${relativePath}`;
  };

  const imageUrl = news.imageUrl
    ? getAbsoluteUrl(news.imageUrl)
    : undefined;
  const videoFileUrl = news.videoFileUrl
    ? getAbsoluteUrl(news.videoFileUrl)
    : undefined;

  /* ---------- SHARE ---------- */

  const shareOnWhatsApp = () => {
    const text = `${cleanTitle}\n\n${newsUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(newsUrl)}`,
      '_blank'
    );
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
        <meta property="article:author" content="Purvanchal Live" />
        <meta property="article:section" content={news.category} />
        <meta property="article:published_time" content={news.createdAt} />

        {/* Priority: News thumbnail over company logo */}
        {imageUrl ? (
          <>
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:type" content="image/jpeg" />
          </>
        ) : (
          // Fallback to company logo if no news image
          <meta property="og:image" content={`${window.location.origin}/favicon.png`} />
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
        <div className="max-w-4xl mx-auto px-4 py-8">

          {/* Breadcrumb */}
          <nav className="mb-4 text-sm text-gray-600">
            <Link to="/" className="text-blue-600">मुखपृष्ठ</Link> › {news.category}
          </nav>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-4">{cleanTitle}</h1>

          {/* Short desc */}
          {news.shortDescription && (
            <p className="italic text-gray-700 border-l-4 border-blue-500 pl-4 mb-4">
              {stripHtml(news.shortDescription)}
            </p>
          )}

          <p className="text-gray-500 mb-6">
            प्रकाशित: {formatDate(news.createdAt)}
          </p>

          {/* Share */}
          <div className="flex gap-3 mb-6">
            <button onClick={shareOnWhatsApp} className="bg-green-600 text-white px-4 py-2 rounded">
              WhatsApp
            </button>
            <button onClick={shareOnFacebook} className="bg-blue-600 text-white px-4 py-2 rounded">
              Facebook
            </button>
            <button onClick={copyLink} className="bg-gray-600 text-white px-4 py-2 rounded">
              लिंक कॉपी करें
            </button>
          </div>

          {/* Image */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt={cleanTitle}
              className="w-full rounded-lg mb-6"
            />
          )}

          {/* Video */}
          {(news.videoUrl || videoFileUrl) && (
            <div className="mb-6">
              {news.videoUrl ? (
                // YouTube or external video URL
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={news.videoUrl}
                    title={cleanTitle}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : videoFileUrl ? (
                // Uploaded video file
                <video
                  controls
                  className="w-full rounded-lg max-h-96"
                  poster={imageUrl} // Use the news image as poster if available
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

          {/* Content */}
          <article
            className="prose max-w-none bg-white p-6 rounded shadow"
            dangerouslySetInnerHTML={{ __html: news.description }}
          />

          <div className="mt-8 text-center">
            <Link to="/" className="text-blue-600">
              ← और समाचार देखें
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewsDetail;
