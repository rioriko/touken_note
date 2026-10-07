import React from 'react';

interface SwordMonLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'fullscreen';
  text?: string;
  subtext?: string;
}

export const SwordMonLoader: React.FC<SwordMonLoaderProps> = ({
  size = 'md',
  text,
  subtext,
}) => {
  const isFullscreen = size === 'fullscreen';

  // Sizing definitions
  const dim = {
    sm: 42,
    md: 72,
    lg: 104,
    fullscreen: 116,
  }[size];

  const content = (
    <div className="flex flex-col items-center justify-center gap-4 select-none">
      {/* Non-rotating, Gentle Breathing Fade-in / Fade-out Stage */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: dim, height: dim }}
      >
        {/* Soft Ambient Gold Aura */}
        <div className="absolute inset-0 rounded-full bg-[var(--accent-gold)]/20 blur-xl animate-pulse" />

        {/* Outer Static Starlight Halo */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
        >
          <circle
            cx="50"
            cy="50"
            r="47"
            fill="none"
            stroke="var(--accent-gold)"
            strokeWidth="0.8"
            strokeDasharray="4 6"
          />
        </svg>

        {/* Central Static Mikazuki Crest with Smooth Opacity Fade: 0% -> 100% -> 15% -> 100% */}
        <div className="w-full h-full animate-mon-fade drop-shadow-[0_4px_16px_rgba(217,165,54,0.4)]">
          <svg
            viewBox="0 0 512 512"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="fadeLoaderGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fff5cf" />
                <stop offset="30%" stopColor="#f6d375" />
                <stop offset="70%" stopColor="#d9a536" />
                <stop offset="100%" stopColor="#ba821c" />
              </linearGradient>
            </defs>

            {/* Crest Outer Crescent */}
            <path
              d="M 148 404 
                 C 72 328, 72 178, 168 98 
                 C 220 54, 292 54, 344 98 
                 C 440 178, 440 328, 364 404 
                 C 416 332, 416 196, 332 126 
                 C 288 90, 224 90, 180 126 
                 C 96 196, 96 332, 148 404 Z"
              fill="url(#fadeLoaderGold)"
            />

            {/* Crest Inner Crescent */}
            <path
              d="M 180 376 
                 C 124 316, 124 200, 196 142 
                 C 232 112, 280 112, 316 142 
                 C 388 200, 388 316, 332 376 
                 C 368 318, 368 214, 308 166 
                 C 278 142, 234 142, 204 166 
                 C 144 214, 144 318, 180 376 Z"
              fill="url(#fadeLoaderGold)"
            />

            {/* Crest Center Dot (Starlight Drop) */}
            <circle cx="256" cy="412" r="15" fill="url(#fadeLoaderGold)" />
            <circle cx="256" cy="412" r="6" fill="#ffffff" opacity="0.95" />
          </svg>
        </div>
      </div>

      {/* Accompanying Inscription */}
      {text && (
        <div className="text-center space-y-1 animate-fadeIn">
          <div className="font-serif font-bold tracking-widest text-[var(--header-red)] text-xs sm:text-sm">
            {text}
          </div>
          {subtext && (
            <div className="font-serif text-[10px] text-[var(--text-muted)] tracking-wider opacity-85">
              {subtext}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-100 flex items-center justify-center bg-[var(--bg-color)]/90 backdrop-blur-md transition-opacity duration-500">
        <div className="p-8 rounded-2xl bg-[var(--panel-color)]/85 border border-[var(--sakura-pink)]/60 shadow-2xl flex flex-col items-center max-w-xs mx-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
