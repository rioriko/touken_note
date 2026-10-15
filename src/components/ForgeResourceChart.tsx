import React, { useState, useMemo } from 'react';
import { ForgeRecord } from '../types';
import {
  Flame,
  Droplet,
  Shield,
  Layers,
  Calendar,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  LineChart as LineChartIcon,
  BarChart3,
  Sparkles,
  Info,
  Maximize2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface ForgeResourceChartProps {
  forgeRecords: ForgeRecord[];
  onOpenForgeForm?: () => void;
  onLoadPresets?: () => void;
}

// Colors for the 4 core Touken Ranbu resources
const RESOURCE_CONFIG = {
  charcoal: {
    key: '木材消耗',
    label: '木材 (木炭)',
    icon: '🪵',
    color: '#ea580c', // Warm charcoal orange
    bgLight: 'bg-orange-50 dark:bg-orange-950/20',
    borderLight: 'border-orange-200 dark:border-orange-900/40',
    textLight: 'text-orange-700 dark:text-orange-300',
  },
  steel: {
    key: '玉钢消耗',
    label: '玉钢',
    icon: '🛡️',
    color: '#475569', // Slate indigo steel
    bgLight: 'bg-slate-50 dark:bg-slate-900/30',
    borderLight: 'border-slate-200 dark:border-slate-800',
    textLight: 'text-slate-700 dark:text-slate-300',
  },
  coolant: {
    key: '冷却材消耗',
    label: '冷却材',
    icon: '💧',
    color: '#0284c7', // Coolant blue
    bgLight: 'bg-sky-50 dark:bg-sky-950/20',
    borderLight: 'border-sky-200 dark:border-sky-900/40',
    textLight: 'text-sky-700 dark:text-sky-300',
  },
  whetstone: {
    key: '砥石消耗',
    label: '砥石',
    icon: '🪨',
    color: '#059669', // Whetstone jade green
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderLight: 'border-emerald-200 dark:border-emerald-900/40',
    textLight: 'text-emerald-700 dark:text-emerald-300',
  },
};

export const ForgeResourceChart: React.FC<ForgeResourceChartProps> = ({
  forgeRecords,
  onOpenForgeForm,
  onLoadPresets,
}) => {
  // Current month detection (e.g. "2026-10")
  const currentIsoMonth = useMemo(() => {
    return new Date().toISOString().slice(0, 7);
  }, []);

  // Determine all available months in forge records
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    monthSet.add(currentIsoMonth);
    forgeRecords.forEach((rec) => {
      if (rec.date && rec.date.length >= 7) {
        monthSet.add(rec.date.slice(0, 7));
      }
    });
    return Array.from(monthSet).sort().reverse();
  }, [forgeRecords, currentIsoMonth]);

  // Selected month state
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    // Prefer current month, or the most recent month with data
    return currentIsoMonth;
  });

  // Chart presentation preferences
  const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
  const [aggregationMode, setAggregationMode] = useState<'daily' | 'cumulative'>('daily');

  // Resource visibility toggles
  const [visibleResources, setVisibleResources] = useState<{
    charcoal: boolean;
    steel: boolean;
    coolant: boolean;
    whetstone: boolean;
  }>({
    charcoal: true,
    steel: true,
    coolant: true,
    whetstone: true,
  });

  // Filter forge records for the selected month
  const monthlyRecords = useMemo(() => {
    return forgeRecords
      .filter((r) => r.date && r.date.startsWith(selectedMonth))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [forgeRecords, selectedMonth]);

  // Compute monthly KPI statistics
  const monthlyStats = useMemo(() => {
    let charcoal = 0;
    let steel = 0;
    let coolant = 0;
    let whetstone = 0;
    const swordNameCounts: Record<string, number> = {};
    const dailyTotalMap: Record<string, number> = {};

    monthlyRecords.forEach((r) => {
      const c = r.charcoal || 0;
      const s = r.steel || 0;
      const cl = r.coolant || 0;
      const w = r.whetstone || 0;
      const daySum = c + s + cl + w;

      charcoal += c;
      steel += s;
      coolant += cl;
      whetstone += w;

      if (r.swordName) {
        swordNameCounts[r.swordName] = (swordNameCounts[r.swordName] || 0) + 1;
      }

      dailyTotalMap[r.date] = (dailyTotalMap[r.date] || 0) + daySum;
    });

    const totalResources = charcoal + steel + coolant + whetstone;
    const forgeCount = monthlyRecords.length;

    // Find peak day
    let peakDay = '';
    let peakAmount = 0;
    Object.entries(dailyTotalMap).forEach(([day, sum]) => {
      if (sum > peakAmount) {
        peakAmount = sum;
        peakDay = day;
      }
    });

    return {
      charcoal,
      steel,
      coolant,
      whetstone,
      totalResources,
      forgeCount,
      swordNameCounts,
      peakDay,
      peakAmount,
      distinctDaysCount: Object.keys(dailyTotalMap).length,
    };
  }, [monthlyRecords]);

  // Build chart dataset aggregated by date in this month
  const chartData = useMemo(() => {
    if (monthlyRecords.length === 0) return [];

    // Group records by date
    const dateMap = new Map<
      string,
      {
        date: string;
        charcoal: number;
        steel: number;
        coolant: number;
        whetstone: number;
        swords: Array<{ name: string; duration?: string; ofuda?: string; type?: string }>;
      }
    >();

    monthlyRecords.forEach((rec) => {
      const entry = dateMap.get(rec.date) || {
        date: rec.date,
        charcoal: 0,
        steel: 0,
        coolant: 0,
        whetstone: 0,
        swords: [],
      };

      entry.charcoal += rec.charcoal || 0;
      entry.steel += rec.steel || 0;
      entry.coolant += rec.coolant || 0;
      entry.whetstone += rec.whetstone || 0;
      entry.swords.push({
        name: rec.swordName,
        duration: rec.duration,
        ofuda: rec.ofuda,
        type: rec.swordType,
      });

      dateMap.set(rec.date, entry);
    });

    // Sort entries chronologically
    const sortedEntries = Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );

    let cumCharcoal = 0;
    let cumSteel = 0;
    let cumCoolant = 0;
    let cumWhetstone = 0;

    return sortedEntries.map((item) => {
      cumCharcoal += item.charcoal;
      cumSteel += item.steel;
      cumCoolant += item.coolant;
      cumWhetstone += item.whetstone;

      // Format date label e.g. "10-10"
      const dateLabel = item.date.length >= 10 ? item.date.slice(5) : item.date;

      if (aggregationMode === 'cumulative') {
        return {
          rawDate: item.date,
          name: dateLabel,
          木材消耗: cumCharcoal,
          玉钢消耗: cumSteel,
          冷却材消耗: cumCoolant,
          砥石消耗: cumWhetstone,
          当日总耗: item.charcoal + item.steel + item.coolant + item.whetstone,
          累计总耗: cumCharcoal + cumSteel + cumCoolant + cumWhetstone,
          swords: item.swords,
        };
      }

      // Default daily consumption
      return {
        rawDate: item.date,
        name: dateLabel,
        木材消耗: item.charcoal,
        玉钢消耗: item.steel,
        冷却材消耗: item.coolant,
        砥石消耗: item.whetstone,
        当日总耗: item.charcoal + item.steel + item.coolant + item.whetstone,
        swords: item.swords,
      };
    });
  }, [monthlyRecords, aggregationMode]);

  // Navigate to previous month
  const handlePrevMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(y, m - 2, 1);
    const newMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  // Navigate to next month
  const handleNextMonth = () => {
    const [y, m] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(y, m, 1);
    const newMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(newMonth);
  };

  // Toggle individual resource visibility
  const toggleResource = (key: keyof typeof visibleResources) => {
    setVisibleResources((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Ensure at least one resource is active
      if (!next.charcoal && !next.steel && !next.coolant && !next.whetstone) {
        return prev;
      }
      return next;
    });
  };

  // Select all or isolate a resource
  const handleSelectOnly = (key: keyof typeof visibleResources) => {
    setVisibleResources({
      charcoal: key === 'charcoal',
      steel: key === 'steel',
      coolant: key === 'coolant',
      whetstone: key === 'whetstone',
    });
  };

  const handleSelectAll = () => {
    setVisibleResources({
      charcoal: true,
      steel: true,
      coolant: true,
      whetstone: true,
    });
  };

  // Human readable title for selected month
  const formattedMonthTitle = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    return `${year}年${parseInt(month, 10)}月`;
  }, [selectedMonth]);

  const isCurrentMonth = selectedMonth === currentIsoMonth;

  return (
    <div className="rounded-xl border border-[var(--sakura-pink)]/70 bg-[var(--card-bg)] shadow-xs overflow-hidden animate-fadeIn space-y-3.5 p-3.5 sm:p-4.5">
      {/* Header bar: Title, Month Selector, Aggregation & Chart Type Toggles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-[var(--sakura-soft)] text-[var(--header-red)] shrink-0">
            <TrendingUp className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-bold font-serif text-[var(--text-color)] tracking-wide">
                本月锻刀资材消耗走势分析
              </h4>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--sakura-soft)] text-[var(--header-red)] border border-[var(--sakura-pink)]/60 font-serif font-bold">
                {formattedMonthTitle}
                {isCurrentMonth && ' · 本月'}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] font-serif mt-0.5">
              呈现木材(木炭)、冷却材、玉钢、砥石四联资材消耗走势曲线，助力审神者洞察本丸炉火开销。
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Month Navigator */}
          <div className="flex items-center rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] p-0.5 text-xs font-serif">
            <button
              type="button"
              onClick={handlePrevMonth}
              title="上一月"
              className="p-1 rounded hover:bg-[var(--panel-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent px-1.5 py-0.5 font-bold font-mono text-xs text-[var(--text-color)] focus:outline-hidden cursor-pointer"
            >
              {availableMonths.map((m) => {
                const [y, mon] = m.split('-');
                return (
                  <option key={m} value={m} className="bg-[var(--panel-color)] text-[var(--text-color)]">
                    {y}年{parseInt(mon, 10)}月 {m === currentIsoMonth ? '(本月)' : ''}
                  </option>
                );
              })}
            </select>

            <button
              type="button"
              onClick={handleNextMonth}
              title="下一月"
              className="p-1 rounded hover:bg-[var(--panel-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Aggregation Mode: Daily vs Cumulative */}
          <div className="flex items-center rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] p-0.5 text-[11px] font-serif">
            <button
              type="button"
              onClick={() => setAggregationMode('daily')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                aggregationMode === 'daily'
                  ? 'bg-[var(--header-red)] text-white font-bold shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
              }`}
            >
              每日消耗
            </button>
            <button
              type="button"
              onClick={() => setAggregationMode('cumulative')}
              className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                aggregationMode === 'cumulative'
                  ? 'bg-[var(--header-red)] text-white font-bold shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
              }`}
            >
              累计走势
            </button>
          </div>

          {/* Chart Type Toggle: Area vs Line vs Bar */}
          <div className="flex items-center rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setChartType('area')}
              title="山水平滑渐变曲线 (Area)"
              className={`p-1 rounded cursor-pointer transition-colors ${
                chartType === 'area'
                  ? 'bg-[var(--sakura-soft)] text-[var(--header-red)] font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('line')}
              title="纤细走势折线 (Line)"
              className={`p-1 rounded cursor-pointer transition-colors ${
                chartType === 'line'
                  ? 'bg-[var(--sakura-soft)] text-[var(--header-red)] font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('bar')}
              title="多联资材柱状对比 (Bar)"
              className={`p-1 rounded cursor-pointer transition-colors ${
                chartType === 'bar'
                  ? 'bg-[var(--sakura-soft)] text-[var(--header-red)] font-bold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Monthly KPI Overview Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-serif">
        {/* Charcoal */}
        <div
          onClick={() => toggleResource('charcoal')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
            visibleResources.charcoal
              ? 'bg-orange-50/80 dark:bg-orange-950/25 border-orange-300 dark:border-orange-800 shadow-2xs'
              : 'opacity-50 bg-[var(--search-bg)] border-[var(--border-color)]'
          }`}
          title="点击显示/隐藏木材消耗曲线"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-orange-800 dark:text-orange-300 flex items-center gap-1">
              <span>🪵</span>
              <span>木材(木炭)</span>
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                visibleResources.charcoal ? 'bg-orange-500 ring-2 ring-orange-200' : 'bg-gray-300'
              }`}
            />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold font-mono text-orange-900 dark:text-orange-100">
              {monthlyStats.charcoal.toLocaleString()}
            </span>
            <span className="text-[10px] text-orange-700/70 dark:text-orange-400 font-mono">
              {monthlyStats.totalResources > 0
                ? `${Math.round((monthlyStats.charcoal / monthlyStats.totalResources) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Steel */}
        <div
          onClick={() => toggleResource('steel')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
            visibleResources.steel
              ? 'bg-slate-50/80 dark:bg-slate-900/35 border-slate-300 dark:border-slate-700 shadow-2xs'
              : 'opacity-50 bg-[var(--search-bg)] border-[var(--border-color)]'
          }`}
          title="点击显示/隐藏玉钢消耗曲线"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-300 flex items-center gap-1">
              <span>🛡️</span>
              <span>玉钢</span>
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                visibleResources.steel ? 'bg-slate-500 ring-2 ring-slate-200' : 'bg-gray-300'
              }`}
            />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-slate-100">
              {monthlyStats.steel.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-600/70 dark:text-slate-400 font-mono">
              {monthlyStats.totalResources > 0
                ? `${Math.round((monthlyStats.steel / monthlyStats.totalResources) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Coolant */}
        <div
          onClick={() => toggleResource('coolant')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
            visibleResources.coolant
              ? 'bg-sky-50/80 dark:bg-sky-950/25 border-sky-300 dark:border-sky-800 shadow-2xs'
              : 'opacity-50 bg-[var(--search-bg)] border-[var(--border-color)]'
          }`}
          title="点击显示/隐藏冷却材消耗曲线"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1">
              <span>💧</span>
              <span>冷却材</span>
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                visibleResources.coolant ? 'bg-sky-500 ring-2 ring-sky-200' : 'bg-gray-300'
              }`}
            />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold font-mono text-sky-900 dark:text-sky-100">
              {monthlyStats.coolant.toLocaleString()}
            </span>
            <span className="text-[10px] text-sky-600/70 dark:text-sky-400 font-mono">
              {monthlyStats.totalResources > 0
                ? `${Math.round((monthlyStats.coolant / monthlyStats.totalResources) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>

        {/* Whetstone */}
        <div
          onClick={() => toggleResource('whetstone')}
          className={`p-2.5 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
            visibleResources.whetstone
              ? 'bg-emerald-50/80 dark:bg-emerald-950/25 border-emerald-300 dark:border-emerald-800 shadow-2xs'
              : 'opacity-50 bg-[var(--search-bg)] border-[var(--border-color)]'
          }`}
          title="点击显示/隐藏砥石消耗曲线"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
              <span>🪨</span>
              <span>砥石</span>
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                visibleResources.whetstone ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-gray-300'
              }`}
            />
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold font-mono text-emerald-900 dark:text-emerald-100">
              {monthlyStats.whetstone.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400 font-mono">
              {monthlyStats.totalResources > 0
                ? `${Math.round((monthlyStats.whetstone / monthlyStats.totalResources) * 100)}%`
                : '0%'}
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Monthly Insights Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-[var(--search-bg)]/80 border border-[var(--border-color)] text-[11px] font-serif text-[var(--text-muted)]">
        <div className="flex flex-wrap items-center gap-3">
          <span>
            本月出炉锻造:{' '}
            <strong className="text-[var(--header-red)] font-mono font-bold">
              {monthlyStats.forgeCount}
            </strong>{' '}
            炉
          </span>
          <span>
            四联资材总耗:{' '}
            <strong className="text-[var(--text-color)] font-mono font-bold">
              {monthlyStats.totalResources.toLocaleString()}
            </strong>
          </span>
          {monthlyStats.peakDay && (
            <span>
              消耗最高日:{' '}
              <span className="font-mono text-[var(--accent-gold)] font-bold">
                {monthlyStats.peakDay.slice(5)}
              </span>{' '}
              ({monthlyStats.peakAmount.toLocaleString()} 资材)
            </span>
          )}
        </div>

        {/* Quick Curve Legend Toggles */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[var(--text-muted)]">曲线过滤:</span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="hover:underline text-[var(--sakura-deep)] cursor-pointer"
          >
            全部显示
          </button>
        </div>
      </div>

      {/* Main Recharts Visualization Canvas */}
      <div className="w-full pt-1">
        {chartData.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-xl border border-dashed border-[var(--border-color)] bg-[var(--search-bg)]/40 font-serif space-y-2.5">
            <div className="w-10 h-10 mx-auto rounded-full bg-[var(--sakura-soft)] text-[var(--header-red)] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-xs text-[var(--text-color)] font-bold">
              {formattedMonthTitle} 暂无锻刀资材消耗记录
            </p>
            <p className="text-[11px] text-[var(--text-muted)] max-w-md mx-auto">
              本月本丸炉火尚未开炉，您可以切换到有记录的月份，或在上方开启「执炉新锻一振」进行记录。
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              {onOpenForgeForm && (
                <button
                  type="button"
                  onClick={onOpenForgeForm}
                  className="px-3 py-1.5 rounded-lg bg-[var(--header-red)] text-white text-xs font-bold hover:bg-[var(--header-red)]/90 transition-all cursor-pointer shadow-2xs"
                >
                  执炉新锻一振
                </button>
              )}
              {onLoadPresets && (
                <button
                  type="button"
                  onClick={onLoadPresets}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-xs text-[var(--text-muted)] hover:text-[var(--text-color)] transition-colors cursor-pointer"
                >
                  载入经典锻刀范本
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="charcoalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="steelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#475569" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#475569" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="coolantGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.03} />
                    </linearGradient>
                    <linearGradient id="whetstoneGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    stroke="var(--border-color)"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    stroke="var(--border-color)"
                  />
                  <Tooltip
                    content={<CustomForgeTooltip aggregationMode={aggregationMode} />}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px', fontFamily: 'serif' }}
                  />

                  {visibleResources.charcoal && (
                    <Area
                      type="monotone"
                      name="木材消耗"
                      dataKey="木材消耗"
                      stroke="#ea580c"
                      fill="url(#charcoalGrad)"
                      strokeWidth={2.2}
                      dot={{ r: 3, fill: '#ea580c', strokeWidth: 1 }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {visibleResources.steel && (
                    <Area
                      type="monotone"
                      name="玉钢消耗"
                      dataKey="玉钢消耗"
                      stroke="#475569"
                      fill="url(#steelGrad)"
                      strokeWidth={2.2}
                      dot={{ r: 3, fill: '#475569', strokeWidth: 1 }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {visibleResources.coolant && (
                    <Area
                      type="monotone"
                      name="冷却材消耗"
                      dataKey="冷却材消耗"
                      stroke="#0284c7"
                      fill="url(#coolantGrad)"
                      strokeWidth={2.2}
                      dot={{ r: 3, fill: '#0284c7', strokeWidth: 1 }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                  {visibleResources.whetstone && (
                    <Area
                      type="monotone"
                      name="砥石消耗"
                      dataKey="砥石消耗"
                      stroke="#059669"
                      fill="url(#whetstoneGrad)"
                      strokeWidth={2.2}
                      dot={{ r: 3, fill: '#059669', strokeWidth: 1 }}
                      activeDot={{ r: 5 }}
                    />
                  )}
                </AreaChart>
              ) : chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    stroke="var(--border-color)"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    stroke="var(--border-color)"
                  />
                  <Tooltip
                    content={<CustomForgeTooltip aggregationMode={aggregationMode} />}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px', fontFamily: 'serif' }}
                  />

                  {visibleResources.charcoal && (
                    <Line
                      type="monotone"
                      name="木材消耗"
                      dataKey="木材消耗"
                      stroke="#ea580c"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#ea580c', strokeWidth: 1.5 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {visibleResources.steel && (
                    <Line
                      type="monotone"
                      name="玉钢消耗"
                      dataKey="玉钢消耗"
                      stroke="#475569"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#475569', strokeWidth: 1.5 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {visibleResources.coolant && (
                    <Line
                      type="monotone"
                      name="冷却材消耗"
                      dataKey="冷却材消耗"
                      stroke="#0284c7"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#0284c7', strokeWidth: 1.5 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                  {visibleResources.whetstone && (
                    <Line
                      type="monotone"
                      name="砥石消耗"
                      dataKey="砥石消耗"
                      stroke="#059669"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#059669', strokeWidth: 1.5 }}
                      activeDot={{ r: 6 }}
                    />
                  )}
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    stroke="var(--border-color)"
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    stroke="var(--border-color)"
                  />
                  <Tooltip
                    content={<CustomForgeTooltip aggregationMode={aggregationMode} />}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '8px', fontFamily: 'serif' }}
                  />

                  {visibleResources.charcoal && (
                    <Bar
                      name="木材消耗"
                      dataKey="木材消耗"
                      fill="#ea580c"
                      radius={[3, 3, 0, 0]}
                    />
                  )}
                  {visibleResources.steel && (
                    <Bar
                      name="玉钢消耗"
                      dataKey="玉钢消耗"
                      fill="#475569"
                      radius={[3, 3, 0, 0]}
                    />
                  )}
                  {visibleResources.coolant && (
                    <Bar
                      name="冷却材消耗"
                      dataKey="冷却材消耗"
                      fill="#0284c7"
                      radius={[3, 3, 0, 0]}
                    />
                  )}
                  {visibleResources.whetstone && (
                    <Bar
                      name="砥石消耗"
                      dataKey="砥石消耗"
                      fill="#059669"
                      radius={[3, 3, 0, 0]}
                    />
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Swords Forged Summary Tags */}
      {Object.keys(monthlyStats.swordNameCounts).length > 0 && (
        <div className="pt-2 border-t border-[var(--border-color)] flex flex-wrap items-center gap-1.5 text-xs font-serif">
          <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[var(--accent-gold)]" />
            本月炉下显现名刃:
          </span>
          {Object.entries(monthlyStats.swordNameCounts).map(([name, count]) => (
            <span
              key={name}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--sakura-soft)] text-[var(--text-color)] border border-[var(--sakura-pink)] text-[11px]"
            >
              <span className="font-bold">{name}</span>
              {count > 1 && (
                <span className="font-mono text-[10px] text-[var(--header-red)]">x{count}</span>
              )}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Custom Tooltip Component for Honmaru Forge Records
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  aggregationMode?: 'daily' | 'cumulative';
}

const CustomForgeTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  aggregationMode,
}) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  if (!dataPoint) return null;

  return (
    <div className="p-3 rounded-xl bg-[var(--panel-color)] border border-[var(--sakura-pink)] shadow-lg text-xs font-serif min-w-[210px] space-y-2">
      <div className="flex items-center justify-between pb-1.5 border-b border-[var(--border-color)]">
        <span className="font-bold text-[var(--text-color)] font-mono">
          {dataPoint.rawDate || label}
        </span>
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--sakura-soft)] text-[var(--header-red)]">
          {aggregationMode === 'cumulative' ? '本月累计消耗' : '当日消耗合计'}
        </span>
      </div>

      {/* Swords forged on this date */}
      {dataPoint.swords && dataPoint.swords.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] text-[var(--text-muted)] block">显现刀剑男士:</span>
          <div className="flex flex-wrap gap-1">
            {dataPoint.swords.map((s: any, idx: number) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded bg-[var(--search-bg)] border border-[var(--border-color)] text-[10px] text-[var(--text-color)] font-bold inline-flex items-center gap-1"
              >
                <span>{s.name}</span>
                {s.duration && (
                  <span className="font-mono font-normal text-[var(--text-muted)]">
                    ({s.duration.slice(0, 5)})
                  </span>
                )}
                {s.ofuda && s.ofuda !== '无' && (
                  <span className="text-[var(--accent-gold)]">[{s.ofuda}札]</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4 Resources */}
      <div className="space-y-1 pt-1 border-t border-[var(--border-color)]/70">
        <div className="flex items-center justify-between text-orange-700 dark:text-orange-300">
          <span className="flex items-center gap-1">
            <span>🪵</span>
            <span>木材 (木炭)</span>
          </span>
          <span className="font-mono font-bold">
            {(dataPoint['木材消耗'] || 0).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1">
            <span>🛡️</span>
            <span>玉钢</span>
          </span>
          <span className="font-mono font-bold">
            {(dataPoint['玉钢消耗'] || 0).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-sky-700 dark:text-sky-300">
          <span className="flex items-center gap-1">
            <span>💧</span>
            <span>冷却材</span>
          </span>
          <span className="font-mono font-bold">
            {(dataPoint['冷却材消耗'] || 0).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300">
          <span className="flex items-center gap-1">
            <span>🪨</span>
            <span>砥石</span>
          </span>
          <span className="font-mono font-bold">
            {(dataPoint['砥石消耗'] || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Total for this day or cumulative */}
      <div className="pt-1.5 border-t border-[var(--border-color)] flex items-center justify-between font-bold text-[var(--text-color)]">
        <span>
          {aggregationMode === 'cumulative' ? '截至当日累计' : '当日总耗资材'}
        </span>
        <span className="font-mono text-[var(--header-red)]">
          {(
            (dataPoint['木材消耗'] || 0) +
            (dataPoint['玉钢消耗'] || 0) +
            (dataPoint['冷却材消耗'] || 0) +
            (dataPoint['砥石消耗'] || 0)
          ).toLocaleString()}
        </span>
      </div>
    </div>
  );
};
