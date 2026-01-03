import { useState, useEffect, useMemo } from 'react';
import { type News, newsAPI } from '../services/api';
import NewsCard from '../components/NewsCard';
import NewsLogo from '../assets/NewsLogo.png';

interface HomeProps {
  selectedCategory?: string;
}

const Home = ({ selectedCategory = 'सभी' }: HomeProps) => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize filtered news for better performance
  const filteredNews = useMemo(() => {
    if (selectedCategory === 'सभी') {
      return news;
    }
    return news.filter(item => item.category === selectedCategory);
  }, [news, selectedCategory]);

  useEffect(() => {
    const fetchNews = async (category?: string) => {
      try {
        setLoading(true);
        const categoryParam = category === 'सभी' ? undefined : category;
        const response = await newsAPI.getAll(categoryParam);
        // Extract news array from response and filter only published news for public view
        const publishedNews = response.news.filter(item => item.isPublished);
        setNews(publishedNews);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('समाचार लोड करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
      } finally {
        setLoading(false);
      }
    };

    fetchNews(selectedCategory);
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600">समाचार लोड हो रहा है...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="text-center">
            <div className="text-red-600 text-base sm:text-lg mb-3 sm:mb-4">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary touch-target"
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
    


      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="text-gray-300 text-6xl sm:text-8xl mb-4 sm:mb-6">📰</div>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700 mb-3 sm:mb-4">
              कोई समाचार नहीं मिला
            </h2>
            <p className="text-gray-500 text-sm sm:text-base lg:text-lg max-w-md mx-auto px-4">
              {selectedCategory === 'सभी'
                ? 'अभी तक कोई समाचार प्रकाशित नहीं हुई है।'
                : `"${selectedCategory}" श्रेणी में कोई समाचार नहीं है।`}
            </p>
          </div>
        ) : (
          <>
            {/* <div className="mb-8 sm:mb-12 text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
                {selectedCategory === 'सभी' ? 'ताज़ा समाचार' : `${selectedCategory} समाचार`}
              </h2>
              <p className="text-gray-600 text-sm sm:text-base lg:text-xl max-w-2xl mx-auto px-4">
                {selectedCategory === 'सभी'
                  ? 'आपके गांव और आसपास की सभी महत्वपूर्ण खबरें'
                  : `${selectedCategory} श्रेणी से ताज़ा और महत्वपूर्ण समाचार`}
              </p>
              <div className="w-16 sm:w-24 h-1 bg-orange-500 mx-auto mt-4 sm:mt-6 rounded-full"></div>
            </div> */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {filteredNews.map((newsItem) => (
                <div key={newsItem._id} className="transform transition-all duration-300 hover:scale-105 active:scale-95">
                  <NewsCard news={newsItem} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-linear-to-r from-gray-800 to-gray-900 text-white py-8 sm:py-12 mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img
              src={NewsLogo}
              alt="गांव समाचार"
              className="h-12 sm:h-16 w-auto mx-auto mb-4 sm:mb-6 opacity-80"
            />
            <p className="text-lg sm:text-xl font-semibold mb-2">
               पूर्वांचल समाचार
            </p>
            <p className="text-gray-400 mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
            पूर्वांचल की ताजा खबरें, आपके लिए - विश्वसनीय और ताज़ा जानकारी
            </p>
            <div className="border-t border-gray-700 pt-4 sm:pt-6">
              <p className="text-gray-400 text-sm sm:text-base">
                © {new Date().getFullYear()} पूर्वांचल समाचार। सभी अधिकार सुरक्षित।
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
