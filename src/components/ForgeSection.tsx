import React, { useState, useMemo } from 'react';
import {
  ForgeRecord,
  DismantleRecord,
  DaozhangRecord,
  SwordType,
  OfudaType,
  COMMON_SWORD_TYPES,
  ForgeRecipe,
} from '../types';
import {
  Flame,
  Droplet,
  Shield,
  Layers,
  Clock,
  Plus,
  Trash2,
  Sparkles,
  Scissors,
  Hammer,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Award,
  BookOpen,
  TrendingUp,
  Bookmark,
  Save,
  Star,
  Zap,
} from 'lucide-react';
import { ForgeResourceChart } from './ForgeResourceChart';
import { ForgeRecipeModal } from './ForgeRecipeModal';

interface ForgeSectionProps {
  forgeRecords: ForgeRecord[];
  dismantleRecords: DismantleRecord[];
  daozhangRecords: DaozhangRecord[];
  forgeRecipes?: ForgeRecipe[];
  onAddForge: (record: Omit<ForgeRecord, 'id'>) => void;
  onDeleteForge: (id: string) => void;
  onAddDismantle: (record: Omit<DismantleRecord, 'id'>) => void;
  onDeleteDismantle: (id: string) => void;
  onLoadPresetForges?: () => void;
  onLoadPresetDismantles?: () => void;
  onClearForges?: () => void;
  onAddForgeRecipe?: (recipe: Omit<ForgeRecipe, 'id'>) => void;
  onUpdateForgeRecipe?: (recipe: ForgeRecipe) => void;
  onDeleteForgeRecipe?: (id: string) => void;
  onLoadReferenceRecipes?: () => void;
  onClearForgeRecipes?: () => void;
  onOpenDaozhang?: () => void;
  showToast: (msg: string) => void;
}

// Classic Touken Ranbu Forge Recipe Presets
const PRESET_RECIPES = [
  { label: 'All 50 (短刀/胁差)', c: 50, s: 50, cl: 50, w: 50, desc: '轻耗极简，多出短刀' },
  { label: 'All 350 (打刀/太刀)', c: 350, s: 350, cl: 350, w: 350, desc: '经典标准炉，兼顾打刀与太刀' },
  { label: 'All 500 (太刀/大太刀)', c: 500, s: 500, cl: 500, w: 500, desc: '重刃试炉，高概率显现太刀' },
  { label: 'All 800 (长柄/枪/薙刀)', c: 800, s: 800, cl: 800, w: 800, desc: '厚积重资，枪与薙刀多见' },
  { label: '550/660/760/550 (三日月/五剑)', c: 550, s: 660, cl: 760, w: 550, desc: '传世名刃黄金公式' },
  { label: '500/600/700/700 (大太刀/石切丸)', c: 500, s: 600, cl: 700, w: 700, desc: '大太刀神刀专用公式' },
];

// Classic Touken Ranbu Forge Durations
const PRESET_DURATIONS = [
  { label: '20分', val: '00:20:00', hint: '平野/前田/乱' },
  { label: '30分', val: '00:30:00', hint: '骨喰/鲶尾/堀川' },
  { label: '40分', val: '00:40:00', hint: '笑面青江' },
  { label: '1时30分', val: '01:30:00', hint: '加州/长谷部/山姥切' },
  { label: '2时30分', val: '02:30:00', hint: '石切丸/太郎太刀' },
  { label: '3小时', val: '03:00:00', hint: '烛台切/江雪/大俱利' },
  { label: '3时20分', val: '03:20:00', hint: '一期一振/鹤丸/莺丸' },
  { label: '4小时', val: '04:00:00', hint: '三日月宗近/小狐丸' },
  { label: '5小时', val: '05:00:00', hint: '岩融 (薙刀)' },
];

