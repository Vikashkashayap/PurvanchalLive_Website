import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { marqueeAPI, type MarqueeContent, type MarqueeContentFormData } from '../../services/api';

const MarqueeManagement = () => {
  const [marqueeContent, setMarqueeContent] = useState<MarqueeContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MarqueeContent | null>(null);
  const [formData, setFormData] = useState<MarqueeContentFormData>({
    content: '',
    type: 'breaking',
    isActive: true,
    order: 0
  });

  useEffect(() => {
    fetchMarqueeContent();
  }, []);

  const fetchMarqueeContent = async () => {
    try {
      setLoading(true);
      const data = await marqueeAPI.getAll();
      setMarqueeContent(data);
    } catch (err) {
      console.error('Error fetching marquee content:', err);
      setError('Failed to load marquee content');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }

    try {
      setError(null);
      if (editingItem) {
        await marqueeAPI.update(editingItem._id, formData);
      } else {
        await marqueeAPI.create(formData);
      }

      await fetchMarqueeContent();
      resetForm();
    } catch (err: any) {
      console.error('Error saving marquee content:', err);
      setError(err.response?.data?.message || 'Failed to save marquee content');
    }
  };

  const handleEdit = (item: MarqueeContent) => {
    setEditingItem(item);
    setFormData({
      content: item.content,
      type: item.type,
      isActive: item.isActive,
      order: item.order
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this marquee content?')) {
      return;
    }

    try {
      await marqueeAPI.delete(id);
      await fetchMarqueeContent();
    } catch (err) {
      console.error('Error deleting marquee content:', err);
      setError('Failed to delete marquee content');
    }
  };

  const resetForm = () => {
    setFormData({
      content: '',
      type: 'breaking',
      isActive: true,
      order: 0
    });
    setEditingItem(null);
    setShowForm(false);
    setError(null);
  };

  const getTypeLabel = (type: string) => {
    return type === 'breaking' ? 'Breaking News' : 'Announcement';
  };

  const getTypeColor = (type: string) => {
    return type === 'breaking' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading marquee content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/dashboard"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Marquee Content Management</h1>
              <p className="text-gray-600 mt-2">Manage scrolling news and announcements</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Add New Content
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white shadow rounded-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Edit Content' : 'Add New Content'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={3}
                  className="input-field"
                  placeholder="Enter marquee content (max 300 characters)"
                  maxLength={300}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.content.length}/300 characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="breaking">Breaking News</option>
                    <option value="announcement">Announcement</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    id="order"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="isActive"
                    name="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {marqueeContent.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📢</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                No Marquee Content
              </h2>
              <p className="text-gray-500 mb-6">
                Add your first marquee content to display scrolling news and announcements.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Add Marquee Content
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {marqueeContent.map((item) => (
                    <tr key={item._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {item.content}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(item.type)}`}>
                          {getTypeLabel(item.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.order}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
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

export default MarqueeManagement;
