import React, { useMemo } from 'react';
import { DailyFortune, isNeibanBlessed, isNeibanTaboo } from '../dailyFortuneData';
import { NeibanRecord } from '../types';
import {
  X,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Quote,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';

interface DailyFortuneModalProps {
  isOpen: boolean;
  onClose: () => void;
  fortune: DailyFortune;
  neibanRecords?: NeibanRecord[];
  onRefreshQuote?: () => void;
  honmaruName?: string;
}

export const DailyFortuneModal: React.FC<DailyFortuneModalProps> = ({
  isOpen,
  onClose,
  fortune,
  neibanRecords = [],
  onRefreshQuote,
  honmaruName = '大和',
}) => {
  // Match today's 宜 and 忌 with current planned Neiban records
  const blessedNeibanItems = useMemo(() => {
    if (!neibanRecords || neibanRecords.length === 0) return [];
    return neibanRecords
      .map((rec) => {
        const check = isNeibanBlessed(rec.type, fortune.goodFor);
        return check.isBlessed ? { record: rec, reason: check.matchedReason } : null;
      })
      .filter(Boolean) as { record: NeibanRecord; reason: string }[];
  }, [neibanRecords, fortune.goodFor]);

  const tabooNeibanItems = useMemo(() => {
    if (!neibanRecords || neibanRecords.length === 0) return [];
    return neibanRecords
      .map((rec) => {
        const check = isNeibanTaboo(rec.type, fortune.badFor);
        return check.isTaboo ? { record: rec, reason: check.matchedReason } : null;
      })
      .filter(Boolean) as { record: NeibanRecord; reason: string }[];
  }, [neibanRecords, fortune.badFor]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--panel-color)] rounded-2xl shadow-2xl border-2 border-[var(--sakura-pink)] overflow-hidden transition-all animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        }}
      >
        {/* Top Header */}
        <div className="px-5 py-4 bg-[var(--sakura-soft)] border-b border-[var(--sakura-pink)]/60 flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎋</span>
            <div>
              <h3 className="text-base font-bold text-[var(--header-red)] font-serif tracking-wider">
                本丸晨鉴 · 今日签文
              </h3>
              <span className="text-[10px] text-[var(--text-muted)] font-serif">
                {honmaruName}_本丸 · 近侍奉告
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onRefreshQuote && (
              <button
                onClick={onRefreshQuote}
                title="重新摇取箴言"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--sakura-deep)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Calendar & Fortune Section */}
        <div className="p-5 flex flex-col gap-4 text-xs">
          {/* Date banner */}
          <div className="text-center p-3 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)]">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--text-muted)] font-mono">
              <Calendar className="w-3.5 h-3.5 text-[var(--sakura-deep)]" />
              <span>{fortune.dateStr}</span>
            </div>
            <div className="text-sm font-bold font-serif text-[var(--text-color)] mt-1">
              {fortune.lunarDateStr}
            </div>
          </div>

          {/* Luck Level Emblem with Symbol & Meaning */}
          <div className="text-center py-2.5 px-4 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] relative">
            <div className="text-[11px] text-[var(--text-muted)] font-serif tracking-widest mb-0.5">
              今日运势神签
            </div>
            <div
              className="text-4xl sm:text-5xl font-serif font-black tracking-widest my-1 drop-shadow-sm transition-transform hover:scale-105 duration-200"
              style={{ color: fortune.luckColor }}
            >
              【{fortune.luckLevel}】
            </div>
            
            {/* Symbol & Core Meaning Tag */}
            <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
              <span
                className="text-xs px-2.5 py-0.5 rounded-full font-bold font-serif border"
                style={{
                  color: fortune.luckColor,
                  borderColor: fortune.luckColor,
                  backgroundColor: fortune.bgLight || 'rgba(0,0,0,0.04)',
                }}
              >
                象征 · {fortune.symbol || '天晴'}
              </span>
              <span className="text-xs font-serif text-[var(--text-color)] font-medium">
                含义：{fortune.meaning || '万事通达'}
              </span>
            </div>
          </div>

          {/* 宜 & 忌 (Yellow Emperor style calendar guide) */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* 宜 */}
            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40">
              <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold font-serif text-xs mb-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>今日 · 宜</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {fortune.goodFor.map((item) => (
                  <span
                    key={item}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-serif"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* 忌 */}
            <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-800/40">
              <div className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-bold font-serif text-xs mb-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>今日 · 忌</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {fortune.badFor.map((item) => (
                  <span
                    key={item}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-rose-900/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-[11px] font-serif"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* 神佑加持匹配与当番照应 (匹配 App.tsx 中 neibanRecords) */}
          {(blessedNeibanItems.length > 0 || tabooNeibanItems.length > 0) && (
            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/25 border border-amber-300/80 dark:border-amber-800/60 space-y-2 animate-fadeIn">
              {blessedNeibanItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-1 text-amber-800 dark:text-amber-300 font-bold font-serif text-xs mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                    <span>神佑加护内番 (与今日当值吉相相合)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {blessedNeibanItems.map(({ record, reason }) => (
                      <span
                        key={record.id}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-amber-900/40 border border-amber-300 text-amber-900 dark:text-amber-200 text-[11px] font-serif shadow-2xs"
                      >
                        <span className="font-bold">✨ 神佑</span>
                        <span>{record.name} · {record.type}</span>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400">({reason})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {tabooNeibanItems.length > 0 && (
                <div className="pt-1.5 border-t border-amber-200/60 dark:border-amber-900/40">
                  <div className="flex items-center gap-1 text-rose-700 dark:text-rose-400 font-bold font-serif text-xs mb-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>今日规诫提示 (请留意内番纪律)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tabooNeibanItems.map(({ record, reason }) => (
                      <span
                        key={record.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white dark:bg-rose-900/30 border border-rose-300 text-rose-800 dark:text-rose-300 text-[10px] font-serif"
                      >
                        <span>⚠️ {record.name} · {record.type}</span>
                        <span className="text-[9px] opacity-80">(忌: {reason})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Character Quote Box */}
          <div className="p-4 rounded-xl bg-[var(--search-bg)] border-l-4 border-l-[var(--accent-gold)] border border-[var(--border-color)] relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                <span className="font-bold font-serif text-xs text-[var(--text-color)]">
                  近侍 · {fortune.quoteSpeaker}
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-serif">
                {fortune.characterTitle}
              </span>
            </div>

            <p className="text-sm leading-relaxed font-serif text-[var(--text-color)] italic my-2">
              「{fortune.quote}」
            </p>

            <div className="text-[10px] text-right text-[var(--text-muted)] font-serif mt-1">
              — {fortune.encouragement}
            </div>
          </div>

          {/* Footer close */}
          <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2 rounded-xl bg-[var(--sakura-deep)] text-white text-xs font-bold font-serif hover:bg-[var(--sakura-deep)]/90 shadow-md cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>遵命 · 启奏本丸事记</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
