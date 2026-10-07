import React, { useState, useMemo } from 'react';
import { Note, NeibanRecord, NoteTag, NeibanType, NeibanStatus, DaozhangRecord } from '../types';
import { SACRED_FORTUNE_LIST, SacredFortuneDefinition } from '../dailyFortuneData';
import { soundManager } from '../utils/soundManager';
import {
  Search,
  Sparkles,
  CheckSquare,
  Square,
  Trash2,
  Plus,
  Calendar,
  Compass,
  Shield,
  Clover,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface NotesSectionProps {
  notes: Note[];
  neibanRecords: NeibanRecord[];
  daozhangRecords?: DaozhangRecord[];
  saniwaName?: string;
  honmaruName?: string;
  onOpenNote: (note: Note) => void;
  onAddNeiban: (record: Omit<NeibanRecord, 'id'>) => void;
  onToggleNeiban: (id: number, targetProgress?: number) => void;
  onUpdateNeibanStatus?: (id: number, status: NeibanStatus, escapeReason?: string) => void;
  onDeleteNeiban: (id: number) => void;
  onLoadPresetNeiban?: () => void;
  showToast: (msg: string) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  neibanRecords,
  daozhangRecords = [],
  saniwaName = '主殿',
  honmaruName = '大和',
  onOpenNote,
  onAddNeiban,
  onToggleNeiban,
  onUpdateNeibanStatus,
  onDeleteNeiban,
  onLoadPresetNeiban,
  showToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMainFilter, setActiveMainFilter] = useState<string>('全部');
  const [activeBattleFilter, setActiveBattleFilter] = useState<string>('全部');
  const [activeNeibanFilter, setActiveNeibanFilter] = useState<string>('全部');

  // Neiban Form State
  const [neibanDate, setNeibanDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [neibanName, setNeibanName] = useState<string>('');
  const [neibanType, setNeibanType] = useState<NeibanType>('马当番');
  const [neibanProgress, setNeibanProgress] = useState<number>(0); // 0, 50, 100
  const [neibanIsEscape, setNeibanIsEscape] = useState<boolean>(false);
  const [neibanEscapeReason, setNeibanEscapeReason] = useState<string>('');

  // Editing escape reason modal
  const [editingEscapeRecord, setEditingEscapeRecord] = useState<NeibanRecord | null>(null);
  const [inputEscapeReason, setInputEscapeReason] = useState<string>('');

  // Divination State
  const [fortuneResult, setFortuneResult] = useState<SacredFortuneDefinition | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Calculate Neiban overall progress and school diligence data for Recharts
  const neibanStats = useMemo(() => {
    const totalCount = neibanRecords.length;
    // Calculate total points: completed (100%) = 1, half (50%) = 0.5, escaped or 0% = 0
    let totalProgressSum = 0;
    let completedCount = 0;
    let halfCount = 0;
    let escapedCount = 0;

    neibanRecords.forEach((r) => {
      const p = typeof r.progress === 'number' ? r.progress : r.done ? 100 : 0;
      totalProgressSum += p;
      if (p === 100) completedCount += 1;
      else if (p === 50) halfCount += 1;
      if (r.status === 'escaped' || r.escapeReason) escapedCount += 1;
    });

    const overallRate = totalCount > 0 ? Math.round(totalProgressSum / totalCount) : 0;

    // Map sword name to school from daozhang records
    const swordSchoolMap: Record<string, string> = {};
    daozhangRecords.forEach((dz) => {
      if (dz.name) {
        swordSchoolMap[dz.name.trim()] = dz.school ? dz.school.trim() : '其他刀派';
      }
    });

    // Default schools fallback
    const presetSchools: Record<string, string> = {
      '三日月宗近': '三条',
      '小狐丸': '三条',
      '石切丸': '三条',
      '一期一振': '粟田口',
      '乱藤四郎': '粟田口',
      '莺丸': '古备前',
      '加州清光': '加州',
      '大和守安定': '大和守',
      '山姥切国广': '堀川',
      '压切长谷部': '长谷部',
      '鹤丸国永': '五条',
      '烛台切光忠': '长船',
      '宗三左文字': '左文字',
      '江雪左文字': '左文字',
    };

    // Aggregate by school
    const schoolStats: Record<string, { total: number; progressSum: number; completed: number; half: number; escaped: number }> = {};

    neibanRecords.forEach((rec) => {
      const name = rec.name.trim();
      const school =
        swordSchoolMap[name] || presetSchools[name] || '本丸同僚';
      if (!schoolStats[school]) {
        schoolStats[school] = { total: 0, progressSum: 0, completed: 0, half: 0, escaped: 0 };
      }
      schoolStats[school].total += 1;
      const p = typeof rec.progress === 'number' ? rec.progress : rec.done ? 100 : 0;
      schoolStats[school].progressSum += p;
      if (p === 100) schoolStats[school].completed += 1;
      else if (p === 50) schoolStats[school].half += 1;
      if (rec.status === 'escaped' || rec.escapeReason) schoolStats[school].escaped += 1;
    });

    const chartData = Object.entries(schoolStats).map(([school, data]) => {
      const rate = data.total > 0 ? Math.round(data.progressSum / data.total) : 0;
      return {
        school,
        rate,
        completed: data.completed,
        half: data.half,
        escaped: data.escaped,
        total: data.total,
        displayLabel: `${school} (${rate}%)`,
      };
    }).sort((a, b) => b.rate - a.rate);

    return {
      totalCount,
      completedCount,
      halfCount,
      escapedCount,
      overallRate,
      chartData,
    };
  }, [neibanRecords, daozhangRecords]);

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    // Text search
    if (searchQuery.trim()) {
      if (!n.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
    }

    const noteTag = n.tag || '日常';

    if (activeMainFilter === '全部') return true;

    if (activeMainFilter === '战斗') {
      if (activeBattleFilter === '全部') {
        return noteTag === '出征' || noteTag === '远征' || noteTag === '演练' || noteTag === '战斗';
      }
      return noteTag === activeBattleFilter;
    }

    if (activeMainFilter === '内番') {
      if (activeNeibanFilter === '全部') {
        return (
          noteTag === '内番' ||
          noteTag === '马当番' ||
          noteTag === '畑当番' ||
          noteTag === '手合场' ||
          noteTag === '寝当番'
        );
      }
      return noteTag === activeNeibanFilter;
    }

    return noteTag === activeMainFilter;
  });

  // Handle Neiban Submission
  const handleCreateNeiban = (e: React.FormEvent) => {
    e.preventDefault();
    if (!neibanName.trim()) {
      showToast('请填写当值刀剑男士姓名');
      return;
    }

    const status: NeibanStatus = neibanIsEscape
      ? 'escaped'
      : neibanProgress === 100
      ? 'completed'
      : neibanProgress === 50
      ? 'half'
      : 'pending';

    onAddNeiban({
      date: neibanDate || new Date().toISOString().split('T')[0],
      name: neibanName.trim(),
      type: neibanType,
      done: neibanProgress === 100,
      progress: neibanIsEscape ? 0 : neibanProgress,
      status,
      escapeReason: neibanIsEscape ? neibanEscapeReason.trim() || '无端摸鱼逃番' : '',
    });

    setNeibanName('');
    setNeibanProgress(0);
    setNeibanIsEscape(false);
    setNeibanEscapeReason('');
    showToast(
      neibanIsEscape
        ? `已录入【${neibanName.trim()}】的逃番逸闻`
        : `已登记【${neibanName.trim()}】的${neibanType}事务 (${neibanProgress}%)`
    );
  };

  // Filtered Neiban records for the table
  const displayedNeibanRecords = neibanRecords.filter((r) => {
    if (activeNeibanFilter === '全部') return true;
    return r.type === activeNeibanFilter;
  });

  // 刀装神签摇签算法：采用12级神签（大吉、中吉、小吉、吉、半吉、末吉、末小吉、平、小凶、半凶、凶、末凶）
  const drawFortune = () => {
    soundManager.playWindbell();
    setIsShaking(true);
    setTimeout(() => {
      const sum = SACRED_FORTUNE_LIST.reduce((acc, cur) => acc + cur.weight, 0);
      let rand = Math.random() * sum;
      let selected = SACRED_FORTUNE_LIST[0];
      for (const item of SACRED_FORTUNE_LIST) {
        if (rand < item.weight) {
          selected = item;
          break;
        }
        rand -= item.weight;
      }

      setFortuneResult(selected);
      setIsShaking(false);
      showToast(`神签占得【${selected.level}】· 象征「${selected.symbol}」· ${selected.meaning}`);
    }, 400);
  };

  const getTagColorClass = (tag: string) => {
    switch (tag) {
      case '内番':
        return 'bg-emerald-700 text-white';
      case '马当番':
        return 'bg-amber-800 text-white';
      case '畑当番':
        return 'bg-lime-700 text-white';
      case '手合场':
        return 'bg-red-700 text-white';
      case '寝当番':
        return 'bg-purple-800 text-white';
      case '出征':
        return 'bg-rose-700 text-white';
      case '远征':
        return 'bg-sky-700 text-white';
      case '演练':
        return 'bg-orange-700 text-white';
      case '刀装':
        return 'bg-slate-700 text-white';
      case '日常':
      default:
        return 'bg-stone-500 text-white';
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 sm:p-6 gap-4 overflow-y-auto">
      {/* Search & Tag Filter Bar */}
      <div className="bg-[var(--panel-color)] p-4 rounded-xl border border-[var(--border-color)] shadow-xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="检索本丸奏帖记述..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:border-[var(--sakura-deep)] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-color)]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Primary Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {['全部', '日常', '内番', '战斗', '刀装'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setActiveMainFilter(tag);
                if (tag === '战斗') setActiveBattleFilter('全部');
                if (tag === '内番') setActiveNeibanFilter('全部');
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap text-xs transition-colors cursor-pointer ${
                activeMainFilter === tag
                  ? 'bg-[var(--sakura-pink)] text-[var(--header-red)] font-bold shadow-2xs'
                  : 'bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Secondary Sub-Filter: Battle */}
        {activeMainFilter === '战斗' && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--border-color)] overflow-x-auto text-xs animate-fadeIn">
            <span className="text-[var(--text-muted)] text-[11px] shrink-0">战斗分类:</span>
            {['全部', '出征', '远征', '演练'].map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveBattleFilter(sub)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                  activeBattleFilter === sub
                    ? 'bg-[var(--sakura-deep)] text-white font-medium shadow-2xs'
                    : 'border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
                }`}
              >
                {sub === '全部' ? '全部战斗' : sub}
              </button>
            ))}
          </div>
        )}

        {/* Secondary Sub-Filter: Neiban */}
        {activeMainFilter === '内番' && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-[var(--border-color)] overflow-x-auto text-xs animate-fadeIn">
            <span className="text-[var(--text-muted)] text-[11px] shrink-0">当番项目:</span>
            {['全部', '马当番', '畑当番', '手合场', '寝当番'].map((sub) => (
              <button
                key={sub}
                onClick={() => setActiveNeibanFilter(sub)}
                className={`px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
                  activeNeibanFilter === sub
                    ? 'bg-[var(--sakura-deep)] text-white font-medium shadow-2xs'
                    : 'border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
                }`}
              >
                {sub === '全部' ? '全部内番' : sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Special Module 1: 内番当值名册表格 (When '内番' is selected) */}
      {activeMainFilter === '内番' && (
        <div className="bg-[var(--panel-color)] rounded-xl border border-emerald-600/30 p-4 shadow-xs border-l-4 border-l-emerald-600 animate-fadeIn space-y-4">
          {/* Header & Overall Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-color)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-color)] flex items-center gap-1.5 font-serif">
                <span>🌾</span> 内番·各刀派勤勉度与当值履历
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                记录马当番、畑当番、手合场及寝当番完成情况，督导本丸众刃修行
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] font-mono text-[var(--text-color)]">
                总安排: <strong className="text-[var(--text-color)]">{neibanStats.totalCount}</strong> 项
              </span>
              {neibanStats.escapedCount > 0 && (
                <span className="text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-300 font-serif">
                  🦊 逃番: {neibanStats.escapedCount} 刃
                </span>
              )}
              <span className="text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono font-bold">
                总达成率: {neibanStats.overallRate}%
              </span>
            </div>
          </div>

          {/* 1. Overall Progress Bar */}
          <div className="p-3 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)]">
            <div className="flex items-center justify-between text-xs font-serif mb-1.5">
              <span className="flex items-center gap-1 text-[var(--text-color)] font-bold">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                本丸全刃内番总进度
              </span>
              <span className="font-mono text-[var(--text-muted)] text-[11px]">
                圆满 {neibanStats.completedCount} 项 · 半途 {neibanStats.halfCount} 项 (折半算入) · 逃番 {neibanStats.escapedCount} 项 · 达成 {neibanStats.overallRate}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden relative">
              <div
                className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-600 transition-all duration-500 ease-out"
                style={{ width: `${neibanStats.overallRate}%` }}
              />
            </div>
          </div>

          {/* 2. Recharts Horizontal Bar Chart: School Diligence */}
          {neibanStats.chartData.length > 0 && (
            <div className="p-3.5 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold font-serif text-[var(--text-color)] flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
                  各刀派内番达成比例 (横向柱状图)
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  按勤勉完成率从高到低排序
                </span>
              </div>

              <div className="w-full" style={{ height: Math.max(140, neibanStats.chartData.length * 36) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={neibanStats.chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
                  >
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      unit="%"
                      tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                      axisLine={{ stroke: 'var(--border-color)' }}
                      tickLine={false}
                    />
                    <YAxis
                      dataKey="school"
                      type="category"
                      width={65}
                      tick={{ fontSize: 11, fill: 'var(--text-color)', fontFamily: 'serif' }}
                      axisLine={{ stroke: 'var(--border-color)' }}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="p-2 rounded-lg bg-[var(--panel-color)] border border-[var(--border-color)] shadow-md text-xs font-serif">
                              <p className="font-bold text-[var(--header-red)]">{data.school}派</p>
                              <p className="text-[var(--text-muted)] mt-0.5">
                                完成: {data.done} / {data.total} 项
                              </p>
                              <p className="font-mono font-bold text-emerald-600 mt-0.5">
                                勤勉度达成率: {data.rate}%
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="rate"
                      name="完成率"
                      radius={[0, 4, 4, 0]}
                      barSize={16}
                    >
                      {neibanStats.chartData.map((entry, index) => {
                        // High diligence emerald, medium teal/gold, low amber
                        let fillColor = '#059669'; // emerald-600
                        if (entry.rate === 100) fillColor = '#10b981';
                        else if (entry.rate >= 50) fillColor = '#0d9488';
                        else fillColor = '#d97706';
                        return <Cell key={`cell-${index}`} fill={fillColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Quick Add Form */}
          <form
            onSubmit={handleCreateNeiban}
            className="flex flex-col gap-2.5 bg-[var(--search-bg)] p-3 rounded-lg border border-[var(--border-color)] text-xs"
          >
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="date"
                value={neibanDate}
                onChange={(e) => setNeibanDate(e.target.value)}
                className="px-2.5 py-1.5 rounded border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-mono"
              />
              <input
                type="text"
                placeholder="当值刀剑男士 (如: 压切长谷部)"
                value={neibanName}
                onChange={(e) => setNeibanName(e.target.value)}
                className="flex-1 min-w-[140px] px-2.5 py-1.5 rounded border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] focus:outline-hidden focus:border-[var(--sakura-deep)]"
              />
              <select
                value={neibanType}
                onChange={(e) => setNeibanType(e.target.value as NeibanType)}
                className="px-2.5 py-1.5 rounded border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] focus:outline-hidden"
              >
                <option value="马当番">马当番</option>
                <option value="畑当番">畑当番</option>
                <option value="手合场">手合场</option>
                <option value="寝当番">寝当番</option>
              </select>

              {/* Progress selector: 0%, 50%, 100% */}
              {!neibanIsEscape && (
                <div className="flex items-center gap-1 bg-[var(--panel-color)] px-2 py-1 rounded border border-[var(--border-color)]">
                  <span className="text-[11px] text-[var(--text-muted)]">进度:</span>
                  <button
                    type="button"
                    onClick={() => setNeibanProgress(0)}
                    className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                      neibanProgress === 0
                        ? 'bg-gray-400 text-white font-bold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    0%
                  </button>
                  <button
                    type="button"
                    onClick={() => setNeibanProgress(50)}
                    className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                      neibanProgress === 50
                        ? 'bg-amber-500 text-white font-bold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    50% (半途)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNeibanProgress(100)}
                    className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-colors ${
                      neibanProgress === 100
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    100% (圆满)
                  </button>
                </div>
              )}

              {/* Escape toggle */}
              <label className="flex items-center gap-1.5 text-[var(--text-color)] cursor-pointer select-none px-2 py-1 rounded bg-[var(--panel-color)] border border-[var(--border-color)]">
                <input
                  type="checkbox"
                  checked={neibanIsEscape}
                  onChange={(e) => {
                    setNeibanIsEscape(e.target.checked);
                    if (e.target.checked) setNeibanProgress(0);
                  }}
                  className="accent-amber-600 rounded"
                />
                <span className={neibanIsEscape ? 'font-bold text-amber-600' : 'text-[var(--text-muted)]'}>
                  🦊 逃番 (摸鱼)
                </span>
              </label>

              <button
                type="submit"
                className="px-3.5 py-1.5 rounded bg-[var(--sakura-deep)] text-white font-medium hover:bg-[var(--sakura-deep)]/90 cursor-pointer shadow-xs ml-auto"
              >
                登记
              </button>
            </div>

            {/* If逃番 is checked, show reason input */}
            {neibanIsEscape && (
              <div className="flex items-center gap-2 pt-1 animate-fadeIn">
                <span className="text-[11px] text-amber-600 shrink-0 font-serif">
                  逃番事由 / 偷溜小记:
                </span>
                <input
                  type="text"
                  placeholder="例：嫌弃耕作弄脏白布溜之大吉 / 趁主公不备偷溜去捉雀 / 借口找退退摸鱼"
                  value={neibanEscapeReason}
                  onChange={(e) => setNeibanEscapeReason(e.target.value)}
                  className="flex-1 px-2.5 py-1 text-xs rounded border border-amber-300 bg-[var(--panel-color)] text-[var(--text-color)] focus:outline-hidden focus:border-amber-500 font-serif"
                />
              </div>
            )}
          </form>

          {/* Roster Table */}
          <div className="overflow-x-auto border border-[var(--border-color)] rounded-lg">
            <table className="w-full text-xs text-center border-collapse">
              <thead className="bg-[var(--search-bg)] border-b border-[var(--border-color)] text-[var(--text-muted)]">
                <tr>
                  <th className="py-2 px-3 font-semibold text-left">日期</th>
                  <th className="py-2 px-3 font-semibold">当番项目</th>
                  <th className="py-2 px-3 font-semibold">当值刀男</th>
                  <th className="py-2 px-3 font-semibold">状态与进度</th>
                  <th className="py-2 px-3 font-semibold text-left">当番逸事 / 逃番备考</th>
                  <th className="py-2 px-3 font-semibold text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {displayedNeibanRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 font-serif">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="italic">
                          {activeNeibanFilter !== '全部'
                            ? `暂无【${activeNeibanFilter}】当值记录`
                            : '内番名册尚无当值安排。请在上方登记当番，或载入当番示例。'}
                        </span>
                        {neibanRecords.length === 0 && onLoadPresetNeiban && (
                          <button
                            type="button"
                            onClick={onLoadPresetNeiban}
                            className="mt-1 px-3 py-1.5 rounded-lg border border-[var(--sakura-pink)] bg-[var(--sakura-soft)] text-[var(--sakura-deep)] text-xs font-semibold hover:bg-[var(--sakura-pink)]/40 cursor-pointer transition-colors"
                          >
                            🌾 一键载入内番示例名册
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedNeibanRecords.map((rec) => {
                    const prog = typeof rec.progress === 'number' ? rec.progress : rec.done ? 100 : 0;
                    const isEscaped = rec.status === 'escaped' || !!rec.escapeReason;

                    return (
                      <tr key={rec.id} className="hover:bg-[var(--search-bg)]/40 transition-colors">
                        <td className="py-2 px-3 font-mono text-[var(--text-muted)] text-left">
                          {rec.date}
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getTagColorClass(rec.type)}`}>
                            {rec.type}
                          </span>
                        </td>
                        <td className="py-2 px-3 font-bold font-serif text-[var(--text-color)]">
                          {rec.name}
                        </td>
                        <td className="py-2 px-3">
                          {/* Progress toggle & status badge */}
                          <div className="inline-flex items-center gap-1.5">
                            {isEscaped ? (
                              <span
                                onClick={() => {
                                  if (onUpdateNeibanStatus) {
                                    onUpdateNeibanStatus(rec.id, 'pending', '');
                                  }
                                }}
                                title="点击取消逃番状态并重回未完成"
                                className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800 text-[10px] font-serif cursor-pointer hover:opacity-80"
                              >
                                🦊 逃番 (0%)
                              </span>
                            ) : prog === 100 ? (
                              <button
                                onClick={() => onToggleNeiban(rec.id, 0)}
                                title="点击切换为未完成"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-[10px] font-bold border border-emerald-300 cursor-pointer"
                              >
                                <CheckSquare className="w-3 h-3 text-emerald-600" />
                                <span>已圆满 (100%)</span>
                              </button>
                            ) : prog === 50 ? (
                              <button
                                onClick={() => onToggleNeiban(rec.id, 100)}
                                title="点击切换为100%完成"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 text-[10px] font-bold border border-amber-300 cursor-pointer"
                              >
                                <div className="w-2.5 h-2.5 rounded-full border border-amber-500 overflow-hidden relative">
                                  <div className="w-1/2 h-full bg-amber-500" />
                                </div>
                                <span>半途 (50%)</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => onToggleNeiban(rec.id, 50)}
                                title="点击推进至50%"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 text-[10px] border border-gray-300 cursor-pointer"
                              >
                                <Square className="w-3 h-3 text-gray-400" />
                                <span>未始 (0%)</span>
                              </button>
                            )}

                            {/* Quick Cycle Button (0% -> 50% -> 100%) */}
                            <button
                              onClick={() => onToggleNeiban(rec.id)}
                              title="循环切换进度 (0% ➔ 50% ➔ 100%)"
                              className="text-[10px] text-[var(--text-muted)] hover:text-[var(--sakura-deep)] px-1 py-0.5 rounded hover:bg-[var(--panel-color)] font-mono border border-[var(--border-color)]"
                            >
                              ⟳
                            </button>
                          </div>
                        </td>

                        {/* 当番逸事 / 逃番备考 */}
                        <td className="py-2 px-3 text-left">
                          {rec.escapeReason ? (
                            <div
                              onClick={() => {
                                setEditingEscapeRecord(rec);
                                setInputEscapeReason(rec.escapeReason || '');
                              }}
                              title="点击编辑逃番备考"
                              className="text-amber-700 dark:text-amber-400 text-xs font-serif italic truncate max-w-xs cursor-pointer hover:underline"
                            >
                              「{rec.escapeReason}」
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingEscapeRecord(rec);
                                setInputEscapeReason(rec.escapeReason || '');
                              }}
                              className="text-[11px] text-[var(--text-muted)] hover:text-amber-600 transition-colors font-serif italic cursor-pointer"
                            >
                              + 补录逃番/当番逸闻
                            </button>
                          )}
                        </td>

                        <td className="py-2 px-3 text-right">
                          <button
                            onClick={() => onDeleteNeiban(rec.id)}
                            className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                            title="移除此项当值"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer with quick action */}
          {onLoadPresetNeiban && (
            <div className="pt-1 flex items-center justify-between text-xs text-[var(--text-muted)] font-serif">
              <span>当值记录：{displayedNeibanRecords.length} / {neibanRecords.length} 项</span>
              <button
                type="button"
                onClick={onLoadPresetNeiban}
                className="hover:text-[var(--sakura-deep)] transition-colors cursor-pointer text-[11px]"
                title="载入五项经典内番示例数据"
              >
                载入内番示例名册
              </button>
            </div>
          )}

          {/* Escape reason editing modal */}
          {editingEscapeRecord && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
              onClick={() => setEditingEscapeRecord(null)}
            >
              <div
                className="w-full max-w-sm bg-[var(--panel-color)] rounded-xl border border-[var(--sakura-pink)] p-5 shadow-2xl space-y-3"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
                  <h4 className="font-serif font-bold text-sm text-[var(--header-red)]">
                    录写【{editingEscapeRecord.name}】的当番/逃番事由
                  </h4>
                  <button
                    onClick={() => setEditingEscapeRecord(null)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-color)] text-xs"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-xs text-[var(--text-muted)] font-serif">
                  记录该刃偷懒逃番、溜至后山玩耍，或完成一半中途歇息的生动逸闻：
                </p>

                <textarea
                  value={inputEscapeReason}
                  onChange={(e) => setInputEscapeReason(e.target.value)}
                  placeholder="例：嫌弃泥水弄脏了白布，抱臂在一旁督工 / 借口找小老虎玩耍溜掉了..."
                  rows={3}
                  className="w-full p-2.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] focus:outline-hidden focus:border-[var(--sakura-deep)] font-serif"
                />

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateNeibanStatus) {
                        onUpdateNeibanStatus(editingEscapeRecord.id, 'pending', '');
                      }
                      setEditingEscapeRecord(null);
                    }}
                    className="text-xs text-red-500 hover:underline cursor-pointer"
                  >
                    清除事由
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingEscapeRecord(null)}
                      className="px-3 py-1 text-xs rounded border border-[var(--border-color)] text-[var(--text-color)]"
                    >
                      取消
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateNeibanStatus) {
                          const status = inputEscapeReason.trim() ? 'escaped' : 'pending';
                          onUpdateNeibanStatus(editingEscapeRecord.id, status, inputEscapeReason.trim());
                        }
                        setEditingEscapeRecord(null);
                      }}
                      className="px-3.5 py-1 text-xs rounded bg-[var(--sakura-deep)] text-white font-bold cursor-pointer shadow-xs"
                    >
                      记录逸闻
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Special Module 2: 刀装·运势占卜模块 (When '刀装' is selected) */}
      {activeMainFilter === '刀装' && (
        <div className="bg-[var(--panel-color)] rounded-xl border border-[var(--accent-gold)]/40 p-6 shadow-xs border-l-4 border-l-[var(--accent-gold)] text-center animate-fadeIn space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl">⛩️</span>
            <h3 className="text-base font-bold text-[var(--text-color)] font-serif">
              刀装 · 运势占卜与祈愿
            </h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
            摇签占卜今日锻造与出阵手气，祈愿皆为特上精锐之装、神刀出炉。
          </p>

          <button
            onClick={drawFortune}
            disabled={isShaking}
            className={`px-8 py-2.5 rounded-full bg-[var(--accent-gold)] text-white text-sm font-bold shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer ${
              isShaking ? 'animate-bounce' : ''
            }`}
          >
            {isShaking ? '神狐摇签中...' : '摇取今日神签'}
          </button>

          {fortuneResult && (
            <div
              className="mt-4 p-5 rounded-2xl bg-[var(--search-bg)] border border-[var(--border-color)] max-w-md mx-auto animate-fadeIn shadow-xs space-y-3"
              style={{
                borderTop: `4px solid ${fortuneResult.color}`,
              }}
            >
              {/* Fortune Emblem & Symbol */}
              <div className="flex items-center justify-center gap-3">
                <div
                  className="text-4xl font-serif font-black tracking-wider"
                  style={{ color: fortuneResult.color }}
                >
                  【{fortuneResult.level}】
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs font-bold font-serif text-[var(--text-color)] px-2 py-0.5 rounded-full bg-[var(--panel-color)] border border-[var(--border-color)]">
                    象征 · <strong style={{ color: fortuneResult.color }}>{fortuneResult.symbol}</strong>
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] font-serif mt-0.5">
                    含义：{fortuneResult.meaning}
                  </span>
                </div>
              </div>

              {/* Detailed Description */}
              <p className="text-xs leading-relaxed text-[var(--text-color)] font-serif bg-[var(--panel-color)] p-3 rounded-xl border border-[var(--border-color)]/60 text-left">
                {fortuneResult.divinationDesc}
              </p>

              {/* Encouragement note */}
              <div className="text-[11px] text-right text-[var(--text-muted)] font-serif italic">
                “{fortuneResult.dailyEncouragement}”
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes List */}
      <div className="space-y-3">
        {filteredNotes.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--panel-color)]">
            <p className="text-sm text-[var(--text-muted)] font-serif italic">
              「{honmaruName}_本丸尚无奏帖。{saniwaName}，请下达指示。」
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div
              key={note.id}
              onClick={() => onOpenNote(note)}
              className="group bg-[var(--card-bg)] rounded-lg p-4 shadow-xs border border-[var(--border-color)] hover:border-[var(--sakura-deep)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer relative"
              style={{
                borderLeft: '4px solid var(--sakura-deep)',
              }}
            >
              {/* Badge */}
              {note.tag && note.tag !== '日常' && (
                <div className="mb-2">
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${getTagColorClass(
                      note.tag
                    )}`}
                  >
                    {note.tag}
                  </span>
                </div>
              )}

              {/* Content Preview */}
              <p className="text-sm leading-relaxed text-[var(--text-color)] font-serif whitespace-pre-wrap break-words">
                {note.content}
              </p>

              {/* Date */}
              <div className="text-[11px] text-[var(--text-muted)] font-mono text-right mt-3 pt-2 border-t border-[var(--border-color)]/50 flex items-center justify-end gap-1">
                <Calendar className="w-3 h-3 opacity-60" />
                <span>{note.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
