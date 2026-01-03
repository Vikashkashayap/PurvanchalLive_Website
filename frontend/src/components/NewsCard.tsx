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

  // Truncate description for preview
  const truncateDescription = (description: string, maxLength: number = 150) => {
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  };

  return (
    <Link to={`/news/${news.slug || news._id}`} className="block touch-target">
      <div className="news-card h-full">
        {/* Image */}
        {news.imageUrl && (
          <div className="aspect-video overflow-hidden rounded-t-lg bg-gray-200">
            <img
              src={`${getBackendBaseUrl()}${news.imageUrl}`}
              alt={news.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                // Hide image container if it fails to load
                const container = (e.target as HTMLImageElement).parentElement;
                if (container) {
                  container.style.display = 'none';
                }
              }}
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Category badge */}
          <div className="mb-2 sm:mb-3">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded-full">
              {news.category}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3 line-clamp-2 hover:text-blue-600 transition-colors leading-tight">
            {news.title}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-3 sm:mb-4 line-clamp-3 text-sm sm:text-base leading-relaxed">
            {truncateDescription(news.shortDescription || news.description)}
          </p>

          {/* Date and Read More */}
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-500">
              {formatDate(news.createdAt)}
            </span>
            <span className="text-blue-600 hover:text-blue-800 font-medium text-xs sm:text-sm flex items-center">
              और पढ़ें
              <svg className="w-3 h-3 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>

          {/* Video indicator */}
          {(news.videoUrl || news.videoFileUrl) && (
            <div className="mt-2 sm:mt-3 flex items-center text-red-600 text-xs sm:text-sm">
              <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span className="truncate">वीडियो उपलब्ध</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;
