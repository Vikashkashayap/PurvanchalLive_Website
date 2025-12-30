import { useState, useEffect, useMemo, useCallback } from 'react';
import { type News, newsAPI, type Category, categoryAPI } from '../services/api';
import NewsCard from '../components/NewsCard';
import NewsLogo from '../assets/NewsLogo.png';

const Home = () => {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('सभी');

  // Memoize filtered news for better performance
  const filteredNews = useMemo(() => {
    if (selectedCategory === 'सभी') {
      return news;
    }
    return news.filter(item => item.category === selectedCategory);
  }, [news, selectedCategory]);

  // Memoize category change handler
  const handleCategoryChange = useCallback((categoryName: string) => {
    setSelectedCategory(categoryName);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryAPI.getAll();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error fetching categories:', err);
        // Use default categories as fallback
        setCategories([
          { _id: '1', name: 'ग्राम समाचार', description: '', createdAt: '', updatedAt: '' },
          { _id: '2', name: 'राजनीति', description: '', createdAt: '', updatedAt: '' },
          { _id: '3', name: 'शिक्षा', description: '', createdAt: '', updatedAt: '' },
          { _id: '4', name: 'मौसम', description: '', createdAt: '', updatedAt: '' },
          { _id: '5', name: 'स्वास्थ्य', description: '', createdAt: '', updatedAt: '' },
          { _id: '6', name: 'कृषि', description: '', createdAt: '', updatedAt: '' },
          { _id: '7', name: 'मनोरंजन', description: '', createdAt: '', updatedAt: '' },
          { _id: '8', name: 'अन्य', description: '', createdAt: '', updatedAt: '' },
        ]);
      }
    };

    const fetchNews = async (category?: string) => {
      try {
        setLoading(true);
        const categoryParam = category === 'सभी' ? undefined : category;
        const newsData = await newsAPI.getAll(categoryParam);
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

    fetchCategories();
    fetchNews(selectedCategory);
  }, [selectedCategory]);

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
      <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 text-white py-8 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='20' cy='20' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="text-center">
            <div className="mb-3">
              <img
                src={NewsLogo}
                alt="गांव समाचार"
                className="h-40 w-auto mx-auto drop-shadow-lg"
              />
            </div>
            <p className="text-sm md:text-lg opacity-95 leading-relaxed max-w-2xl mx-auto">
            पूर्वांचल की ताजा खबरें, आपके लिए - विश्वसनीय और ताज़ा जानकारी
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm opacity-90">
            <span className="flex items-center bg-white/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              ताज़ा अपडेट
            </span>
            <span className="flex items-center bg-white/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              विश्वसनीय सूचना
            </span>
            <span className="flex items-center bg-white/10 px-3 py-1 rounded-full">
              <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
              स्थानीय खबरें
            </span>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              रिफ्रेश करें
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">श्रेणी चुनें</h2>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                key="सभी"
                onClick={() => handleCategoryChange('सभी')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === 'सभी'
                    ? 'bg-orange-500 text-white shadow-lg ring-2 ring-orange-300'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-orange-300 hover:shadow-md'
                }`}
              >
                सभी
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleCategoryChange(category.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category.name
                      ? 'bg-orange-500 text-white shadow-lg ring-2 ring-orange-300'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-orange-300 hover:shadow-md'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {filteredNews.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-gray-300 text-8xl mb-6">📰</div>
            <h2 className="text-3xl font-semibold text-gray-700 mb-4">
              कोई समाचार नहीं मिला
            </h2>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              {selectedCategory === 'सभी'
                ? 'अभी तक कोई समाचार प्रकाशित नहीं हुई है।'
                : `"${selectedCategory}" श्रेणी में कोई समाचार नहीं है।`}
            </p>
            {selectedCategory !== 'सभी' && (
              <button
                onClick={() => setSelectedCategory('सभी')}
                className="mt-6 btn-primary"
              >
                सभी समाचार देखें
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-12 text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {selectedCategory === 'सभी' ? 'ताज़ा समाचार' : `${selectedCategory} समाचार`}
              </h2>
              <p className="text-gray-600 text-xl max-w-2xl mx-auto">
                {selectedCategory === 'सभी'
                  ? 'आपके गांव और आसपास की सभी महत्वपूर्ण खबरें'
                  : `${selectedCategory} श्रेणी से ताज़ा और महत्वपूर्ण समाचार`}
              </p>
              <div className="w-24 h-1 bg-orange-500 mx-auto mt-6 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredNews.map((newsItem) => (
                <div key={newsItem._id} className="transform transition-all duration-300 hover:scale-105">
                  <NewsCard news={newsItem} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <img
              src={NewsLogo}
              alt="गांव समाचार"
              className="h-16 w-auto mx-auto mb-6 opacity-80"
            />
            <p className="text-xl font-semibold mb-2">
              गांव समाचार
            </p>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
            पूर्वांचल की ताजा खबरें, आपके लिए - विश्वसनीय और ताज़ा जानकारी
            </p>
            <div className="border-t border-gray-700 pt-6">
              <p className="text-gray-400">
                © {new Date().getFullYear()} गांव समाचार। सभी अधिकार सुरक्षित।
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
