import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsAPI, type NewsFormData, getBackendBaseUrl, isAuthenticated, type Category, categoryAPI } from '../../services/api';
import RichTextEditor from '../../components/RichTextEditor';
import VideoUploader from '../../components/VideoUploader';
import HindiKeyboard from '../../components/HindiKeyboard';

// Function to strip HTML tags from text
const stripHtmlTags = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Function to generate slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

const NewsForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    description: '',
    category: 'ग्राम समाचार',
    videoUrl: '',
    slug: '',
    isPublished: true, // Default to published so news shows on public UI
  });

  const [shortDescription, setShortDescription] = useState<string>('');

  const [categories, setCategories] = useState<Category[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingVideoFileUrl, setExistingVideoFileUrl] = useState<string>('');
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
        description: news.description || '', // Rich text HTML content
        category: news.category,
        videoUrl: news.videoUrl || '',
        slug: news.slug || '',
        isPublished: news.isPublished,
      });
      setShortDescription(news.shortDescription || '');

      // Load existing image if present
      if (news.imageUrl) {
        setImagePreview(`${getBackendBaseUrl()}${news.imageUrl}`);
        setExistingImageUrl(news.imageUrl); // Track existing image for backend
      }

      // Load existing video information
      if (news.videoFileUrl) {
        setExistingVideoFileUrl(news.videoFileUrl); // Track existing video file for backend
      }
    } catch (err) {
      console.error('Error fetching news for edit:', err);
      setError('Error loading news.');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Strip HTML tags from title field to prevent HTML content in titles
    const processedValue = name === 'title' ? stripHtmlTags(value) : value;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue,
      // Auto-generate slug when title changes (but not when editing slug directly)
      ...(name === 'title' && !isEditing ? { slug: generateSlug(processedValue) } : {}),
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

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setExistingImageUrl(''); // Clear existing image reference
    // Clear the file input
    const fileInput = document.getElementById('image-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleRemoveVideo = () => {
    setVideoFile(null);
    setFormData(prev => ({
      ...prev,
      videoUrl: '',
    }));
    setExistingVideoFileUrl(''); // Clear existing video file reference
  };

  const handleDelete = async () => {
    if (!id || loading) return;
    if (!window.confirm('Are you sure you want to delete this news? This action cannot be undone.')) {
      return;
    }
    setLoading(true);
    try {
      await newsAPI.delete(id);
      window.location.href = '/admin/dashboard?refresh=true';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error deleting news.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!shortDescription.trim()) {
      setError('Short description is required');
      return false;
    }
    if (!formData.category) {
      setError('Please select a category');
      return false;
    }
    if (!formData.slug || !formData.slug.trim()) {
      setError('Slug cannot be empty.');
      return false;
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
      submitFormData.append('shortDescription', shortDescription);
      submitFormData.append('description', formData.description); // Rich text HTML content
      submitFormData.append('category', formData.category);
      submitFormData.append('slug', formData.slug || generateSlug(formData.title));
      submitFormData.append('isPublished', formData.isPublished.toString());

      if (formData.videoUrl) {
        submitFormData.append('videoUrl', formData.videoUrl);
      }

      if (videoFile) {
        submitFormData.append('videoFile', videoFile);
      }

      if (imageFile) {
        submitFormData.append('image', imageFile);
      } else if (isEditing && existingImageUrl && !imageFile) {
        // Send flag to remove existing image
        submitFormData.append('removeImage', 'true');
      }

      // Handle video removal
      if (isEditing && existingVideoFileUrl && !videoFile && (!formData.videoUrl || !formData.videoUrl.trim())) {
        // Send flag to remove existing video file
        submitFormData.append('removeVideoFile', 'true');
      }

      let response;
      if (isEditing && id) {
        response = await newsAPI.update(id, submitFormData);
      } else {
        response = await newsAPI.create(submitFormData);
      }

      // Update form state with the response data for editing
      if (isEditing && response) {
        const updatedNews = response;
        setFormData({
          title: updatedNews.title,
          description: updatedNews.description || '',
          category: updatedNews.category,
          videoUrl: updatedNews.videoUrl || '',
          slug: updatedNews.slug || '',
          isPublished: updatedNews.isPublished,
        });
        setShortDescription(updatedNews.shortDescription || '');

        // Update image preview if changed
        if (updatedNews.imageUrl) {
          setImagePreview(`${getBackendBaseUrl()}${updatedNews.imageUrl}`);
          setExistingImageUrl(updatedNews.imageUrl);
        } else {
          setImagePreview('');
          setExistingImageUrl('');
        }

        // Update video information if changed
        if (updatedNews.videoFileUrl) {
          setExistingVideoFileUrl(updatedNews.videoFileUrl);
        } else {
          setExistingVideoFileUrl('');
        }
      }

      setSuccess(true);
    } catch (err: any) {
      console.error('Error saving news:', err);
      setError(err.response?.data?.message || 'Error saving news.');
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
            <p className="mt-4 text-lg text-gray-600">Loading news...</p>
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
← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Edit News' : 'Add New News'}
          </h1>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              News {isEditing ? 'updated' : 'created'} successfully!
            </div>
            <div className="mt-4 flex space-x-4">
              <Link
                to="/admin/dashboard"
                className="btn-primary"
              >
Go to Dashboard
              </Link>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setFormData({
                      title: '',
                      description: '',
                      category: 'ग्राम समाचार',
                      videoUrl: '',
                      slug: '',
                      isPublished: true,
                    });
                    setShortDescription('');
                    setImageFile(null);
                    setImagePreview('');
                    setExistingImageUrl('');
                    setVideoFile(null);
                    setExistingVideoFileUrl('');
                  }}
                className="btn-secondary"
              >
Add Another News
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
News Title *
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
                placeholder="Enter news title"
                disabled={loading}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use the keyboard above to type in Hindi or switch your keyboard
              </p>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
Short Description
                </label>
                <HindiKeyboard
                  onKeyPress={(key) => {
                    if (key === 'Backspace') {
                      setShortDescription(prev => prev.slice(0, -1));
                    } else {
                      setShortDescription(prev => prev + key);
                    }
                  }}
                  disabled={loading}
                />
              </div>
              <textarea
                id="shortDescription"
                name="shortDescription"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={3}
                className="input-field"
                placeholder="Enter short description of the news"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                Use the keyboard above to type in Hindi or switch your keyboard
              </p>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
Category *
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

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL)
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                className="input-field"
                placeholder="auto-generated-from-title"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                SEO-friendly URL slug. Auto-generated from title, but can be customized.
              </p>
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
Next - Add Content
                </button>
              </div>
            )}

            {/* Content Fields - Show only when showContentField is true */}
            {showContentField && (
              <>
                {/* Detailed Content - Rich Text Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
Detailed Content {!isEditing && '*'}
                  </label>
                  <RichTextEditor
                    content={formData.description}
                    onChange={handleContentChange}
                    placeholder="Enter detailed news content. You can format text, add images, and videos using the toolbar."
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
Use the toolbar to format text, insert images, or add YouTube videos
                  </p>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
Image Upload
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    disabled={loading}
                  />
                  {imagePreview && (
                    <div className="mt-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-xs max-h-48 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          disabled={loading}
                        >
                          Remove Image
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {existingImageUrl ? 'Current image from news. Upload new image to replace.' : 'New image uploaded'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Video Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
Video Upload
                  </label>
                  <VideoUploader
                    videoUrl={formData.videoUrl}
                    onVideoUrlChange={handleVideoUrlChange}
                    videoFile={videoFile}
                    onVideoFileChange={handleVideoFileChange}
                    disabled={loading}
                    onRemove={handleRemoveVideo}
                    existingVideoFileUrl={existingVideoFileUrl}
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
Publish this news
                  </label>
                </div>
              </>
            )}

            {/* Submit Buttons - Only show when content field is visible */}
            {showContentField && (
              <div className="flex justify-between items-center pt-6 border-t">
                {/* Delete button - only show when editing */}
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </div>
                    ) : (
                      'Delete News'
                    )}
                  </button>
                )}

                {/* Cancel and Save buttons */}
                <div className="flex space-x-4">
                  <Link
                    to="/admin/dashboard"
                    className="btn-secondary"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      isEditing ? 'Update' : 'Save'
                    )}
                  </button>
                </div>
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
