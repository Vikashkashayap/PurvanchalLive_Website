import { useState, useEffect } from 'react';
import { type Category, categoryAPI, type CategoryFormData, isAuthenticated } from '../../services/api';

const CategoryManagement = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchCategories();
    } else {
      setLoading(false);
      setError('Authentication required. Please log in again.');
    }
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await categoryAPI.getAll();
      // Sort by creation date (newest first)
      const sortedCategories = categoriesData.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setCategories(sortedCategories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('श्रेणियां लोड करने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('श्रेणी का नाम आवश्यक है');
      return;
    }

    try {
      setFormLoading(true);
      setError(null);

      if (editingCategory) {
        await categoryAPI.update(editingCategory._id, formData);
      } else {
        await categoryAPI.create(formData);
      }

      await fetchCategories();
      resetForm();
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err.response?.data?.message || 'श्रेणी सहेजने में त्रुटि हुई।');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('क्या आप इस श्रेणी को हटाना चाहते हैं? इससे जुड़ी सभी समाचार प्रभावित हो सकती हैं।')) {
      return;
    }

    try {
      setDeletingId(id);
      await categoryAPI.delete(id);
      setCategories(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      console.error('Error deleting category:', err);
      alert('श्रेणी हटाने में त्रुटि हुई।');
    } finally {
      setDeletingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setEditingCategory(null);
    setShowForm(false);
    setError(null);
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
            <h1 className="text-3xl font-bold text-gray-900">श्रेणी प्रबंधन</h1>
            <p className="text-gray-600 mt-2">समाचार श्रेणियां बनाएं और प्रबंधित करें</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary"
          >
            {showForm ? 'रद्द करें' : 'नई श्रेणी जोड़ें'}
          </button>
        </div>

        {/* Error Message */}
        {error && !showForm && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-8 py-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {editingCategory ? 'श्रेणी संपादित करें' : 'नई श्रेणी जोड़ें'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    श्रेणी का नाम *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="श्रेणी का नाम दर्ज करें"
                    disabled={formLoading}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    विवरण
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="input-field"
                    placeholder="श्रेणी का विवरण दर्ज करें (वैकल्पिक)"
                    disabled={formLoading}
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                    disabled={formLoading}
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {formLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        सहेज रहा है...
                      </div>
                    ) : (
                      editingCategory ? 'अपडेट करें' : 'सहेजें'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Categories Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {categories.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📁</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                कोई श्रेणी नहीं
              </h2>
              <p className="text-gray-500 mb-6">
                पहली श्रेणी जोड़ने के लिए "नई श्रेणी जोड़ें" बटन पर क्लिक करें।
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                नई श्रेणी जोड़ें
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      श्रेणी
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      विवरण
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
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {category.description || 'कोई विवरण नहीं'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(category.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            संपादित करें
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            disabled={deletingId === category._id}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            {deletingId === category._id ? 'हटा रहा है...' : 'हटाएं'}
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

export default CategoryManagement;
