import React, { useState, useMemo } from 'react';
import {
  DaozhangRecord,
  DaozhangMemoEntry,
  TreasureItem,
  COMMON_SWORD_TYPES,
  COMMON_SCHOOLS,
  SwordType,
} from '../types';
import { TreasureGallery } from './TreasureGallery';
import {
  X,
  Plus,
  Search,
  ArrowUpDown,
  LayoutGrid,
  List,
  Calendar,
  Edit3,
  Trash2,
  Check,
  Star,
  Sparkles,
  BookOpen,
  Filter,
  Award,
  Clock,
  Cake,
  Heart,
  MessageSquare,
  StickyNote,
  Send,
  Gift,
} from 'lucide-react';

interface DaozhangModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: DaozhangRecord[];
  treasures: TreasureItem[];
  onSaveRecord: (record: DaozhangRecord, isNew: boolean) => void;
  onDeleteRecord: (id: string) => void;
  onSaveTreasure: (item: TreasureItem) => void;
  onDeleteTreasure: (id: string) => void;
  onLoadPresetSwords: () => void;
  showToast: (msg: string) => void;
}

type DaozhangView = 'index' | 'form' | 'detail' | 'treasure';
type ViewMode = 'grid' | 'list' | 'timeline';
type SortOrder = 'date-desc' | 'date-asc' | 'number-asc' | 'number-desc';

// Helper to compute anniversary / days manifested in Honmaru
const getManifestationInfo = (dateStr: string) => {
  if (!dateStr) return { days: 0, years: 0, isAnniversaryMonth: false, label: '未知' };
  try {
    const manifested = new Date(dateStr);
    const now = new Date();
    const diffTime = now.getTime() - manifested.getTime();
    const days = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const years = Math.floor(days / 365);
    const isAnniversaryMonth =
      now.getMonth() === manifested.getMonth() && years >= 1;
    return {
      days,
      years,
      isAnniversaryMonth,
      label: `显现第 ${days} 日`,
    };
  } catch {
    return { days: 0, years: 0, isAnniversaryMonth: false, label: dateStr };
  }
};

