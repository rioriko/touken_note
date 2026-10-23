import React, { useState, useEffect, useMemo } from 'react';
import {
  KiwameInventory,
  KiwameRecord,
  SwordType,
  COMMON_SWORD_TYPES,
  DaozhangRecord,
} from '../types';
import {
  calculateKiwameLevelFromExp,
  CLASSIC_KIWAME_LETTERS,
  TOKU_LV99_EXP_MAP,
  KIWAME_BASE_LEVEL_MAP,
} from '../kiwameData';
import {
  Sparkles,
  Package,
  Calculator,
  ListOrdered,
  Plus,
  Trash2,
  Clock,
  Mail,
  CheckCircle2,
  Compass,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Send,
  HelpCircle,
  FileText,
  RotateCcw,
  Check,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface KiwameSectionProps {
  inventory: KiwameInventory;
  onUpdateInventory: (inventory: KiwameInventory) => void;
  records: KiwameRecord[];
  onAddRecord: (record: Omit<KiwameRecord, 'id'>, deductItems?: boolean) => void;
  onUpdateRecord: (record: KiwameRecord) => void;
  onDeleteRecord: (id: string) => void;
  onCompleteKiwame: (id: string) => void;
  daozhangRecords?: DaozhangRecord[];
  subFilter: '道具' | '经验值' | '列表';
  onSelectSubFilter: (sub: '道具' | '经验值' | '列表') => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning') => void;
}

export const KiwameSection: React.FC<KiwameSectionProps> = ({
  inventory,
  onUpdateInventory,
  records,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onCompleteKiwame,
  daozhangRecords = [],
  subFilter,
  onSelectSubFilter,
  showToast,
}) => {
  // Current real-time clock tick for 96-hour countdown
  const [nowTime, setNowTime] = useState<number>(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNowTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // -------------------------------------------------------------
  // TAB 1: 道具 (Inventory) State
  // -------------------------------------------------------------
  const completeSets = Math.min(
    inventory.travelOutfit,
    inventory.travelGear,
    inventory.letters
  );

  const handleAdjustItem = (item: 'travelOutfit' | 'travelGear' | 'letters', delta: number) => {
    const nextVal = Math.max(0, (inventory[item] || 0) + delta);
    const updated: KiwameInventory = {
      ...inventory,
      [item]: nextVal,
      logs: [
        {
          id: `log-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: delta > 0 ? 'gain' : 'consume',
          itemName: item === 'travelOutfit' ? '旅装束' : item === 'travelGear' ? '旅道具' : '手纸一式',
          count: Math.abs(delta),
          reason: delta > 0 ? '手动入库录纳' : '手动调配消纳',
        },
        ...(inventory.logs || []),
      ],
    };
    onUpdateInventory(updated);
    showToast(`已${delta > 0 ? '增入' : '核减'} ${Math.abs(delta)} 件【${item === 'travelOutfit' ? '旅装束' : item === 'travelGear' ? '旅道具' : '手纸一式'}】`);
  };

  const handleAddFullSet = (delta: number) => {
    const nextOutfit = Math.max(0, inventory.travelOutfit + delta);
    const nextGear = Math.max(0, inventory.travelGear + delta);
    const nextLetters = Math.max(0, inventory.letters + delta);
    const updated: KiwameInventory = {
      ...inventory,
      travelOutfit: nextOutfit,
      travelGear: nextGear,
      letters: nextLetters,
      logs: [
        {
          id: `log-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: delta > 0 ? 'gain' : 'consume',
          itemName: '整套三宝',
          count: Math.abs(delta),
          reason: delta > 0 ? '活动战绩/整套入库' : '整套调用消纳',
        },
        ...(inventory.logs || []),
      ],
    };
    onUpdateInventory(updated);
    showToast(`已${delta > 0 ? '调入' : '核减'} ${Math.abs(delta)} 套修行三宝！`);
  };

  // -------------------------------------------------------------
  // TAB 2: 经验值 (EXP Calculator) State
  // -------------------------------------------------------------
  const [calcSwordType, setCalcSwordType] = useState<SwordType>('打刀');
  const [calcExpInput, setCalcExpInput] = useState<number>(1500000);
  const [isTotalExpMode, setIsTotalExpMode] = useState<boolean>(false);

  const expCalculationResult = useMemo(() => {
    return calculateKiwameLevelFromExp(calcSwordType, calcExpInput, isTotalExpMode);
  }, [calcSwordType, calcExpInput, isTotalExpMode]);

  // -------------------------------------------------------------
  // TAB 3: 列表 (Depart & Countdown & Letters) State
  // -------------------------------------------------------------
  const [isDepartModalOpen, setIsDepartModalOpen] = useState(false);
  const [selectedSwordName, setSelectedSwordName] = useState('');
  const [departSwordType, setDepartSwordType] = useState<SwordType>('打刀');
  const [departTimeStr, setDepartTimeStr] = useState<string>(
    new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
  );
  const [autoDeductItems, setAutoDeductItems] = useState(true);
  const [departDay1Letter, setDepartDay1Letter] = useState('');
  const [departDay2Letter, setDepartDay2Letter] = useState('');
  const [departDay3Letter, setDepartDay3Letter] = useState('');
  const [departNotes, setDepartNotes] = useState('');
  const [departAccumulatedExp, setDepartAccumulatedExp] = useState<number>(0);

  // Expanded letter accordion in list
  const [expandedLetterId, setExpandedLetterId] = useState<string | null>(null);
  // Expanded letter accordion in completed records list
  const [expandedCompletedLetterId, setExpandedCompletedLetterId] = useState<string | null>(null);

  // State to hold temporary preview of sealed letter drafts (审神者神念先行检阅)
  const [previewedLetters, setPreviewedLetters] = useState<Record<string, boolean>>({});
  const togglePreviewLetter = (letterKey: string) => {
    setPreviewedLetters((prev) => ({
      ...prev,
      [letterKey]: !prev[letterKey],
    }));
  };

  // Custom In-App Confirmation Modal (Replaces blocked window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'complete' | 'delete';
    record: KiwameRecord | null;
  }>({
    isOpen: false,
    type: 'complete',
    record: null,
  });

  // When sword name changes in modal, check preset letters and daozhang info
  const handleSelectSwordForDepart = (name: string) => {
    setSelectedSwordName(name);
    // Find in daozhang
    const dz = daozhangRecords.find((r) => r.name === name);
    if (dz) {
      const matched = COMMON_SWORD_TYPES.find((t) => dz.swordType.includes(t));
      if (matched) setDepartSwordType(matched);
    }
    // Check if preset letter exists
    if (CLASSIC_KIWAME_LETTERS[name]) {
      const preset = CLASSIC_KIWAME_LETTERS[name];
      setDepartSwordType(preset.swordType);
      setDepartDay1Letter(preset.letters.day1);
      setDepartDay2Letter(preset.letters.day2);
      setDepartDay3Letter(preset.letters.day3);
    }
  };

  const handleConfirmDepart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSwordName.trim()) {
      showToast('请指定或输入出门修行的刀剑男士名讳', 'warning');
      return;
    }

    if (autoDeductItems && completeSets <= 0) {
      showToast('当前三宝库存未凑满整套，已免扣道具直接登记出行', 'info');
    }

    // Departure ISO
    const departedDate = new Date(departTimeStr);
    const departedAt = isNaN(departedDate.getTime())
      ? new Date().toISOString()
      : departedDate.toISOString();

    // Calculate estimated level
    const est = calculateKiwameLevelFromExp(departSwordType, departAccumulatedExp, false);

    onAddRecord(
      {
        swordName: selectedSwordName.trim(),
        swordType: departSwordType,
        departedAt,
        status: 'traveling',
        departureLevel: 99,
        accumulatedExp: departAccumulatedExp,
        estimatedKiwameLevel: est.kiwameLevel,
        letters: {
          day1: departDay1Letter.trim(),
          day2: departDay2Letter.trim(),
          day3: departDay3Letter.trim(),
        },
        notes: departNotes.trim(),
      },
      autoDeductItems && completeSets > 0
    );

    setIsDepartModalOpen(false);
    setSelectedSwordName('');
    setDepartDay1Letter('');
    setDepartDay2Letter('');
    setDepartDay3Letter('');
    setDepartNotes('');
    setDepartAccumulatedExp(0);
    showToast(`🌸【${selectedSwordName.trim()}】已正式踏上极化修行之路，96小时倒计时启程！`, 'success');
  };

  // Helper for 96-hour countdown calculation
  const getCountdownData = (departedAt: string) => {
    const start = new Date(departedAt).getTime();
    const totalDurationMs = 96 * 3600 * 1000;
    const elapsedMs = Math.max(0, nowTime - start);
    const remainingMs = Math.max(0, totalDurationMs - elapsedMs);
    const progressPercent = Math.min(100, Math.round((elapsedMs / totalDurationMs) * 100));

    const totalRemainingSecs = Math.floor(remainingMs / 1000);
    const remHours = Math.floor(totalRemainingSecs / 3600);
    const remMinutes = Math.floor((totalRemainingSecs % 3600) / 60);
    const remSeconds = totalRemainingSecs % 60;

    const elapsedHours = elapsedMs / (3600 * 1000);

    // Stages
    let stageIndex = 1;
    let stageTitle = '阶段一 · 抵至修行之地';
    let stageDesc = '第一封书信送达本丸';
    if (elapsedHours >= 72) {
      stageIndex = 4;
      stageTitle = '阶段四 · 踏上回丸归途';
      stageDesc = '极化修行已大功告成，整装归还';
    } else if (elapsedHours >= 48) {
      stageIndex = 3;
      stageTitle = '阶段三 · 斩断迷惘悟道';
      stageDesc = '第三封书信送达本丸';
    } else if (elapsedHours >= 24) {
      stageIndex = 2;
      stageTitle = '阶段二 · 溯源心绪动摇';
      stageDesc = '第二封书信送达本丸';
    }

    const isReady = remainingMs <= 0;

    return {
      elapsedMs,
      elapsedHours,
      remainingMs,
      remHours,
      remMinutes,
      remSeconds,
      progressPercent,
      stageIndex,
      stageTitle,
      stageDesc,
      isReady,
    };
  };

  // Helper component to render individual letters with progressive unlock & sealed state
  const renderLetterCard = (
    rec: KiwameRecord,
    dayNumber: 1 | 2 | 3,
    dayTitle: string,
    targetHours: number,
    letterContent: string | undefined,
    elapsedHours: number,
    elapsedMs: number
  ) => {
    // A letter is officially delivered if the sword is marked 'completed' or elapsed time reached target hours
    const isDelivered = rec.status === 'completed' || elapsedHours >= targetHours;
    const letterKey = `${rec.id}-day${dayNumber}`;
    const isPreviewed = !!previewedLetters[letterKey];

    // Calculate countdown to delivery
    const targetMs = targetHours * 3600 * 1000;
    const remMs = Math.max(0, targetMs - elapsedMs);
    const totalSecs = Math.floor(remMs / 1000);
    const remH = Math.floor(totalSecs / 3600);
    const remM = Math.floor((totalSecs % 3600) / 60);
    const remS = totalSecs % 60;

    return (
      <div
        className={`p-3.5 rounded-xl border transition-all ${
          isDelivered
            ? 'bg-[var(--panel-color)] border-[var(--border-color)] shadow-2xs'
            : 'bg-[var(--search-bg)]/60 border-dashed border-amber-300/80 dark:border-amber-800/70'
        }`}
      >
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]/50 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-base">{isDelivered ? '📜' : '✉️'}</span>
            <span className="font-serif font-bold text-xs text-[var(--sakura-deep)]">
              第{dayNumber === 1 ? '一' : dayNumber === 2 ? '二' : '三'}日寄信 · {dayTitle}
            </span>
          </div>

          {isDelivered ? (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              已送达本丸 · 审神者已拆阅
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              在途投递中 (约剩 {remH}小时{remM}分{remS}秒)
            </span>
          )}
        </div>

        {isDelivered ? (
          <div className="pt-2.5 pl-1">
            <p className="font-serif leading-relaxed text-[var(--text-color)] whitespace-pre-wrap opacity-95 text-xs">
              {letterContent || '（暂无书信文本）'}
            </p>
          </div>
        ) : (
          <div className="pt-3 pb-1 text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--panel-color)] border border-[var(--border-color)] text-[11px] font-serif text-[var(--text-muted)] shadow-2xs">
              <Lock className="w-3 h-3 text-amber-500" />
              <span className="font-bold text-[var(--text-color)]">鸿雁传书驿路疾驰中 · 尚在封缄中</span>
              <span className="font-mono text-[10px] opacity-75">(需历练满 {targetHours} 小时送达)</span>
            </div>
            <p className="text-[11px] font-serif text-[var(--text-muted)] italic leading-relaxed max-w-md mx-auto">
              “旅途山长水远，驿使疾行。倒计时到达第二/三日节点后，飞鸟方会将此信送入本丸，请审神者静候佳音……”
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => togglePreviewLetter(letterKey)}
                className="text-[10px] text-[var(--text-muted)] hover:text-[var(--sakura-deep)] underline font-serif cursor-pointer transition-colors inline-flex items-center gap-1"
              >
                {isPreviewed ? (
                  <>
                    <EyeOff className="w-3 h-3" />
                    <span>✕ 重新封缄密存</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3 h-3" />
                    <span>👁️ 审神者神念 · 先行检视草稿</span>
                  </>
                )}
              </button>
            </div>
            {isPreviewed && (
              <div className="mt-2.5 p-3 rounded-xl bg-[var(--panel-color)] border border-amber-300 dark:border-amber-800 text-left animate-fadeIn space-y-1.5 shadow-2xs">
                <div className="flex items-center justify-between text-[10px] text-amber-700 dark:text-amber-400 font-serif font-bold">
                  <span>【先行检视 · 草稿内容预览】</span>
                  <span className="font-mono text-[9px] opacity-80">尚在路上未送抵，仅供预读</span>
                </div>
                <p className="font-serif leading-relaxed text-[var(--text-color)] whitespace-pre-wrap text-xs pl-1 opacity-90 border-t border-[var(--border-color)]/50 pt-1.5">
                  {letterContent || '（暂无草稿内容）'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const travelingRecords = records.filter((r) => r.status === 'traveling');
  const completedRecords = records.filter((r) => r.status === 'completed');

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* =========================================================================
          SUB-VIEW 1: 道具 (Inventory)
      ========================================================================= */}
      {subFilter === '道具' && (
        <div className="space-y-4">
          {/* Top Banner: Three-piece Set Summary */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--sakura-soft)] via-[var(--panel-color)] to-[var(--search-bg)] border border-[var(--sakura-pink)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[var(--sakura-deep)] text-white flex items-center justify-center shadow-xs text-xl">
                🎒
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-black text-sm text-[var(--header-red)]">
                    修行三宝库房存量
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--sakura-deep)] text-white text-[10px] font-mono font-bold">
                    成套储备: {completeSets} 套
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] font-serif mt-0.5">
                  旅装束、旅道具与手纸一式各消耗一件，方可准许一振刀剑男士出门远行修行。
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddFullSet(1)}
                className="px-3 py-1.5 rounded-lg bg-[var(--panel-color)] border border-[var(--sakura-pink)] text-[var(--sakura-deep)] hover:bg-[var(--sakura-soft)] text-xs font-serif font-bold transition-colors cursor-pointer shadow-2xs"
              >
                +1 整套入库
              </button>
              <button
                type="button"
                onClick={() => {
                  onSelectSubFilter('列表');
                  setIsDepartModalOpen(true);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white text-xs font-serif font-bold hover:bg-[var(--sakura-deep)]/90 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>派遣极化修行</span>
              </button>
            </div>
          </div>

          {/* Three Item Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Item 1: 旅装束 */}
            <div className="p-4 rounded-xl bg-[var(--panel-color)] border border-[var(--border-color)] shadow-xs space-y-3 relative overflow-hidden group hover:border-[var(--sakura-pink)] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👘</span>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-[var(--text-color)]">
                      旅装束 (包袱服饰)
                    </h4>
                    <span className="text-[10px] text-[var(--text-muted)] font-serif">
                      旅途遮风挡雨之行装
                    </span>
                  </div>
                </div>
                <span className="text-2xl font-black font-mono text-[var(--header-red)]">
                  {inventory.travelOutfit}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] font-serif">
                  存量调整
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAdjustItem('travelOutfit', -1)}
                    disabled={inventory.travelOutfit <= 0}
                    className="w-7 h-7 rounded-md bg-[var(--search-bg)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-color)] hover:border-red-400 disabled:opacity-40 cursor-pointer flex items-center justify-center"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustItem('travelOutfit', 1)}
                    className="w-7 h-7 rounded-md bg-[var(--sakura-soft)] border border-[var(--sakura-pink)] text-xs font-bold text-[var(--sakura-deep)] hover:bg-[var(--sakura-pink)]/40 cursor-pointer flex items-center justify-center"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>

            {/* Item 2: 旅道具 */}
            <div className="p-4 rounded-xl bg-[var(--panel-color)] border border-[var(--border-color)] shadow-xs space-y-3 relative overflow-hidden group hover:border-[var(--sakura-pink)] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏮</span>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-[var(--text-color)]">
                      旅道具 (笠杖行囊)
                    </h4>
                    <span className="text-[10px] text-[var(--text-muted)] font-serif">
                      行经千山万水之行脚法宝
                    </span>
                  </div>
                </div>
                <span className="text-2xl font-black font-mono text-[var(--header-red)]">
                  {inventory.travelGear}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] font-serif">
                  存量调整
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAdjustItem('travelGear', -1)}
                    disabled={inventory.travelGear <= 0}
                    className="w-7 h-7 rounded-md bg-[var(--search-bg)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-color)] hover:border-red-400 disabled:opacity-40 cursor-pointer flex items-center justify-center"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustItem('travelGear', 1)}
                    className="w-7 h-7 rounded-md bg-[var(--sakura-soft)] border border-[var(--sakura-pink)] text-xs font-bold text-[var(--sakura-deep)] hover:bg-[var(--sakura-pink)]/40 cursor-pointer flex items-center justify-center"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>

            {/* Item 3: 手纸一式 */}
            <div className="p-4 rounded-xl bg-[var(--panel-color)] border border-[var(--border-color)] shadow-xs space-y-3 relative overflow-hidden group hover:border-[var(--sakura-pink)] transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📜</span>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-[var(--text-color)]">
                      手纸一式 (寄丸信纸)
                    </h4>
                    <span className="text-[10px] text-[var(--text-muted)] font-serif">
                      羁绊之信笺，三日寄思情
                    </span>
                  </div>
                </div>
                <span className="text-2xl font-black font-mono text-[var(--header-red)]">
                  {inventory.letters}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)]">
                <span className="text-[10px] text-[var(--text-muted)] font-serif">
                  存量调整
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleAdjustItem('letters', -1)}
                    disabled={inventory.letters <= 0}
                    className="w-7 h-7 rounded-md bg-[var(--search-bg)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-color)] hover:border-red-400 disabled:opacity-40 cursor-pointer flex items-center justify-center"
                  >
                    -1
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustItem('letters', 1)}
                    className="w-7 h-7 rounded-md bg-[var(--sakura-soft)] border border-[var(--sakura-pink)] text-xs font-bold text-[var(--sakura-deep)] hover:bg-[var(--sakura-pink)]/40 cursor-pointer flex items-center justify-center"
                  >
                    +1
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Acquisition Logs & History */}
          <div className="p-4 rounded-xl bg-[var(--panel-color)] border border-[var(--border-color)] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif font-bold text-xs text-[var(--header-red)] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>修行三宝调配与入库履历</span>
              </h4>
              <span className="text-[10px] text-[var(--text-muted)] font-serif">
                共记录 {inventory.logs?.length || 0} 笔动向
              </span>
            </div>

            {(!inventory.logs || inventory.logs.length === 0) ? (
              <div className="p-4 text-center text-xs text-[var(--text-muted)] font-serif bg-[var(--search-bg)] rounded-lg">
                暂无三宝调用记录。日常可在此核对活动战绩与派遣消耗明细。
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {inventory.logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                          log.type === 'gain'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {log.type === 'gain' ? '+入库' : '-消纳'}
                      </span>
                      <span className="font-serif font-bold text-[var(--text-color)]">
                        {log.itemName} × {log.count}
                      </span>
                      {log.reason && (
                        <span className="text-[11px] text-[var(--text-muted)] font-serif truncate max-w-[200px] sm:max-w-xs">
                          ({log.reason})
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {log.date}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-VIEW 2: 经验值 (EXP Calculator)
      ========================================================================= */}
      {subFilter === '经验值' && (
        <div className="space-y-4">
          {/* Intro Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--sakura-soft)] via-[var(--panel-color)] to-[var(--search-bg)] border border-[var(--sakura-pink)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--sakura-deep)] text-white flex items-center justify-center shadow-xs text-xl">
                🧮
              </div>
              <div>
                <h3 className="font-serif font-black text-sm text-[var(--header-red)]">
                  刀剑男士极化归来等级计算机
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] font-serif mt-0.5">
                  输入刀种与特化 Lv.99 后的累积溢出经验值，立即推算修行归丸后的初始极化等级与剩余经验。
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] text-xs font-serif">
              <button
                type="button"
                onClick={() => setIsTotalExpMode(false)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  !isTotalExpMode
                    ? 'bg-[var(--sakura-deep)] text-white font-bold shadow-2xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                }`}
              >
                99级溢出累积经验
              </button>
              <button
                type="button"
                onClick={() => setIsTotalExpMode(true)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  isTotalExpMode
                    ? 'bg-[var(--sakura-deep)] text-white font-bold shadow-2xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                }`}
              >
                总累计经验 (Total)
              </button>
            </div>
          </div>

          {/* Calculator Interactive Form */}
          <div className="p-4 rounded-xl bg-[var(--panel-color)] border border-[var(--border-color)] shadow-xs space-y-4">
            {/* 1. Select Sword Type */}
            <div>
              <label className="block text-xs font-bold font-serif text-[var(--text-color)] mb-2">
                1. 选择刀剑男士的刀种类别：
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {COMMON_SWORD_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCalcSwordType(type)}
                    className={`py-2 px-1.5 rounded-lg border text-center font-serif text-xs transition-all cursor-pointer ${
                      calcSwordType === type
                        ? 'border-[var(--sakura-deep)] bg-[var(--sakura-soft)] text-[var(--header-red)] font-black shadow-2xs'
                        : 'border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Exp Input & Quick Fill */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold font-serif text-[var(--text-color)]">
                  2. {isTotalExpMode ? '输入总累计经验值 (Total Exp)' : '输入特化 Lv.99 后的累积经验值 (Over Exp)'}：
                </label>
                <span className="text-[10px] text-[var(--text-muted)] font-serif">
                  {calcSwordType} Lv.99 基准经验: {TOKU_LV99_EXP_MAP[calcSwordType]?.toLocaleString()} Exp
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={calcExpInput}
                  onChange={(e) => setCalcExpInput(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="例: 1500000"
                  className="flex-1 px-3 py-2 text-sm font-mono font-bold rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] focus:outline-hidden focus:border-[var(--sakura-deep)]"
                />
                <button
                  type="button"
                  onClick={() => setCalcExpInput(0)}
                  className="px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-xs text-[var(--text-muted)] hover:text-red-500 font-serif cursor-pointer"
                >
                  清零
                </button>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-[var(--text-muted)] font-serif">快捷累加:</span>
                {[
                  { label: '+10万', add: 100000 },
                  { label: '+50万', add: 500000 },
                  { label: '+100万', add: 1000000 },
                  { label: '+300万', add: 3000000 },
                  { label: '+500万', add: 5000000 },
                  { label: '+1000万', add: 10000000 },
                ].map((chip) => (
                  <button
                    key={chip.label}
                    type="button"
                    onClick={() => setCalcExpInput((prev) => prev + chip.add)}
                    className="px-2 py-0.8 rounded text-[10px] font-mono bg-[var(--search-bg)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-[var(--sakura-pink)] cursor-pointer"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Output Result Card */}
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[var(--sakura-soft)]/50 via-[var(--panel-color)] to-[var(--search-bg)] border border-[var(--sakura-pink)] shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--sakura-pink)]/40">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🌸</span>
                  <span className="font-serif font-bold text-xs text-[var(--header-red)]">
                    【{calcSwordType}】极化归还推算结果
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-serif text-[var(--text-muted)]">
                    已折算总可用经验：
                  </span>
                  <span className="text-xs font-mono font-bold text-[var(--sakura-deep)]">
                    {expCalculationResult.totalExpUsed.toLocaleString()} Exp
                  </span>
                </div>
              </div>

              {/* Main Badge Display */}
              <div className="flex items-center justify-between flex-wrap gap-4 py-2">
                <div>
                  <span className="text-[10px] font-serif text-[var(--text-muted)] block">
                    预估极化归来初始等级
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-black font-mono text-[var(--sakura-deep)]">
                      Lv.{expCalculationResult.kiwameLevel}
                    </span>
                    <span className="text-xs font-serif font-bold text-[var(--header-red)]">
                      极
                    </span>
                    {expCalculationResult.kiwameLevel >= 99 && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-serif font-bold">
                        ★ 极化圆满
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-serif text-[var(--text-muted)] block">
                    当前极化等级经验进度
                  </span>
                  <span className="text-base font-bold font-mono text-[var(--text-color)]">
                    {expCalculationResult.progressPercent}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-[var(--search-bg)] border border-[var(--border-color)] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--sakura-pink)] to-[var(--sakura-deep)] transition-all duration-300"
                  style={{ width: `${expCalculationResult.progressPercent}%` }}
                />
              </div>

              {/* Detailed Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-serif pt-1">
                <div className="p-2.5 rounded-lg bg-[var(--panel-color)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-muted)] block">
                    距离升至下一级 (Lv.{expCalculationResult.kiwameLevel + 1}) 还差：
                  </span>
                  <span className="font-mono font-bold text-[var(--header-red)] text-sm">
                    {expCalculationResult.expForNextLevel > 0
                      ? `${expCalculationResult.expForNextLevel.toLocaleString()} Exp`
                      : '已满级'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-[var(--panel-color)] border border-[var(--border-color)]">
                  <span className="text-[10px] text-[var(--text-muted)] block">
                    距离极化极点 (Lv.99) 总共还需：
                  </span>
                  <span className="font-mono font-bold text-[var(--text-color)] text-sm">
                    {expCalculationResult.totalRemainingTo99 > 0
                      ? `${expCalculationResult.totalRemainingTo99.toLocaleString()} Exp`
                      : '已登极化极点'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          SUB-VIEW 3: 列表 (Depart & Countdown & Letters)
      ========================================================================= */}
      {subFilter === '列表' && (
        <div className="space-y-4">
          {/* Top Bar with Action Button */}
          <div className="p-3.5 rounded-xl bg-[var(--panel-color)] border border-[var(--border-color)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[var(--sakura-deep)]" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif font-bold text-xs text-[var(--header-red)]">
                    极化修行在途名册与信件收纳
                  </h3>
                  <span className="px-2 py-0.2 rounded-full bg-[var(--sakura-soft)] text-[var(--sakura-deep)] border border-[var(--sakura-pink)] text-[10px] font-mono font-bold">
                    修行中: {travelingRecords.length} 振 · 已归丸: {completedRecords.length} 振
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] font-serif mt-0.2">
                  96 小时羁绊苦修实时倒计时 · 每日寄送信件收纳归档
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsDepartModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white text-xs font-serif font-bold shadow-xs hover:bg-[var(--sakura-deep)]/90 cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              <span>登记刀剑出门极化</span>
            </button>
          </div>

          {/* Section: Currently Traveling Swords (修行中) */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-xs text-[var(--header-red)] flex items-center gap-1.5">
              <span>🌸</span>
              <span>正在修行中的刀剑男士 ({travelingRecords.length})</span>
            </h4>

            {travelingRecords.length === 0 ? (
              <div className="p-6 rounded-xl bg-[var(--panel-color)] border border-[var(--border-color)] text-center text-xs font-serif text-[var(--text-muted)] space-y-2">
                <p>当前本丸暂无外出修行的刀剑男士。</p>
                <p className="text-[11px] opacity-75">
                  若已有满级刀剑并备足三宝，点击上方「登记刀剑出门极化」开启96小时成长见证！
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {travelingRecords.map((rec) => {
                  const cd = getCountdownData(rec.departedAt);
                  const isExpanded = expandedLetterId === rec.id;

                  return (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl bg-[var(--panel-color)] border border-[var(--sakura-pink)] shadow-sm space-y-3.5 transition-all"
                    >
                      {/* Card Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-color)]">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-[var(--sakura-soft)] text-[var(--sakura-deep)] font-serif font-black text-xs flex items-center justify-center shrink-0">
                            极
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-serif font-black text-sm text-[var(--header-red)]">
                                {rec.swordName}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-serif bg-[var(--search-bg)] border border-[var(--border-color)] text-[var(--text-muted)]">
                                {rec.swordType}
                              </span>
                              {rec.estimatedKiwameLevel && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-300">
                                  预估归来: Lv.{rec.estimatedKiwameLevel}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-[var(--text-muted)] font-mono">
                              出发时间: {new Date(rec.departedAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {cd.isReady ? (
                            <button
                              type="button"
                              onClick={() => {
                                onCompleteKiwame(rec.id);
                                showToast(`🎉 恭迎【${rec.swordName}】极化修行圆满，正式归丸！`, 'success');
                              }}
                              className="px-3 py-1 rounded-lg bg-emerald-600 text-white font-serif font-bold text-xs hover:bg-emerald-700 shadow-xs cursor-pointer flex items-center gap-1 animate-pulse"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>迎接近侍归丸</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDialog({
                                  isOpen: true,
                                  type: 'complete',
                                  record: rec,
                                });
                              }}
                              className="px-2.5 py-1 rounded-md border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] text-[11px] font-serif cursor-pointer hover:border-[var(--sakura-pink)] hover:bg-[var(--sakura-soft)] transition-colors"
                            >
                              提前归丸
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                type: 'delete',
                                record: rec,
                              });
                            }}
                            className="p-1 rounded text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                            title="撤销/删除此记录"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 96-Hour Countdown Clock & Stage Banner */}
                      <div className="p-3 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] space-y-2">
                        <div className="flex items-center justify-between text-xs font-serif">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[var(--sakura-deep)]" />
                            <span className="font-bold text-[var(--text-color)]">
                              96小时修行倒计时：
                            </span>
                            {cd.isReady ? (
                              <span className="font-bold text-emerald-600">
                                4天期满 · 随时可迎归丸！
                              </span>
                            ) : (
                              <span className="font-mono font-bold text-[var(--sakura-deep)]">
                                剩余 {cd.remHours}小时 {cd.remMinutes}分 {cd.remSeconds}秒
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] font-mono text-[var(--text-muted)]">
                            已历练 {Math.floor(cd.elapsedHours)}h / 96h ({cd.progressPercent}%)
                          </span>
                        </div>

                        {/* Progress Bar with 4 Milestone Nodes */}
                        <div className="relative pt-1 pb-1">
                          <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[var(--sakura-pink)] to-[var(--sakura-deep)] transition-all duration-500"
                              style={{ width: `${cd.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Four-stage Milestone Badges */}
                        <div className="grid grid-cols-4 gap-1 text-[10px] font-serif pt-1 text-center">
                          {[
                            { day: 'Day 1', label: '启程·信一', pass: cd.elapsedHours >= 24 },
                            { day: 'Day 2', label: '溯源·信二', pass: cd.elapsedHours >= 48 },
                            { day: 'Day 3', label: '悟道·信三', pass: cd.elapsedHours >= 72 },
                            { day: 'Day 4', label: '归途·圆满', pass: cd.elapsedHours >= 96 },
                          ].map((node, i) => (
                            <div
                              key={i}
                              className={`p-1 rounded ${
                                node.pass
                                  ? 'bg-[var(--sakura-soft)] text-[var(--sakura-deep)] font-bold'
                                  : 'text-[var(--text-muted)] opacity-70'
                              }`}
                            >
                              <div>{node.day}</div>
                              <div className="text-[9px] truncate">{node.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Letters Accordion Box with Progressive Unlocking */}
                      <div className="rounded-xl border border-[var(--border-color)] bg-[var(--panel-color)] overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setExpandedLetterId(isExpanded ? null : rec.id)}
                          className="w-full px-3 py-2 flex items-center justify-between text-xs font-serif font-bold text-[var(--text-color)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-[var(--sakura-deep)]" />
                            <span>重温【{rec.swordName}】寄回本丸的羁绊信件 (3封)</span>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {isExpanded && (
                          <div className="p-3 border-t border-[var(--border-color)] space-y-3 bg-[var(--search-bg)]/40 text-xs animate-fadeIn">
                            {/* Letter 1: 抵至修行地 (Day 1: 满24小时送达) */}
                            {renderLetterCard(rec, 1, '抵至修行地', 24, rec.letters?.day1, cd.elapsedHours, cd.elapsedMs)}

                            {/* Letter 2: 溯源旧主情 (Day 2: 满48小时送达) */}
                            {renderLetterCard(rec, 2, '溯源旧主情', 48, rec.letters?.day2, cd.elapsedHours, cd.elapsedMs)}

                            {/* Letter 3: 悟道展新芒 (Day 3: 满72小时送达) */}
                            {renderLetterCard(rec, 3, '悟道展新芒', 72, rec.letters?.day3, cd.elapsedHours, cd.elapsedMs)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section: Completed Kiwame Records (已归丸名册) */}
          {completedRecords.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-[var(--border-color)]">
              <h4 className="font-serif font-bold text-xs text-[var(--text-muted)] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>已修得正果·极化归丸典籍 ({completedRecords.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {completedRecords.map((comp) => {
                  const isCompExpanded = expandedCompletedLetterId === comp.id;
                  return (
                    <div
                      key={comp.id}
                      className="p-3.5 rounded-xl bg-[var(--panel-color)] border border-[var(--border-color)] space-y-2.5 hover:border-[var(--sakura-pink)] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-serif font-black text-xs flex items-center justify-center">
                            极
                          </span>
                          <span className="font-serif font-bold text-xs text-[var(--header-red)]">
                            【{comp.swordName} · 极】
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-serif">
                            {comp.swordType}
                          </span>
                          {comp.estimatedKiwameLevel && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold border border-emerald-300">
                              Lv.{comp.estimatedKiwameLevel}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-emerald-600 font-bold">
                            修行圆满
                          </span>
                          <button
                            type="button"
                            onClick={() => setConfirmDialog({ isOpen: true, type: 'delete', record: comp })}
                            className="p-1 rounded text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                            title="移除此条记录"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
                        <span>出发: {new Date(comp.departedAt).toLocaleDateString()}</span>
                        {comp.completedAt && (
                          <span>归丸: {new Date(comp.completedAt).toLocaleDateString()}</span>
                        )}
                      </div>

                      {/* Accordion to read all 3 letters */}
                      <button
                        type="button"
                        onClick={() => setExpandedCompletedLetterId(isCompExpanded ? null : comp.id)}
                        className="w-full pt-1.5 border-t border-[var(--border-color)]/60 flex items-center justify-between text-[11px] font-serif text-[var(--text-muted)] hover:text-[var(--sakura-deep)] cursor-pointer"
                      >
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-[var(--sakura-deep)]" />
                          <span>重温修行信件 (3封全齐)</span>
                        </span>
                        {isCompExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isCompExpanded && (
                        <div className="space-y-2 pt-1 animate-fadeIn text-xs">
                          {renderLetterCard(comp, 1, '抵至修行地', 24, comp.letters?.day1, 999, 999 * 3600000)}
                          {renderLetterCard(comp, 2, '溯源旧主情', 48, comp.letters?.day2, 999, 999 * 3600000)}
                          {renderLetterCard(comp, 3, '悟道展新芒', 72, comp.letters?.day3, 999, 999 * 3600000)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL: 登记刀剑出门极化弹窗
      ========================================================================= */}
      {isDepartModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsDepartModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-[var(--panel-color)] rounded-2xl shadow-2xl border border-[var(--sakura-pink)] flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-[var(--sakura-pink)]/40 flex items-center justify-between bg-[var(--sakura-soft)]/30">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌸</span>
                <div>
                  <h3 className="font-serif font-black text-sm text-[var(--header-red)]">
                    准许刀剑男士出门极化修行
                  </h3>
                  <p className="text-[10px] text-[var(--text-muted)] font-serif">
                    登写入途名册 · 自动开启 96 小时信件倒计时
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDepartModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-color)] text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleConfirmDepart} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Select or Input Sword */}
              <div>
                <label className="block text-xs font-bold font-serif text-[var(--text-color)] mb-1">
                  刀剑男士名讳 *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={selectedSwordName}
                    onChange={(e) => handleSelectSwordForDepart(e.target.value)}
                    placeholder="例如: 加州清光、山姥切国广..."
                    className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif"
                  />
                  {/* Select from Daozhang Quick Dropdown */}
                  {daozhangRecords.length > 0 && (
                    <select
                      onChange={(e) => {
                        if (e.target.value) handleSelectSwordForDepart(e.target.value);
                      }}
                      className="px-2 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif text-xs cursor-pointer"
                    >
                      <option value="">从本丸刀账挑选...</option>
                      {daozhangRecords.map((dz) => (
                        <option key={dz.id} value={dz.name}>
                          {dz.name} ({dz.swordType})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Sword Type & Departure Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold font-serif text-[var(--text-color)] mb-1">
                    刀种
                  </label>
                  <select
                    value={departSwordType}
                    onChange={(e) => setDepartSwordType(e.target.value as SwordType)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif text-xs"
                  >
                    {COMMON_SWORD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold font-serif text-[var(--text-color)] mb-1">
                    出发启程时间 (开启倒计时)
                  </label>
                  <input
                    type="datetime-local"
                    value={departTimeStr}
                    onChange={(e) => setDepartTimeStr(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-mono text-xs"
                  />
                </div>
              </div>

              {/* Accumulated EXP input */}
              <div>
                <label className="block text-xs font-bold font-serif text-[var(--text-color)] mb-1">
                  出门前特化 Lv.99 攒下的累积经验值 (可选)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={departAccumulatedExp}
                  onChange={(e) => setDepartAccumulatedExp(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="例: 2000000 (系统将自动推算极化归来等级)"
                  className="w-full px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-mono text-xs"
                />
              </div>

              {/* Deduct inventory checkbox */}
              <div className="p-3 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] flex items-center justify-between">
                <div>
                  <span className="font-serif font-bold text-xs text-[var(--text-color)] block">
                    同步扣减 1 套修行三宝
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-serif">
                    当前库存成套数：{completeSets} 套
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoDeductItems}
                  onChange={(e) => setAutoDeductItems(e.target.checked)}
                  className="w-4 h-4 accent-[var(--sakura-deep)] cursor-pointer"
                />
              </div>

              {/* Letter Inputs (Optional pre-filled) */}
              <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-xs text-[var(--header-red)]">
                    📜 寄回信件收纳 (可填入或载入官方范本)
                  </span>
                  {CLASSIC_KIWAME_LETTERS[selectedSwordName] && (
                    <button
                      type="button"
                      onClick={() => handleSelectSwordForDepart(selectedSwordName)}
                      className="text-[10px] text-[var(--sakura-deep)] hover:underline cursor-pointer font-serif"
                    >
                      重新载入原味经典书信
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-serif text-[var(--text-muted)] mb-0.5">
                    第 1 天信件 (抵达修行地):
                  </label>
                  <textarea
                    rows={2}
                    value={departDay1Letter}
                    onChange={(e) => setDepartDay1Letter(e.target.value)}
                    placeholder="可填写信件内容..."
                    className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-serif text-[var(--text-muted)] mb-0.5">
                    第 2 天信件 (触及过往羁绊):
                  </label>
                  <textarea
                    rows={2}
                    value={departDay2Letter}
                    onChange={(e) => setDepartDay2Letter(e.target.value)}
                    placeholder="可填写信件内容..."
                    className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-serif text-[var(--text-muted)] mb-0.5">
                    第 3 天信件 (心志蜕变告成):
                  </label>
                  <textarea
                    rows={2}
                    value={departDay3Letter}
                    onChange={(e) => setDepartDay3Letter(e.target.value)}
                    placeholder="可填写信件内容..."
                    className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif text-xs"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setIsDepartModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] font-serif hover:text-[var(--text-color)] cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white font-serif font-bold text-xs shadow-xs hover:bg-[var(--sakura-deep)]/90 cursor-pointer transition-colors"
                >
                  准许出行 ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: 提前归丸 / 撤销记录 专属确认弹窗 (无阻断替换 window.confirm)
      ========================================================================= */}
      {confirmDialog.isOpen && confirmDialog.record && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setConfirmDialog({ isOpen: false, type: 'complete', record: null })}
        >
          <div
            className="w-full max-w-md bg-[var(--panel-color)] rounded-2xl shadow-2xl border border-[var(--sakura-pink)] p-5 space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shadow-2xs ${
                  confirmDialog.type === 'complete'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {confirmDialog.type === 'complete' ? '🌸' : '🗑️'}
              </div>
              <div>
                <h3 className="font-serif font-bold text-sm text-[var(--header-red)]">
                  {confirmDialog.type === 'complete' ? '迎接近侍提前归丸' : '撤销极化修行记录'}
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] font-serif">
                  刀剑男士：【{confirmDialog.record.swordName}】
                </p>
              </div>
            </div>

            <p className="text-xs font-serif text-[var(--text-color)] leading-relaxed bg-[var(--search-bg)] p-3.5 rounded-xl border border-[var(--border-color)]">
              {confirmDialog.type === 'complete'
                ? `确定要提前迎回【${confirmDialog.record.swordName}】并圆满本次修行吗？此操作将立即完成极化修行，将状态记为已归丸，三封羁绊书信也将全部解锁拆阅，并自动联动更新本丸刀账修习等级。`
                : `确定撤销并移除【${confirmDialog.record.swordName}】的本次极化修行记录吗？此操作将彻底删除此条目。`}
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDialog({ isOpen: false, type: 'complete', record: null })}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-serif text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetRec = confirmDialog.record!;
                  if (confirmDialog.type === 'complete') {
                    onCompleteKiwame(targetRec.id);
                    showToast(`🎉 恭迎【${targetRec.swordName}】极化修行圆满，正式归丸！`, 'success');
                  } else {
                    onDeleteRecord(targetRec.id);
                    showToast(`已撤销【${targetRec.swordName}】的修行记录`);
                  }
                  setConfirmDialog({ isOpen: false, type: 'complete', record: null });
                }}
                className={`px-4 py-1.5 rounded-lg text-white text-xs font-serif font-bold shadow-xs cursor-pointer transition-colors ${
                  confirmDialog.type === 'complete'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {confirmDialog.type === 'complete' ? '确认迎归丸' : '确认撤销删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
