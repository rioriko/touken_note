import React, { useState } from 'react';
import { ForgeRecipe, SwordType, COMMON_SWORD_TYPES } from '../types';
import { REFERENCE_FORGE_RECIPES } from '../presetData';
import {
  Sparkles,
  Plus,
  Flame,
  Shield,
  Droplet,
  Layers,
  Clock,
  Star,
  Trash2,
  Edit2,
  X,
  BookOpen,
  Search,
  Check,
  RefreshCw,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface ForgeRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipes: ForgeRecipe[];
  onAddRecipe: (recipe: Omit<ForgeRecipe, 'id'>) => void;
  onUpdateRecipe: (recipe: ForgeRecipe) => void;
  onDeleteRecipe: (id: string) => void;
  onLoadReferenceRecipes: () => void;
  onClearRecipes: () => void;
  onApplyRecipe: (recipe: ForgeRecipe) => void;
  showToast: (msg: string) => void;
  // If user opens modal to save current forge form resources
  initialFormValues?: {
    charcoal: number;
    steel: number;
    coolant: number;
    whetstone: number;
    duration?: string;
    swordType?: SwordType | string;
    swordName?: string;
  } | null;
}

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

export const ForgeRecipeModal: React.FC<ForgeRecipeModalProps> = ({
  isOpen,
  onClose,
  recipes,
  onAddRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
  onLoadReferenceRecipes,
  onClearRecipes,
  onApplyRecipe,
  showToast,
  initialFormValues,
}) => {
  // Mode: 'list' or 'edit'
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search query
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [recipeName, setRecipeName] = useState('');
  const [charcoal, setCharcoal] = useState(350);
  const [steel, setSteel] = useState(350);
  const [coolant, setCoolant] = useState(350);
  const [whetstone, setWhetstone] = useState(350);
  const [targetSword, setTargetSword] = useState('');
  const [swordType, setSwordType] = useState<SwordType | string>('打刀');
  const [expectedDuration, setExpectedDuration] = useState('01:30:00');
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isConfirmingClearRecipes, setIsConfirmingClearRecipes] = useState(false);

  // If opened with initial values to save from forge form
  React.useEffect(() => {
    if (initialFormValues && isOpen) {
      setRecipeName('');
      setCharcoal(initialFormValues.charcoal || 350);
      setSteel(initialFormValues.steel || 350);
      setCoolant(initialFormValues.coolant || 350);
      setWhetstone(initialFormValues.whetstone || 350);
      setExpectedDuration(initialFormValues.duration || '01:30:00');
      setSwordType(initialFormValues.swordType || '打刀');
      setTargetSword(initialFormValues.swordName || '');
      setNotes('');
      setIsFavorite(false);
      setEditingId(null);
      setIsEditing(true);
    }
  }, [initialFormValues, isOpen]);

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingId(null);
    setRecipeName('');
    setCharcoal(350);
    setSteel(350);
    setCoolant(350);
    setWhetstone(350);
    setTargetSword('');
    setSwordType('打刀');
    setExpectedDuration('01:30:00');
    setNotes('');
    setIsFavorite(false);
    setIsEditing(true);
  };

  const handleStartEdit = (r: ForgeRecipe) => {
    setEditingId(r.id);
    setRecipeName(r.name);
    setCharcoal(r.charcoal);
    setSteel(r.steel);
    setCoolant(r.coolant);
    setWhetstone(r.whetstone);
    setTargetSword(r.targetSword || '');
    setSwordType(r.swordType || '打刀');
    setExpectedDuration(r.expectedDuration || '01:30:00');
    setNotes(r.notes || '');
    setIsFavorite(!!r.isFavorite);
    setIsEditing(true);
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipeName.trim()) {
      showToast('请为配方起一个响亮的名字（如：All 350 / 三日月黄金配方）');
      return;
    }

    const payload = {
      name: recipeName.trim(),
      charcoal: Math.max(50, Math.min(999, Number(charcoal) || 50)),
      steel: Math.max(50, Math.min(999, Number(steel) || 50)),
      coolant: Math.max(50, Math.min(999, Number(coolant) || 50)),
      whetstone: Math.max(50, Math.min(999, Number(whetstone) || 50)),
      targetSword: targetSword.trim() || undefined,
      swordType: swordType || undefined,
      expectedDuration: expectedDuration.trim() || undefined,
      notes: notes.trim() || undefined,
      isFavorite,
    };

    if (editingId) {
      onUpdateRecipe({ id: editingId, ...payload });
      showToast(`已更新锻刀公式【${payload.name}】`);
    } else {
      onAddRecipe(payload);
      showToast(`已记录新锻刀公式【${payload.name}】`);
    }

    setIsEditing(false);
    setEditingId(null);
  };

  const handleApply = (recipe: ForgeRecipe) => {
    onApplyRecipe(recipe);
    showToast(`已一键装填配方【${recipe.name}】至锻刀台！`);
    onClose();
  };

  const filteredRecipes = recipes
    .filter((r) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        (r.targetSword && r.targetSword.toLowerCase().includes(q)) ||
        (r.swordType && r.swordType.toLowerCase().includes(q)) ||
        (r.notes && r.notes.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      // Favorites first
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] bg-[var(--panel-color)] rounded-2xl border-2 border-[var(--sakura-pink)] shadow-2xl flex flex-col overflow-hidden text-[var(--text-color)] font-serif"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)] bg-[var(--sakura-soft)]/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-[var(--header-red)] text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[var(--header-red)] tracking-wide flex items-center gap-2">
                <span>锻刀配方秘录 · 常用公式簿</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--panel-color)] border border-[var(--sakura-pink)] text-[var(--header-red)] font-mono font-normal">
                  {recipes.length > 0 ? `${recipes.length} 篇` : '无收录'}
                </span>
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                自由记录并保存四联资材配方，锻刀时一键填充，支持载入经典范本参考。
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
            title="关闭配方秘录"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Action Toolbar */}
          {!isEditing && (
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleStartAdd}
                  className="px-3.5 py-1.5 rounded-lg bg-[var(--header-red)] text-white text-xs font-bold hover:bg-[var(--header-red)]/90 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>新建专属公式</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onLoadReferenceRecipes();
                    showToast('已成功载入 8 款经典锻刀参考范本！');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[var(--sakura-pink)] bg-[var(--sakura-soft)] text-[var(--sakura-deep)] text-xs font-semibold hover:bg-[var(--sakura-pink)]/40 transition-colors cursor-pointer flex items-center gap-1.5"
                  title="载入三日月、大太刀、All 350 等 8 项官方经典范本供参考"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>载入范本作为参考 ({REFERENCE_FORGE_RECIPES.length})</span>
                </button>

                {recipes.length > 0 && (
                  isConfirmingClearRecipes ? (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs shadow-xs animate-fadeIn">
                      <span className="text-red-700 dark:text-red-300 text-[11px] font-bold">
                        确认清空所有公式？
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onClearRecipes();
                          setIsConfirmingClearRecipes(false);
                          showToast('已清空所有公式，恢复无收录初始状态');
                        }}
                        className="px-2 py-0.5 rounded bg-red-600 text-white font-bold hover:bg-red-700 text-[11px] cursor-pointer transition-colors shadow-2xs"
                      >
                        确认清空
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsConfirmingClearRecipes(false)}
                        className="px-1.5 py-0.5 rounded border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)] text-[11px] cursor-pointer transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsConfirmingClearRecipes(true)}
                      className="px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-red-600 hover:border-red-300 text-xs transition-colors cursor-pointer flex items-center gap-1"
                      title="清空当前所有配方，恢复干净无收录"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>清空配方 (恢复无收录)</span>
                    </button>
                  )
                )}
              </div>

              {/* Search filter if there are multiple recipes */}
              {recipes.length > 2 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    placeholder="检索公式/男士/刀种..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] focus:outline-hidden focus:border-[var(--sakura-deep)] font-serif w-44"
                  />
                </div>
              )}
            </div>
          )}

          {/* Form Mode: Add or Edit Recipe */}
          {isEditing ? (
            <form
              onSubmit={handleSaveRecipe}
              className="p-4 sm:p-5 rounded-xl border border-[var(--sakura-pink)] bg-[var(--search-bg)]/70 text-xs space-y-4 animate-fadeIn shadow-inner"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <span className="font-bold text-[var(--header-red)] flex items-center gap-1.5 text-sm">
                  <Sparkles className="w-4 h-4" />
                  {editingId ? '编辑锻刀公式' : '录入自定锻刀公式'}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  * 录入后可在锻刀录入界面随时一键装填
                </span>
              </div>

              {/* Row 1: Recipe Name & Favorite */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                    公式名称 (必填) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例：All 350 / 三日月黄金公式 / 鹤丸狙击炉"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-bold text-xs focus:outline-hidden focus:border-[var(--sakura-deep)]"
                  />
                </div>

                <div className="flex items-center sm:justify-center pt-2 sm:pt-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[var(--text-color)] px-3 py-1.5 rounded-lg bg-[var(--panel-color)] border border-[var(--border-color)]">
                    <input
                      type="checkbox"
                      checked={isFavorite}
                      onChange={(e) => setIsFavorite(e.target.checked)}
                      className="accent-amber-500 rounded"
                    />
                    <Star
                      className={`w-3.5 h-3.5 ${
                        isFavorite ? 'text-amber-500 fill-amber-500' : 'text-gray-400'
                      }`}
                    />
                    <span className={isFavorite ? 'font-bold text-amber-600' : 'text-[var(--text-muted)]'}>
                      设为常用置顶
                    </span>
                  </label>
                </div>
              </div>

              {/* Row 2: 4-Resources Input */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1.5">
                  四联资材数值配比 (50 ~ 999)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Charcoal */}
                  <div className="p-2.5 rounded-lg border border-orange-200 dark:border-orange-950/60 bg-orange-50/50 dark:bg-orange-950/15">
                    <div className="flex items-center justify-between text-[11px] font-bold text-orange-800 dark:text-orange-300 mb-1">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3 h-3 text-orange-600" />
                        木材 / 木炭
                      </span>
                    </div>
                    <input
                      type="number"
                      min={50}
                      max={999}
                      step={10}
                      value={charcoal}
                      onChange={(e) => setCharcoal(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded border border-orange-200 bg-[var(--panel-color)] text-orange-900 dark:text-orange-100 font-mono font-bold text-xs focus:outline-hidden focus:border-orange-500"
                    />
                    <div className="flex gap-1 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setCharcoal(Math.max(50, charcoal - 50))}
                        className="flex-1 py-0.5 rounded text-[10px] bg-[var(--panel-color)] border border-orange-200 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-800 dark:text-orange-300"
                      >
                        -50
                      </button>
                      <button
                        type="button"
                        onClick={() => setCharcoal(Math.min(999, charcoal + 50))}
                        className="flex-1 py-0.5 rounded text-[10px] bg-[var(--panel-color)] border border-orange-200 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-800 dark:text-orange-300"
                      >
                        +50
                      </button>
                    </div>
                  </div>

                  {/* Steel */}
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-300 mb-1">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-slate-600" />
                        玉钢
                      </span>
                    </div>
                    <input
                      type="number"
                      min={50}
                      max={999}
                      step={10}
                      value={steel}
                      onChange={(e) => setSteel(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded border border-slate-200 bg-[var(--panel-color)] text-slate-900 dark:text-slate-100 font-mono font-bold text-xs focus:outline-hidden focus:border-slate-500"
                    />
                    <div className="flex gap-1 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setSteel(Math.max(50, steel - 50))}
                        className="flex-1 py-0.5 rounded text-[10px] bg-[var(--panel-color)] border border-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-300"
                      >
                        -50
                      </button>
                      <button
                        type="button"
                        onClick={() => setSteel(Math.min(999, steel + 50))}
                        className="flex-1 py-0.5 rounded text-[10px] bg-[var(--panel-color)] border border-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-300"
                      >
                        +50
                      </button>
                    </div>
                  </div>

                  {/* Coolant */}
                  <div className="p-2.5 rounded-lg border border-sky-200 dark:border-sky-950/60 bg-sky-50/50 dark:bg-sky-950/15">
                    <div className="flex items-center justify-between text-[11px] font-bold text-sky-800 dark:text-sky-300 mb-1">
                      <span className="flex items-center gap-1">
                        <Droplet className="w-3 h-3 text-sky-600" />
                        冷却材
                      </span>
                    </div>
                    <input
                      type="number"
                      min={50}
                      max={999}
                      step={10}
                      value={coolant}
                      onChange={(e) => setCoolant(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded border border-sky-200 bg-[var(--panel-color)] text-sky-900 dark:text-sky-100 font-mono font-bold text-xs focus:outline-hidden focus:border-sky-500"
                    />
                    <div className="flex gap-1 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setCoolant(Math.max(50, coolant - 50))}
                        className="flex-1 py-0.5 rounded text-[10px] bg-[var(--panel-color)] border border-sky-200 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-sky-800 dark:text-sky-300"
                      >
                        -50
                      </button>
                      <button
                        type="button"
                        onClick={() => setCoolant(Math.min(999, coolant + 50))}
                        className="flex-1 py-0.5 rounded text-[10px] bg-[var(--panel-color)] border border-sky-200 hover:bg-sky-100 dark:hover:bg-sky-900/40 text-sky-800 dark:text-sky-300"
                      >
                        +50
                      </button>
                    </div>
                  </div>

                  {/* Whetstone */}
                  <div className="p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-950/60 bg-emerald-50/50 dark:bg-emerald-950/15">
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-emerald-600" />
                        砥石
                      </span>
                    </div>
                    <input
                      type="number"
                      min={50}
                      max={999}
                      step={10}
                      value={whetstone}
                      onChange={(e) => setWhetstone(Number(e.target.value))}
                      className="w-full px-2 py-1 rounded border border-emerald-200 bg-[var(--panel-color)] text-emerald-900 dark:text-emerald-100 font-mono font-bold text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                    <div className="flex gap-1 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setWhetstone(Math.max(50, whetstone - 50))}
                        className="flex-1 py-0.5 rounded text-[10px] bg-[var(--panel-color)] border border-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                      >
                        -50
                      </button>
                      <button
                        type="button"
                        onClick={() => setWhetstone(Math.min(999, whetstone + 50))}
                        className="flex-1 py-0.5 rounded text-[10px] bg-[var(--panel-color)] border border-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300"
                      >
                        +50
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 3: Target Sword & Sword Type & Expected Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                    目标男士名讳 (可选)
                  </label>
                  <input
                    type="text"
                    placeholder="如：三日月宗近 / 石切丸"
                    value={targetSword}
                    onChange={(e) => setTargetSword(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] text-xs focus:outline-hidden focus:border-[var(--sakura-deep)]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                    推荐刀种 (可选)
                  </label>
                  <select
                    value={swordType}
                    onChange={(e) => setSwordType(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] text-xs focus:outline-hidden focus:border-[var(--sakura-deep)]"
                  >
                    {COMMON_SWORD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1 flex items-center justify-between">
                    <span>预估时长 (可选)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="如 04:00:00"
                    value={expectedDuration}
                    onChange={(e) => setExpectedDuration(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--header-red)] font-mono font-bold text-xs focus:outline-hidden focus:border-[var(--sakura-deep)]"
                  />
                </div>
              </div>

              {/* Quick Duration Buttons */}
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                <span className="text-[10px] text-[var(--text-muted)] mr-1">快捷选定预估时长:</span>
                {PRESET_DURATIONS.map((dur) => (
                  <button
                    key={dur.val}
                    type="button"
                    onClick={() => setExpectedDuration(dur.val)}
                    className={`px-1.5 py-0.5 rounded text-[10px] border transition-colors cursor-pointer ${
                      expectedDuration === dur.val
                        ? 'bg-[var(--sakura-soft)] text-[var(--header-red)] border-[var(--sakura-pink)] font-bold'
                        : 'bg-[var(--panel-color)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>

              {/* Row 4: Notes / Remarks */}
              <div>
                <label className="block text-[11px] font-bold text-[var(--text-color)] mb-1">
                  玄学考究 / 御札搭配 / 心得小注 (可选)
                </label>
                <textarea
                  rows={2}
                  placeholder="例：配富士札加护为佳，山姥切国广执炉显现概率高；或日常低耗打铁测试..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] text-xs focus:outline-hidden focus:border-[var(--sakura-deep)]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] text-xs cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[var(--header-red)] text-white text-xs font-bold hover:bg-[var(--header-red)]/90 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{editingId ? '保存公式修改' : '收纳入公式簿'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* List Mode */
            <div className="space-y-3">
              {filteredRecipes.length === 0 ? (
                /* Empty State: 无收录 */
                <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-[var(--sakura-pink)]/60 bg-[var(--search-bg)]/40 space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[var(--sakura-soft)] text-[var(--header-red)] flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-[var(--text-color)]">
                    {searchQuery ? '未找到符合条件的配方' : '当前尚未收录锻刀配方'}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
                    {searchQuery
                      ? '请尝试更换关键词搜索，或清除搜索框。'
                      : '保持初始干净的无收录状态。您可以输入并记录自己的独门锻刀配方，或点击下方按钮载入 8 款官方经典参考范本。'}
                  </p>
                  {!searchQuery && (
                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={handleStartAdd}
                        className="px-4 py-2 rounded-xl bg-[var(--header-red)] text-white text-xs font-bold hover:bg-[var(--header-red)]/90 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>录入自己的专属公式</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onLoadReferenceRecipes();
                          showToast('已成功载入 8 款经典锻刀参考范本！');
                        }}
                        className="px-4 py-2 rounded-xl border border-[var(--sakura-pink)] bg-[var(--panel-color)] text-[var(--sakura-deep)] text-xs font-bold hover:bg-[var(--sakura-soft)] transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                      >
                        <BookOpen className="w-4 h-4" />
                        <span>载入范本作为参考 (8款经典)</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Recipe Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className={`p-3.5 rounded-xl border transition-all bg-[var(--panel-color)] flex flex-col justify-between space-y-2.5 shadow-2xs ${
                        recipe.isFavorite
                          ? 'border-amber-300 dark:border-amber-700/80 ring-1 ring-amber-300/40'
                          : 'border-[var(--border-color)] hover:border-[var(--sakura-pink)]'
                      }`}
                    >
                      {/* Top Bar: Title & Badges */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateRecipe({ ...recipe, isFavorite: !recipe.isFavorite });
                            }}
                            className="text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                            title={recipe.isFavorite ? '取消置顶' : '置顶此常用公式'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                recipe.isFavorite ? 'fill-amber-500 text-amber-500' : 'text-gray-300 hover:text-amber-400'
                              }`}
                            />
                          </button>
                          <h4 className="font-bold text-xs sm:text-sm text-[var(--text-color)] tracking-wide">
                            {recipe.name}
                          </h4>
                          {recipe.swordType && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--sakura-soft)] text-[var(--header-red)] border border-[var(--sakura-pink)]/40">
                              {recipe.swordType}
                            </span>
                          )}
                          {recipe.expectedDuration && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[var(--text-muted)] font-mono flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {recipe.expectedDuration}
                            </span>
                          )}
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(recipe)}
                            className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
                            title="编辑此公式"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`确认删除配方【${recipe.name}】吗？`)) {
                                onDeleteRecipe(recipe.id);
                                showToast(`已删除配方【${recipe.name}】`);
                              }
                            }}
                            className="p-1 rounded text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                            title="删除此公式"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* 4-Resource Badge Strip */}
                      <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                        <div className="px-1.5 py-1 rounded bg-orange-50 dark:bg-orange-950/25 border border-orange-200 dark:border-orange-900/40">
                          <span className="text-[9px] text-orange-700 dark:text-orange-300 block font-serif">木</span>
                          <span className="text-xs font-bold text-orange-900 dark:text-orange-100">
                            {recipe.charcoal}
                          </span>
                        </div>
                        <div className="px-1.5 py-1 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                          <span className="text-[9px] text-slate-700 dark:text-slate-300 block font-serif">钢</span>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {recipe.steel}
                          </span>
                        </div>
                        <div className="px-1.5 py-1 rounded bg-sky-50 dark:bg-sky-950/25 border border-sky-200 dark:border-sky-900/40">
                          <span className="text-[9px] text-sky-700 dark:text-sky-300 block font-serif">冷</span>
                          <span className="text-xs font-bold text-sky-900 dark:text-sky-100">
                            {recipe.coolant}
                          </span>
                        </div>
                        <div className="px-1.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/40">
                          <span className="text-[9px] text-emerald-700 dark:text-emerald-300 block font-serif">石</span>
                          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                            {recipe.whetstone}
                          </span>
                        </div>
                      </div>

                      {/* Target Sword & Notes */}
                      {(recipe.targetSword || recipe.notes) && (
                        <div className="text-[11px] text-[var(--text-muted)] space-y-0.5 bg-[var(--search-bg)]/40 p-2 rounded-lg">
                          {recipe.targetSword && (
                            <div className="truncate">
                              <span className="text-[var(--text-color)] font-bold">🎯 目标男士：</span>
                              <span>{recipe.targetSword}</span>
                            </div>
                          )}
                          {recipe.notes && (
                            <div className="text-[10px] leading-relaxed italic line-clamp-2">
                              “{recipe.notes}”
                            </div>
                          )}
                        </div>
                      )}

                      {/* One-Click Apply Button */}
                      <button
                        type="button"
                        onClick={() => handleApply(recipe)}
                        className="w-full py-1.5 rounded-lg bg-[var(--sakura-soft)] hover:bg-[var(--header-red)] hover:text-white text-[var(--header-red)] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
                        title="立即将此配方装填入锻刀台"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>一键装填至锻刀台 ({recipe.charcoal}/{recipe.steel}/{recipe.coolant}/{recipe.whetstone})</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-color)] bg-[var(--search-bg)]/50 flex items-center justify-between text-xs text-[var(--text-muted)] shrink-0">
          <div className="flex items-center gap-2">
            <span>
              公式数量：<strong className="text-[var(--text-color)]">{recipes.length}</strong> 项
            </span>
            <span className="text-[var(--border-color)]">|</span>
            <span>
              置顶常用：<strong className="text-amber-600">{recipes.filter((r) => r.isFavorite).length}</strong> 项
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] hover:border-[var(--sakura-pink)] text-xs transition-colors cursor-pointer"
          >
            关闭公式簿
          </button>
        </div>
      </div>
    </div>
  );
};
