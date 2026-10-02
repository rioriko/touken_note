import React from 'react';
import { BookOpen, Plus, Settings, Sun, Moon, Sparkles } from 'lucide-react';

interface HeaderProps {
  honmaruName: string;
  saniwaName: string;
  onOpenNewNote: () => void;
  onOpenDaozhang: () => void;
  onOpenSettings: () => void;
  onOpenFortune?: () => void;
  onEditProfile: () => void;
  daozhangCount: number;
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  honmaruName,
  saniwaName,
  onOpenNewNote,
  onOpenDaozhang,
  onOpenSettings,
  onOpenFortune,
  onEditProfile,
  daozhangCount,
  theme,
  onToggleTheme,
}) => {
  const displayHonmaru = honmaruName ? `${honmaruName}_本丸` : '本丸';

  return (
    <header className="px-4 sm:px-5 py-3.5 bg-[var(--panel-color)] border-b-2 border-[var(--sakura-pink)] shadow-xs sticky top-0 z-30 flex items-center justify-between transition-colors">
      {/* Zone 1: Brand Wordmark with User Requested Format: [honmaruName_本丸] */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div
          onClick={onEditProfile}
          title="点击重新编定本丸与主殿名号"
          className="w-8 h-8 rounded-full bg-[var(--sakura-soft)] flex items-center justify-center text-[var(--header-red)] border border-[var(--sakura-pink)] hover:scale-105 transition-transform cursor-pointer shadow-xs shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[var(--sakura-deep)]" />
        </div>
        <div className="flex items-baseline gap-2">
          {/* Requested format: 在最左是本丸的名字，下划线，本丸 */}
          <button
            onClick={onEditProfile}
            title="点击更换本丸名号或审神者尊号"
            className="text-lg sm:text-xl font-black tracking-wide text-[var(--header-red)] font-serif text-left hover:opacity-85 transition-opacity cursor-pointer group flex items-baseline gap-1"
          >
            <span>{displayHonmaru}</span>
          </button>

          {saniwaName && (
            <span
              onClick={onEditProfile}
              title="审神者尊号"
              className="hidden md:inline-flex items-center text-[11px] text-[var(--text-muted)] font-serif cursor-pointer hover:text-[var(--sakura-deep)] transition-colors px-1.5 py-0.5 rounded bg-[var(--search-bg)] border border-[var(--border-color)]"
            >
              主: {saniwaName}
            </span>
          )}

          <span className="hidden lg:inline-block text-[11px] text-[var(--text-muted)] tracking-wider">
            手札奏帖与刀账
          </span>
        </div>
      </div>

      {/* Zone 3: Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle Theme */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? '切换为白昼 (亮色)' : '切换为夜阑 (暗色)'}
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[var(--accent-gold)]" />
          ) : (
            <Moon className="w-4 h-4 text-[var(--text-muted)]" />
          )}
        </button>

        {/* 今日签文与晨鉴 Button */}
        {onOpenFortune && (
          <button
            onClick={onOpenFortune}
            title="今日签文与近侍箴言"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] hover:border-[var(--sakura-pink)] hover:bg-[var(--sakura-soft)] hover:text-[var(--header-red)] transition-all text-xs font-serif font-medium cursor-pointer shadow-2xs"
          >
            <span className="text-sm leading-none">🎋</span>
            <span className="hidden sm:inline">今日签文</span>
          </button>
        )}

        {/* 刀账 Button */}
        <button
          onClick={onOpenDaozhang}
          title="本丸刀账典籍"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--sakura-pink)] bg-[var(--sakura-soft)] text-[var(--sakura-deep)] hover:bg-[var(--sakura-pink)]/40 transition-colors text-xs font-semibold cursor-pointer shadow-xs"
        >
          <BookOpen className="w-4 h-4" />
          <span className="tracking-wide">本丸刀账</span>
          <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-[var(--sakura-deep)] text-white font-mono tabular-nums">
            {daozhangCount}
          </span>
        </button>

        {/* 书写新奏帖 (+) */}
        <button
          onClick={onOpenNewNote}
          title="书写新奏帖"
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white hover:bg-[var(--sakura-deep)]/90 transition-all text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">新奏帖</span>
        </button>

        {/* 设置 Button */}
        <button
          onClick={onOpenSettings}
          title="本丸常务与配置"
          className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--header-red)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
