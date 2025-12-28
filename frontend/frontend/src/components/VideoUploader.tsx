import React, { useState, useRef } from 'react';

interface VideoUploaderProps {
  videoUrl?: string;
  onVideoUrlChange: (url: string) => void;
  videoFile?: File | null;
  onVideoFileChange: (file: File | null) => void;
  disabled?: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({
  videoUrl = '',
  onVideoUrlChange,
  videoFile,
  onVideoFileChange,
  disabled = false,
}) => {
  const [videoPreview, setVideoPreview] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError('');

    if (file) {
      // Check file type
      if (!file.type.startsWith('video/')) {
        setError('कृपया केवल वीडियो फाइल चुनें (.mp4, .avi, .mov, आदि)');
        return;
      }

      // No size limit - allow any size video
      onVideoFileChange(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setVideoPreview(url);
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    onVideoUrlChange(url);

    // Clear file if URL is entered
    if (url.trim() && videoFile) {
      onVideoFileChange(null);
      setVideoPreview('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    // Clear URL if file is selected
    if (videoUrl.trim()) {
      onVideoUrlChange('');
    }
  };

  const getVideoType = (url: string): 'youtube' | 'direct' | null => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return 'youtube';
    }
    if (url.match(/\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i)) {
      return 'direct';
    }
    return null;
  };

  const renderVideoPreview = () => {
    if (videoPreview) {
      return (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">वीडियो पूर्वावलोकन:</p>
          <video
            src={videoPreview}
            controls
            className="max-w-xs max-h-48 rounded-lg border"
            preload="metadata"
          >
            आपका ब्राउज़र वीडियो टैग का समर्थन नहीं करता।
          </video>
        </div>
      );
    }

    if (videoUrl) {
      const videoType = getVideoType(videoUrl);
      if (videoType === 'youtube') {
        const videoId = videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1];
        if (videoId) {
          return (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">YouTube वीडियो पूर्वावलोकन:</p>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="max-w-xs max-h-48 rounded-lg border"
                allowFullScreen
                title="YouTube video preview"
              />
            </div>
          );
        }
      }
    }

    return null;
  };

  return (
    <div className="space-y-4">
      {/* YouTube URL Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          YouTube वीडियो लिंक
        </label>
        <input
          type="url"
          value={videoUrl}
          onChange={handleUrlChange}
          placeholder="https://youtube.com/watch?v=... या https://youtu.be/..."
          className="input-field"
          disabled={disabled}
        />
        <p className="text-xs text-gray-500 mt-1">
          YouTube वीडियो का पूरा URL दर्ज करें
        </p>
      </div>

      {/* OR Divider */}
      <div className="flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-3 text-sm text-gray-500 bg-white">या</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          वीडियो फाइल अपलोड करें (MP4, AVI, MOV, आदि)
        </label>
        <button
          type="button"
          onClick={handleFileUpload}
          className="btn-secondary"
          disabled={disabled}
        >
          वीडियो फाइल चुनें
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        <p className="text-xs text-gray-500 mt-1">
          कोई भी आकार की वीडियो फाइल अपलोड कर सकते हैं<br/>
          समर्थित प्रारूप: MP4, AVI, MOV, WMV, FLV, WebM, MKV
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Video Preview */}
      {renderVideoPreview()}

      {/* Current Selection Info */}
      {(videoUrl || videoFile) && (
        <div className="text-sm text-gray-600">
          {videoUrl ? (
            <p>✅ YouTube लिंक: {videoUrl}</p>
          ) : videoFile ? (
            <p>✅ फाइल: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
