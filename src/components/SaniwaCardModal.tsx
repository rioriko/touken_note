import React, { useState, useMemo, useEffect } from 'react';
import {
  Assistant,
  BenwanConfig,
  DaozhangRecord,
  DismantleRecord,
  ExpeditionRecord,
  ForgeRecipe,
  ForgeRecord,
  KiwameInventory,
  KiwameRecord,
  NeibanRecord,
  Note,
  TreasureItem,
  WordCard,
} from '../types';
import { SchoolMonWatermark } from './SchoolMonWatermark';
import {
  X,
  Edit3,
  Check,
  Copy,
  Camera,
  RotateCcw,
  UserCheck,
  BookOpen,
  Flame,
  Compass,
  Sprout,
  ScrollText,
  Sparkles,
  Calendar,
} from 'lucide-react';

interface SaniwaCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BenwanConfig;
  onUpdateConfig: (partial: Partial<BenwanConfig>) => void;
  assistant: Assistant;
  notes: Note[];
  neibanRecords: NeibanRecord[];
  daozhangRecords: DaozhangRecord[];
  treasures: TreasureItem[];
  expeditions: ExpeditionRecord[];
  forgeRecords: ForgeRecord[];
  dismantleRecords: DismantleRecord[];
  forgeRecipes: ForgeRecipe[];
  kiwameInventory: KiwameInventory;
  kiwameRecords: KiwameRecord[];
  wordCards: WordCard[];
  onOpenDaozhang?: () => void;
  onOpenAssistant?: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning') => void;
}

const REGION_PRESETS = ['山城国', '备前国', '相模国', '丰后国', '萨摩国', '美浓国', '现世本丸'];
const TITLE_PRESETS = [
  '时之政府特任审神者',
  '百炼名刀守护者',
  '现世樱庭执笔人',
  '万屋常客主殿',
  '静守四时本丸之主',
];
const CREST_OPTIONS = [
  { label: '随近侍流派', value: '' },
  { label: '三条 · 弦月', value: '三条' },
  { label: '粟田口 · 垂藤', value: '粟田口' },
  { label: '堀川 · 重菱', value: '堀川' },
  { label: '左文字 · 悲月', value: '左文字' },
  { label: '备前长船 · 重樱', value: '备前长船' },
  { label: '加州 / 冲田 · 山形', value: '加州' },
  { label: '交刃古环', value: '通用' },
];