export const DaozhangModal: React.FC<DaozhangModalProps> = ({
  isOpen,
  onClose,
  records,
  treasures,
  onSaveRecord,
  onDeleteRecord,
  onSaveTreasure,
  onDeleteTreasure,
  onLoadPresetSwords,
  showToast,
}) => {
  const [currentView, setCurrentView] = useState<DaozhangView>('index');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [treasureFilterSwordId, setTreasureFilterSwordId] = useState<string | null>(null);

  // Search & Filter state - Default to chronological timeline sorting (date-desc)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSwordType, setSelectedSwordType] = useState<string>('全部');
  const [selectedSchool, setSelectedSchool] = useState<string>('全部');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date-desc');

  // Form editing state
  const [formId, setFormId] = useState<string>('');
  const [formNumber, setFormNumber] = useState<string>('');
  const [formName, setFormName] = useState<string>('');
  const [formSwordType, setFormSwordType] = useState<string>('打刀');
  const [formSchool, setFormSchool] = useState<string>('');
  const [formDate, setFormDate] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formFavorite, setFormFavorite] = useState<boolean>(false);
  const [formBondLevel, setFormBondLevel] = useState<number>(1);

  // In-app Custom Confirm Dialog to avoid browser window.confirm being blocked
  const [recordPendingDelete, setRecordPendingDelete] = useState<DaozhangRecord | null>(null);

  // Inline notes editing on detail view
  const [isEditingNotesInline, setIsEditingNotesInline] = useState(false);
  const [inlineNotesContent, setInlineNotesContent] = useState('');

  // Memo entry form state inside detail view
  const [isAddingMemo, setIsAddingMemo] = useState(false);
  const [memoCategory, setMemoCategory] = useState<'互动小记' | '刀装心得' | '问答签文' | '出阵手札'>('互动小记');
  const [memoContent, setMemoContent] = useState('');

  const currentRecord = records.find((r) => r.id === selectedRecordId);

  // Quick Bond Level click handler (1-5 stars)
  const handleUpdateBond = (record: DaozhangRecord, newBond: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const clamped = Math.max(1, Math.min(5, newBond));
    const updated: DaozhangRecord = {
      ...record,
      bondLevel: clamped,
    };
    onSaveRecord(updated, false);
    showToast(`【${record.name}】羁绊值升至 ${clamped} 星！心犀相通`);
  };

  // Add memo entry to current record
  const handleAddMemoEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRecord || !memoContent.trim()) return;

    const newEntry: DaozhangMemoEntry = {
      id: `memo-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      category: memoCategory,
      content: memoContent.trim(),
    };

    const updated: DaozhangRecord = {
      ...currentRecord,
      memoEntries: [newEntry, ...(currentRecord.memoEntries || [])],
    };

    onSaveRecord(updated, false);
    setMemoContent('');
    setIsAddingMemo(false);
    showToast(`已增补【${currentRecord.name}】的${memoCategory}`);
  };

  // Delete memo entry from current record
  const handleDeleteMemoEntry = (entryId: string) => {
    if (!currentRecord) return;
    const updated: DaozhangRecord = {
      ...currentRecord,
      memoEntries: (currentRecord.memoEntries || []).filter((m) => m.id !== entryId),
    };
    onSaveRecord(updated, false);
    showToast('已移除该条备忘小记');
  };

  // Extract all unique schools for filter
  const allSchools = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.school && r.school.trim()) set.add(r.school.trim());
    });
    return Array.from(set);
  }, [records]);

  // Normalize sword number for sorting (e.g. "No.003" -> 3, "085" -> 85)
  const extractNumericPart = (numStr: string): number => {
    const match = numStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 999999;
  };

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    return records
      .filter((rec) => {
        // Text search (matches number, name, school, sword type, or notes)
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matchNum = rec.number.toLowerCase().includes(q);
          const matchName = rec.name.toLowerCase().includes(q);
          const matchSchool = (rec.school || '').toLowerCase().includes(q);
          const matchType = (rec.swordType || '').toLowerCase().includes(q);
          const matchNotes = (rec.notes || '').toLowerCase().includes(q);
          if (!matchNum && !matchName && !matchSchool && !matchType && !matchNotes) {
            return false;
          }
        }
        // Sword type filter
        if (selectedSwordType !== '全部' && rec.swordType !== selectedSwordType) {
          return false;
        }
        // School filter
        if (selectedSchool !== '全部' && rec.school !== selectedSchool) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'number-asc') {
          return extractNumericPart(a.number) - extractNumericPart(b.number);
        }
        if (sortOrder === 'number-desc') {
          return extractNumericPart(b.number) - extractNumericPart(a.number);
        }
        if (sortOrder === 'date-desc') {
          return (b.date || '').localeCompare(a.date || '');
        }
        if (sortOrder === 'date-asc') {
          return (a.date || '').localeCompare(b.date || '');
        }
        return 0;
      });
  }, [records, searchTerm, selectedSwordType, selectedSchool, sortOrder]);

  // Group records by year-month for timeline view
  const timelineGroups = useMemo(() => {
    const groups: { [key: string]: DaozhangRecord[] } = {};
    filteredRecords.forEach((r) => {
      const monthKey = r.date ? r.date.substring(0, 7) : '未知岁月';
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(r);
    });
    return groups;
  }, [filteredRecords]);

  if (!isOpen) return null;

  // Open Form to Add New Sword
  const handleAddNew = () => {
    // Generate next estimated number
    const maxNum = records.reduce((max, r) => {
      const n = extractNumericPart(r.number);
      return n < 999999 && n > max ? n : max;
    }, 0);
    const nextNumStr = `No.${String(maxNum + 1).padStart(3, '0')}`;

    setFormId(`dz-${Date.now()}`);
    setFormNumber(nextNumStr);
    setFormName('');
    setFormSwordType('打刀');
    setFormSchool('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setFormFavorite(false);
    setCurrentView('form');
  };

  // Open Form to Edit Existing Sword
  const handleEditRecord = (record: DaozhangRecord) => {
    setFormId(record.id);
    setFormNumber(record.number || '');
    setFormName(record.name || '');
    setFormSwordType(record.swordType || '打刀');
    setFormSchool(record.school || '');
    setFormDate(record.date || new Date().toISOString().split('T')[0]);
    setFormNotes(record.notes || '');
    setFormFavorite(!!record.favorite);
    setFormBondLevel(record.bondLevel || 1);
    setCurrentView('form');
  };

  // View Sword Detail
  const handleOpenDetail = (record: DaozhangRecord) => {
    setSelectedRecordId(record.id);
    setInlineNotesContent(record.notes || '');
    setIsEditingNotesInline(false);
    setIsAddingMemo(false);
    setMemoContent('');
    setCurrentView('detail');
  };

  // Save Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('刀剑男士名讳不可为空');
      return;
    }

    // Auto format number if user just wrote "3" -> "No.003"
    let formattedNum = formNumber.trim();
    if (/^\d+$/.test(formattedNum)) {
      formattedNum = `No.${formattedNum.padStart(3, '0')}`;
    } else if (!formattedNum) {
      formattedNum = 'No.???';
    }

    const existing = records.find((r) => r.id === formId);
    const isNew = !existing;
    const newRecord: DaozhangRecord = {
      id: formId,
      number: formattedNum,
      name: formName.trim(),
      swordType: formSwordType,
      school: formSchool.trim(),
      date: formDate || new Date().toISOString().split('T')[0],
      notes: formNotes.trim(),
      favorite: formFavorite,
      bondLevel: formBondLevel,
      memoEntries: existing?.memoEntries || [],
    };

    onSaveRecord(newRecord, isNew);
    setSelectedRecordId(formId);
    setInlineNotesContent(newRecord.notes);
    setCurrentView('detail');
    showToast(isNew ? `新刃【${newRecord.name}】已录入刀账` : `【${newRecord.name}】刀账档案已更新`);
  };

  // Save Inline Notes
  const handleSaveInlineNotes = () => {
    if (!currentRecord) return;
    const updated: DaozhangRecord = {
      ...currentRecord,
      notes: inlineNotesContent.trim(),
    };
    onSaveRecord(updated, false);
    setIsEditingNotesInline(false);
    showToast(`【${currentRecord.name}】逸闻注记已保存`);
  };

  // Delete Record via custom in-app modal (never blocked by iframe/sandbox)
  const handleDeleteCurrent = () => {
    if (!formId && !selectedRecordId) return;
    const idToDelete = formId || selectedRecordId!;
    const rec = records.find((r) => r.id === idToDelete);
    if (rec) {
      setRecordPendingDelete(rec);
    }
  };

  const handleConfirmExecuteDelete = () => {
    if (!recordPendingDelete) return;
    const idToDelete = recordPendingDelete.id;
    const name = recordPendingDelete.name;
    onDeleteRecord(idToDelete);
    showToast(`已将【${name}】从本丸刀账中彻底除名`);
    setRecordPendingDelete(null);
    setCurrentView('index');
    setSelectedRecordId(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[var(--panel-color)] rounded-xl shadow-2xl border border-[var(--sakura-pink)]/50 flex flex-col max-h-[92vh] overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[var(--sakura-pink)]/40 flex items-center justify-between bg-[var(--sakura-soft)]/40 gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <BookOpen className="w-5 h-5 text-[var(--header-red)] shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-[var(--header-red)] tracking-wider font-serif shrink-0">
              本丸刀账典籍
            </h2>
            <span className="text-xs text-[var(--text-muted)] ml-1 sm:ml-2 truncate">
              收录 <strong className="text-[var(--sakura-deep)] font-mono">{records.length}</strong> 振刀剑
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* 宝物库按钮 (位于登录新刀左侧，使用 Gift 图标) */}
            <button
              onClick={() => {
                if (currentView === 'treasure') {
                  setCurrentView('index');
                  setTreasureFilterSwordId(null);
                } else {
                  setCurrentView('treasure');
                  setTreasureFilterSwordId(null);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer shadow-xs transition-all ${
                currentView === 'treasure'
                  ? 'bg-[var(--accent-gold)] text-white border-[var(--accent-gold)] shadow-sm'
                  : 'bg-[var(--panel-color)] border-[var(--sakura-pink)] text-[var(--header-red)] hover:bg-[var(--sakura-soft)]'
              }`}
              title="浏览与收纳本丸男士肖像、战绩留念与珍藏宝物照片"
            >
              <Gift className="w-3.5 h-3.5" />
              <span>御宝物库</span>
              {treasures.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono leading-none ${
                  currentView === 'treasure' ? 'bg-white/25 text-white' : 'bg-[var(--sakura-soft)] text-[var(--sakura-deep)]'
                }`}>
                  {treasures.length}
                </span>
              )}
            </button>

            {currentView === 'index' && (
              <button
                onClick={handleAddNew}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white hover:bg-[var(--sakura-deep)]/90 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>登用新刃</span>
              </button>
            )}

            {currentView === 'treasure' && (
              <button
                onClick={() => setCurrentView('index')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--search-bg)] text-xs font-medium cursor-pointer transition-colors"
              >
                <span>返还刀账</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ================= VIEW 1: INDEX (CATALOG) ================= */}
        {currentView === 'index' && (
          <div className="flex-1 flex flex-col overflow-hidden p-4 sm:p-5 gap-3.5">
            {/* Search, Filter & View Controls */}
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              {/* Search Box */}
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  placeholder="检索番号(如003)、刀名、刀种、流派或逸事..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:border-[var(--sakura-deep)] transition-colors"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-color)]"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Order Selector */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-xs text-[var(--text-color)]">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[var(--sakura-deep)] shrink-0" />
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                    className="bg-transparent border-none text-xs focus:outline-hidden cursor-pointer text-[var(--text-color)]"
                  >
                    <option value="date-desc">显现时序：最新显现在前 (时间轴)</option>
                    <option value="date-asc">显现时序：开荒初始在前 (从早到晚)</option>
                    <option value="number-asc">刀剑番号：从小到大 (No.1→)</option>
                    <option value="number-desc">刀剑番号：从大到小</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-[var(--search-bg)] border border-[var(--border-color)] rounded-lg p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    title="图鉴卡牌视图"
                    className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      viewMode === 'grid'
                        ? 'bg-[var(--panel-color)] text-[var(--sakura-deep)] shadow-xs font-semibold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    title="名簿长卷视图 (适合上百振刀浏览)"
                    className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      viewMode === 'list'
                        ? 'bg-[var(--panel-color)] text-[var(--sakura-deep)] shadow-xs font-semibold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('timeline')}
                    title="显现时间轴视图"
                    className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                      viewMode === 'timeline'
                        ? 'bg-[var(--panel-color)] text-[var(--sakura-deep)] shadow-xs font-semibold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Sword Type Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[var(--text-muted)] shrink-0 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> 刀种:
              </span>
              {['全部', ...COMMON_SWORD_TYPES].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedSwordType(type)}
                  className={`px-2.5 py-1 rounded-md whitespace-nowrap text-xs transition-colors cursor-pointer ${
                    selectedSwordType === type
                      ? 'bg-[var(--sakura-deep)] text-white font-medium shadow-xs'
                      : 'bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
                  }`}
                >
                  {type}
                </button>
              ))}

              {allSchools.length > 0 && (
                <div className="ml-auto pl-2 shrink-0 flex items-center gap-1">
                  <span className="text-[var(--text-muted)]">流派:</span>
                  <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="bg-[var(--search-bg)] border border-[var(--border-color)] rounded-md px-2 py-0.5 text-xs text-[var(--text-color)] focus:outline-hidden"
                  >
                    <option value="全部">全部流派</option>
                    {allSchools.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pr-1">
              {filteredRecords.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[var(--border-color)] rounded-xl bg-[var(--search-bg)]/30">
                  <Sparkles className="w-10 h-10 text-[var(--sakura-pink)] mb-3 opacity-60" />
                  <p className="text-sm text-[var(--text-muted)] font-serif mb-3">
                    {searchTerm || selectedSwordType !== '全部' || selectedSchool !== '全部'
                      ? '未能检索到符合条件的刀剑男士。'
                      : '刀账尚无收录。主殿，请登用新刃或载入本丸典范样本。'}
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleAddNew}
                      className="px-3.5 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white text-xs font-semibold hover:bg-[var(--sakura-deep)]/90 cursor-pointer shadow-xs"
                    >
                      登用第一振刀
                    </button>
                    {records.length === 0 && (
                      <button
                        onClick={onLoadPresetSwords}
                        className="px-3.5 py-1.5 rounded-lg border border-[var(--sakura-pink)] bg-[var(--sakura-soft)] text-[var(--sakura-deep)] text-xs font-semibold hover:bg-[var(--sakura-pink)]/40 cursor-pointer"
                      >
                        一键载入典范刀账 (14振)
                      </button>
                    )}
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                /* 1. Grid Mode: Clean independent card cells (never overlapping!) */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredRecords.map((dz) => {
                    const info = getManifestationInfo(dz.date);
                    return (
                      <div
                        key={dz.id}
                        onClick={() => handleOpenDetail(dz)}
                        className="group relative bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--sakura-deep)] rounded-lg p-3 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between"
                        style={{
                          borderBottom: '3px solid var(--sakura-pink)',
                        }}
                      >
                        {/* Top Row: 番号 + Favorite / Anniversary Medal */}
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-[var(--search-bg)] text-[var(--text-muted)] group-hover:text-[var(--header-red)] group-hover:bg-[var(--sakura-soft)] transition-colors">
                            {dz.number || 'No.???'}
                          </span>
                          <div className="flex items-center gap-1">
                            {info.isAnniversaryMonth && (
                              <span
                                title="本月为入丸周年纪念月！"
                                className="flex items-center text-[10px] text-[var(--sakura-deep)] bg-[var(--sakura-soft)] px-1 rounded font-serif"
                              >
                                <Cake className="w-3 h-3 mr-0.5" />
                                {info.years}周
                              </span>
                            )}
                            {dz.favorite && (
                              <Star className="w-3.5 h-3.5 fill-[var(--accent-gold)] text-[var(--accent-gold)] shrink-0" />
                            )}
                          </div>
                        </div>

                        {/* Name */}
                        <div className="text-center my-1.5">
                          <div className="text-base font-bold text-[var(--text-color)] group-hover:text-[var(--sakura-deep)] transition-colors tracking-wide font-serif">
                            {dz.name}
                          </div>
                        </div>

                        {/* Middle: 刀种 & 流派 */}
                        <div className="flex flex-wrap items-center justify-center gap-1 my-1">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[var(--search-bg)] text-[var(--text-color)] border border-[var(--border-color)]">
                            {dz.swordType || '打刀'}
                          </span>
                          {dz.school && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[var(--sakura-soft)] text-[var(--sakura-deep)]">
                              {dz.school}
                            </span>
                          )}
                        </div>

                        {/* Bond Level (1-5 Stars Quick Click) */}
                        <div
                          className="flex items-center justify-center gap-0.5 py-1 my-0.5"
                          title={`当前羁绊值: ${dz.bondLevel || 1} 星 (点击快速升降羁绊)`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-[9px] text-[var(--text-muted)] font-serif mr-0.5">羁绊:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={(e) => handleUpdateBond(dz, star, e)}
                              className="p-0.5 cursor-pointer hover:scale-125 transition-transform"
                            >
                              <Star
                                className={`w-3 h-3 ${
                                  star <= (dz.bondLevel || 1)
                                    ? 'fill-[var(--accent-gold)] text-[var(--accent-gold)]'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>

                        {/* Bottom Date with Memorial Days Badge */}
                        <div className="text-[10px] text-center text-[var(--text-muted)] mt-2 pt-1.5 border-t border-[var(--border-color)] flex items-center justify-between">
                          <span className="font-mono flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5 opacity-60" />
                            {dz.date || '未知'}
                          </span>
                          <span
                            className="text-[9px] px-1 py-0.2 rounded font-mono bg-[var(--search-bg)] text-[var(--text-muted)] border border-[var(--border-color)]/60"
                            title={`自显现起已陪伴本丸 ${info.days} 天`}
                          >
                            {info.days}天
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : viewMode === 'list' ? (
                /* 2. List Mode: Optimized for 100+ swords in clean ledger table */
                <div className="border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--card-bg)] shadow-xs">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="bg-[var(--search-bg)] border-b border-[var(--border-color)] text-[var(--text-muted)]">
                      <tr>
                        <th className="py-2.5 px-3 font-semibold w-20">番号</th>
                        <th className="py-2.5 px-3 font-semibold">刀剑名讳</th>
                        <th className="py-2.5 px-3 font-semibold w-20">刀种</th>
                        <th className="py-2.5 px-3 font-semibold w-20">流派</th>
                        <th className="py-2.5 px-3 font-semibold w-24">羁绊值</th>
                        <th className="py-2.5 px-3 font-semibold w-36">显现纪念时日</th>
                        <th className="py-2.5 px-3 font-semibold hidden md:table-cell">逸事摘记</th>
                        <th className="py-2.5 px-3 font-semibold text-right w-20">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-color)]">
                      {filteredRecords.map((dz) => {
                        const info = getManifestationInfo(dz.date);
                        return (
                          <tr
                            key={dz.id}
                            onClick={() => handleOpenDetail(dz)}
                            className="hover:bg-[var(--sakura-soft)]/40 transition-colors cursor-pointer group"
                          >
                            <td className="py-2 px-3 font-mono font-bold text-[var(--text-muted)] group-hover:text-[var(--header-red)]">
                              {dz.number}
                            </td>
                            <td className="py-2 px-3 font-serif font-bold text-sm text-[var(--text-color)] flex items-center gap-1.5">
                              {dz.name}
                              {info.isAnniversaryMonth && (
                                <span
                                  className="text-[10px] text-[var(--sakura-deep)] bg-[var(--sakura-soft)] px-1 rounded font-serif font-normal"
                                  title="本月周年庆"
                                >
                                  🎂{info.years}周年
                                </span>
                              )}
                              {dz.favorite && (
                                <Star className="w-3 h-3 fill-[var(--accent-gold)] text-[var(--accent-gold)] inline" />
                              )}
                            </td>
                            <td className="py-2 px-3 text-[var(--text-muted)]">
                              <span className="px-1.5 py-0.5 rounded bg-[var(--search-bg)] border border-[var(--border-color)] text-[11px]">
                                {dz.swordType}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-[var(--text-muted)]">
                              {dz.school ? (
                                <span className="text-[var(--sakura-deep)] font-medium">
                                  {dz.school}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-2 px-3">
                              <div
                                className="flex items-center gap-0.5"
                                onClick={(e) => e.stopPropagation()}
                                title={`当前羁绊值: ${dz.bondLevel || 1} 星`}
                              >
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={(e) => handleUpdateBond(dz, s, e)}
                                    className="p-0.5 cursor-pointer hover:scale-125 transition-transform"
                                  >
                                    <Star
                                      className={`w-3 h-3 ${
                                        s <= (dz.bondLevel || 1)
                                          ? 'fill-[var(--accent-gold)] text-[var(--accent-gold)]'
                                          : 'text-gray-300 dark:text-gray-600'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </td>
                            <td className="py-2 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[var(--text-muted)]">{dz.date}</span>
                                <span
                                  className="text-[10px] font-mono px-1 py-0.2 rounded bg-[var(--sakura-soft)] text-[var(--sakura-deep)] border border-[var(--sakura-pink)]/50"
                                  title={`显现至今第 ${info.days} 天`}
                                >
                                  {info.days}天
                                </span>
                              </div>
                            </td>
                            <td className="py-2 px-3 text-[var(--text-muted)] truncate max-w-xs hidden md:table-cell">
                              {dz.notes || <span className="italic text-gray-400">暂无逸事记述</span>}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditRecord(dz);
                                  }}
                                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--sakura-deep)] hover:bg-[var(--search-bg)]"
                                  title="编辑档案"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRecordPendingDelete(dz);
                                  }}
                                  className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50"
                                  title="除名此刀"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* 3. Timeline View: Chronological view to answer "when did I obtain which sword" */
                <div className="space-y-6 py-2">
                  {Object.entries(timelineGroups).map(([monthKey, list]) => (
                    <div key={monthKey} className="relative pl-6 border-l-2 border-[var(--sakura-pink)]">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-[var(--panel-color)] border-2 border-[var(--sakura-deep)] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--sakura-deep)]" />
                      </div>
                      <div className="mb-2.5 flex items-center gap-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[var(--sakura-soft)] text-[var(--header-red)] border border-[var(--sakura-pink)]/40 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[var(--sakura-deep)]" />
                          {monthKey}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">
                          共显现 <strong className="text-[var(--sakura-deep)] font-mono">{list.length}</strong> 振刀剑
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                        {list.map((dz) => {
                          const info = getManifestationInfo(dz.date);
                          return (
                            <div
                              key={dz.id}
                              onClick={() => handleOpenDetail(dz)}
                              className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] hover:border-[var(--sakura-deep)] hover:shadow-xs transition-all cursor-pointer flex items-center justify-between"
                            >
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-[11px] text-[var(--text-muted)]">
                                    {dz.number}
                                  </span>
                                  <span className="font-serif font-bold text-sm text-[var(--text-color)]">
                                    {dz.name}
                                  </span>
                                  {info.isAnniversaryMonth && (
                                    <span className="text-[10px] text-[var(--sakura-deep)]" title="周年纪念月">
                                      🎂
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                                  {dz.swordType} · {dz.school || '无铭'}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] text-[var(--text-muted)] font-mono">
                                  {dz.date}
                                </div>
                                <div className="text-[9px] text-[var(--sakura-deep)] font-mono font-semibold">
                                  第{info.days}天
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Utility Bar */}
            <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              <div>
                <span>当前显示：{filteredRecords.length} / {records.length} 振</span>
                {selectedSwordType !== '全部' && <span className="ml-2">({selectedSwordType})</span>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onLoadPresetSwords}
                  className="hover:text-[var(--sakura-deep)] transition-colors cursor-pointer"
                  title="载入14振经典刀剑男士参考数据"
                >
                  载入经典刀剑范本
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: FORM (ADD / EDIT ALL FIELDS) ================= */}
        {currentView === 'form' && (
          <form
            onSubmit={handleSaveForm}
            className="flex-1 flex flex-col overflow-y-auto p-5 gap-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
              <h3 className="font-serif font-bold text-base text-[var(--header-red)] flex items-center gap-2">
                <Edit3 className="w-4 h-4" />
                {records.some((r) => r.id === formId) ? '修撰刀剑档案' : '录入新刀剑男士'}
              </h3>
              <label className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formFavorite}
                  onChange={(e) => setFormFavorite(e.target.checked)}
                  className="rounded border-[var(--border-color)] text-[var(--accent-gold)] accent-[var(--accent-gold)]"
                />
                <span>标为喜爱 / 本丸主力</span>
              </label>
            </div>

            {/* Row 1: 番号 & 名讳 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-color)] mb-1">
                  刀剑番号 <span className="text-[var(--header-red)]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    placeholder="例：No.003 或 003"
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-mono focus:outline-hidden focus:border-[var(--sakura-deep)] transition-colors"
                  />
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  可输入纯数字（如 3 或 85），系统会自动规范为 No.003 / No.085 方便排序检索
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-color)] mb-1">
                  刀剑男士名讳 <span className="text-[var(--header-red)]">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="例：三日月宗近、加州清光"
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif font-bold focus:outline-hidden focus:border-[var(--sakura-deep)] transition-colors"
                />
              </div>
            </div>

            {/* Row 2: 刀种与流派分开输入 (User explicitly requested separating these!) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 刀种 */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-color)] mb-1">
                  刀种 (分类)
                </label>
                <div className="flex gap-2">
                  <select
                    value={COMMON_SWORD_TYPES.includes(formSwordType as SwordType) ? formSwordType : '其它'}
                    onChange={(e) => {
                      if (e.target.value !== '其它') {
                        setFormSwordType(e.target.value);
                      }
                    }}
                    className="px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] focus:outline-hidden focus:border-[var(--sakura-deep)]"
                  >
                    {COMMON_SWORD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="其它">其它自定</option>
                  </select>
                  <input
                    type="text"
                    value={formSwordType}
                    onChange={(e) => setFormSwordType(e.target.value)}
                    placeholder="刀种名称"
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] focus:outline-hidden focus:border-[var(--sakura-deep)]"
                  />
                </div>
              </div>

              {/* 流派 */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-color)] mb-1">
                  流派 (刀工流派)
                </label>
                <input
                  type="text"
                  value={formSchool}
                  onChange={(e) => setFormSchool(e.target.value)}
                  placeholder="例：三条、粟田口、左文字、备前长船"
                  list="school-suggestions"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] focus:outline-hidden focus:border-[var(--sakura-deep)]"
                />
                <datalist id="school-suggestions">
                  {COMMON_SCHOOLS.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['三条', '粟田口', '左文字', '堀川', '古备前'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormSchool(s)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--sakura-soft)]"
                    >
                      +{s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: 显现/收入日期 & 羁绊评级 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-color)] mb-1">
                  显现 / 收入日期
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] focus:outline-hidden focus:border-[var(--sakura-deep)] font-mono"
                />
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  记录本丸锻刀出炉或战役掉落显现的确切时日
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-color)] mb-1">
                  主仆羁绊评级 (1-5 颗星)
                </label>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormBondLevel(s)}
                      className="cursor-pointer p-0.5 hover:scale-125 transition-transform"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          s <= formBondLevel
                            ? 'fill-[var(--accent-gold)] text-[var(--accent-gold)]'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-mono font-bold text-[var(--accent-gold)] ml-2">
                    {formBondLevel}/5 星
                  </span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  亦可在刀账卡片或长卷目录中点击星标快速调整
                </p>
              </div>
            </div>

            {/* Row 4: 源起 / 逸事考录 */}
            <div className="flex-1 flex flex-col">
              <label className="block text-xs font-semibold text-[var(--text-color)] mb-1">
                源起 / 逸事考录与本丸备忘
              </label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                placeholder="记录该刀剑男士的历史典故、刀工传承、锻造公式（如ALL350）、出阵心得、性格喜好或本丸生活趣事..."
                rows={5}
                className="w-full flex-1 px-3 py-2 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] leading-relaxed focus:outline-hidden focus:border-[var(--sakura-deep)] resize-y font-serif"
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCurrentView(selectedRecordId ? 'detail' : 'index')}
                className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-color)] hover:bg-[var(--search-bg)] cursor-pointer"
              >
                折返
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white text-xs font-semibold hover:bg-[var(--sakura-deep)]/90 shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>录入刀账</span>
              </button>
            </div>
          </form>
        )}

        {/* ================= VIEW 3: DETAIL VIEW (WITH EDIT BUTTON & INLINE EDITING) ================= */}
        {currentView === 'detail' && currentRecord && (
          <div className="flex-1 flex flex-col overflow-y-auto p-5 sm:p-6 gap-5">
            {/* Header info card */}
            <div className="text-center pb-4 border-b border-[var(--sakura-pink)]/40 relative">
              {/* Badges: 番号, 刀种, 流派 */}
              <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--sakura-soft)] text-[var(--header-red)] border border-[var(--sakura-pink)]">
                  {currentRecord.number}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-[var(--search-bg)] text-[var(--text-color)] border border-[var(--border-color)]">
                  {currentRecord.swordType}
                </span>
                {currentRecord.school && (
                  <span className="text-xs px-2 py-0.5 rounded bg-[var(--accent-gold-light)] text-[var(--accent-gold)] border border-[var(--accent-gold)]/30 font-medium">
                    {currentRecord.school}派
                  </span>
                )}
              </div>

              {/* Sword Name */}
              <h1 className="text-3xl sm:text-4xl font-serif font-black text-[var(--header-red)] tracking-widest my-2">
                {currentRecord.name}
              </h1>

              {/* Date of manifestation with Memorial Indicator and Interactive Bond Level */}
              {(() => {
                const detailInfo = getManifestationInfo(currentRecord.date);
                const currentBond = currentRecord.bondLevel || 1;
                return (
                  <div className="flex flex-col items-center justify-center gap-1.5 mt-2">
                    <div className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1.5 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-[var(--sakura-deep)]" />
                      <span>于 {currentRecord.date || '未知岁月'} 显现本丸</span>
                      <span className="inline-block w-1 h-1 rounded-full bg-[var(--sakura-pink)]" />
                      <span className="text-[var(--header-red)] font-semibold">
                        已陪伴本丸 {detailInfo.days} 天
                      </span>
                    </div>

                    {/* Interactive 1-5 Star Bond Level System */}
                    <div className="flex items-center gap-1 mt-1 px-3 py-1 rounded-full bg-[var(--search-bg)] border border-[var(--border-color)]">
                      <span className="text-xs font-serif text-[var(--text-color)] font-bold flex items-center gap-1">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        主仆羁绊:
                      </span>
                      <div className="flex items-center gap-1 ml-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={(e) => handleUpdateBond(currentRecord, star, e)}
                            className="p-1 cursor-pointer hover:scale-130 transition-transform"
                            title={`点击将羁绊评级设为 ${star} 颗星`}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= currentBond
                                  ? 'fill-[var(--accent-gold)] text-[var(--accent-gold)]'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[var(--accent-gold)] ml-1">
                        {currentBond}/5 星
                      </span>
                    </div>

                    {detailInfo.isAnniversaryMonth && (
                      <div className="inline-flex items-center gap-1 px-2.5 py-0.5 mt-1 rounded-full bg-[var(--sakura-soft)] text-[var(--sakura-deep)] text-[11px] border border-[var(--sakura-pink)] animate-pulse">
                        <Cake className="w-3.5 h-3.5" />
                        <span>本月正值入丸 {detailInfo.years} 周年纪念！</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {currentRecord.favorite && (
                <div className="absolute right-0 top-0 flex items-center gap-1 text-xs text-[var(--accent-gold)] bg-[var(--accent-gold-light)] px-2 py-1 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-[var(--accent-gold)]" />
                  <span>主力爱刃</span>
                </div>
              )}
            </div>

            {/* Notes Section with Inline Edit Capability to fix typos instantly */}
            <div className="flex-1 bg-[var(--search-bg)] border border-[var(--border-color)] rounded-xl p-4 sm:p-5 relative border-l-4 border-l-[var(--accent-gold)]">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-color)]">
                <span className="text-xs font-bold tracking-wider text-[var(--text-color)] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  源起 · 逸事考录与本丸事记
                </span>

                {/* Inline quick-edit toggle */}
                {!isEditingNotesInline ? (
                  <button
                    onClick={() => {
                      setInlineNotesContent(currentRecord.notes || '');
                      setIsEditingNotesInline(true);
                    }}
                    className="text-xs text-[var(--sakura-deep)] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    title="快速修改逸闻错字"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>速修逸闻</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditingNotesInline(false)}
                      className="text-xs text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleSaveInlineNotes}
                      className="text-xs px-2.5 py-0.5 rounded bg-[var(--sakura-deep)] text-white hover:bg-[var(--sakura-deep)]/90 cursor-pointer shadow-2xs font-medium"
                    >
                      保存速修
                    </button>
                  </div>
                )}
              </div>

              {isEditingNotesInline ? (
                <div>
                  <textarea
                    value={inlineNotesContent}
                    onChange={(e) => setInlineNotesContent(e.target.value)}
                    rows={6}
                    placeholder="在此修改错别字或增补逸闻..."
                    className="w-full p-2.5 text-sm rounded-lg border border-[var(--sakura-deep)] bg-[var(--panel-color)] text-[var(--text-color)] leading-relaxed focus:outline-hidden font-serif"
                    autoFocus
                  />
                  <div className="text-[11px] text-[var(--text-muted)] mt-1.5">
                    * 快速修复错别字或调整语句，点击右上角「保存速修」即可生效。
                  </div>
                </div>
              ) : currentRecord.notes ? (
                <p className="text-sm sm:text-base leading-relaxed text-[var(--text-color)] font-serif whitespace-pre-wrap">
                  {currentRecord.notes}
                </p>
              ) : (
                <div className="py-8 text-center text-xs text-[var(--text-muted)] italic font-serif">
                  暂未题写逸闻考录。主殿可点击右上角「速修逸闻」或下方「编辑全卷档案」增补。
                </div>
              )}
            </div>

            {/* NEW MODULE: 刀账备忘录 (互动小记、刀装心得、问答签文备考) */}
            <div className="bg-[var(--panel-color)] border border-[var(--sakura-pink)]/60 rounded-xl p-4 sm:p-5 shadow-xs border-l-4 border-l-[var(--sakura-deep)] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-[var(--sakura-deep)]" />
                  <h3 className="font-serif font-bold text-sm text-[var(--text-color)]">
                    【{currentRecord.name}】刀账备忘录
                  </h3>
                  <span className="text-[10px] text-[var(--text-muted)] hidden sm:inline">
                    记录互动小记、刀装问答签文与羁绊随想
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Shortcut to view this sword's treasures in TreasureGallery */}
                  <button
                    type="button"
                    onClick={() => {
                      setTreasureFilterSwordId(currentRecord.id);
                      setCurrentView('treasure');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-[var(--accent-gold)] text-xs font-serif cursor-pointer transition-colors"
                    title={`进入宝物库查看【${currentRecord.name}】的专属照片与留影`}
                  >
                    <Gift className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                    <span>专属宝物 ({treasures.filter((t) => t.swordId === currentRecord.id).length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAddingMemo(!isAddingMemo)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--sakura-soft)] text-[var(--sakura-deep)] hover:bg-[var(--sakura-pink)]/40 text-xs font-serif font-semibold cursor-pointer transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingMemo ? '收起录入' : '题写备忘'}</span>
                  </button>
                </div>
              </div>

              {/* Form to add a new memo entry */}
              {isAddingMemo && (
                <form
                  onSubmit={handleAddMemoEntry}
                  className="p-3.5 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] space-y-3 animate-fadeIn text-xs"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-[var(--text-color)] font-serif">备忘类型:</span>
                    {(['互动小记', '刀装心得', '问答签文', '出阵手札'] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setMemoCategory(cat)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-serif transition-colors cursor-pointer ${
                          memoCategory === cat
                            ? 'bg-[var(--sakura-deep)] text-white font-bold shadow-2xs'
                            : 'bg-[var(--panel-color)] text-[var(--text-muted)] border border-[var(--border-color)] hover:text-[var(--text-color)]'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={memoContent}
                    onChange={(e) => setMemoContent(e.target.value)}
                    rows={3}
                    placeholder={`在此题写与【${currentRecord.name}】的${memoCategory}（如：互动日常、出阵感悟、特上刀装制作灵感、晨间问答箴言...）`}
                    className="w-full p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] focus:outline-hidden focus:border-[var(--sakura-deep)] font-serif"
                    autoFocus
                  />

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingMemo(false)}
                      className="px-3 py-1 rounded text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white font-bold font-serif hover:bg-[var(--sakura-deep)]/90 cursor-pointer shadow-xs"
                    >
                      <Send className="w-3 h-3" />
                      <span>收录至备忘录</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Entries list */}
              {(!currentRecord.memoEntries || currentRecord.memoEntries.length === 0) ? (
                <div className="py-6 text-center text-xs text-[var(--text-muted)] font-serif italic border border-dashed border-[var(--border-color)] rounded-lg">
                  「暂无备忘条目。主殿，可点击右上角『题写备忘』记录今日与{currentRecord.name}的互动或签文。」
                </div>
              ) : (
                <div className="space-y-2.5">
                  {currentRecord.memoEntries.map((memo) => {
                    const badgeStyles = {
                      '互动小记': 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                      '刀装心得': 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                      '问答签文': 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                      '出阵手札': 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                    }[memo.category] || 'bg-gray-100 text-gray-700';

                    return (
                      <div
                        key={memo.id}
                        className="p-3.5 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] hover:border-[var(--sakura-pink)] transition-all group"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-serif font-bold border ${badgeStyles}`}>
                              {memo.category}
                            </span>
                            <span className="text-[10px] font-mono text-[var(--text-muted)]">
                              {memo.date}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteMemoEntry(memo.id)}
                            className="text-gray-400 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            title="删除该条备忘"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm font-serif leading-relaxed text-[var(--text-color)] whitespace-pre-wrap pl-0.5">
                          {memo.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom Actions: Return to List + Delete + Full Edit Button */}
            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
              <button
                onClick={() => setCurrentView('index')}
                className="px-4 py-1.5 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-color)] hover:bg-[var(--search-bg)] cursor-pointer"
              >
                返回刀账目录
              </button>

              <div className="flex items-center gap-2">
                {/* 刀账除名: Placed immediately to the left of 编辑全卷档案 */}
                <button
                  type="button"
                  onClick={handleDeleteCurrent}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs font-medium cursor-pointer transition-colors"
                  title="将此刀剑从本丸刀账中彻底除名"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>刀账除名</span>
                </button>

                {/* 编辑全卷档案 */}
                <button
                  onClick={() => handleEditRecord(currentRecord)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white text-xs font-semibold hover:bg-[var(--sakura-deep)]/90 shadow-xs cursor-pointer transition-colors"
                  title="编辑刀剑全部信息（番号、名讳、刀种、流派、日期、逸闻）"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>编辑全卷档案</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= VIEW 4: TREASURE GALLERY (宝物库 · INS拍立得照片墙) ================= */}
        {currentView === 'treasure' && (
          <TreasureGallery
            treasures={treasures}
            swords={records}
            onSaveTreasure={onSaveTreasure}
            onDeleteTreasure={onDeleteTreasure}
            filterSwordId={treasureFilterSwordId}
            onClearSwordFilter={() => setTreasureFilterSwordId(null)}
            showToast={showToast}
            onClose={() => setCurrentView('index')}
          />
        )}

        {/* In-App Custom Confirm Modal for 刀账除名 (100% reliable in sandbox iframe & web browsers) */}
        {recordPendingDelete && (
          <div
            className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
            onClick={() => setRecordPendingDelete(null)}
          >
            <div
              className="w-full max-w-sm bg-[var(--panel-color)] rounded-xl border-2 border-red-300 shadow-2xl p-5 overflow-hidden animate-scaleIn"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2.5 text-red-600 mb-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4 text-red-600" />
                </div>
                <h3 className="font-serif font-bold text-base text-[var(--header-red)]">
                  刀账除名请示
                </h3>
              </div>

              <div className="bg-[var(--search-bg)] border border-[var(--border-color)] rounded-lg p-3 my-2 text-xs leading-relaxed font-serif">
                确定要将【
                <span className="font-bold text-[var(--header-red)]">
                  {recordPendingDelete.number} {recordPendingDelete.name}
                </span>
                】（{recordPendingDelete.swordType} · {recordPendingDelete.school || '无铭'}）从本丸刀账中彻底除名吗？
                <p className="text-[11px] text-[var(--text-muted)] mt-1.5">
                  * 此操作将抹去其在刀账长卷中的所有档案与逸事记录，无法撤销。
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-4 pt-3 border-t border-[var(--border-color)]">
                <button
                  type="button"
                  onClick={() => setRecordPendingDelete(null)}
                  className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-color)] hover:bg-[var(--search-bg)] cursor-pointer"
                >
                  留存刀账
                </button>
                <button
                  type="button"
                  onClick={handleConfirmExecuteDelete}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow-xs transition-colors"
                >
                  确认除名
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
