import React, { useState, useMemo } from 'react';
import { ExpeditionRecord } from '../types';
import {
  Compass,
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Flame,
  Droplet,
  Layers,
  Sparkles,
  RefreshCw,
  BarChart3,
  LineChart,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

interface ExpeditionSectionProps {
  expeditions: ExpeditionRecord[];
  onAddExpedition: (record: Omit<ExpeditionRecord, 'id'>) => void;
  onUpdateExpedition?: (record: ExpeditionRecord) => void;
  onDeleteExpedition: (id: string) => void;
  onLoadPresetExpeditions?: () => void;
  showToast: (msg: string) => void;
}

const COMMON_EXPEDITION_AREAS = [
  '时代1-1 鸟羽出阵',
  '时代1-2 会津侦察',
  '时代1-3 南部巡回',
  '时代2-1 江户迎击',
  '时代2-2 享保大饥荒',
  '时代2-3 元禄回廊',
  '时代3-1 织田安土',
  '时代3-2 本能寺侦巡',
  '时代4-2 西上作战略',
  'B-1 公武合体运动',
  'C-2 元寇击退战',
];

export const ExpeditionSection: React.FC<ExpeditionSectionProps> = ({
  expeditions,
  onAddExpedition,
  onUpdateExpedition,
  onDeleteExpedition,
  onLoadPresetExpeditions,
  showToast,
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [area, setArea] = useState('时代1-1 鸟羽出阵');
  const [fleet, setFleet] = useState('第二部队');
  const [result, setResult] = useState<'大成功' | '成功' | '失败'>('大成功');

  // Resource Gains (收获)
  const [charcoal, setCharcoal] = useState(150);
  const [steel, setSteel] = useState(150);
  const [coolant, setCoolant] = useState(100);
  const [whetstone, setWhetstone] = useState(100);

  // Resource Expenses (消耗：手入/补给)
  const [showExpenseInputs, setShowExpenseInputs] = useState(false);
  const [charcoalExpense, setCharcoalExpense] = useState(20);
  const [steelExpense, setSteelExpense] = useState(15);
  const [coolantExpense, setCoolantExpense] = useState(10);
  const [whetstoneExpense, setWhetstoneExpense] = useState(5);

  const [itemsEarned, setItemsEarned] = useState('小判箱(中) x1, 手入札 x1');
  const [notes, setNotes] = useState('');

  // Chart display options
  const [chartMode, setChartMode] = useState<'gain' | 'net' | 'expense'>('gain');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Reset form
  const resetForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setArea('时代1-1 鸟羽出阵');
    setFleet('第二部队');
    setResult('大成功');
    setCharcoal(150);
    setSteel(150);
    setCoolant(100);
    setWhetstone(100);
    setCharcoalExpense(0);
    setSteelExpense(0);
    setCoolantExpense(0);
    setWhetstoneExpense(0);
    setItemsEarned('');
    setNotes('');
  };

  const startEdit = (rec: ExpeditionRecord) => {
    setEditingId(rec.id);
    setDate(rec.date);
    setArea(rec.area);
    setFleet(rec.fleet);
    setResult(rec.result);
    setCharcoal(rec.charcoal || 0);
    setSteel(rec.steel || 0);
    setCoolant(rec.coolant || 0);
    setWhetstone(rec.whetstone || 0);
    setCharcoalExpense(rec.charcoalExpense || 0);
    setSteelExpense(rec.steelExpense || 0);
    setCoolantExpense(rec.coolantExpense || 0);
    setWhetstoneExpense(rec.whetstoneExpense || 0);
    setShowExpenseInputs(
      !!(rec.charcoalExpense || rec.steelExpense || rec.coolantExpense || rec.whetstoneExpense)
    );
    setItemsEarned(rec.itemsEarned || '');
    setNotes(rec.notes || '');
    setIsFormOpen(true);
  };

  // Totals & Statistics
  const totals = useMemo(() => {
    return expeditions.reduce(
      (acc, cur) => {
        // Gains
        acc.charcoal += cur.charcoal || 0;
        acc.steel += cur.steel || 0;
        acc.coolant += cur.coolant || 0;
        acc.whetstone += cur.whetstone || 0;

        // Expenses
        acc.charcoalExp += cur.charcoalExpense || 0;
        acc.steelExp += cur.steelExpense || 0;
        acc.coolantExp += cur.coolantExpense || 0;
        acc.whetstoneExp += cur.whetstoneExpense || 0;

        if (cur.result === '大成功') acc.greatSuccessCount += 1;
        if (cur.result === '成功') acc.successCount += 1;
        return acc;
      },
      {
        charcoal: 0,
        steel: 0,
        coolant: 0,
        whetstone: 0,
        charcoalExp: 0,
        steelExp: 0,
        coolantExp: 0,
        whetstoneExp: 0,
        greatSuccessCount: 0,
        successCount: 0,
      }
    );
  }, [expeditions]);

  const totalExpCount = expeditions.length;
  const greatSuccessRate =
    totalExpCount > 0 ? Math.round((totals.greatSuccessCount / totalExpCount) * 100) : 0;

  // Chart data sorted chronologically
  const chartData = useMemo(() => {
    const sorted = [...expeditions].sort((a, b) => a.date.localeCompare(b.date));
    return sorted.slice(-12).map((item, idx) => {
      const cGain = item.charcoal || 0;
      const sGain = item.steel || 0;
      const coGain = item.coolant || 0;
      const wGain = item.whetstone || 0;

      const cExp = item.charcoalExpense || 0;
      const sExp = item.steelExpense || 0;
      const coExp = item.coolantExpense || 0;
      const wExp = item.whetstoneExpense || 0;

      const label = `${item.date.slice(5)} #${idx + 1}`;

      if (chartMode === 'net') {
        return {
          name: label,
          木炭净增: Math.max(0, cGain - cExp),
          玉钢净增: Math.max(0, sGain - sExp),
          冷却材净增: Math.max(0, coGain - coExp),
          砥石净增: Math.max(0, wGain - wExp),
          区域: item.area,
          成效: item.result,
        };
      }

      if (chartMode === 'expense') {
        return {
          name: label,
          木炭消耗: cExp,
          玉钢消耗: sExp,
          冷却材消耗: coExp,
          砥石消耗: wExp,
          区域: item.area,
          成效: item.result,
        };
      }

      // Default: gain
      return {
        name: label,
        木炭收获: cGain,
        玉钢收获: sGain,
        冷却材收获: coGain,
        砥石收获: wGain,
        区域: item.area,
        成效: item.result,
      };
    });
  }, [expeditions, chartMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      date: date || new Date().toISOString().split('T')[0],
      area: area.trim() || '日常远征',
      fleet,
      result,
      charcoal: Number(charcoal) || 0,
      steel: Number(steel) || 0,
      coolant: Number(coolant) || 0,
      whetstone: Number(whetstone) || 0,
      charcoalExpense: showExpenseInputs ? Number(charcoalExpense) || 0 : 0,
      steelExpense: showExpenseInputs ? Number(steelExpense) || 0 : 0,
      coolantExpense: showExpenseInputs ? Number(coolantExpense) || 0 : 0,
      whetstoneExpense: showExpenseInputs ? Number(whetstoneExpense) || 0 : 0,
      itemsEarned: itemsEarned.trim(),
      notes: notes.trim(),
    };

    if (editingId && onUpdateExpedition) {
      onUpdateExpedition({
        id: editingId,
        ...payload,
      });
      showToast(`已成功修改【${area}】远征战报`);
    } else {
      onAddExpedition(payload);
      showToast(`远征战报已归卷：【${area}】远征${result}！`);
    }

    resetForm();
  };

  return (
    <div className="bg-[var(--panel-color)] rounded-xl border border-[var(--sakura-pink)]/60 p-4 sm:p-5 shadow-xs space-y-4 animate-fadeIn border-l-4 border-l-[var(--accent-gold)]">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[var(--sakura-soft)] text-[var(--header-red)] border border-[var(--sakura-pink)]/40 shadow-2xs">
            <Compass className="w-5 h-5 text-[var(--accent-gold)]" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-[var(--header-red)] flex items-center gap-2">
              <span>本丸远征战报与四项资源收支簿</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--sakura-soft)] text-[var(--sakura-deep)] font-mono border border-[var(--sakura-pink)]/40">
                {expeditions.length} 卷战报
              </span>
            </h3>
            <p className="text-[11px] text-[var(--text-muted)] font-serif mt-0.5">
              记录各部队远征归还、大成功概率与木炭/玉钢/冷却材/砥石收获与消耗数据
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap">
          {expeditions.length === 0 && onLoadPresetExpeditions && (
            <button
              type="button"
              onClick={onLoadPresetExpeditions}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--sakura-pink)] bg-[var(--sakura-soft)] text-[var(--sakura-deep)] text-xs font-serif font-bold hover:bg-[var(--sakura-pink)]/40 cursor-pointer transition-colors shadow-2xs"
              title="载入五卷经典远征战报范本"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>载入战报范本</span>
            </button>
          )}

          <button
            onClick={() => {
              if (isFormOpen) {
                resetForm();
              } else {
                setIsFormOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white text-xs font-serif font-bold hover:bg-[var(--sakura-deep)]/90 transition-all cursor-pointer shadow-xs shrink-0"
          >
            {isFormOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isFormOpen ? '收起面板' : '录入远征战报'}</span>
          </button>
        </div>
      </div>

      {/* Dashboard Overview Cards: 4 Resources Gain & Net Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Charcoal */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-serif text-[var(--text-muted)] flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-600" /> 木炭 (Charcoal)
            </span>
            {totals.charcoalExp > 0 && (
              <span className="text-[9px] font-mono text-red-500/80">-{totals.charcoalExp}</span>
            )}
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold font-mono text-amber-700 dark:text-amber-400">
              +{totals.charcoal.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              净+{Math.max(0, totals.charcoal - totals.charcoalExp).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Steel */}
        <div className="p-3 rounded-xl bg-slate-500/10 border border-slate-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-serif text-[var(--text-muted)] flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-600" /> 玉钢 (Steel)
            </span>
            {totals.steelExp > 0 && (
              <span className="text-[9px] font-mono text-red-500/80">-{totals.steelExp}</span>
            )}
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold font-mono text-slate-700 dark:text-slate-300">
              +{totals.steel.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              净+{Math.max(0, totals.steel - totals.steelExp).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Coolant */}
        <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-serif text-[var(--text-muted)] flex items-center gap-1">
              <Droplet className="w-3 h-3 text-sky-600" /> 冷却材 (Coolant)
            </span>
            {totals.coolantExp > 0 && (
              <span className="text-[9px] font-mono text-red-500/80">-{totals.coolantExp}</span>
            )}
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold font-mono text-sky-700 dark:text-sky-400">
              +{totals.coolant.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              净+{Math.max(0, totals.coolant - totals.coolantExp).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Whetstone */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-serif text-[var(--text-muted)] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" /> 砥石 (Whetstone)
            </span>
            {totals.whetstoneExp > 0 && (
              <span className="text-[9px] font-mono text-red-500/80">-{totals.whetstoneExp}</span>
            )}
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-base sm:text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400">
              +{totals.whetstone.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              净+{Math.max(0, totals.whetstone - totals.whetstoneExp).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <div className="px-3 py-1 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] font-serif text-[var(--text-color)] flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
          <span>大成功率: </span>
          <strong className="text-[var(--accent-gold)] font-mono">{greatSuccessRate}%</strong>
          <span className="text-[10px] text-[var(--text-muted)]">
            ({totals.greatSuccessCount}/{totalExpCount})
          </span>
        </div>
        <div className="px-3 py-1 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] font-serif text-[var(--text-color)]">
          <span>总收获资源: </span>
          <strong className="font-mono text-emerald-600 dark:text-emerald-400">
            +{(totals.charcoal + totals.steel + totals.coolant + totals.whetstone).toLocaleString()}
          </strong>
        </div>
        <div className="px-3 py-1 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] font-serif text-[var(--text-color)]">
          <span>总消耗耗损: </span>
          <strong className="font-mono text-rose-500">
            -{(totals.charcoalExp + totals.steelExp + totals.coolantExp + totals.whetstoneExp).toLocaleString()}
          </strong>
        </div>
      </div>

      {/* Form: Add or Edit Expedition Report */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="p-4 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] space-y-3.5 animate-fadeIn text-xs"
        >
          <div className="font-serif font-bold text-xs text-[var(--header-red)] flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>{editingId ? '编辑远征战报' : '登记远征归还与斩获明细'}</span>
            </span>
            {editingId && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--sakura-soft)] text-[var(--sakura-deep)]">
                正在修改卷宗 #{editingId}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-serif font-semibold text-[var(--text-color)] mb-1">
                远征归还日期
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-serif font-semibold text-[var(--text-color)] mb-1">
                远征地域
              </label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="例：时代1-1 鸟羽、B-1 公武合体"
                list="expedition-areas"
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-serif"
                required
              />
              <datalist id="expedition-areas">
                {COMMON_EXPEDITION_AREAS.map((a) => (
                  <option key={a} value={a} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-[11px] font-serif font-semibold text-[var(--text-color)] mb-1">
                执事部队
              </label>
              <select
                value={fleet}
                onChange={(e) => setFleet(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-serif"
              >
                <option value="第二部队">第二部队</option>
                <option value="第三部队">第三部队</option>
                <option value="第四部队">第四部队</option>
                <option value="第一部队">第一部队 (主力)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-serif font-semibold text-[var(--text-color)] mb-1">
                远征成效
              </label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-serif font-bold"
              >
                <option value="大成功">🌟 大成功 (斩获150%资源)</option>
                <option value="成功">✨ 成功</option>
                <option value="失败">❌ 失败</option>
              </select>
            </div>
          </div>

          {/* 4 Resources Harvest (收获) */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-serif font-semibold text-[var(--text-color)]">
              🌾 斩获四大资源 (收获点数)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--panel-color)] rounded-lg border border-[var(--border-color)]">
                <span className="text-[10px] text-amber-700 font-serif font-bold shrink-0">木炭+</span>
                <input
                  type="number"
                  min="0"
                  value={charcoal}
                  onChange={(e) => setCharcoal(Number(e.target.value))}
                  className="w-full bg-transparent text-right font-mono text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--panel-color)] rounded-lg border border-[var(--border-color)]">
                <span className="text-[10px] text-slate-700 font-serif font-bold shrink-0">玉钢+</span>
                <input
                  type="number"
                  min="0"
                  value={steel}
                  onChange={(e) => setSteel(Number(e.target.value))}
                  className="w-full bg-transparent text-right font-mono text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--panel-color)] rounded-lg border border-[var(--border-color)]">
                <span className="text-[10px] text-sky-700 font-serif font-bold shrink-0">冷却材+</span>
                <input
                  type="number"
                  min="0"
                  value={coolant}
                  onChange={(e) => setCoolant(Number(e.target.value))}
                  className="w-full bg-transparent text-right font-mono text-xs focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--panel-color)] rounded-lg border border-[var(--border-color)]">
                <span className="text-[10px] text-emerald-700 font-serif font-bold shrink-0">砥石+</span>
                <input
                  type="number"
                  min="0"
                  value={whetstone}
                  onChange={(e) => setWhetstone(Number(e.target.value))}
                  className="w-full bg-transparent text-right font-mono text-xs focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Toggle Resource Consumption (消耗) */}
          <div className="space-y-2 pt-1 border-t border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowExpenseInputs(!showExpenseInputs)}
                className="text-[11px] font-serif text-[var(--header-red)] hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                {showExpenseInputs ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                <span>{showExpenseInputs ? '收起资源消耗明细' : '＋ 登记本次出征或手入资源消耗 (可选)'}</span>
              </button>
              {showExpenseInputs && (
                <span className="text-[10px] text-[var(--text-muted)] font-serif">
                  * 用于计算净增收益走势
                </span>
              )}
            </div>

            {showExpenseInputs && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 animate-fadeIn bg-[var(--panel-color)]/70 p-2.5 rounded-lg border border-dashed border-[var(--border-color)]">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--panel-color)] rounded border border-rose-300 dark:border-rose-900/60">
                  <span className="text-[10px] text-rose-600 font-serif shrink-0">木炭耗-</span>
                  <input
                    type="number"
                    min="0"
                    value={charcoalExpense}
                    onChange={(e) => setCharcoalExpense(Number(e.target.value))}
                    className="w-full bg-transparent text-right font-mono text-xs focus:outline-hidden text-rose-600"
                  />
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--panel-color)] rounded border border-rose-300 dark:border-rose-900/60">
                  <span className="text-[10px] text-rose-600 font-serif shrink-0">玉钢耗-</span>
                  <input
                    type="number"
                    min="0"
                    value={steelExpense}
                    onChange={(e) => setSteelExpense(Number(e.target.value))}
                    className="w-full bg-transparent text-right font-mono text-xs focus:outline-hidden text-rose-600"
                  />
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--panel-color)] rounded border border-rose-300 dark:border-rose-900/60">
                  <span className="text-[10px] text-rose-600 font-serif shrink-0">冷却耗-</span>
                  <input
                    type="number"
                    min="0"
                    value={coolantExpense}
                    onChange={(e) => setCoolantExpense(Number(e.target.value))}
                    className="w-full bg-transparent text-right font-mono text-xs focus:outline-hidden text-rose-600"
                  />
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--panel-color)] rounded border border-rose-300 dark:border-rose-900/60">
                  <span className="text-[10px] text-rose-600 font-serif shrink-0">砥石耗-</span>
                  <input
                    type="number"
                    min="0"
                    value={whetstoneExpense}
                    onChange={(e) => setWhetstoneExpense(Number(e.target.value))}
                    className="w-full bg-transparent text-right font-mono text-xs focus:outline-hidden text-rose-600"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-serif font-semibold text-[var(--text-color)] mb-1">
                随伴获赠道具 (小判箱 / 加速札 / 委托札)
              </label>
              <input
                type="text"
                value={itemsEarned}
                onChange={(e) => setItemsEarned(e.target.value)}
                placeholder="例：小判箱(大) x1, 手入札 x1"
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-serif"
              />
            </div>

            <div>
              <label className="block text-[11px] font-serif font-semibold text-[var(--text-color)] mb-1">
                远征心得或带队队长
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="例：加州清光队长满樱花出阵，大成功回港"
                className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-serif"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={resetForm}
              className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white font-serif font-bold cursor-pointer hover:bg-[var(--sakura-deep)]/90 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingId ? '保存战报修改' : '录入归卷'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Recharts Chart: Resource Trends */}
      {chartData.length > 0 && (
        <div className="p-4 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] space-y-3 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-[var(--header-red)]">
              <TrendingUp className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>远征资源获取与收支走势图</span>
              <span className="text-[10px] text-[var(--text-muted)] font-mono font-normal">
                (近 {chartData.length} 次远征)
              </span>
            </div>

            {/* Chart Mode Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <div className="flex items-center p-0.5 rounded-lg bg-[var(--panel-color)] border border-[var(--border-color)] text-[11px] font-serif">
                <button
                  type="button"
                  onClick={() => setChartMode('gain')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    chartMode === 'gain'
                      ? 'bg-[var(--sakura-deep)] text-white font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                  }`}
                >
                  总获取收获
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('net')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    chartMode === 'net'
                      ? 'bg-[var(--sakura-deep)] text-white font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                  }`}
                >
                  净获取入账
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('expense')}
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                    chartMode === 'expense'
                      ? 'bg-[var(--sakura-deep)] text-white font-bold'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                  }`}
                >
                  出征消耗
                </button>
              </div>

              {/* Chart type toggle */}
              <div className="flex items-center p-0.5 rounded-lg bg-[var(--panel-color)] border border-[var(--border-color)] text-[11px]">
                <button
                  type="button"
                  onClick={() => setChartType('area')}
                  title="折线山水渐变图"
                  className={`p-1 rounded cursor-pointer ${
                    chartType === 'area'
                      ? 'bg-[var(--sakura-soft)] text-[var(--header-red)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  title="柱状对比图"
                  className={`p-1 rounded cursor-pointer ${
                    chartType === 'bar'
                      ? 'bg-[var(--sakura-soft)] text-[var(--header-red)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'area' ? (
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="charcoalGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d97706" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#d97706" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="steelGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#64748b" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#64748b" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="coolantGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="whetstoneGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--text-muted)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--panel-color)',
                      borderColor: 'var(--sakura-pink)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'serif',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  {chartMode === 'gain' && (
                    <>
                      <Area type="monotone" dataKey="木炭收获" stroke="#d97706" fill="url(#charcoalGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="玉钢收获" stroke="#64748b" fill="url(#steelGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="冷却材收获" stroke="#0284c7" fill="url(#coolantGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="砥石收获" stroke="#059669" fill="url(#whetstoneGrad)" strokeWidth={2} />
                    </>
                  )}
                  {chartMode === 'net' && (
                    <>
                      <Area type="monotone" dataKey="木炭净增" stroke="#d97706" fill="url(#charcoalGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="玉钢净增" stroke="#64748b" fill="url(#steelGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="冷却材净增" stroke="#0284c7" fill="url(#coolantGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="砥石净增" stroke="#059669" fill="url(#whetstoneGrad)" strokeWidth={2} />
                    </>
                  )}
                  {chartMode === 'expense' && (
                    <>
                      <Area type="monotone" dataKey="木炭消耗" stroke="#d97706" fill="url(#charcoalGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="玉钢消耗" stroke="#64748b" fill="url(#steelGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="冷却材消耗" stroke="#0284c7" fill="url(#coolantGrad)" strokeWidth={2} />
                      <Area type="monotone" dataKey="砥石消耗" stroke="#059669" fill="url(#whetstoneGrad)" strokeWidth={2} />
                    </>
                  )}
                </AreaChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="var(--text-muted)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--text-muted)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--panel-color)',
                      borderColor: 'var(--sakura-pink)',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontFamily: 'serif',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  {chartMode === 'gain' && (
                    <>
                      <Bar dataKey="木炭收获" fill="#d97706" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="玉钢收获" fill="#64748b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="冷却材收获" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="砥石收获" fill="#059669" radius={[4, 4, 0, 0]} />
                    </>
                  )}
                  {chartMode === 'net' && (
                    <>
                      <Bar dataKey="木炭净增" fill="#d97706" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="玉钢净增" fill="#64748b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="冷却材净增" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="砥石净增" fill="#059669" radius={[4, 4, 0, 0]} />
                    </>
                  )}
                  {chartMode === 'expense' && (
                    <>
                      <Bar dataKey="木炭消耗" fill="#d97706" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="玉钢消耗" fill="#64748b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="冷却材消耗" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="砥石消耗" fill="#059669" radius={[4, 4, 0, 0]} />
                    </>
                  )}
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* History Table List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-serif font-bold text-[var(--text-color)] block">
            远征战报历史清单 ({expeditions.length} 卷)
          </span>
          <span className="text-[11px] text-[var(--text-muted)] font-serif">
            点击战报右侧「编辑」可重新调整资源或逸事
          </span>
        </div>

        {expeditions.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--text-muted)] font-serif italic border border-dashed border-[var(--border-color)] rounded-xl flex flex-col items-center justify-center gap-2">
            <span>暂无远征战报记录。可点击上方「录入远征战报」登记，或「载入战报范本」体验。</span>
            {onLoadPresetExpeditions && (
              <button
                type="button"
                onClick={onLoadPresetExpeditions}
                className="mt-1 px-3 py-1.5 rounded-lg border border-[var(--sakura-pink)] bg-[var(--sakura-soft)] text-[var(--sakura-deep)] text-xs font-semibold hover:bg-[var(--sakura-pink)]/40 cursor-pointer transition-colors shadow-2xs"
              >
                🌾 立即载入典范远征战报范本
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {expeditions.map((exp) => (
              <div
                key={exp.id}
                className="p-3 rounded-xl bg-[var(--panel-color)] border border-[var(--border-color)] hover:border-[var(--sakura-pink)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-2xs group"
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-serif font-bold ${
                      exp.result === '大成功'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300'
                        : exp.result === '成功'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300'
                    }`}
                  >
                    {exp.result}
                  </span>

                  <span className="font-serif font-bold text-[var(--text-color)] text-sm">
                    {exp.area}
                  </span>

                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--search-bg)] text-[var(--text-muted)] font-serif border border-[var(--border-color)]">
                    {exp.fleet}
                  </span>

                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {exp.date}
                  </span>

                  {exp.itemsEarned && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--sakura-soft)] text-[var(--header-red)] font-serif">
                      🎁 {exp.itemsEarned}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end">
                  {/* Resources summary */}
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-amber-700 dark:text-amber-400">木+{exp.charcoal}</span>
                    <span className="text-slate-700 dark:text-slate-300">钢+{exp.steel}</span>
                    <span className="text-sky-700 dark:text-sky-400">冷+{exp.coolant}</span>
                    <span className="text-emerald-700 dark:text-emerald-400">砥+{exp.whetstone}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(exp)}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--sakura-deep)] hover:bg-[var(--search-bg)] cursor-pointer transition-colors"
                      title="编辑此战报"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteExpedition(exp.id)}
                      className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-[var(--search-bg)] cursor-pointer transition-colors"
                      title="删除该战报"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
