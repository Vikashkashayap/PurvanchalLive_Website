import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { type News, newsAPI, getBackendBaseUrl, isAuthenticated, type Category, categoryAPI } from '../../services/api';

const Dashboard = () => {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('सभी');

  useEffect(() => {
    // Only fetch data if user is authenticated
    if (isAuthenticated()) {
      fetchCategories();
      fetchNews();
    } else {
      setLoading(false);
      setError('Authentication required. Please log in again.');
    }
  }, []);

  // Refresh data when returning from form (check URL parameters)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('refresh') === 'true') {
      // Clean URL and refetch
      window.history.replaceState({}, '', window.location.pathname);
      if (isAuthenticated()) {
        fetchCategories();
        fetchNews();
      }
    }
  }, []);

  // Refetch news when category filter changes
  useEffect(() => {
    if (isAuthenticated() && !loading) {
      fetchNews(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const categoriesData = await categoryAPI.getAll();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Don't set error for categories as it's not critical
    }
  };

  const fetchNews = async (category?: string) => {
    try {
      setLoading(true);
      const categoryParam = category === 'सभी' ? undefined : category;
      const newsData = await newsAPI.getAll(categoryParam);
      // Sort by creation date (newest first)
      const sortedNews = newsData.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNews(sortedNews);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('समाचार लोड करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('क्या आप इस समाचार को हटाना चाहते हैं? यह क्रिया वापस नहीं ली जा सकती।')) {
      return;
    }

    try {
      setDeletingId(id);
      await newsAPI.delete(id);
      setNews(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error deleting news:', err);
      alert('समाचार हटाने में त्रुटि हुई।');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublishToggle = async (newsItem: News) => {
    try {
      const formData = new FormData();
      formData.append('title', newsItem.title);
      formData.append('description', newsItem.description);
      formData.append('category', newsItem.category);
      formData.append('isPublished', (!newsItem.isPublished).toString());
      if (newsItem.videoUrl) {
        formData.append('videoUrl', newsItem.videoUrl);
      }

      await newsAPI.update(newsItem._id, formData);
      await fetchNews(); // Refresh the list
    } catch (err) {
      console.error('Error updating news:', err);
      alert('समाचार अपडेट करने में त्रुटि हुई।');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">डेटा लोड हो रहा है...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">एडमिन डैशबोर्ड</h1>
            <p className="text-gray-600 mt-2">सभी समाचार प्रबंधित करें</p>
          </div>
          <div className="flex space-x-4">
            <Link
              to="/admin/categories"
              className="btn-secondary"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 1v4m8-4v4" />
              </svg>
              श्रेणी प्रबंधन
            </Link>
            <button
              onClick={() => fetchNews(selectedCategory)}
              disabled={loading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              रिफ्रेश करें
            </button>
            <Link
              to="/admin/news/new"
              className="btn-primary"
            >
              नई खबर जोड़ें
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{news.length}</div>
            <div className="text-gray-600">कुल समाचार</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {news.filter(item => item.isPublished).length}
            </div>
            <div className="text-gray-600">प्रकाशित</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">
              {news.filter(item => !item.isPublished).length}
            </div>
            <div className="text-gray-600">ड्राफ्ट</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">श्रेणी फिल्टर</h3>
              <p className="text-sm text-gray-600">चुनिंदा श्रेणी की समाचार देखें</p>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field max-w-xs"
              disabled={loading}
            >
              <option value="सभी">सभी श्रेणियां</option>
              {categories.map(category => (
                <option key={category._id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* News Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {news.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📰</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                कोई समाचार नहीं
              </h2>
              <p className="text-gray-500 mb-6">
                पहली समाचार जोड़ने के लिए "नई खबर जोड़ें" बटन पर क्लिक करें।
              </p>
              <Link
                to="/admin/news/new"
                className="btn-primary"
              >
                नई खबर जोड़ें
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      समाचार
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      श्रेणी
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      स्थिति
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      दिनांक
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      कार्य
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {news.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.imageUrl && (
                            <img
                              className="h-12 w-12 rounded-lg object-cover mr-3"
                              src={`${getBackendBaseUrl()}${item.imageUrl}`}
                              alt={item.title}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">
                              {item.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                              {item.description.substring(0, 50)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handlePublishToggle(item)}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {item.isPublished ? 'प्रकाशित' : 'ड्राफ्ट'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/news/${item._id}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            देखें
                          </Link>
                          <Link
                            to={`/admin/news/edit/${item._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            संपादित करें
                          </Link>
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={deletingId === item._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deletingId === item._id ? 'हटा रहा है...' : 'हटाएं'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
