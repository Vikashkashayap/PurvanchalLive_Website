import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { type News, newsAPI } from '../services/api';

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const newsData = await newsAPI.getById(id);
        setNews(newsData);
      } catch (err) {
        console.error('Error fetching news detail:', err);
        setError('समाचार लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id]);

  // Format date in Hindi style
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Share functions
  const shareOnWhatsApp = () => {
    if (!news) return;
    const text = `${news.title}\n\n${window.location.href}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareOnFacebook = () => {
    const url = window.location.href;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('लिंक कॉपी हो गई है!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">समाचार लोड हो रहा है...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">
              {error || 'समाचार नहीं मिला'}
            </div>
            <Link to="/" className="btn-primary">
              मुखपृष्ठ पर वापस जाएं
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            मुखपृष्ठ
          </Link>
          <span className="mx-2 text-gray-400">›</span>
          <span className="text-gray-600">{news.category}</span>
        </nav>

        {/* Article Header */}
        <header className="mb-8">
          <div className="mb-4">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {news.category}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {news.title}
          </h1>

          <div className="text-gray-600 text-lg mb-6">
            प्रकाशित: {formatDate(news.createdAt)}
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={shareOnWhatsApp}
              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.742.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
              </svg>
              WhatsApp
            </button>

            <button
              onClick={shareOnFacebook}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>

            <button
              onClick={copyLink}
              className="flex items-center bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              लिंक कॉपी करें
            </button>
          </div>
        </header>

        {/* Article Image */}
        {news.imageUrl && (
          <div className="mb-8">
            <img
              src={`http://localhost:5000${news.imageUrl}`}
              alt={news.title}
              className="w-full max-h-96 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                // Hide image if it fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Article Content */}
        <article className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div
            className="prose prose-lg max-w-none text-gray-800 leading-relaxed"
            style={{ fontFamily: "'Noto Sans Devanagari', sans-serif" }}
            dangerouslySetInnerHTML={{ __html: news.description }}
          />
        </article>

        {/* Video Section */}
        {(news.videoUrl || news.videoFileUrl) && (
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">वीडियो</h2>
            <div className="aspect-video">
              {news.videoUrl && (news.videoUrl.includes('youtube.com') || news.videoUrl.includes('youtu.be')) ? (
                <iframe
                  src={news.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  className="w-full h-full rounded-lg"
                  allowFullScreen
                  title="News Video"
                ></iframe>
              ) : news.videoFileUrl ? (
                <video
                  src={`http://localhost:5000${news.videoFileUrl}`}
                  controls
                  className="w-full h-full rounded-lg"
                >
                  आपका ब्राउज़र वीडियो सपोर्ट नहीं करता।
                </video>
              ) : (
                <video
                  src={`http://localhost:5000${news.videoUrl}`}
                  controls
                  className="w-full h-full rounded-lg"
                >
                  आपका ब्राउज़र वीडियो सपोर्ट नहीं करता।
                </video>
              )}
            </div>
          </div>
        )}

        {/* Back to Home */}
        <div className="text-center">
          <Link to="/" className="btn-primary">
            और समाचार देखें
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
