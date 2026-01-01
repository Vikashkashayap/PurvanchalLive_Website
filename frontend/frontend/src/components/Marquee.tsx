import { useState, useEffect } from 'react';
import { marqueeAPI, type MarqueeContent } from '../services/api';

const Marquee = () => {
  const [breakingNews, setBreakingNews] = useState<MarqueeContent[]>([]);
  const [announcements, setAnnouncements] = useState<MarqueeContent[]>([]);
  const [marqueeLoading, setMarqueeLoading] = useState(true);

  useEffect(() => {
    // Fetch marquee content using the optimized method
    const fetchMarqueeContent = async () => {
      try {
        setMarqueeLoading(true);
        const content = await marqueeAPI.getAllContent();
        setBreakingNews(content.breaking);
        setAnnouncements(content.announcements);
      } catch (error) {
        console.error('Error fetching marquee content:', error);
        // Set empty arrays on error - no default content shown
        setBreakingNews([]);
        setAnnouncements([]);
      } finally {
        setMarqueeLoading(false);
      }
    };

    fetchMarqueeContent();
  }, []);

  // Don't render anything if loading or if no active content
  if (marqueeLoading || (breakingNews.length === 0 && announcements.length === 0)) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white overflow-hidden relative">
      {/* Left to Right Marquee - Breaking News */}
      {breakingNews.length > 0 && (
        <div className="relative w-full py-3">
          <div className="animate-marquee-left whitespace-nowrap flex items-center">
            <span className="text-lg font-bold mr-8 bg-red-600 px-4 py-2 rounded-lg animate-pulse mx-4">📰 ब्रेकिंग न्यूज</span>
            {breakingNews.map((item, index) => (
              <span key={`breaking-${index}`} className="mx-6">{item.content}</span>
            ))}
            {/* Duplicate for seamless loop */}
            {breakingNews.map((item, index) => (
              <span key={`breaking-dup-${index}`} className="mx-6">{item.content}</span>
            ))}
          </div>
        </div>
      )}

      {/* Right to Left Marquee - Announcements */}
      {announcements.length > 0 && (
        <div className="relative w-full py-3 border-t border-orange-500">
          <div className="animate-marquee-right whitespace-nowrap flex items-center">
            <span className="text-lg font-bold mr-8 bg-blue-600 px-4 py-2 rounded-lg animate-pulse mx-4">📢 महत्वपूर्ण सूचना</span>
            {announcements.map((item, index) => (
              <span key={`announcement-${index}`} className="mx-6">{item.content}</span>
            ))}
            {/* Duplicate for seamless loop */}
            {announcements.map((item, index) => (
              <span key={`announcement-dup-${index}`} className="mx-6">{item.content}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Marquee;
