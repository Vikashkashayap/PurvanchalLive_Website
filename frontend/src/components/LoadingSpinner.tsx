import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-orange-200 border-t-orange-600 mx-auto`}></div>
        <p className="mt-4 text-lg text-gray-600 font-medium">{message}</p>
        <div className="mt-2 text-sm text-gray-500">Please wait while we load the content...</div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