export const SaniwaCardModal: React.FC<SaniwaCardModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  assistant,
  notes,
  neibanRecords,
  daozhangRecords,
  treasures,
  expeditions,
  forgeRecords,
  dismantleRecords,
  forgeRecipes,
  kiwameInventory,
  kiwameRecords,
  wordCards,
  onOpenDaozhang,
  onOpenAssistant,
  showToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isPureCardMode, setIsPureCardMode] = useState(false);

  // Edit form states
  const [honmaruNameInput, setHonmaruNameInput] = useState(config.honmaruName || '大和');
  const [saniwaNameInput, setSaniwaNameInput] = useState(config.saniwaName || '审神者');
  const [titleInput, setTitleInput] = useState(config.saniwaTitle || '时之政府特任审神者');
  const [regionInput, setRegionInput] = useState(config.honmaruRegion || '');
  const [mottoInput, setMottoInput] = useState(
    config.saniwaMotto || '愿与诸刃共赏四季樱落，长伴本丸岁岁平安。'
  );
  const [appointedDateInput, setAppointedDateInput] = useState(config.appointedDate || '');
  const [crestInput, setCrestInput] = useState(config.crestSchool || '');

  useEffect(() => {
    if (isOpen) {
      setHonmaruNameInput(config.honmaruName || '大和');
      setSaniwaNameInput(config.saniwaName || '审神者');
      setTitleInput(config.saniwaTitle || '时之政府特任审神者');
      setRegionInput(config.honmaruRegion || '');
      setMottoInput(config.saniwaMotto || '愿与诸刃共赏四季樱落，长伴本丸岁岁平安。');
      setAppointedDateInput(config.appointedDate || '');
      setCrestInput(config.crestSchool || '');
      setIsEditing(false);
    }
  }, [isOpen, config]);

  // Compute real Honmaru analytics
  const stats = useMemo(() => {
    // 1. Daozhang & Kiwame stats
    const uniqueSwords = daozhangRecords.length;
    const totalHoldings = daozhangRecords.reduce(
      (sum, r) => sum + (typeof r.count === 'number' ? r.count : 1),
      0
    );
    const kiwameFromDaozhang = daozhangRecords.filter(
      (r) => typeof r.level === 'string' && r.level.includes('极')
    ).length;
    const completedKiwameNames = new Set(
      kiwameRecords.filter((k) => k.status === 'completed').map((k) => k.swordName.trim())
    );
    const travelingKiwameCount = kiwameRecords.filter((k) => k.status === 'traveling').length;
    const totalKiwameCount = Math.max(kiwameFromDaozhang, completedKiwameNames.size);
    const favoriteSwordsCount = daozhangRecords.filter((r) => r.favorite).length;

    // 2. Expedition stats
    const expTotal = expeditions.length;
    const expGreatSuccess = expeditions.filter((e) => e.result === '大成功').length;
    const expGreatRate = expTotal > 0 ? Math.round((expGreatSuccess / expTotal) * 100) : 0;

    // 3. Neiban diligence & top diligent school
    const neibanTotal = neibanRecords.length;
    let progressSum = 0;
    const swordSchoolMap: Record<string, string> = {};
    daozhangRecords.forEach((dz) => {
      if (dz.name && dz.school) {
        swordSchoolMap[dz.name.trim()] = dz.school.trim();
      }
    });
    const presetSchools: Record<string, string> = {
      三日月宗近: '三条',
      小狐丸: '三条',
      石切丸: '三条',
      一期一振: '粟田口',
      乱藤四郎: '粟田口',
      药研藤四郎: '粟田口',
      莺丸: '古备前',
      加州清光: '加州',
      大和守安定: '大和守',
      山姥切国广: '堀川',
      压切长谷部: '长谷部',
      鹤丸国永: '五条',
      烛台切光忠: '长船',
      宗三左文字: '左文字',
      江雪左文字: '左文字',
    };

    const schoolStats: Record<string, { sum: number; count: number }> = {};
    neibanRecords.forEach((r) => {
      const p = typeof r.progress === 'number' ? r.progress : r.done ? 100 : 0;
      progressSum += p;
      const name = r.name.trim();
      const school = swordSchoolMap[name] || presetSchools[name] || '本丸同僚';
      if (!schoolStats[school]) schoolStats[school] = { sum: 0, count: 0 };
      schoolStats[school].sum += p;
      schoolStats[school].count += 1;
    });

    const neibanRate = neibanTotal > 0 ? Math.round(progressSum / neibanTotal) : 0;
    const topSchoolEntry = Object.entries(schoolStats)
      .map(([school, v]) => ({
        school,
        rate: Math.round(v.sum / v.count),
        count: v.count,
      }))
      .sort((a, b) => b.rate - a.rate || b.count - a.count)[0];

    // 4. Kiwame item sets
    const kiwameSets = Math.min(
      kiwameInventory.travelOutfit || 0,
      kiwameInventory.travelGear || 0,
      kiwameInventory.letters || 0
    );

    // 5. Optional appointed days calculation
    let appointedDays: number | null = null;
    if (config.appointedDate) {
      const start = new Date(config.appointedDate);
      if (!isNaN(start.getTime())) {
        const now = new Date();
        const startMid = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
        const nowMid = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        appointedDays = Math.max(1, Math.floor((nowMid - startMid) / (1000 * 3600 * 24)) + 1);
      }
    }

    return {
      uniqueSwords,
      totalHoldings,
      totalKiwameCount,
      travelingKiwameCount,
      favoriteSwordsCount,
      forgeCount: forgeRecords.length,
      dismantleCount: dismantleRecords.length,
      recipeCount: forgeRecipes.length,
      expTotal,
      expGreatSuccess,
      expGreatRate,
      neibanTotal,
      neibanRate,
      topSchool: topSchoolEntry ? `${topSchoolEntry.school} (${topSchoolEntry.rate}%)` : '尚待考课',
      kiwameSets,
      notesCount: notes.length,
      treasuresCount: treasures.length,
      wordCardsCount: wordCards.length,
      appointedDays,
    };
  }, [
    daozhangRecords,
    kiwameRecords,
    expeditions,
    neibanRecords,
    forgeRecords,
    dismantleRecords,
    forgeRecipes,
    kiwameInventory,
    notes,
    treasures,
    wordCards,
    config.appointedDate,
  ]);

  if (!isOpen) return null;

  const displayHonmaru = config.honmaruName ? `${config.honmaruName}_本丸` : '大和_本丸';
  const displaySaniwa = config.saniwaName || '审神者';
  const displayTitle = config.saniwaTitle || '时之政府特任审神者';
  const displayRegion = config.honmaruRegion || '时之回廊';
  const displayMotto =
    config.saniwaMotto || '愿与诸刃共赏四季樱落，长伴本丸岁岁平安。';

  // Choose crest school (manual choice or assistant's school/name)
  const effectiveCrestSchool =
    config.crestSchool === '通用'
      ? ''
      : config.crestSchool || assistant.school || '';
  const effectiveCrestName =
    config.crestSchool === '通用'
      ? ''
      : config.crestSchool
      ? ''
      : assistant.name || '';

  const handleSaveCardProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHonmaru = honmaruNameInput.trim() || '大和';
    const cleanSaniwa = saniwaNameInput.trim() || '审神者';
    onUpdateConfig({
      honmaruName: cleanHonmaru,
      saniwaName: cleanSaniwa,
      saniwaTitle: titleInput.trim() || '时之政府特任审神者',
      honmaruRegion: regionInput.trim(),
      saniwaMotto: mottoInput.trim() || '愿与诸刃共赏四季樱落，长伴本丸岁岁平安。',
      appointedDate: appointedDateInput.trim(),
      crestSchool: crestInput,
      hasInitializedProfile: true,
    });
    setIsEditing(false);
    showToast('本丸审神者名片已更新落印', 'success');
  };

  const handleCopySummary = async () => {
    const lines = [
      `【${displayHonmaru} · 审神者名片】`,
      `主殿：${displaySaniwa}（${displayTitle}）`,
      `驻地：${displayRegion}${
        stats.appointedDays !== null ? ` · 已镇守本丸第 ${stats.appointedDays} 天` : ''
      }`,
      `近侍：${assistant.name}${assistant.school ? ` [${assistant.school}]` : ''}`,
      `刀账收录：${stats.uniqueSwords} 振（总保有 ${stats.totalHoldings} 振 · 极化 ${stats.totalKiwameCount} 振）`,
      `执炉锻刀：${stats.forgeCount} 次 · 刀解 ${stats.dismantleCount} 次`,
      `远征战绩：${stats.expTotal} 次（大成功率 ${stats.expGreatRate}%）`,
      `内番达成：${stats.neibanRate}%（最勤勉刀派：${stats.topSchool}）`,
      `本丸铭言：「${displayMotto}」`,
    ];
    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      showToast('名片文字简报已复制到剪贴板！', 'success');
    } catch {
      showToast('未能自动复制，可直接切换纯享模式截图留念', 'info');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--panel-color)] rounded-2xl shadow-2xl border-2 border-[var(--sakura-pink)] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (hidden in Pure Card Screenshot Mode except compact exit chip) */}
        {!isPureCardMode ? (
          <div className="px-4 sm:px-5 py-3 border-b border-[var(--border-color)] bg-[var(--search-bg)]/80 flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded-xs border border-[var(--header-red)] text-[10px] font-serif font-bold text-[var(--header-red)] bg-[var(--sakura-soft)]">
                御朱印
              </span>
              <h2 className="font-serif font-black text-sm sm:text-base text-[var(--header-red)]">
                审神者本丸就任名片
              </h2>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsEditing((v) => !v)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-serif flex items-center gap-1 transition-colors cursor-pointer border ${
                  isEditing
                    ? 'bg-[var(--sakura-deep)] text-white border-[var(--sakura-deep)]'
                    : 'bg-[var(--panel-color)] border-[var(--border-color)] text-[var(--text-color)] hover:border-[var(--sakura-deep)]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? '返回名片' : '编修名片'}</span>
              </button>

              {!isEditing && (
                <>
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    title="复制名片战绩文本"
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--panel-color)] border border-[var(--border-color)] text-xs font-serif text-[var(--text-color)] hover:border-[var(--sakura-pink)] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">复制文案</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPureCardMode(true)}
                    title="隐去操作栏，方便截屏留存"
                    className="px-2.5 py-1.5 rounded-lg bg-[var(--sakura-soft)] border border-[var(--sakura-pink)] text-xs font-serif font-bold text-[var(--header-red)] hover:bg-[var(--sakura-pink)]/40 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">纯享截屏</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--header-red)] hover:bg-[var(--panel-color)] cursor-pointer transition-colors"
                aria-label="关闭名片"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 py-2 bg-[var(--search-bg)]/60 border-b border-[var(--border-color)]/60 flex items-center justify-between text-[11px] font-serif text-[var(--text-muted)]">
            <span>纯享名片预览模式 · 可直接截屏留念</span>
            <button
              type="button"
              onClick={() => setIsPureCardMode(false)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--panel-color)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-[var(--sakura-deep)] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>恢复操作栏</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {isEditing ? (
            /* ================= EDIT PROFILE MODE ================= */
            <form onSubmit={handleSaveCardProfile} className="space-y-4 text-xs animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-serif font-bold text-[var(--text-color)] mb-1">
                    审神者尊号
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={20}
                    value={saniwaNameInput}
                    onChange={(e) => setSaniwaNameInput(e.target.value)}
                    placeholder="如：主殿、千鹤"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif focus:outline-hidden focus:border-[var(--sakura-deep)]"
                  />
                </div>

                <div>
                  <label className="block font-serif font-bold text-[var(--text-color)] mb-1">
                    本丸名号（将展示为「名号_本丸」）
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    value={honmaruNameInput}
                    onChange={(e) => setHonmaruNameInput(e.target.value)}
                    placeholder="如：大和、浅樱、山城"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif focus:outline-hidden focus:border-[var(--sakura-deep)]"
                  />
                </div>
              </div>

              {/* Title + Preset */}
              <div>
                <label className="block font-serif font-bold text-[var(--text-color)] mb-1">
                  审神者称号 / 官衔
                </label>
                <input
                  type="text"
                  maxLength={24}
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="时之政府特任审神者"
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif focus:outline-hidden focus:border-[var(--sakura-deep)]"
                />
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {TITLE_PRESETS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTitleInput(t)}
                      className="px-2 py-0.5 rounded bg-[var(--search-bg)] border border-[var(--border-color)] text-[10px] font-serif text-[var(--text-muted)] hover:text-[var(--header-red)] hover:border-[var(--sakura-pink)] cursor-pointer"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Region & Optional Appointed Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-serif font-bold text-[var(--text-color)] mb-1">
                    所属国度 / 驻地（可选）
                  </label>
                  <input
                    type="text"
                    maxLength={16}
                    value={regionInput}
                    onChange={(e) => setRegionInput(e.target.value)}
                    placeholder="如：山城国、备前国"
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif focus:outline-hidden focus:border-[var(--sakura-deep)]"
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {REGION_PRESETS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRegionInput(r)}
                        className="px-1.5 py-0.5 rounded bg-[var(--search-bg)] border border-[var(--border-color)] text-[10px] font-serif text-[var(--text-muted)] hover:text-[var(--header-red)] hover:border-[var(--sakura-pink)] cursor-pointer"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-serif font-bold text-[var(--text-color)] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[var(--sakura-deep)]" />
                      <span>就任日期（可选，暂未想好可留空）</span>
                    </label>
                    {appointedDateInput && (
                      <button
                        type="button"
                        onClick={() => setAppointedDateInput('')}
                        className="text-[10px] text-[var(--text-muted)] hover:text-red-500 font-serif cursor-pointer"
                      >
                        清空
                      </button>
                    )}
                  </div>
                  <input
                    type="date"
                    value={appointedDateInput}
                    onChange={(e) => setAppointedDateInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-mono focus:outline-hidden focus:border-[var(--sakura-deep)]"
                  />
                  <p className="text-[10px] text-[var(--text-muted)] font-serif mt-1">
                    填写入坑/启记日期后，名片将自动换算镇守本丸天数；留空则显示“良辰待题”。
                  </p>
                </div>
              </div>

              {/* Crest watermark selector */}
              <div>
                <label className="block font-serif font-bold text-[var(--text-color)] mb-1">
                  名片家纹底印
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {CREST_OPTIONS.map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setCrestInput(opt.value)}
                      className={`px-2 py-1.5 rounded-lg border text-[11px] font-serif cursor-pointer transition-colors ${
                        crestInput === opt.value
                          ? 'bg-[var(--sakura-soft)] border-[var(--sakura-deep)] text-[var(--header-red)] font-bold'
                          : 'bg-[var(--search-bg)] border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Motto */}
              <div>
                <label className="block font-serif font-bold text-[var(--text-color)] mb-1">
                  本丸铭言 / 就任座右铭
                </label>
                <textarea
                  rows={2}
                  maxLength={80}
                  value={mottoInput}
                  onChange={(e) => setMottoInput(e.target.value)}
                  placeholder="写下一句属于本丸的寄语或就任心情..."
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif focus:outline-hidden focus:border-[var(--sakura-deep)]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-muted)] font-serif hover:text-[var(--text-color)] cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[var(--sakura-deep)] text-white font-serif font-bold shadow-xs hover:bg-[var(--sakura-deep)]/90 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>保存落印</span>
                </button>
              </div>
            </form>
          ) : (
            /* ================= DISPLAY CARD MODE ================= */
            <div className="space-y-4 animate-fadeIn">
              {/* Primary Wafu Card Banner */}
              <div className="relative rounded-2xl border-2 border-[var(--accent-gold)]/55 bg-gradient-to-br from-[var(--sakura-soft)]/55 via-[var(--panel-color)] to-[var(--search-bg)] p-5 sm:p-6 shadow-sm overflow-hidden">
                {/* School Mon Crest Watermark */}
                <div className="absolute -right-4 -bottom-4 text-[var(--sakura-deep)] pointer-events-none select-none">
                  <SchoolMonWatermark
                    school={effectiveCrestSchool}
                    name={effectiveCrestName}
                    className="w-40 h-40 opacity-50"
                  />
                </div>

                {/* Top Metadata Line (Clean typographic separators, zero pills) */}
                <div className="relative z-10 flex items-center justify-between gap-3 flex-wrap pb-3 border-b border-[var(--accent-gold)]/30">
                  <div className="text-[11px] font-serif text-[var(--text-muted)] tracking-wider flex items-center gap-2 flex-wrap">
                    <span>时空政厅 · 本丸任状</span>
                    <span aria-hidden="true">·</span>
                    <span>{displayRegion}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {stats.appointedDays !== null
                        ? `镇守第 ${stats.appointedDays} 日 (${config.appointedDate} 起)`
                        : '良辰待题 · 岁月长伴'}
                    </span>
                  </div>

                  {/* Vermilion Hanko Seal */}
                  <div
                    className="w-10 h-10 rounded-md border-2 border-[var(--header-red)]/85 bg-[var(--panel-color)]/80 flex flex-col items-center justify-center text-[var(--header-red)] font-serif font-black leading-none shadow-2xs select-none rotate-3 shrink-0"
                    title="本丸御朱印"
                  >
                    <span className="text-[11px]">本丸</span>
                    <span className="text-[10px] mt-0.5">之印</span>
                  </div>
                </div>

                {/* Identity Core */}
                <div className="relative z-10 py-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="text-xs font-serif text-[var(--sakura-deep)] font-bold tracking-wide">
                      {displayTitle}
                    </div>
                    <div className="flex items-baseline gap-2.5 flex-wrap">
                      <h3 className="text-2xl sm:text-3xl font-black font-serif text-[var(--header-red)] tracking-wider">
                        {displaySaniwa}
                      </h3>
                      <span className="text-sm font-serif text-[var(--text-muted)]">
                        领镇「<strong className="text-[var(--text-color)]">{displayHonmaru}</strong>」
                      </span>
                    </div>
                  </div>

                  {/* Current Attendant */}
                  <button
                    type="button"
                    disabled={isPureCardMode}
                    onClick={() => {
                      if (!isPureCardMode && onOpenAssistant) {
                        onClose();
                        onOpenAssistant();
                      }
                    }}
                    className={`text-left sm:text-right px-3.5 py-2.5 rounded-xl bg-[var(--panel-color)]/90 border border-[var(--sakura-pink)]/70 shadow-2xs shrink-0 transition-colors ${
                      !isPureCardMode && onOpenAssistant
                        ? 'cursor-pointer hover:border-[var(--sakura-deep)]'
                        : 'cursor-default'
                    }`}
                  >
                    <div className="text-[10px] font-serif text-[var(--text-muted)] flex items-center sm:justify-end gap-1">
                      <UserCheck className="w-3 h-3 text-[var(--sakura-deep)]" />
                      <span>当值近侍</span>
                    </div>
                    <div className="text-sm font-serif font-black text-[var(--text-color)] mt-0.5">
                      {assistant.name || '未任命'}
                    </div>
                    {assistant.school && (
                      <div className="text-[10px] font-serif text-[var(--sakura-deep)]">
                        {assistant.school}
                      </div>
                    )}
                  </button>
                </div>

                {/* Motto Quote */}
                <div className="relative z-10 pt-3 border-t border-[var(--accent-gold)]/25">
                  <p className="text-xs sm:text-sm font-serif italic text-[var(--text-color)] leading-relaxed">
                    “{displayMotto}”
                  </p>
                </div>
              </div>

              {/* Honmaru Record Summary Grid (4 Primary Stat Blocks) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. Daozhang */}
                <div
                  onClick={() => {
                    if (!isPureCardMode && onOpenDaozhang) {
                      onClose();
                      onOpenDaozhang();
                    }
                  }}
                  className={`p-3.5 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] space-y-1 transition-colors ${
                    !isPureCardMode && onOpenDaozhang
                      ? 'cursor-pointer hover:border-[var(--sakura-pink)]'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-serif text-[var(--text-muted)]">
                    <span>刀账收录</span>
                    <BookOpen className="w-3.5 h-3.5 text-[var(--sakura-deep)]" />
                  </div>
                  <div className="text-xl font-black font-mono tabular-nums text-[var(--header-red)]">
                    {stats.uniqueSwords}{' '}
                    <span className="text-xs font-serif font-normal text-[var(--text-muted)]">振</span>
                  </div>
                  <div className="text-[10px] font-serif text-[var(--text-muted)]">
                    在库 {stats.totalHoldings} 振 · 极化 {stats.totalKiwameCount} 振
                  </div>
                </div>

                {/* 2. Forge & Dismantle */}
                <div className="p-3.5 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-serif text-[var(--text-muted)]">
                    <span>执炉锻造</span>
                    <Flame className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div className="text-xl font-black font-mono tabular-nums text-[var(--text-color)]">
                    {stats.forgeCount}{' '}
                    <span className="text-xs font-serif font-normal text-[var(--text-muted)]">次</span>
                  </div>
                  <div className="text-[10px] font-serif text-[var(--text-muted)]">
                    刀解 {stats.dismantleCount} 次 · 配方 {stats.recipeCount} 册
                  </div>
                </div>

                {/* 3. Expedition */}
                <div className="p-3.5 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-serif text-[var(--text-muted)]">
                    <span>远征战果</span>
                    <Compass className="w-3.5 h-3.5 text-sky-600" />
                  </div>
                  <div className="text-xl font-black font-mono tabular-nums text-[var(--text-color)]">
                    {stats.expTotal}{' '}
                    <span className="text-xs font-serif font-normal text-[var(--text-muted)]">回</span>
                  </div>
                  <div className="text-[10px] font-serif text-[var(--text-muted)]">
                    大成功 {stats.expGreatSuccess} 回（{stats.expGreatRate}%）
                  </div>
                </div>

                {/* 4. Neiban */}
                <div className="p-3.5 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-serif text-[var(--text-muted)]">
                    <span>内番勤勉</span>
                    <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <div className="text-xl font-black font-mono tabular-nums text-emerald-600">
                    {stats.neibanRate}
                    <span className="text-xs font-mono">%</span>
                  </div>
                  <div className="text-[10px] font-serif text-[var(--text-muted)] truncate" title={stats.topSchool}>
                    领衔：{stats.topSchool}
                  </div>
                </div>
              </div>

              {/* Secondary Cultivation & Memories Strip */}
              <div className="p-3.5 rounded-xl bg-[var(--panel-color)] border border-[var(--border-color)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--sakura-deep)] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-[var(--text-muted)] font-serif">修行状态</div>
                    <div className="font-mono font-bold text-[var(--text-color)] truncate">
                      在途 {stats.travelingKiwameCount} / 三宝 {stats.kiwameSets}套
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ScrollText className="w-4 h-4 text-[var(--header-red)] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-[var(--text-muted)] font-serif">奏帖手札</div>
                    <div className="font-mono font-bold text-[var(--text-color)]">
                      {stats.notesCount} 篇
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-[var(--text-muted)] font-serif">珍藏阁影</div>
                    <div className="font-mono font-bold text-[var(--text-color)]">
                      {stats.treasuresCount} 帧
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-[var(--text-muted)] font-serif">言叶字卡</div>
                    <div className="font-mono font-bold text-[var(--text-color)]">
                      {stats.wordCardsCount} 枚
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
