import React from 'react';

interface MikazukiIconProps {
  className?: string;
  size?: number;
}

export const MikazukiIcon: React.FC<MikazukiIconProps> = ({ className = 'w-full h-full' }) => {
  return (
    <svg
      viewBox="0 0 512 512"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="compBgNight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#161b33" />
          <stop offset="45%" stopColor="#0f1123" />
          <stop offset="100%" stopColor="#060812" />
        </linearGradient>

        <linearGradient id="compMikazukiGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff5cf" />
          <stop offset="25%" stopColor="#f6d375" />
          <stop offset="60%" stopColor="#d9a536" />
          <stop offset="100%" stopColor="#ba821c" />
        </linearGradient>

        <radialGradient id="compMoonAura" cx="50%" cy="46%" r="52%">
          <stop offset="0%" stopColor="#d9a536" stopOpacity="0.22" />
          <stop offset="50%" stopColor="#3d406b" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="512" height="512" rx="115" fill="url(#compBgNight)" />
      <rect width="512" height="512" rx="115" fill="url(#compMoonAura)" />

      {/* Rings */}
      <circle
        cx="256"
        cy="242"
        r="214"
        fill="none"
        stroke="url(#compMikazukiGold)"
        strokeWidth="1.8"
        strokeOpacity="0.35"
      />
      <circle
        cx="256"
        cy="242"
        r="206"
        fill="none"
        stroke="url(#compMikazukiGold)"
        strokeWidth="0.8"
        strokeDasharray="3,6"
        strokeOpacity="0.5"
      />

      {/* Crest */}
      <g transform="translate(0, -6)">
        {/* Outer Crescent */}
        <path
          d="M 148 404 
             C 72 328, 72 178, 168 98 
             C 220 54, 292 54, 344 98 
             C 440 178, 440 328, 364 404 
             C 416 332, 416 196, 332 126 
             C 288 90, 224 90, 180 126 
             C 96 196, 96 332, 148 404 Z"
          fill="url(#compMikazukiGold)"
        />

        {/* Inner Crescent */}
        <path
          d="M 180 376 
             C 124 316, 124 200, 196 142 
             C 232 112, 280 112, 316 142 
             C 388 200, 388 316, 332 376 
             C 368 318, 368 214, 308 166 
             C 278 142, 234 142, 204 166 
             C 144 214, 144 318, 180 376 Z"
          fill="url(#compMikazukiGold)"
        />

        {/* Bottom Dot */}
        <circle cx="256" cy="412" r="14" fill="url(#compMikazukiGold)" />
        <circle cx="256" cy="412" r="6" fill="#fff9e6" opacity="0.85" />
      </g>

      {/* Label */}
      <text
        x="256"
        y="478"
        fontFamily="'Noto Serif SC', 'Songti SC', serif"
        fontSize="19"
        fontWeight="600"
        fill="url(#compMikazukiGold)"
        textAnchor="middle"
        letterSpacing="7"
        opacity="0.9"
      >
        本丸手札
      </text>
    </svg>
  );
};
