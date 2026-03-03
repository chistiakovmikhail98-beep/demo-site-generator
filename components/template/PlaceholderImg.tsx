import React from 'react';

/** Check if URL is a placeholder (placehold.co) or empty */
export function isPlaceholder(url?: string): boolean {
  return !url || url.includes('placehold.co');
}

interface PlaceholderImgProps {
  src?: string;
  alt?: string;
  className?: string;
  placeholderClassName?: string;
  label?: string;
  icon?: React.ReactNode;
}

/**
 * Image that falls back to a neutral gradient when src is a placeholder URL.
 * Use instead of <img> everywhere that might receive placehold.co URLs.
 */
const PlaceholderImg: React.FC<PlaceholderImgProps> = ({ src, alt, className = '', placeholderClassName, label, icon }) => {
  if (isPlaceholder(src)) {
    return (
      <div className={placeholderClassName || `w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center ${className}`}>
        {icon || (label && <span className="text-zinc-600 font-bold text-sm uppercase tracking-wider text-center px-4">{label}</span>)}
      </div>
    );
  }

  return <img src={src} alt={alt || ''} className={className} loading="lazy" />;
};

export default PlaceholderImg;
