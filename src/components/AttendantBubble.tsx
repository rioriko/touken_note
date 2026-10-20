import React, { useState, useEffect } from 'react';
import { WordCard, Assistant } from '../types';
import { RefreshCw, X, SlidersHorizontal, MessageSquareQuote, Volume2 } from 'lucide-react';
import { soundManager } from '../utils/soundManager';

interface AttendantBubbleProps {
  card: WordCard | null;
  assistant: Assistant;
  isVisible: boolean;
  onDismiss: () => void;
  onDrawNext: () => void;
  onOpenSettings: () => void;
  audioEnabled?: boolean;
}

export const AttendantBubble: React.FC<AttendantBubbleProps> = ({
  card,
  assistant,
  isVisible,
  onDismiss,
  onDrawNext,
  onOpenSettings,
  audioEnabled = false,
}) => {
  const [isRotating, setIsRotating] = useState(false);

  // Play a soft sound effect when bubble becomes visible
  useEffect(() => {
    if (isVisible && audioEnabled) {
      soundManager.playBrushStroke();
    }
  }, [isVisible, audioEnabled]);

  if (!isVisible || !card) return null;

  const handleDrawAnother = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    if (audioEnabled) {
      soundManager.playPaperFlip();
    }
    onDrawNext();
    setTimeout(() => setIsRotating(false), 400);
  };

  const authorName = card.author?.trim() || assistant.name || '近侍';

  return (
    <div
      className="fixed bottom-[4.25rem] left-4 z-30 max-w-[20rem] sm:max-w-xs animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-300 pointer-events-auto"
      style={{
        filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.15)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
      }}
    >
      <div
        className="relative p-3.5 rounded-2xl border border-[var(--sakura-pink)] bg-[var(--panel-color)] text-[var(--text-color)] shadow-xl transition-all group"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Downward Speech Bubble Triangle Pointer pointing right to the assistant pill below */}
        <div
          className="absolute -bottom-2.5 left-7 w-0 h-0 border-x-8 border-x-transparent border-t-[10px] border-t-[var(--panel-color)] pointer-events-none"
          style={{
            filter: 'drop-shadow(0 1px 0 var(--sakura-pink))',
          }}
        />

        {/* Bubble Header */}
        <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-5 h-5 rounded-full bg-[var(--sakura-soft)] text-[var(--sakura-deep)] flex items-center justify-center shrink-0">
              <MessageSquareQuote className="w-3 h-3" />
            </span>
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-serif font-bold text-xs text-[var(--header-red)] truncate">
                【{authorName}】
              </span>
              {card.category && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-serif bg-[var(--sakura-soft)] text-[var(--sakura-deep)] border border-[var(--sakura-pink)]/40 shrink-0">
                  {card.category}
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleDrawAnother}
              title="抽取下一句言叶"
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--sakura-deep)] hover:bg-[var(--sakura-soft)] transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings();
              }}
              title="字卡库与时长配置"
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              title="隐去气泡"
              className="p-1 rounded-md text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bubble Text Body */}
        <div className="text-xs font-serif leading-relaxed text-[var(--text-color)] tracking-wide select-text">
          <p className="line-clamp-4 hover:line-clamp-none transition-all">
            “{card.text}”
          </p>
        </div>

        {/* Bubble Subtle Footer Tag */}
        <div className="mt-2 pt-1.5 flex items-center justify-between text-[10px] text-[var(--text-muted)] font-serif border-t border-[var(--border-color)]/60">
          <span className="opacity-75">近侍言叶 · 随风呈递</span>
          <button
            type="button"
            onClick={handleDrawAnother}
            className="hover:text-[var(--sakura-deep)] cursor-pointer transition-colors"
          >
            换一句 ➔
          </button>
        </div>
      </div>
    </div>
  );
};