export const ForgeSection: React.FC<ForgeSectionProps> = ({
  forgeRecords,
  dismantleRecords,
  daozhangRecords,
  forgeRecipes = [],
  onAddForge,
  onDeleteForge,
  onAddDismantle,
  onDeleteDismantle,
  onLoadPresetForges,
  onLoadPresetDismantles,
  onClearForges,
  onAddForgeRecipe,
  onUpdateForgeRecipe,
  onDeleteForgeRecipe,
  onLoadReferenceRecipes,
  onClearForgeRecipes,
  onOpenDaozhang,
  showToast,
}) => {
  // Sub-tabs: 'forge' (锻刀) vs 'dismantle' (刀解)
  const [activeSubTab, setActiveSubTab] = useState<'forge' | 'dismantle'>('forge');

  // Accordion form toggles
  const [isForgeFormOpen, setIsForgeFormOpen] = useState(false);
  const [isDismantleFormOpen, setIsDismantleFormOpen] = useState(false);

  // Visualization Chart toggle
  const [showResourceTrendChart, setShowResourceTrendChart] = useState(true);

  // Clear confirmation states (avoiding window.confirm which is blocked in iframes)
  const [isConfirmingClearForges, setIsConfirmingClearForges] = useState(false);

  // Recipe Modal & quick save state
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [initialRecipeToSave, setInitialRecipeToSave] = useState<{
    charcoal: number;
    steel: number;
    coolant: number;
    whetstone: number;
    duration?: string;
    swordType?: SwordType | string;
    swordName?: string;
  } | null>(null);

  // ================= FORGE FORM STATE =================
  const [forgeDate, setForgeDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [forgeCharcoal, setForgeCharcoal] = useState(350);
  const [forgeSteel, setForgeSteel] = useState(350);
  const [forgeCoolant, setForgeCoolant] = useState(350);
  const [forgeWhetstone, setForgeWhetstone] = useState(350);
  const [forgeDuration, setForgeDuration] = useState('01:30:00');
  const [forgeSwordName, setForgeSwordName] = useState('');
  const [forgeSwordType, setForgeSwordType] = useState<SwordType | string>('打刀');
  const [forgeAssistant, setForgeAssistant] = useState('山姥切国广');
  const [forgeOfuda, setForgeOfuda] = useState<OfudaType>('无');
  const [forgeNotes, setForgeNotes] = useState('');

  // ================= DISMANTLE FORM STATE =================
  const [dismantleDate, setDismantleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dismantleSwordName, setDismantleSwordName] = useState('');
  const [dismantleCount, setDismantleCount] = useState(1);
  const [dismantleCharcoal, setDismantleCharcoal] = useState(10);
  const [dismantleSteel, setDismantleSteel] = useState(10);
  const [dismantleCoolant, setDismantleCoolant] = useState(8);
  const [dismantleWhetstone, setDismantleWhetstone] = useState(10);
  const [dismantleReason, setDismantleReason] = useState('重复显现回炉');
  const [dismantleNotes, setDismantleNotes] = useState('');

  // Total Resource Statistics for Forge
  const forgeStats = useMemo(() => {
    let totalCharcoal = 0;
    let totalSteel = 0;
    let totalCoolant = 0;
    let totalWhetstone = 0;

    forgeRecords.forEach((f) => {
      totalCharcoal += f.charcoal || 0;
      totalSteel += f.steel || 0;
      totalCoolant += f.coolant || 0;
      totalWhetstone += f.whetstone || 0;
    });

    return {
      totalCharcoal,
      totalSteel,
      totalCoolant,
      totalWhetstone,
      totalCount: forgeRecords.length,
    };
  }, [forgeRecords]);

  // Total Resource Statistics for Dismantle
  const dismantleStats = useMemo(() => {
    let totalCharcoalReturned = 0;
    let totalSteelReturned = 0;
    let totalCoolantReturned = 0;
    let totalWhetstoneReturned = 0;
    let totalSwordsDismantled = 0;

    dismantleRecords.forEach((d) => {
      totalCharcoalReturned += d.charcoalReturned || 0;
      totalSteelReturned += d.steelReturned || 0;
      totalCoolantReturned += d.coolantReturned || 0;
      totalWhetstoneReturned += d.whetstoneReturned || 0;
      totalSwordsDismantled += d.count || 1;
    });

    return {
      totalCharcoalReturned,
      totalSteelReturned,
      totalCoolantReturned,
      totalWhetstoneReturned,
      totalSwordsDismantled,
      totalRecords: dismantleRecords.length,
    };
  }, [dismantleRecords]);

  // When picking a sword in dismantle, calculate default return resources
  const handleSelectDismantleSword = (name: string) => {
    setDismantleSwordName(name);
    const rec = daozhangRecords.find((r) => r.name === name);
    const type = rec?.swordType || '打刀';

    if (type === '短刀') {
      setDismantleCharcoal(3);
      setDismantleSteel(3);
      setDismantleCoolant(2);
      setDismantleWhetstone(3);
    } else if (type === '胁差') {
      setDismantleCharcoal(5);
      setDismantleSteel(5);
      setDismantleCoolant(4);
      setDismantleWhetstone(5);
    } else if (type === '太刀') {
      setDismantleCharcoal(15);
      setDismantleSteel(15);
      setDismantleCoolant(12);
      setDismantleWhetstone(15);
    } else if (type === '大太刀') {
      setDismantleCharcoal(20);
      setDismantleSteel(20);
      setDismantleCoolant(18);
      setDismantleWhetstone(20);
    } else if (type === '枪' || type === '薙刀') {
      setDismantleCharcoal(18);
      setDismantleSteel(18);
      setDismantleCoolant(15);
      setDismantleWhetstone(18);
    } else {
      // 打刀
      setDismantleCharcoal(10);
      setDismantleSteel(10);
      setDismantleCoolant(8);
      setDismantleWhetstone(10);
    }
  };

  // Submit Forge Record
  const handleSubmitForge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgeSwordName.trim()) {
      showToast('请填写锻得之刀剑男士名讳');
      return;
    }

    onAddForge({
      date: forgeDate || new Date().toISOString().split('T')[0],
      charcoal: Number(forgeCharcoal) || 0,
      steel: Number(forgeSteel) || 0,
      coolant: Number(forgeCoolant) || 0,
      whetstone: Number(forgeWhetstone) || 0,
      duration: forgeDuration.trim() || '01:30:00',
      swordName: forgeSwordName.trim(),
      swordType: forgeSwordType,
      assistant: forgeAssistant.trim(),
      ofuda: forgeOfuda,
      notes: forgeNotes.trim(),
    });

    setForgeSwordName('');
    setForgeNotes('');
    setIsForgeFormOpen(false);
  };

  // Submit Dismantle Record
  const handleSubmitDismantle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dismantleSwordName.trim()) {
      showToast('请选择或填写需刀解之刀剑男士');
      return;
    }

    const currentSword = daozhangRecords.find((r) => r.name === dismantleSwordName.trim());
    const currentCount = currentSword?.count !== undefined ? currentSword.count : 1;

    if (currentSword && currentCount < dismantleCount) {
      showToast(`本丸在库仅有 ${currentCount} 振，不可超额刀解！`);
      return;
    }

    onAddDismantle({
      date: dismantleDate || new Date().toISOString().split('T')[0],
      swordName: dismantleSwordName.trim(),
      swordType: currentSword?.swordType || '打刀',
      count: Math.max(1, Number(dismantleCount) || 1),
      charcoalReturned: Number(dismantleCharcoal) || 0,
      steelReturned: Number(dismantleSteel) || 0,
      coolantReturned: Number(dismantleCoolant) || 0,
      whetstoneReturned: Number(dismantleWhetstone) || 0,
      reason: dismantleReason.trim() || '重复显现回炉',
      notes: dismantleNotes.trim(),
    });

    setDismantleSwordName('');
    setDismantleNotes('');
    setIsDismantleFormOpen(false);
  };

  // Apply a recipe to the forge form
  const handleApplyRecipe = (recipe: ForgeRecipe) => {
    setForgeCharcoal(recipe.charcoal);
    setForgeSteel(recipe.steel);
    setForgeCoolant(recipe.coolant);
    setForgeWhetstone(recipe.whetstone);
    if (recipe.expectedDuration) {
      setForgeDuration(recipe.expectedDuration);
    }
    if (recipe.swordType) {
      setForgeSwordType(recipe.swordType);
    }
    if (recipe.targetSword && !forgeSwordName) {
      setForgeSwordName(recipe.targetSword.split('/')[0].trim());
    }
    setIsForgeFormOpen(true);
  };

  // Open modal with current form values pre-filled to save as custom recipe
  const handleSaveCurrentAsRecipe = () => {
    setInitialRecipeToSave({
      charcoal: forgeCharcoal,
      steel: forgeSteel,
      coolant: forgeCoolant,
      whetstone: forgeWhetstone,
      duration: forgeDuration,
      swordType: forgeSwordType,
      swordName: forgeSwordName,
    });
    setIsRecipeModalOpen(true);
  };

  return (
    <div className="bg-[var(--panel-color)] rounded-xl border border-[var(--sakura-pink)]/50 p-4 sm:p-5 shadow-xs border-l-4 border-l-[var(--header-red)] animate-fadeIn space-y-4">
      {/* Top Header with Title and Sub-Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-color)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[var(--sakura-soft)] text-[var(--header-red)]">
              <Hammer className="w-4 h-4" />
            </span>
            <h3 className="text-base font-bold text-[var(--text-color)] font-serif tracking-wide">
              本丸锻刀房 · 炉火造刃与刀解消纳
            </h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-serif">
            精准记录四联资材消耗、锻造时长与名刃显现，支持重刃刀解回炉，与刀账保有数量实时联动。
          </p>
        </div>

        {/* Sub-Tabs: 锻刀 vs 刀解 */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] self-start sm:self-auto shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveSubTab('forge')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'forge'
                ? 'bg-[var(--header-red)] text-white shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>锻刀履历 ({forgeRecords.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('dismantle')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-serif font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'dismantle'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>刀解消纳 ({dismantleRecords.length})</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: 锻刀造刃 ================= */}
      {activeSubTab === 'forge' && (
        <div className="space-y-4 animate-fadeIn">
          {/* 4-Resource Spent Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-orange-800 dark:text-orange-300 font-serif flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-600" />
                  木材(木炭)消耗
                </span>
                <div className="text-lg font-mono font-bold text-orange-900 dark:text-orange-100 mt-0.5">
                  {forgeStats.totalCharcoal.toLocaleString()}
                </div>
              </div>
              <span className="text-xl opacity-20">🪵</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-800 dark:text-slate-300 font-serif flex items-center gap-1">
                  <Shield className="w-3 h-3 text-slate-600" />
                  玉钢消耗
                </span>
                <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {forgeStats.totalSteel.toLocaleString()}
                </div>
              </div>
              <span className="text-xl opacity-20">🛡️</span>
            </div>

            <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-sky-800 dark:text-sky-300 font-serif flex items-center gap-1">
                  <Droplet className="w-3 h-3 text-sky-600" />
                  冷却材消耗
                </span>
                <div className="text-lg font-mono font-bold text-sky-900 dark:text-sky-100 mt-0.5">
                  {forgeStats.totalCoolant.toLocaleString()}
                </div>
              </div>
              <span className="text-xl opacity-20">💧</span>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-serif flex items-center gap-1">
                  <Layers className="w-3 h-3 text-emerald-600" />
                  砥石消耗
                </span>
                <div className="text-lg font-mono font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">
                  {forgeStats.totalWhetstone.toLocaleString()}
                </div>
              </div>
              <span className="text-xl opacity-20">🪨</span>
            </div>
          </div>

          {/* 本月锻刀资材消耗走势分析 (Recharts 可视化图表) */}
          {showResourceTrendChart && (
            <ForgeResourceChart
              forgeRecords={forgeRecords}
              onOpenForgeForm={() => setIsForgeFormOpen(true)}
              onLoadPresets={onLoadPresetForges}
            />
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsForgeFormOpen(!isForgeFormOpen)}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--header-red)] text-white text-xs font-serif font-bold hover:bg-[var(--header-red)]/90 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isForgeFormOpen ? '收起锻刀台' : '执炉新锻一振'}</span>
              {isForgeFormOpen ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setInitialRecipeToSave(null);
                  setIsRecipeModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-lg border border-[var(--sakura-pink)] bg-[var(--sakura-soft)] text-[var(--header-red)] text-xs font-serif font-bold hover:bg-[var(--sakura-pink)]/40 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="打开常用锻刀配方秘录公式簿"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>配方公式簿 ({forgeRecipes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setShowResourceTrendChart(!showResourceTrendChart)}
                className={`px-2.5 py-1.5 rounded-lg border text-xs font-serif transition-colors cursor-pointer flex items-center gap-1.5 ${
                  showResourceTrendChart
                    ? 'border-[var(--sakura-pink)] bg-[var(--sakura-soft)] text-[var(--header-red)] font-semibold'
                    : 'border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
                }`}
                title={showResourceTrendChart ? '收起本月资材消耗走势分析图表' : '展开本月资材消耗走势分析图表'}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{showResourceTrendChart ? '收起走势图' : '资材走势图'}</span>
              </button>

              {onLoadPresetForges && (
                <button
                  type="button"
                  onClick={onLoadPresetForges}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)] text-xs font-serif transition-colors cursor-pointer flex items-center gap-1"
                  title="载入经典锻刀流水参考数据"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>载入流水范本</span>
                </button>
              )}
              {onClearForges && forgeRecords.length > 0 && (
                isConfirmingClearForges ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs font-serif shadow-xs animate-fadeIn">
                    <span className="text-red-700 dark:text-red-300 text-[11px] font-bold">
                      确认清空全部 {forgeRecords.length} 炉流水？
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClearForges();
                        setIsConfirmingClearForges(false);
                        showToast('已清空锻刀流水，恢复无收录干净状态');
                      }}
                      className="px-2 py-0.5 rounded bg-red-600 text-white font-bold hover:bg-red-700 text-[11px] cursor-pointer transition-colors shadow-2xs"
                    >
                      确认清空
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClearForges(false)}
                      className="px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)] text-[11px] cursor-pointer transition-colors"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClearForges(true)}
                    className="px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-red-600 hover:border-red-300 text-xs font-serif transition-colors cursor-pointer flex items-center gap-1"
                    title="清空当前所有锻刀流水，恢复无收录干净状态"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>清空流水</span>
                  </button>
                )
              )}
              {onOpenDaozhang && (
                <button
                  type="button"
                  onClick={onOpenDaozhang}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--sakura-pink)] bg-[var(--sakura-soft)] text-[var(--sakura-deep)] text-xs font-serif font-semibold hover:bg-[var(--sakura-pink)]/40 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>查看本丸刀账</span>
                </button>
              )}
            </div>
          </div>

          {/* Forge Input Form Accordion */}
          {isForgeFormOpen && (
            <form
              onSubmit={handleSubmitForge}
              className="p-4 rounded-xl border border-[var(--sakura-pink)] bg-[var(--search-bg)]/60 text-xs font-serif space-y-3.5 animate-fadeIn shadow-inner"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <span className="font-bold text-[var(--header-red)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  执炉锻造录入
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  * 录入后对应刀剑男士将在刀账中自动增加在库保有振数
                </span>
              </div>

              {/* Quick Recipe Chips or Empty State */}
              <div>
                {forgeRecipes.length === 0 ? (
                  <div className="p-3 rounded-xl border border-dashed border-[var(--sakura-pink)] bg-[var(--panel-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-md bg-[var(--sakura-soft)] text-[var(--header-red)]">
                        <BookOpen className="w-3.5 h-3.5" />
                      </span>
                      <div>
                        <span className="text-[11px] font-bold text-[var(--text-color)] block">
                          常用锻刀公式（当前无收录）
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)]">
                          支持输入自定义独门公式，或一键载入官方经典范本参考
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setInitialRecipeToSave(null);
                          setIsRecipeModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded-md bg-[var(--header-red)] text-white text-[11px] font-bold hover:bg-[var(--header-red)]/90 transition-all cursor-pointer shadow-xs flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+ 录入专属公式</span>
                      </button>
                      {onLoadReferenceRecipes && (
                        <button
                          type="button"
                          onClick={() => {
                            onLoadReferenceRecipes();
                            showToast('已载入 8 款经典锻刀参考范本！');
                          }}
                          className="px-2.5 py-1 rounded-md border border-[var(--sakura-pink)] bg-[var(--sakura-soft)] text-[var(--sakura-deep)] text-[11px] font-semibold hover:bg-[var(--sakura-pink)]/40 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>载入范本作为参考</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
                      <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>常用配方一键装填 ({forgeRecipes.length}):</span>
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setInitialRecipeToSave(null);
                            setIsRecipeModalOpen(true);
                          }}
                          className="text-[10px] text-[var(--header-red)] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                        >
                          <Plus className="w-3 h-3" />
                          <span>新增公式</span>
                        </button>
                        <span className="text-[var(--border-color)]">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setInitialRecipeToSave(null);
                            setIsRecipeModalOpen(true);
                          }}
                          className="text-[10px] text-[var(--text-muted)] hover:text-[var(--text-color)] flex items-center gap-0.5 cursor-pointer"
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>管理公式簿</span>
                        </button>
                        {onLoadReferenceRecipes && (
                          <>
                            <span className="text-[var(--border-color)]">|</span>
                            <button
                              type="button"
                              onClick={() => {
                                onLoadReferenceRecipes();
                                showToast('已追加载入经典锻刀参考范本！');
                              }}
                              className="text-[10px] text-[var(--text-muted)] hover:text-[var(--sakura-deep)] cursor-pointer"
                              title="追加载入8款经典范本参考"
                            >
                              载入范本
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {forgeRecipes.map((recipe) => (
                        <button
                          key={recipe.id}
                          type="button"
                          onClick={() => {
                            handleApplyRecipe(recipe);
                            showToast(`已一键装填配方【${recipe.name}】(${recipe.charcoal}/${recipe.steel}/${recipe.coolant}/${recipe.whetstone})`);
                          }}
                          className={`px-2.5 py-1 rounded-md text-[11px] border cursor-pointer transition-all flex items-center gap-1 shadow-2xs ${
                            recipe.isFavorite
                              ? 'bg-amber-50/90 dark:bg-amber-950/25 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 font-bold ring-1 ring-amber-300/40'
                              : 'bg-[var(--panel-color)] border-[var(--border-color)] hover:border-[var(--sakura-deep)] text-[var(--text-color)]'
                          }`}
                          title={`${recipe.name} (${recipe.charcoal}/${recipe.steel}/${recipe.coolant}/${recipe.whetstone})${recipe.expectedDuration ? ` [${recipe.expectedDuration}]` : ''}${recipe.notes ? ` · ${recipe.notes}` : ''}`}
                        >
                          {recipe.isFavorite && <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 shrink-0" />}
                          <span>{recipe.name}</span>
                          <span className="font-mono text-[10px] opacity-75">
                            ({recipe.charcoal}/{recipe.steel}/{recipe.coolant}/{recipe.whetstone})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Row 1: Four Resources */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-orange-700 dark:text-orange-400 mb-1">
                    木材 / 木炭 (Charcoal)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={50}
                      max={999}
                      step={10}
                      value={forgeCharcoal}
                      onChange={(e) => setForgeCharcoal(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-mono font-bold text-xs focus:outline-hidden focus:border-[var(--sakura-deep)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    玉钢 (Steel)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={50}
                      max={999}
                      step={10}
                      value={forgeSteel}
                      onChange={(e) => setForgeSteel(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-mono font-bold text-xs focus:outline-hidden focus:border-[var(--sakura-deep)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-sky-700 dark:text-sky-400 mb-1">
                    冷却材 (Coolant)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={50}
                      max={999}
                      step={10}
                      value={forgeCoolant}
                      onChange={(e) => setForgeCoolant(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-mono font-bold text-xs focus:outline-hidden focus:border-[var(--sakura-deep)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                    砥石 (Whetstone)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={50}
                      max={999}
                      step={10}
                      value={forgeWhetstone}
                      onChange={(e) => setForgeWhetstone(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-mono font-bold text-xs focus:outline-hidden focus:border-[var(--sakura-deep)]"
                    />
                  </div>
                </div>
              </div>

              {/* Resource Total & Save as Custom Recipe Shortcut */}
              <div className="flex items-center justify-between pt-0.5 pb-0.5 flex-wrap gap-2">
                <span className="text-[11px] text-[var(--text-muted)] font-serif">
                  四联资材总耗：<strong className="font-mono text-[var(--header-red)]">{(forgeCharcoal + forgeSteel + forgeCoolant + forgeWhetstone).toLocaleString()}</strong> 点
                </span>

                <button
                  type="button"
                  onClick={handleSaveCurrentAsRecipe}
                  className="px-2.5 py-1 rounded-md bg-[var(--panel-color)] border border-[var(--sakura-pink)] text-[var(--sakura-deep)] hover:bg-[var(--sakura-soft)] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  title="将当前填写的四联数值直接存入您的专属锻刀公式簿"
                >
                  <Save className="w-3 h-3" />
                  <span>将当前数值保存为常用公式</span>
                </button>
              </div>

              {/* Row 2: Duration with quick presets */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-[var(--text-color)] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[var(--sakura-deep)]" />
                    锻刀倒计时时长 (HH:MM:SS)
                  </label>
                  <span className="text-[10px] text-[var(--text-muted)]">点击下方预设直选</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={forgeDuration}
                    onChange={(e) => setForgeDuration(e.target.value)}
                    placeholder="如 03:20:00"
                    className="w-28 px-2.5 py-1 rounded-md border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--header-red)] font-mono font-bold text-xs focus:outline-hidden focus:border-[var(--sakura-deep)]"
                  />
                  <div className="flex flex-wrap gap-1">
                    {PRESET_DURATIONS.map((dur) => (
                      <button
                        key={dur.val}
                        type="button"
                        onClick={() => setForgeDuration(dur.val)}
                        className={`px-2 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                          forgeDuration === dur.val
                            ? 'bg-[var(--sakura-soft)] text-[var(--header-red)] border-[var(--sakura-pink)] font-bold'
                            : 'bg-[var(--panel-color)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-color)]'
                        }`}
                        title={dur.hint}
                      >
                        {dur.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 3: Sword Name & Sword Type & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                    锻得刀剑男士名讳 *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      list="sword-names-list"
                      value={forgeSwordName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForgeSwordName(val);
                        // Auto-match swordType if in daozhang
                        const match = daozhangRecords.find((r) => r.name === val.trim());
                        if (match?.swordType) {
                          setForgeSwordType(match.swordType);
                        }
                      }}
                      placeholder="如 三日月宗近、小狐丸"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-serif font-bold text-xs focus:outline-hidden focus:border-[var(--sakura-deep)]"
                    />
                    <datalist id="sword-names-list">
                      {daozhangRecords.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.swordType} · {r.school || '本丸'}
                        </option>
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                    刀种类别
                  </label>
                  <select
                    value={forgeSwordType}
                    onChange={(e) => setForgeSwordType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] text-xs focus:outline-hidden"
                  >
                    {COMMON_SWORD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                    显现日期
                  </label>
                  <input
                    type="date"
                    value={forgeDate}
                    onChange={(e) => setForgeDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-mono text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 4: Assistant & Ofuda */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                    执炉近侍 (可选)
                  </label>
                  <input
                    type="text"
                    value={forgeAssistant}
                    onChange={(e) => setForgeAssistant(e.target.value)}
                    placeholder="如 山姥切国广、压切长谷部"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                    御札加护 (Ofuda)
                  </label>
                  <select
                    value={forgeOfuda}
                    onChange={(e) => setForgeOfuda(e.target.value as OfudaType)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] text-xs focus:outline-hidden font-medium"
                  >
                    <option value="无">无御札</option>
                    <option value="梅">梅札</option>
                    <option value="竹">竹札</option>
                    <option value="松">松札</option>
                    <option value="富士">富士札 (祈愿大吉)</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Notes */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                  锻刀心得 / 炉火祈愿杂记 (可选)
                </label>
                <input
                  type="text"
                  value={forgeNotes}
                  onChange={(e) => setForgeNotes(e.target.value)}
                  placeholder="如: 四小时炉火大吉！近侍清光执炉，新刃终于来到本丸..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] text-xs focus:outline-hidden"
                />
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsForgeFormOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--header-red)] text-white text-xs font-bold hover:bg-[var(--header-red)]/90 shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>记录锻刀显现并更新刀账</span>
                </button>
              </div>
            </form>
          )}

          {/* Forge Records Ledger Table */}
          <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--card-bg)] shadow-xs">
            <div className="p-3 bg-[var(--search-bg)] border-b border-[var(--border-color)] flex items-center justify-between text-xs font-serif flex-wrap gap-2">
              <span className="font-bold text-[var(--text-color)] flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-600" />
                锻刀流水明细录 ({forgeRecords.length} 炉)
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
                  每逢锻获新刃，刀账保有数自动 +1 振
                </span>
                {onClearForges && forgeRecords.length > 0 && !isConfirmingClearForges && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmingClearForges(true)}
                    className="text-[11px] text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
                    title="清空所有锻刀流水"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>清空流水</span>
                  </button>
                )}
              </div>
            </div>

            {forgeRecords.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)] font-serif space-y-2">
                <p>本丸炉火暂熄，尚未录入锻刀流水。</p>
                <p className="text-[11px]">点击上方「执炉新锻一振」或「载入经典锻刀范本」开启记录！</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse font-serif">
                  <thead className="bg-[var(--search-bg)]/50 border-b border-[var(--border-color)] text-[var(--text-muted)]">
                    <tr>
                      <th className="py-2.5 px-3 w-24">日期</th>
                      <th className="py-2.5 px-3">锻得刀剑</th>
                      <th className="py-2.5 px-3 w-24">倒计时时长</th>
                      <th className="py-2.5 px-3 min-w-[200px]">消耗四联资材</th>
                      <th className="py-2.5 px-3 w-28">近侍 · 御札</th>
                      <th className="py-2.5 px-3 hidden md:table-cell">心得记述</th>
                      <th className="py-2.5 px-3 text-right w-16">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {forgeRecords.map((rec) => {
                      const matchedInDaozhang = daozhangRecords.find((r) => r.name === rec.swordName);
                      const currentCount = matchedInDaozhang?.count !== undefined ? matchedInDaozhang.count : 1;

                      return (
                        <tr
                          key={rec.id}
                          className="hover:bg-[var(--sakura-soft)]/30 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-mono text-[var(--text-muted)] whitespace-nowrap">
                            {rec.date}
                          </td>

                          <td className="py-2.5 px-3 font-serif">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-[var(--text-color)]">
                                {rec.swordName}
                              </span>
                              {rec.swordType && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--search-bg)] border border-[var(--border-color)] text-[var(--text-muted)]">
                                  {rec.swordType}
                                </span>
                              )}
                              <span
                                className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-[var(--sakura-soft)] text-[var(--header-red)] border border-[var(--sakura-pink)]/50"
                                title="刀账当前保有振数"
                              >
                                在库 {currentCount} 振
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 font-mono">
                            <span className="px-2 py-0.5 rounded-full bg-[var(--search-bg)] border border-[var(--border-color)] font-bold text-[11px] text-[var(--header-red)] inline-flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-[var(--sakura-deep)]" />
                              {rec.duration}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 font-mono">
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-orange-700 dark:text-orange-400" title="木材/木炭">
                                🪵{rec.charcoal}
                              </span>
                              <span className="text-slate-700 dark:text-slate-300" title="玉钢">
                                🛡️{rec.steel}
                              </span>
                              <span className="text-sky-700 dark:text-sky-400" title="冷却材">
                                💧{rec.coolant}
                              </span>
                              <span className="text-emerald-700 dark:text-emerald-400" title="砥石">
                                🪨{rec.whetstone}
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 flex-wrap">
                              <span>{rec.assistant || '无近侍'}</span>
                              {rec.ofuda && rec.ofuda !== '无' && (
                                <span className="px-1 py-0.2 rounded text-[10px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300">
                                  {rec.ofuda}札
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-[var(--text-muted)] italic truncate max-w-xs hidden md:table-cell">
                            {rec.notes || <span className="text-gray-400">-</span>}
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => onDeleteForge(rec.id)}
                              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                              title="删除此条锻刀流水"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: 刀解消纳 ================= */}
      {activeSubTab === 'dismantle' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Dismantle Resource Return Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
              <span className="text-[11px] text-amber-800 dark:text-amber-300 font-serif flex items-center gap-1">
                <Scissors className="w-3 h-3 text-amber-700" />
                累计刀解总数
              </span>
              <div className="text-lg font-mono font-bold text-amber-900 dark:text-amber-100 mt-0.5">
                {dismantleStats.totalSwordsDismantled} <span className="text-xs font-normal">振</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40">
              <span className="text-[11px] text-orange-800 dark:text-orange-300 font-serif flex items-center gap-1">
                🪵 回收木材
              </span>
              <div className="text-lg font-mono font-bold text-orange-900 dark:text-orange-100 mt-0.5">
                +{dismantleStats.totalCharcoalReturned.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-800 dark:text-slate-300 font-serif flex items-center gap-1">
                🛡️ 回收玉钢
              </span>
              <div className="text-lg font-mono font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                +{dismantleStats.totalSteelReturned.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40">
              <span className="text-[11px] text-sky-800 dark:text-sky-300 font-serif flex items-center gap-1">
                💧 回收冷却材
              </span>
              <div className="text-lg font-mono font-bold text-sky-900 dark:text-sky-100 mt-0.5">
                +{dismantleStats.totalCoolantReturned.toLocaleString()}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-serif flex items-center gap-1">
                🪨 回收砥石
              </span>
              <div className="text-lg font-mono font-bold text-emerald-900 dark:text-emerald-100 mt-0.5">
                +{dismantleStats.totalWhetstoneReturned.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setIsDismantleFormOpen(!isDismantleFormOpen)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-serif font-bold hover:bg-amber-800 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>{isDismantleFormOpen ? '收起刀解台' : '刀解回炉重刃'}</span>
              {isDismantleFormOpen ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
            </button>

            <div className="flex items-center gap-2">
              {onLoadPresetDismantles && (
                <button
                  type="button"
                  onClick={onLoadPresetDismantles}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)] text-xs font-serif transition-colors cursor-pointer flex items-center gap-1"
                  title="载入经典刀解回炉范本"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>载入刀解范本</span>
                </button>
              )}
              {onOpenDaozhang && (
                <button
                  type="button"
                  onClick={onOpenDaozhang}
                  className="px-2.5 py-1.5 rounded-lg border border-[var(--sakura-pink)] bg-[var(--sakura-soft)] text-[var(--sakura-deep)] text-xs font-serif font-semibold hover:bg-[var(--sakura-pink)]/40 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <BookOpen className="w-3 h-3" />
                  <span>查看刀账保有振数</span>
                </button>
              )}
            </div>
          </div>

          {/* Dismantle Input Form Accordion */}
          {isDismantleFormOpen && (
            <form
              onSubmit={handleSubmitDismantle}
              className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-[var(--search-bg)]/60 text-xs font-serif space-y-3.5 animate-fadeIn shadow-inner"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <span className="font-bold text-amber-800 dark:text-amber-200 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5" />
                  刀解回炉资材转化
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  * 刀解后，刀账上对应刀剑男士的在库振数将自动扣减
                </span>
              </div>

              {/* Row 1: Sword selection & count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                    选择待刀解刀剑男士 (从刀账在库中挑选) *
                  </label>
                  <select
                    value={dismantleSwordName}
                    onChange={(e) => handleSelectDismantleSword(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] text-xs focus:outline-hidden font-bold"
                  >
                    <option value="">-- 请选择要刀解的刀剑男士 --</option>
                    {daozhangRecords.map((r) => {
                      const count = r.count !== undefined ? r.count : 1;
                      return (
                        <option key={r.id} value={r.name}>
                          {r.name} ({r.swordType} · {r.school || '本丸'}) - 当前在库: {count} 振
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                    刀解数量 (振)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={dismantleCount}
                    onChange={(e) => setDismantleCount(Math.max(1, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-mono font-bold text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Warning if sword count is 1 */}
              {(() => {
                const sword = daozhangRecords.find((r) => r.name === dismantleSwordName);
                const count = sword?.count !== undefined ? sword.count : 1;
                if (sword && count <= 1) {
                  return (
                    <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-300 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      <span>
                        注意：本丸【{sword.name}】目前仅存 <strong>1 振</strong>。若执行刀解，刀账保有数将清零变为「未在库（已刀解归虚）」。
                      </span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Row 2: Returned Resources */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                  解构回收四项资材估值 (可手动调整)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <span className="text-[10px] text-orange-700 dark:text-orange-400 block mb-0.5">
                      🪵 回收木材
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={dismantleCharcoal}
                      onChange={(e) => setDismantleCharcoal(Number(e.target.value))}
                      className="w-full px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-mono text-xs"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-700 dark:text-slate-300 block mb-0.5">
                      🛡️ 回收玉钢
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={dismantleSteel}
                      onChange={(e) => setDismantleSteel(Number(e.target.value))}
                      className="w-full px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-mono text-xs"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-sky-700 dark:text-sky-400 block mb-0.5">
                      💧 回收冷却材
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={dismantleCoolant}
                      onChange={(e) => setDismantleCoolant(Number(e.target.value))}
                      className="w-full px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-mono text-xs"
                    />
                  </div>

                  <div>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mb-0.5">
                      🪨 回收砥石
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={dismantleWhetstone}
                      onChange={(e) => setDismantleWhetstone(Number(e.target.value))}
                      className="w-full px-2.5 py-1 rounded border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Date, Reason, Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                    刀解日期
                  </label>
                  <input
                    type="date"
                    value={dismantleDate}
                    onChange={(e) => setDismantleDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                    刀解缘由
                  </label>
                  <input
                    type="text"
                    value={dismantleReason}
                    onChange={(e) => setDismantleReason(e.target.value)}
                    placeholder="如: 重复显现回炉、兵库整理"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                    札记心得 (可选)
                  </label>
                  <input
                    type="text"
                    value={dismantleNotes}
                    onChange={(e) => setDismantleNotes(e.target.value)}
                    placeholder="如: 多余刀解，回填四类资材..."
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] text-xs"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDismantleFormOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-700 text-white text-xs font-bold hover:bg-amber-800 shadow-xs cursor-pointer flex items-center gap-1"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>执行刀解并扣减刀账保有数</span>
                </button>
              </div>
            </form>
          )}

          {/* Dismantle Records Ledger Table */}
          <div className="border border-[var(--border-color)] rounded-xl overflow-hidden bg-[var(--card-bg)] shadow-xs">
            <div className="p-3 bg-[var(--search-bg)] border-b border-[var(--border-color)] flex items-center justify-between text-xs font-serif">
              <span className="font-bold text-[var(--text-color)] flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-amber-700" />
                刀解消纳台账 ({dismantleRecords.length} 笔)
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">
                刀解削减保有振数，回收精纯资材
              </span>
            </div>

            {dismantleRecords.length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--text-muted)] font-serif space-y-2">
                <p>暂无刀解回炉记录，本丸刀剑皆完好保存在库。</p>
                <p className="text-[11px]">若兵库满位或有重复重刃，可在此执行刀解回炉换取资材。</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse font-serif">
                  <thead className="bg-[var(--search-bg)]/50 border-b border-[var(--border-color)] text-[var(--text-muted)]">
                    <tr>
                      <th className="py-2.5 px-3 w-24">日期</th>
                      <th className="py-2.5 px-3">刀解男士</th>
                      <th className="py-2.5 px-3 w-20">刀解数量</th>
                      <th className="py-2.5 px-3 min-w-[200px]">回收四项资材</th>
                      <th className="py-2.5 px-3 w-32">缘由事由</th>
                      <th className="py-2.5 px-3 hidden md:table-cell">札记</th>
                      <th className="py-2.5 px-3 text-right w-16">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]">
                    {dismantleRecords.map((rec) => {
                      const matched = daozhangRecords.find((r) => r.name === rec.swordName);
                      const currentCount = matched?.count !== undefined ? matched.count : 1;

                      return (
                        <tr
                          key={rec.id}
                          className="hover:bg-[var(--sakura-soft)]/30 transition-colors"
                        >
                          <td className="py-2.5 px-3 font-mono text-[var(--text-muted)] whitespace-nowrap">
                            {rec.date}
                          </td>

                          <td className="py-2.5 px-3 font-serif">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-[var(--text-color)]">
                                {rec.swordName}
                              </span>
                              {rec.swordType && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[var(--search-bg)] border border-[var(--border-color)] text-[var(--text-muted)]">
                                  {rec.swordType}
                                </span>
                              )}
                              <span
                                className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold border ${
                                  currentCount > 0
                                    ? 'bg-[var(--sakura-soft)] text-[var(--header-red)] border-[var(--sakura-pink)]/50'
                                    : 'bg-gray-100 text-gray-500 border-gray-300 dark:bg-gray-800 dark:text-gray-400'
                                }`}
                              >
                                {currentCount > 0 ? `尚存 ${currentCount} 振` : '未在库(归虚)'}
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 font-mono font-bold text-amber-800 dark:text-amber-300">
                            - {rec.count} 振
                          </td>

                          <td className="py-2.5 px-3 font-mono">
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="text-orange-700 dark:text-orange-400" title="回收木材">
                                🪵+{rec.charcoalReturned}
                              </span>
                              <span className="text-slate-700 dark:text-slate-300" title="回收玉钢">
                                🛡️+{rec.steelReturned}
                              </span>
                              <span className="text-sky-700 dark:text-sky-400" title="回收冷却材">
                                💧+{rec.coolantReturned}
                              </span>
                              <span className="text-emerald-700 dark:text-emerald-400" title="回收砥石">
                                🪨+{rec.whetstoneReturned}
                              </span>
                            </div>
                          </td>

                          <td className="py-2.5 px-3 text-[var(--text-muted)]">
                            <span className="px-1.5 py-0.5 rounded bg-[var(--search-bg)] border border-[var(--border-color)] text-[10px]">
                              {rec.reason || '回炉纳资'}
                            </span>
                          </td>

                          <td className="py-2.5 px-3 text-[var(--text-muted)] italic truncate max-w-xs hidden md:table-cell">
                            {rec.notes || <span className="text-gray-400">-</span>}
                          </td>

                          <td className="py-2.5 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => onDeleteDismantle(rec.id)}
                              className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 cursor-pointer"
                              title="撤销此条刀解（并将振数返还刀账）"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 常用锻刀公式秘录管理 Modal */}
      <ForgeRecipeModal
        isOpen={isRecipeModalOpen}
        onClose={() => {
          setIsRecipeModalOpen(false);
          setInitialRecipeToSave(null);
        }}
        recipes={forgeRecipes}
        onAddRecipe={onAddForgeRecipe || (() => {})}
        onUpdateRecipe={onUpdateForgeRecipe || (() => {})}
        onDeleteRecipe={onDeleteForgeRecipe || (() => {})}
        onLoadReferenceRecipes={onLoadReferenceRecipes || (() => {})}
        onClearRecipes={onClearForgeRecipes || (() => {})}
        onApplyRecipe={handleApplyRecipe}
        showToast={showToast}
        initialFormValues={initialRecipeToSave}
      />
    </div>
  );
};
