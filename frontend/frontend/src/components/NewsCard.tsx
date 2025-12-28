import { Link } from 'react-router-dom';
import { type News, getBackendBaseUrl } from '../services/api';

interface NewsCardProps {
  news: News;
}

const NewsCard = ({ news }: NewsCardProps) => {
  // Format date in Hindi style
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Strip HTML tags and truncate description for preview
  const truncateDescription = (description: string, maxLength: number = 150) => {
    // Strip HTML tags
    const textOnly = description.replace(/<[^>]*>/g, '').trim();
    if (textOnly.length <= maxLength) return textOnly;
    return textOnly.substring(0, maxLength) + '...';
  };

  return (
    <Link to={`/news/${news._id}`} className="block">
      <div className="news-card">
        {/* Image */}
        {news.imageUrl && (
          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img
              src={`${getBackendBaseUrl()}${news.imageUrl}`}
              alt={news.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                // Hide image if it fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Category badge */}
          <div className="mb-3">
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {news.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
            {news.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-4 line-clamp-3">
            {truncateDescription(news.description)}
          </p>

          {/* Date and Read More */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {formatDate(news.createdAt)}
            </span>
            <span className="text-blue-600 hover:text-blue-800 font-medium text-sm">
              और पढ़ें →
            </span>
          </div>

          {/* Video indicator */}
          {(news.videoUrl || news.videoFileUrl) && (
            <div className="mt-3 flex items-center text-red-600 text-sm">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              वीडियो उपलब्ध
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
