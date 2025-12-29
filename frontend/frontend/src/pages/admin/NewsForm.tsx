import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsAPI, type NewsFormData, getBackendBaseUrl, isAuthenticated, type Category, categoryAPI } from '../../services/api';
import RichTextEditor from '../../components/RichTextEditor';
import VideoUploader from '../../components/VideoUploader';
import HindiKeyboard from '../../components/HindiKeyboard';

const NewsForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    description: '',
    category: 'ग्राम समाचार',
    videoUrl: '',
    isPublished: true, // Default to published so news shows on public UI
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showContentField, setShowContentField] = useState(isEditing); // Show content field when editing, hide when creating new

  useEffect(() => {
    fetchCategories();
    if (isEditing) {
      fetchNewsForEdit();
    }
  }, [id, isEditing]);

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

  const fetchNewsForEdit = async () => {
    if (!id) return;

    // Check authentication before making API call
    if (!isAuthenticated()) {
      setError('Authentication required. Please log in again.');
      setFetchLoading(false);
      return;
    }

    try {
      setFetchLoading(true);
      const news = await newsAPI.getById(id);
      setFormData({
        title: news.title,
        description: news.description || '', // Now expecting HTML content
        category: news.category,
        videoUrl: news.videoUrl || '',
        isPublished: news.isPublished,
      });
      if (news.imageUrl) {
        setImagePreview(`${getBackendBaseUrl()}${news.imageUrl}`);
      }
    } catch (err) {
      console.error('Error fetching news for edit:', err);
      setError('समाचार लोड करने में त्रुटि हुई।');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContentChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      description: content,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleVideoUrlChange = (url: string) => {
    setFormData(prev => ({
      ...prev,
      videoUrl: url,
    }));
  };

  const handleVideoFileChange = (file: File | null) => {
    setVideoFile(file);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('शीर्षक आवश्यक है');
      return false;
    }
    if (!formData.category) {
      setError('श्रेणी चुनें');
      return false;
    }
    // Only validate content if content field is shown
    if (showContentField) {
      // Check if rich text content has actual text (not just empty HTML tags)
      const textContent = formData.description.replace(/<[^>]*>/g, '').trim();
      if (!textContent) {
        setError('विवरण आवश्यक है - कृपया कुछ सामग्री दर्ज करें');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const submitFormData = new FormData();
      submitFormData.append('title', formData.title);
      submitFormData.append('description', formData.description); // Now contains HTML
      submitFormData.append('category', formData.category);
      submitFormData.append('isPublished', formData.isPublished.toString());

      if (formData.videoUrl) {
        submitFormData.append('videoUrl', formData.videoUrl);
      }

      if (videoFile) {
        submitFormData.append('videoFile', videoFile);
      }

      if (imageFile) {
        submitFormData.append('image', imageFile);
      }

      await newsAPI.create(submitFormData);
      setSuccess(true);
    } catch (err: any) {
      console.error('Error saving news:', err);
      setError(err.response?.data?.message || 'समाचार सहेजने में त्रुटि हुई।');
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/dashboard"
            className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← डैशबोर्ड पर वापस जाएं
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'समाचार संपादित करें' : 'नई समाचार जोड़ें'}
          </h1>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              समाचार सफलतापूर्वक {isEditing ? 'अपडेट' : 'बनाई'} गई है!
            </div>
            <div className="mt-4 flex space-x-4">
              <Link
                to="/admin/dashboard"
                className="btn-primary"
              >
                डैशबोर्ड पर जाएं
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    title: '',
                    description: '',
                    category: 'ग्राम समाचार',
                    videoUrl: '',
                    isPublished: true,
                  });
                  setImageFile(null);
                  setImagePreview('');
                  setVideoFile(null);
                }}
                className="btn-secondary"
              >
                नई समाचार जोड़ें
              </button>
            </div>
          </div>
        )}

        {/* Form */}
        {!success && (
          <div className="bg-white shadow rounded-lg">
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  खबर का शीर्षक *
                </label>
                <HindiKeyboard
                  onKeyPress={(key) => {
                    if (key === 'Backspace') {
                      setFormData(prev => ({
                        ...prev,
                        title: prev.title.slice(0, -1),
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        title: prev.title + key,
                      }));
                    }
                  }}
                  disabled={loading}
                />
              </div>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="input-field"
                placeholder="समाचार का शीर्षक दर्ज करें"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                हिंदी में टाइप करने के लिए ऊपर दिए गए कीबोर्ड का उपयोग करें या अपना कीबोर्ड स्विच करें
              </p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                श्रेणी *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input-field"
                disabled={loading}
                required
              >
                {categories.map(category => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Show Content Field Button (only for new news) */}
            {!isEditing && !showContentField && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowContentField(true)}
                  className="btn-primary"
                  disabled={loading}
                >
                  अगला - सामग्री जोड़ें
                </button>
              </div>
            )}

            {/* Content Fields - Show only when showContentField is true */}
            {showContentField && (
              <>
                {/* Description - Rich Text Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    खबर का विवरण {!isEditing && '*'}
                  </label>
                  <RichTextEditor
                    content={formData.description}
                    onChange={handleContentChange}
                    placeholder="समाचार का विस्तृत विवरण दर्ज करें। आप टूलबार का उपयोग करके टेक्स्ट को फॉर्मेट कर सकते हैं, इमेज और वीडियो जोड़ सकते हैं।"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    टूलबार का उपयोग करके टेक्स्ट को फॉर्मेट करें, इमेज डालें, या YouTube वीडियो जोड़ें
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    इमेज अपलोड
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={loading}
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-w-xs max-h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    वीडियो अपलोड
                  </label>
                  <VideoUploader
                    videoUrl={formData.videoUrl}
                    onVideoUrlChange={handleVideoUrlChange}
                    videoFile={videoFile}
                    onVideoFileChange={handleVideoFileChange}
                    disabled={loading}
                  />
                </div>

                {/* Publish Checkbox */}
                <div className="flex items-center">
                  <input
                    id="isPublished"
                    name="isPublished"
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                    इस समाचार को प्रकाशित करें
                  </label>
                </div>
              </>
            )}

            {/* Submit Buttons - Only show when content field is visible */}
            {showContentField && (
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <Link
                  to="/admin/dashboard"
                  className="btn-secondary"
                >
                  रद्द करें
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      सहेज रहा है...
                    </div>
                  ) : (
                    isEditing ? 'अपडेट करें' : 'सहेजें'
                  )}
                </button>
              </div>
            )}
          </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsForm;
