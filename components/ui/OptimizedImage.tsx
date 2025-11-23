
import React, { useState } from 'react';
import { ImageOff, Loader2 } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  containerClassName?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({ 
  src, 
  alt, 
  containerClassName = "",
  className = "",
  ...props 
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <div className={`relative overflow-hidden bg-surface-high/20 ${containerClassName}`}>
      
      {/* Loading State / Blur Placeholder */}
      <div 
        className={`absolute inset-0 bg-surface-high/50 backdrop-blur-md transition-all duration-700 z-10 flex items-center justify-center ${
            status === 'loaded' ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-pulse" />
        {status === 'loading' && (
             <Loader2 className="w-6 h-6 text-accent/30 animate-spin relative z-20" />
        )}
      </div>

      {/* Error State */}
      {status === 'error' && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-surface-high text-text-secondary p-4 text-center">
             <ImageOff className="w-8 h-8 mb-2 opacity-50" />
             <span className="text-[10px] uppercase tracking-wider font-medium opacity-60">Asset Missing</span>
        </div>
      )}

      {/* Actual Image */}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'} ${className}`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
        loading="lazy"
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
