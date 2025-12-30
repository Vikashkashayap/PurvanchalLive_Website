import { useState, useEffect } from 'react';
import { type News, newsAPI, type Category, categoryAPI } from '../services/api';
import NewsCard from '../components/NewsCard';
import NewsLogo from '../assets/NewsLogo.png';

const Home = () => {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('सभी');

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Enhanced Loading Hero */}
        <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 animate-pulse" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl mb-8">
              <img
                src={NewsLogo}
                alt="गांव समाचार"
                className="h-24 w-auto mx-auto drop-shadow-2xl"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">गांव समाचार</h1>
          </div>
        </div>

        {/* Enhanced Loading Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Animated Loading Spinner */}
            <div className="relative mb-8">
              <div className="w-20 h-20 border-4 border-orange-200 rounded-full mx-auto"></div>
              <div className="w-20 h-20 border-4 border-transparent border-t-orange-500 rounded-full mx-auto absolute top-0 animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Loading Text with Animation */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 animate-fade-in">समाचार लोड हो रहा है...</h2>
              <p className="text-gray-600 text-lg animate-fade-in" style={{ animationDelay: '0.3s' }}>
                कृपया कुछ क्षण प्रतीक्षा करें
              </p>

              {/* Animated Dots */}
              <div className="flex justify-center space-x-2 mt-6">
                <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>

            {/* Skeleton Loading Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gradient-to-r from-gray-200 to-gray-300"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-full"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-4/5"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/5"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/4"></div>
                      <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/3"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
        {/* Error Hero */}
        <div className="bg-gradient-to-br from-red-500 via-orange-500 to-pink-600 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl mb-8">
              <img
                src={NewsLogo}
                alt="गांव समाचार"
                className="h-24 w-auto mx-auto drop-shadow-2xl"
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-4">गांव समाचार</h1>
          </div>
        </div>

        {/* Enhanced Error Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            {/* Error Icon */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-red-400 to-orange-500 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-6 max-w-md mx-auto">
              <h2 className="text-3xl font-bold text-gray-800">क्षमा करें!</h2>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-red-100">
                <p className="text-red-600 text-lg font-medium mb-4">{error}</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-red-400 to-orange-500 h-2 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Retry Button */}
              <button
                onClick={() => window.location.reload()}
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-6 h-6 mr-3 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                पुनः प्रयास करें
              </button>

              {/* Alternative Actions */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors duration-300"
                >
                  ← वापस जाएं
                </button>
                <button
                  onClick={() => setError(null)}
                  className="px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-xl transition-colors duration-300"
                >
                  होम पर जाएं
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section */}
      <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white py-16 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 animate-pulse" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            animation: 'float 20s ease-in-out infinite'
          }}></div>
        </div>

        {/* Floating Shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce opacity-60"></div>
        <div className="absolute top-32 right-16 w-12 h-12 bg-white/10 rounded-full animate-bounce opacity-40" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-white/10 rounded-full animate-bounce opacity-50" style={{ animationDelay: '4s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="text-center">
            {/* Logo with enhanced styling */}
            <div className="mb-8 transform hover:scale-105 transition-transform duration-500">
              <div className="inline-block p-4 bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl">
                <img
                  src={NewsLogo}
                  alt="गांव समाचार"
                  className="h-32 md:h-40 w-auto mx-auto drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Enhanced tagline */}
            <h1 className="text-2xl md:text-4xl font-bold mb-4 animate-fade-in">
              गांव समाचार
            </h1>
            <p className="text-lg md:text-xl opacity-95 leading-relaxed max-w-3xl mx-auto mb-8 font-medium">
              आपके गांव की ताज़ा खबरें, आपके लिए - विश्वसनीय और ताज़ा जानकारी
            </p>

            {/* Enhanced feature badges */}
            <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm">
              <div className="group flex items-center bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/25 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                <span className="font-medium">ताज़ा अपडेट</span>
              </div>
              <div className="group flex items-center bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/25 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-3 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <span className="font-medium">विश्वसनीय सूचना</span>
              </div>
              <div className="group flex items-center bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20 hover:bg-white/25 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <div className="w-3 h-3 bg-purple-400 rounded-full mr-3 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <span className="font-medium">स्थानीय खबरें</span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="group flex items-center bg-gradient-to-r from-white/30 to-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 hover:bg-white/35 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
              >
                <svg className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="font-medium">रिफ्रेश करें</span>
              </button>
            </div>

            {/* Call to action arrow */}
            <div className="mt-12 animate-bounce">
              <svg className="w-8 h-8 mx-auto text-white/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Category Filter */}
      <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            {/* Enhanced section title */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">श्रेणी चुनें</h2>
              <p className="text-gray-600 text-lg">अपनी पसंदीदा श्रेणी में समाचार पढ़ें</p>
              <div className="w-20 h-1 bg-gradient-to-r from-orange-400 to-pink-500 mx-auto mt-4 rounded-full"></div>
            </div>

            {/* Enhanced category buttons */}
            <div className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">
              <button
                key="सभी"
                onClick={() => setSelectedCategory('सभी')}
                className={`group relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 ${
                  selectedCategory === 'सभी'
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-xl ring-4 ring-orange-200 scale-110 -translate-y-1'
                    : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-orange-50 hover:to-pink-50 border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg hover:text-orange-700'
                }`}
              >
                <span className="relative z-10 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2z" clipRule="evenodd" />
                  </svg>
                  सभी
                </span>
                {selectedCategory === 'सभी' && (
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl opacity-50 animate-pulse"></div>
                )}
              </button>
              {categories.map((category, index) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`group relative px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-500 transform hover:scale-110 hover:-translate-y-1 ${
                    selectedCategory === category.name
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl ring-4 ring-blue-200 scale-110 -translate-y-1'
                      : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg hover:text-blue-700'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="relative z-10 flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      selectedCategory === category.name ? 'bg-white animate-pulse' : 'bg-gray-400 group-hover:bg-blue-400'
                    }`}></div>
                    {category.name}
                  </span>
                  {selectedCategory === category.name && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl opacity-50 animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Active category indicator */}
            {selectedCategory !== 'सभी' && (
              <div className="mt-6 animate-fade-in">
                <p className="text-gray-600">
                  <span className="font-medium text-orange-600">"{selectedCategory}"</span> श्रेणी के समाचार दिखाए जा रहे हैं
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced News Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {news.length === 0 ? (
          <div className="text-center py-24">
            {/* Enhanced Empty State */}
            <div className="relative mb-12">
              <div className="w-32 h-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full mx-auto flex items-center justify-center shadow-2xl">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-orange-400 rounded-full animate-bounce opacity-75"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-blue-400 rounded-full animate-bounce opacity-50" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="space-y-6 animate-fade-in">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                कोई समाचार नहीं मिला
              </h2>
              <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 max-w-lg mx-auto">
                <p className="text-gray-600 text-xl mb-6 leading-relaxed">
                  {selectedCategory === 'सभी'
                    ? 'अभी तक कोई समाचार प्रकाशित नहीं हुई है।'
                    : `"${selectedCategory}" श्रेणी में कोई समाचार नहीं है।`}
                </p>

                {/* Progress indicator */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                  <div className="bg-gradient-to-r from-orange-400 to-pink-500 h-3 rounded-full animate-pulse w-1/3"></div>
                </div>

                {selectedCategory !== 'सभी' && (
                  <button
                    onClick={() => setSelectedCategory('सभी')}
                    className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-3 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    सभी समाचार देखें
                  </button>
                )}

                {/* Suggestions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500 mb-3">कोई विचार:</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">नई समाचार जल्द ही आएगी</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">पृष्ठ को रिफ्रेश करें</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">अन्य श्रेणी आजमाएं</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Enhanced Section Header */}
            <div className="mb-16 text-center">
              <div className="inline-block p-6 bg-gradient-to-r from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100 mb-8">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-2">
                      {selectedCategory === 'सभी' ? 'ताज़ा समाचार' : `${selectedCategory} समाचार`}
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {selectedCategory === 'सभी'
                        ? 'आपके गांव और आसपास की सभी महत्वपूर्ण खबरें'
                        : `${selectedCategory} श्रेणी से ताज़ा और महत्वपूर्ण समाचार`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Animated divider */}
              <div className="flex justify-center items-center space-x-4">
                <div className="w-16 h-1 bg-gradient-to-r from-transparent to-orange-400 rounded-full"></div>
                <div className="w-4 h-4 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full animate-pulse"></div>
                <div className="w-24 h-1 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 rounded-full"></div>
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-16 h-1 bg-gradient-to-l from-transparent to-blue-500 rounded-full"></div>
              </div>

              {/* News count badge */}
              <div className="mt-8">
                <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 font-semibold rounded-full border border-blue-200 shadow-sm">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {news.length} समाचार
                </span>
              </div>
            </div>

            {/* Enhanced News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {news.map((newsItem, index) => (
                <div
                  key={newsItem._id}
                  className="group transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="relative">
                    {/* Hover glow effect */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>

                    {/* Card with enhanced shadow */}
                    <div className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden group-hover:border-orange-200">
                      <NewsCard news={newsItem} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-16">
              <button className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <span>और समाचार लोड करें</span>
                <svg className="w-5 h-5 ml-3 group-hover:translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Enhanced Modern Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden mt-24">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-orange-500/10 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-16 w-12 h-12 bg-blue-500/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-pink-500/10 rounded-full animate-pulse" style={{ animationDelay: '4s' }}></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <div className="inline-block p-4 bg-white/5 backdrop-blur-sm rounded-3xl mb-6">
                <img
                  src={NewsLogo}
                  alt="गांव समाचार"
                  className="h-16 w-auto drop-shadow-lg"
                />
              </div>
              <h3 className="text-2xl font-bold mb-4">गांव समाचार</h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                आपके गांव की आवाज़, आपके लिए - विश्वसनीय और ताज़ा जानकारी
              </p>
              <div className="flex justify-center md:justify-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h4 className="text-xl font-bold mb-6 relative">
                <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">त्वरित लिंक</span>
                <div className="w-12 h-1 bg-gradient-to-r from-orange-400 to-pink-500 mx-auto mt-2 rounded-full"></div>
              </h4>
              <div className="space-y-3">
                {[
                  { name: 'सभी समाचार', href: '#' },
                  { name: 'ग्राम समाचार', href: '#' },
                  { name: 'राजनीति', href: '#' },
                  { name: 'शिक्षा', href: '#' },
                  { name: 'मौसम', href: '#' },
                ].map((link, index) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="block text-gray-300 hover:text-white hover:translate-x-2 transition-all duration-300 transform"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Contact & Stats */}
            <div className="text-center md:text-right">
              <h4 className="text-xl font-bold mb-6 relative">
                <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">हमारे बारे में</span>
                <div className="w-12 h-1 bg-gradient-to-r from-blue-400 to-purple-500 mx-auto mt-2 rounded-full"></div>
              </h4>
              <div className="space-y-4">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-orange-400 mb-1">24/7</div>
                  <div className="text-sm text-gray-300">समाचार अपडेट</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-blue-400 mb-1">100+</div>
                  <div className="text-sm text-gray-300">दैनिक समाचार</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-purple-400 mb-1">50K+</div>
                  <div className="text-sm text-gray-300">पाठक</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © {new Date().getFullYear()} गांव समाचार। सभी अधिकार सुरक्षित।
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors duration-300">गोपनीयता नीति</a>
                <span className="text-gray-600">|</span>
                <a href="#" className="hover:text-white transition-colors duration-300">सेवा की शर्तें</a>
                <span className="text-gray-600">|</span>
                <a href="#" className="hover:text-white transition-colors duration-300">संपर्क करें</a>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-8 text-center">
              <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 max-w-md mx-auto">
                <h5 className="text-lg font-semibold mb-2">नवीनतम समाचार प्राप्त करें</h5>
                <p className="text-gray-300 text-sm mb-4">हमारे न्यूज़लेटर के साथ अपडेट रहें</p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="ईमेल दर्ज करें"
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold rounded-r-xl transition-all duration-300 hover:scale-105">
                    सदस्यता लें
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
