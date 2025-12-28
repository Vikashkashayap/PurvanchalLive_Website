import { useState, useEffect } from 'react';
import { type News, newsAPI } from '../services/api';
import NewsCard from '../components/NewsCard';
import NewsLogo from '../assets/NewsLogo.png';

const Home = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const newsData = await newsAPI.getAll();
        // Filter only published news for public view
        const publishedNews = newsData.filter(item => item.isPublished);
        setNews(publishedNews);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('समाचार लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">समाचार लोड हो रहा है...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-red-600 text-lg mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              पुनः प्रयास करें
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      {/* <div className="bg-linear-to-r from-orange-600 to-orange-800 text-white py-16"> */}
      <div className="bg-orange-400 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <img
              src={NewsLogo}
              alt="गांव समाचार"
              className="h-24 w-auto mx-auto mb-4"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            गांव समाचार
          </h1>
          <p className="text-xl md:text-2xl opacity-90">
            आपके गांव की ताज़ा खबरें, आपके लिए
          </p>
        </div>
      </div>

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {news.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 text-6xl mb-4">📰</div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              कोई समाचार नहीं मिला
            </h2>
            <p className="text-gray-500">
              अभी तक कोई समाचार प्रकाशित नहीं हुई है।
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                ताज़ा समाचार
              </h2>
              <p className="text-gray-600 text-lg">
                आपके गांव और आसपास की सभी महत्वपूर्ण खबरें
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((newsItem) => (
                <NewsCard key={newsItem._id} news={newsItem} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg">
            © 2024 गांव समाचार। सभी अधिकार सुरक्षित।
          </p>
          <p className="text-gray-400 mt-2">
            आपके गांव की आवाज़, आपके लिए
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
