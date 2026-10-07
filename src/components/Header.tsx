import React from 'react';
import { BookOpen, Plus, Settings, Sun, Moon, Sparkles, Volume2, VolumeX, Wind, CalendarRange, PenTool } from 'lucide-react';

interface HeaderProps {
  honmaruName: string;
  saniwaName: string;
  activeMainView: 'notes' | 'planner';
  onSelectMainView: (view: 'notes' | 'planner') => void;
  onOpenNewNote: () => void;
  onOpenDaozhang: () => void;
  onOpenSettings: () => void;
  onOpenFortune?: () => void;
  onEditProfile: () => void;
  daozhangCount: number;
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
  audioEnabled?: boolean;
  onToggleAudio?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  honmaruName,
  saniwaName,
  activeMainView,
  onSelectMainView,
  onOpenNewNote,
  onOpenDaozhang,
  onOpenSettings,
  onOpenFortune,
  onEditProfile,
  daozhangCount,
  theme,
  onToggleTheme,
  audioEnabled = false,
  onToggleAudio,
}) => {
  const displayHonmaru = honmaruName ? `${honmaruName}_本丸` : '本丸';

  return (
    <header className="px-3 sm:px-5 py-2 sm:py-2.5 bg-[var(--panel-color)] border-b-2 border-[var(--sakura-pink)] shadow-xs sticky top-0 z-30 flex flex-col transition-colors gap-1">
      {/* Primary Top Bar */}
      <div className="flex items-center justify-between w-full gap-2">
        {/* Zone 1: Brand Wordmark: [honmaruName_本丸] + saniwaName as subtitle */}
        <div
          onClick={onEditProfile}
          title="点击重新编定本丸与主殿名号"
          className="flex flex-col justify-center cursor-pointer group min-w-0 flex-1 max-w-[160px] sm:max-w-none"
        >
          <div className="text-base sm:text-lg font-black tracking-wide text-[var(--header-red)] font-serif leading-tight group-hover:opacity-85 transition-opacity break-words">
            {displayHonmaru}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] sm:text-[11px] text-[var(--text-muted)] font-serif truncate max-w-[130px] sm:max-w-[200px]">
              {saniwaName ? `主: ${saniwaName}` : '审神者'}
            </span>
            <span className="hidden xl:inline-block text-[10px] text-[var(--text-muted)] tracking-wider">
              · 奏帖手札与刀账
            </span>
          </div>
        </div>

        {/* Zone 1.5: Desktop-only Central Mode Switcher: 奏帖便签 vs 周度手札 */}
        <div className="hidden md:flex items-center p-1 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] text-xs font-serif shrink-0 shadow-2xs">
          <button
            onClick={() => onSelectMainView('notes')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
              activeMainView === 'notes'
                ? 'bg-[var(--panel-color)] text-[var(--header-red)] shadow-xs border border-[var(--sakura-pink)]/70'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>奏帖便签</span>
          </button>
          <button
            onClick={() => onSelectMainView('planner')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
              activeMainView === 'planner'
                ? 'bg-[var(--panel-color)] text-[var(--header-red)] shadow-xs border border-[var(--sakura-pink)]/70'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5 text-[var(--sakura-deep)]" />
            <span>周度手札</span>
          </button>
        </div>

        {/* Zone 2: Actions on Top Line */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Toggle Theme */}
          <button
            onClick={onToggleTheme}
            title={theme === 'dark' ? '切换为白昼 (亮色)' : '切换为夜阑 (暗色)'}
            className="p-1.5 sm:p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[var(--accent-gold)]" />
            ) : (
              <Moon className="w-4 h-4 text-[var(--text-muted)]" />
            )}
          </button>

          {/* 回廊环境音效 / 风铃开关 (极具和风意境) */}
          {onToggleAudio && (
            <button
              onClick={onToggleAudio}
              title={audioEnabled ? '静音本丸环境音效' : '开启本丸回廊风铃与纸墨音效'}
              className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer relative ${
                audioEnabled
                  ? 'text-[var(--accent-gold)] bg-[var(--sakura-soft)] border border-[var(--accent-gold)]/40 shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)]'
              }`}
            >
              {audioEnabled ? (
                <Volume2 className="w-4 h-4 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4 opacity-70" />
              )}
            </button>
          )}

          {/* 今日签文与晨鉴 Button (极简 '签' 字符号) */}
          {onOpenFortune && (
            <button
              onClick={onOpenFortune}
              title="今日签文与近侍箴言"
              className="flex items-center justify-center w-7 h-7 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1.5 rounded-lg border border-[var(--sakura-pink)] bg-[var(--sakura-soft)] text-[var(--header-red)] hover:bg-[var(--sakura-pink)]/40 transition-all font-serif font-bold text-xs cursor-pointer shadow-2xs"
            >
              <span className="text-xs leading-none">签</span>
              <span className="hidden sm:inline ml-1 font-normal text-[11px]">签文</span>
            </button>
          )}

          {/* 刀账 Button (纯净书本图标与文字) */}
          <button
            onClick={onOpenDaozhang}
            title={`本丸刀账 (${daozhangCount}振已登记)`}
            className="flex items-center justify-center w-7 h-7 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-lg border border-[var(--sakura-pink)] bg-[var(--sakura-soft)] text-[var(--sakura-deep)] hover:bg-[var(--sakura-pink)]/40 transition-colors cursor-pointer shadow-xs"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline ml-1.5 text-xs font-semibold tracking-wide">
              本丸刀账
            </span>
          </button>

          {/* 书写新奏帖 (+) */}
          <button
            onClick={onOpenNewNote}
            title="书写新奏帖"
            className="flex items-center justify-center w-7 h-7 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white hover:bg-[var(--sakura-deep)]/90 transition-all text-xs font-semibold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline ml-1">新奏帖</span>
          </button>

          {/* 设置 Button */}
          <button
            onClick={onOpenSettings}
            title="本丸常务与配置"
            className="p-1.5 sm:p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--header-red)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Zone 1.5b: Mobile-dedicated sub-row (Cleanly positioned UNDER settings and plus button) */}
      <div className="flex md:hidden items-center justify-end w-full pt-0.5 pb-0.5">
        <div className="flex items-center p-0.5 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] text-xs font-serif shadow-2xs">
          <button
            onClick={() => onSelectMainView('notes')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
              activeMainView === 'notes'
                ? 'bg-[var(--panel-color)] text-[var(--header-red)] shadow-xs border border-[var(--sakura-pink)]/70'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>奏帖</span>
          </button>
          <button
            onClick={() => onSelectMainView('planner')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
              activeMainView === 'planner'
                ? 'bg-[var(--panel-color)] text-[var(--header-red)] shadow-xs border border-[var(--sakura-pink)]/70'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5 text-[var(--sakura-deep)]" />
            <span>周记</span>
          </button>
        </div>
      </div>
    </header>
  );
};
