import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { type News, newsAPI, getBackendBaseUrl, isAuthenticated, type Category, categoryAPI } from '../../services/api';

// Function to strip HTML tags from text
const stripHtmlTags = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Function to share news on WhatsApp
const shareOnWhatsApp = (news: News) => {
  const cleanTitle = stripHtmlTags(news.title);
  const cleanDescription = stripHtmlTags(news.description).substring(0, 150) + '...';
  const newsUrl = `${window.location.origin}/news/${news.slug || news._id}`;

  // Create a clean, engaging message for WhatsApp
  const message = `📰 *${cleanTitle}*\n\n${cleanDescription}\n\n📖 Read full article: ${newsUrl}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');
};

const Dashboard = () => {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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
      const categoryParam = category === 'All' ? undefined : category;
      const newsData = await newsAPI.getAll(categoryParam);
      // Sort by creation date (newest first)
      const sortedNews = newsData.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setNews(sortedNews);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Error loading news.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deletingId) return;
    if (!window.confirm('Are you sure you want to delete this news? This action cannot be undone.')) {
      return;
    }
    setDeletingId(id);
    try {
      await newsAPI.delete(id);
      setNews(prev => prev.filter(item => item._id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting news.');
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
      alert('Error updating news.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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
            <p className="mt-4 text-lg text-gray-600">Loading data...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage all news</p>
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
              Category Management
            </Link>
            <button
              onClick={() => fetchNews(selectedCategory)}
              disabled={loading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <Link
              to="/admin/news/new"
              className="btn-primary"
            >
              Add New News
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
            <div className="text-gray-600">Total News</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {news.filter(item => item.isPublished).length}
            </div>
            <div className="text-gray-600">Published</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">
              {news.filter(item => !item.isPublished).length}
            </div>
            <div className="text-gray-600">Draft</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Category Filter</h3>
              <p className="text-sm text-gray-600">View news of selected category</p>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field max-w-xs"
              disabled={loading}
            >
              <option value="All">All Categories</option>
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
                No News
              </h2>
              <p className="text-gray-500 mb-6">
                Click the "Add New News" button to add your first news.
              </p>
              <Link
                to="/admin/news/new"
                className="btn-primary"
              >
                Add New News
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      News
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                              {stripHtmlTags(item.title)}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                              {stripHtmlTags(item.description).substring(0, 50)}...
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
                          {item.isPublished ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/news/${item.slug || item._id}`}
                            target="_blank"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => shareOnWhatsApp(item)}
                            className="text-green-600 hover:text-green-900"
                            title="Share on WhatsApp"
                          >
                            📱
                          </button>
                          <Link
                            to={`/admin/news/edit/${item._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={deletingId === item._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deletingId === item._id ? 'Deleting...' : 'Delete'}
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
