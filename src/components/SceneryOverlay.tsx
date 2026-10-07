import React, { useMemo } from 'react';
import { SceneryType } from '../types';

interface SceneryOverlayProps {
  scenery?: SceneryType;
}

export const SceneryOverlay: React.FC<SceneryOverlayProps> = ({ scenery = 'sakura' }) => {
  if (!scenery || scenery === 'none') return null;

  // Generate lightweight deterministic floating petals / particles
  const particles = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => ({
      id: i,
      left: `${(i * 6.3 + (i % 3) * 4) % 96}%`,
      delay: `${(i * 0.75) % 10}s`,
      duration: `${9 + ((i * 1.7) % 6)}s`,
      size: 10 + (i % 8) * 2,
      opacity: 0.35 + (i % 4) * 0.15,
      tilt: (i % 5) * 15,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none">
      {scenery === 'sakura' && (
        <>
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute animate-petal-fall"
              style={{
                left: p.left,
                top: '-40px',
                animationDelay: p.delay,
                animationDuration: p.duration,
                opacity: p.opacity,
              }}
            >
              <svg
                width={p.size}
                height={p.size * 1.2}
                viewBox="0 0 30 36"
                style={{
                  transform: `rotate(${p.tilt}deg)`,
                }}
              >
                {/* Authentic Sakura Petal Silhouette */}
                <path
                  d="M15 0 C8 10, 0 16, 0 24 C0 31, 7 36, 15 36 C23 36, 30 31, 30 24 C30 16, 22 10, 15 0 Z"
                  fill="#fca5a5"
                  className="opacity-75"
                />
                <path
                  d="M15 6 C10 14, 4 18, 4 24 C4 29, 9 32, 15 32 C21 32, 26 29, 26 24 C26 18, 20 14, 15 6 Z"
                  fill="#fda4af"
                  className="opacity-90"
                />
              </svg>
            </div>
          ))}
        </>
      )}

      {scenery === 'maple' && (
        <>
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute animate-petal-fall"
              style={{
                left: p.left,
                top: '-40px',
                animationDelay: p.delay,
                animationDuration: p.duration,
                opacity: p.opacity,
              }}
            >
              <svg
                width={p.size * 1.3}
                height={p.size * 1.3}
                viewBox="0 0 32 32"
                style={{
                  transform: `rotate(${p.tilt}deg)`,
                }}
              >
                {/* Japanese Momiji Red Maple Leaf */}
                <path
                  d="M16 2 L19 10 L27 8 L22 15 L29 19 L20 21 L22 29 L16 24 L10 29 L12 21 L3 19 L10 15 L5 8 L13 10 Z"
                  fill="#dc2626"
                  className="opacity-80"
                />
              </svg>
            </div>
          ))}
        </>
      )}

      {scenery === 'snow' && (
        <>
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute animate-petal-fall"
              style={{
                left: p.left,
                top: '-30px',
                animationDelay: p.delay,
                animationDuration: p.duration,
                opacity: p.opacity * 0.9,
              }}
            >
              <div
                className="rounded-full bg-white shadow-xs backdrop-blur-xs"
                style={{
                  width: `${p.size * 0.45}px`,
                  height: `${p.size * 0.45}px`,
                }}
              />
            </div>
          ))}
        </>
      )}

      {scenery === 'firefly' && (
        <>
          {particles.slice(0, 10).map((p) => (
            <div
              key={p.id}
              className="absolute animate-firefly-glow"
              style={{
                left: p.left,
                top: `${20 + (p.id * 7) % 65}%`,
                animationDelay: p.delay,
                animationDuration: '6s',
              }}
            >
              <div
                className="rounded-full bg-lime-300 shadow-[0_0_12px_#a3e635] animate-pulse"
                style={{
                  width: '5px',
                  height: '5px',
                }}
              />
            </div>
          ))}
        </>
      )}
    </div>
  );
};
