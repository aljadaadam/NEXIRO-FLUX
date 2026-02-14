// src/components/common/LoadingSpinner.jsx
import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

// Shimmer-only loader (no circular spinner or text)
const LoadingSpinner = ({ fullScreen = false }) => {
  const { theme, dir } = useLanguage();

  const shimmerBar = (
    <div className={`w-48 h-4 rounded-full relative overflow-hidden ${
      theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
    }`}>
      <div
        className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent ${
          dir === 'rtl' ? 'animate-shimmer-rtl' : 'animate-shimmer-ltr'
        }`}
      />
    </div>
  );

  return (
    <div className={`flex items-center justify-center ${fullScreen ? 'h-screen' : 'h-40'}`}>
      <div className="space-y-3">
        {shimmerBar}
        {shimmerBar}
        {shimmerBar}
      </div>
    </div>
  );
};

export default LoadingSpinner;