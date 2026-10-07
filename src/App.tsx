import React, { useState, useEffect } from 'react';
import {
  Note,
  NeibanRecord,
  NeibanStatus,
  DaozhangRecord,
  TreasureItem,
  BenwanConfig,
  Assistant,
  COMMON_SWORD_TYPES,
  SwordType,
} from './types';
import {
  INITIAL_NOTES,
  INITIAL_NEIBAN,
  INITIAL_PRESET_SWORDS,
  CLASSIC_PRESET_SWORDS,
  CLASSIC_PRESET_NEIBAN,
  INITIAL_PRESET_TREASURES,
} from './presetData';
import { APP_DEFAULT_ABOUT } from './changelogData';
import { Header } from './components/Header';
import { NotesSection } from './components/NotesSection';
import { DaozhangModal } from './components/DaozhangModal';
import { NoteEditorModal } from './components/NoteEditorModal';
import { AssistantModal } from './components/AssistantModal';
import { SettingsModal } from './components/SettingsModal';
import { WelcomeModal } from './components/WelcomeModal';
import { DailyFortuneModal } from './components/DailyFortuneModal';
import { generateDailyFortune, DailyFortune } from './dailyFortuneData';
import { ToastContainer, ToastMessage } from './components/Toast';
import { SwordMonLoader } from './components/SwordMonLoader';
import { UserCheck, Sparkles } from 'lucide-react';

export default function App() {
  // Application Data States
  const [notes, setNotes] = useState<Note[]>([]);
  const [neibanRecords, setNeibanRecords] = useState<NeibanRecord[]>([]);
  const [daozhangRecords, setDaozhangRecords] = useState<DaozhangRecord[]>([]);
  const [treasures, setTreasures] = useState<TreasureItem[]>([]);
  const [config, setConfig] = useState<BenwanConfig>({
    confirmDelete: true,
    theme: 'system',
    about: APP_DEFAULT_ABOUT,
    honmaruName: '大和',
    saniwaName: '审神者',
    hasInitializedProfile: false,
  });
  const [assistant, setAssistant] = useState<Assistant>({
    name: '加州清光',
    school: '打刀',
  });

  // Modal Visibility States
  const [isDaozhangOpen, setIsDaozhangOpen] = useState(false);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [activeNoteForEdit, setActiveNoteForEdit] = useState<Note | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isFortuneModalOpen, setIsFortuneModalOpen] = useState(false);
  const [dailyFortune, setDailyFortune] = useState<DailyFortune>(() =>
    generateDailyFortune('加州清光', '打刀')
  );

  // Ceremonial Sword Mon Loading state (App startup and large data imports)
  const [isAppInitializing, setIsAppInitializing] = useState(true);
  const [dataSwitchingMessage, setDataSwitchingMessage] = useState<string | null>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  };

  // Helper to migrate old records if needed (e.g. if school was "三条 / 太刀")
  const migrateDaozhangRecords = (rawList: any[]): DaozhangRecord[] => {
    return rawList.map((r, idx) => {
      let number = r.number || `No.${String(idx + 1).padStart(3, '0')}`;
      let swordType = r.swordType || '打刀';
      let school = r.school || '';

      // If user had "三条 / 太刀" in school field from previous HTML
      if (school.includes('/')) {
        const parts = school.split('/').map((s: string) => s.trim());
        school = parts[0] || '';
        if (parts[1]) {
          const matchedType = COMMON_SWORD_TYPES.find((t) => parts[1].includes(t));
          swordType = matchedType || parts[1];
        }
      }

      return {
        id: r.id || `dz-${Date.now()}-${idx}`,
        number,
        name: r.name || '无名刀刃',
        swordType,
        school,
        date: r.date || new Date().toISOString().split('T')[0],
        notes: r.notes || '',
        favorite: !!r.favorite,
        bondLevel: typeof r.bondLevel === 'number' ? Math.max(1, Math.min(5, r.bondLevel)) : 1,
        memoEntries: Array.isArray(r.memoEntries) ? r.memoEntries : [],
      };
    });
  };

  // Helper to ensure NeibanRecords have progress and status properly set
  const migrateNeibanRecords = (rawList: any[]): NeibanRecord[] => {
    return rawList.map((r, idx) => {
      let progress = typeof r.progress === 'number' ? r.progress : r.done ? 100 : 0;
      let status = r.status || (progress === 100 ? 'completed' : progress === 50 ? 'half' : r.escapeReason ? 'escaped' : 'pending');
      let done = progress === 100;
      return {
        id: r.id || Date.now() + idx,
        date: r.date || new Date().toISOString().split('T')[0],
        name: r.name || '无名刀士',
        type: r.type || '马当番',
        done,
        progress,
        status,
        escapeReason: r.escapeReason || '',
      };
    });
  };

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('benwan_notes');
      if (savedNotes) {
        setNotes(JSON.parse(savedNotes));
      } else {
        setNotes(INITIAL_NOTES);
      }

      const savedNeiban = localStorage.getItem('benwan_neiban_records');
      if (savedNeiban) {
        const parsed = JSON.parse(savedNeiban);
        // Clean up preset demo neiban: filter out initial demo records (ids: 1727251200001 ~ 1727251200005)
        // while strictly keeping any records entered by the user
        const presetNeibanIds = new Set(CLASSIC_PRESET_NEIBAN.map((n) => n.id));
        const filteredNeiban = migrateNeibanRecords(parsed).filter((r) => !presetNeibanIds.has(r.id));
        setNeibanRecords(filteredNeiban);
        localStorage.setItem('benwan_neiban_records', JSON.stringify(filteredNeiban));
      } else {
        setNeibanRecords(INITIAL_NEIBAN); // Empty array
      }

      const savedDaozhang = localStorage.getItem('benwan_daozhang');
      if (savedDaozhang) {
        const parsed = JSON.parse(savedDaozhang);
        // Clean up preset swords: remove any swords that belong to the initial demo set (ids in CLASSIC_PRESET_SWORDS)
        // while strictly keeping all swords created by the user (custom IDs like 'dz-17...').
        const classicPresetIds = new Set(CLASSIC_PRESET_SWORDS.map((s) => s.id));
        const filtered = migrateDaozhangRecords(parsed).filter(
          (r) =>
            !classicPresetIds.has(r.id) &&
            !r.number.toLowerCase().includes('0111') &&
            !(r.name.includes('古备前') || (r.school === '古备前' && r.number.includes('0111')))
        );
        setDaozhangRecords(filtered);
        localStorage.setItem('benwan_daozhang', JSON.stringify(filtered));
      } else {
        setDaozhangRecords(INITIAL_PRESET_SWORDS); // Empty array
      }

      // Load treasures from localStorage
      const savedTreasures = localStorage.getItem('benwan_treasures');
      if (savedTreasures) {
        try {
          const parsedTreasures = JSON.parse(savedTreasures);
          if (Array.isArray(parsedTreasures)) {
            setTreasures(parsedTreasures);
          }
        } catch {
          setTreasures(INITIAL_PRESET_TREASURES);
        }
      } else {
        setTreasures(INITIAL_PRESET_TREASURES);
      }

      const savedConfig = localStorage.getItem('benwan_config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        // If the saved about text was still the old system default, update it to the new title
        if (
          !parsed.about ||
          parsed.about.includes('本丸便笺') ||
          parsed.about.includes('本丸便笺 2.0') ||
          parsed.about.includes('审神者自制记事本')
        ) {
          parsed.about = APP_DEFAULT_ABOUT;
        }
        setConfig((prev) => ({ ...prev, ...parsed }));
        if (!parsed.hasInitializedProfile) {
          setIsWelcomeModalOpen(true);
        }
      } else {
        // First visit: show welcome modal to let user register Saniwa and Honmaru name
        setIsWelcomeModalOpen(true);
      }

      const savedAsst = localStorage.getItem('benwan_asst');
      let currentAsstName = '加州清光';
      let currentAsstSchool = '打刀';
      if (savedAsst) {
        const parsedAsst = JSON.parse(savedAsst);
        setAssistant(parsedAsst);
        currentAsstName = parsedAsst.name || '加州清光';
        currentAsstSchool = parsedAsst.school || '打刀';
      }

      // Generate fortune based on current assistant
      const initialFortune = generateDailyFortune(currentAsstName, currentAsstSchool);
      setDailyFortune(initialFortune);

      // If user has already finished welcome profile, automatically pop up daily fortune upon opening
      const todayStr = new Date().toISOString().split('T')[0];
      const hasViewedFortuneToday = sessionStorage.getItem(`benwan_viewed_fortune_${todayStr}`);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.hasInitializedProfile && !hasViewedFortuneToday) {
          setIsFortuneModalOpen(true);
          sessionStorage.setItem(`benwan_viewed_fortune_${todayStr}`, 'true');
        }
      }
    } catch (e) {
      console.error('Failed to load local data', e);
    } finally {
      // Smooth ceremonial entrance transition
      setTimeout(() => {
        setIsAppInitializing(false);
      }, 700);
    }
  }, []);

  // Sync theme and color theme with body/HTML
  useEffect(() => {
    const applyTheme = (theme: 'light' | 'dark' | 'system', colorTheme?: ColorTheme) => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'system') {
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }

      // Apply chosen seasonal color theme (default to 'sakura')
      const chosenColor = colorTheme || 'sakura';
      document.documentElement.setAttribute('data-color-theme', chosenColor);
    };

    applyTheme(config.theme, config.colorTheme);

    if (config.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [config.theme, config.colorTheme]);

  // Save changes to localStorage
  const saveNotesToStorage = (updated: Note[]) => {
    setNotes(updated);
    try {
      localStorage.setItem('benwan_notes', JSON.stringify(updated));
    } catch (e) {
      showToast('存储空间可能不足，保存失败', 'warning');
    }
  };

  const saveNeibanToStorage = (updated: NeibanRecord[]) => {
    setNeibanRecords(updated);
    try {
      localStorage.setItem('benwan_neiban_records', JSON.stringify(updated));
    } catch (e) {
      showToast('存储空间不足', 'warning');
    }
  };

  const saveDaozhangToStorage = (updated: DaozhangRecord[]) => {
    setDaozhangRecords(updated);
    try {
      localStorage.setItem('benwan_daozhang', JSON.stringify(updated));
    } catch (e) {
      showToast('存储空间不足', 'warning');
    }
  };

  const saveTreasuresToStorage = (updated: TreasureItem[]) => {
    setTreasures(updated);
    try {
      localStorage.setItem('benwan_treasures', JSON.stringify(updated));
    } catch (e) {
      showToast('浏览器本地存储空间可能不足，宝物图片未能完全持久化', 'warning');
    }
  };

  const handleSaveTreasure = (item: TreasureItem) => {
    const existingIndex = treasures.findIndex((t) => t.id === item.id);
    let updated: TreasureItem[];
    if (existingIndex >= 0) {
      updated = [...treasures];
      updated[existingIndex] = item;
    } else {
      updated = [item, ...treasures];
    }
    saveTreasuresToStorage(updated);
  };

  const handleDeleteTreasure = (id: string) => {
    const updated = treasures.filter((t) => t.id !== id);
    saveTreasuresToStorage(updated);
  };

  const handleUpdateConfig = (newConfig: Partial<BenwanConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...newConfig };
      localStorage.setItem('benwan_config', JSON.stringify(next));
      return next;
    });
  };

  const handleSaveAssistant = (newAsst: Assistant) => {
    setAssistant(newAsst);
    localStorage.setItem('benwan_asst', JSON.stringify(newAsst));
    // Immediately regenerate daily fortune in the voice of the new assistant
    const updatedFortune = generateDailyFortune(newAsst.name, newAsst.school);
    setDailyFortune(updatedFortune);
  };

  const handleRefreshFortune = () => {
    // Generate a fresh quote/fortune for the current assistant
    const refreshed = generateDailyFortune(
      assistant.name || '加州清光',
      assistant.school || '打刀',
      new Date(Date.now() + Math.floor(Math.random() * 100000))
    );
    setDailyFortune(refreshed);
    showToast(`近侍【${assistant.name}】已重新摇取今日签相`);
  };

  // Note actions
  const handleOpenNoteForEdit = (note: Note) => {
    setActiveNoteForEdit(note);
    setIsNoteEditorOpen(true);
  };

  const handleOpenNewNote = () => {
    setActiveNoteForEdit(null);
    setIsNoteEditorOpen(true);
  };

  const handleSaveNote = (
    noteData: { content: string; tag: string; date?: string },
    isNew: boolean
  ) => {
    const now = new Date();
    const formattedDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(
      2,
      '0'
    )}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(
      2,
      '0'
    )}:${String(now.getMinutes()).padStart(2, '0')}`;

    if (isNew) {
      const newNote: Note = {
        id: `note-${Date.now()}`,
        content: noteData.content,
        tag: noteData.tag,
        date: formattedDate,
      };
      saveNotesToStorage([newNote, ...notes]);
      showToast('新奏帖已封缄保存');
    } else if (activeNoteForEdit) {
      const updatedNotes = notes.map((n) =>
        n.id === activeNoteForEdit.id
          ? {
              ...n,
              content: noteData.content,
              tag: noteData.tag,
              date: n.content === noteData.content && n.tag === noteData.tag ? n.date : formattedDate,
            }
          : n
      );
      saveNotesToStorage(updatedNotes);
      showToast('奏帖已更新');
    }
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotesToStorage(updated);
    showToast('奏帖已坚决销毁');
  };

  // Neiban actions
  const handleAddNeiban = (rec: Omit<NeibanRecord, 'id'>) => {
    const progress = typeof rec.progress === 'number' ? rec.progress : rec.done ? 100 : 0;
    const status = rec.status || (progress === 100 ? 'completed' : progress === 50 ? 'half' : rec.escapeReason ? 'escaped' : 'pending');
    const newRecord: NeibanRecord = {
      id: Date.now(),
      ...rec,
      progress,
      status,
      done: progress === 100,
    };
    saveNeibanToStorage([newRecord, ...neibanRecords]);
  };

  const handleToggleNeiban = (id: number, targetProgress?: number) => {
    const updated = neibanRecords.map((r) => {
      if (r.id !== id) return r;
      let nextProgress: number;
      if (typeof targetProgress === 'number') {
        nextProgress = targetProgress;
      } else {
        // Cycle: 0% -> 50% -> 100% -> 0%
        const current = typeof r.progress === 'number' ? r.progress : r.done ? 100 : 0;
        if (current === 0) nextProgress = 50;
        else if (current === 50) nextProgress = 100;
        else nextProgress = 0;
      }
      const status: NeibanStatus =
        nextProgress === 100 ? 'completed' : nextProgress === 50 ? 'half' : r.status === 'escaped' ? 'escaped' : 'pending';
      return {
        ...r,
        progress: nextProgress,
        status,
        done: nextProgress === 100,
      };
    });
    saveNeibanToStorage(updated);
  };

  const handleUpdateNeibanStatus = (id: number, status: NeibanStatus, escapeReason?: string) => {
    const updated = neibanRecords.map((r) => {
      if (r.id !== id) return r;
      let progress = r.progress ?? 0;
      if (status === 'completed') progress = 100;
      else if (status === 'half') progress = 50;
      else if (status === 'escaped') progress = 0;
      return {
        ...r,
        status,
        progress,
        done: progress === 100,
        escapeReason: escapeReason !== undefined ? escapeReason : r.escapeReason,
      };
    });
    saveNeibanToStorage(updated);
    showToast(status === 'escaped' ? '已记录该刃逃番逸闻！' : '当番状态已更新');
  };

  const handleDeleteNeiban = (id: number) => {
    const updated = neibanRecords.filter((r) => r.id !== id);
    saveNeibanToStorage(updated);
    showToast('已移除当值记录');
  };

  // Daozhang actions
  const handleSaveDaozhang = (record: DaozhangRecord, isNew: boolean) => {
    if (isNew) {
      saveDaozhangToStorage([record, ...daozhangRecords]);
    } else {
      const updated = daozhangRecords.map((r) => (r.id === record.id ? record : r));
      saveDaozhangToStorage(updated);
    }
  };

  const handleDeleteDaozhang = (id: string) => {
    const updated = daozhangRecords.filter((r) => r.id !== id);
    saveDaozhangToStorage(updated);
  };

  // One-click load preset swords (classic Touken Ranbu swords)
  const handleLoadPresetSwords = () => {
    setDataSwitchingMessage('正在开卷呈纳典范刀账名录...');
    setTimeout(() => {
      saveDaozhangToStorage(CLASSIC_PRESET_SWORDS);
      setDataSwitchingMessage(null);
      showToast('已成功载入典范刀账 (14振名刃)', 'success');
    }, 550);
  };

  // One-click load preset Neiban roster examples
  const handleLoadPresetNeiban = () => {
    setDataSwitchingMessage('正在排布内番当值典范名册...');
    setTimeout(() => {
      saveNeibanToStorage(CLASSIC_PRESET_NEIBAN);
      setDataSwitchingMessage(null);
      showToast('已成功载入内番当值示例名册', 'success');
    }, 550);
  };

  // Export Data JSON
  const handleExportData = () => {
    const dataToExport = {
      notes,
      neibanRecords,
      daozhangRecords,
      treasures,
      config,
      assistant,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `本丸卷宗备份_${dateStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('本丸卷宗已顺利导出');
  };

  // Import Data JSON
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDataSwitchingMessage('正在检视并归拢本丸历史卷宗...');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setTimeout(() => {
          if (imported.notes && Array.isArray(imported.notes)) {
            saveNotesToStorage(imported.notes);
          }
          if (imported.neibanRecords && Array.isArray(imported.neibanRecords)) {
            saveNeibanToStorage(imported.neibanRecords);
          }
          if (imported.daozhangRecords && Array.isArray(imported.daozhangRecords)) {
            saveDaozhangToStorage(migrateDaozhangRecords(imported.daozhangRecords));
          }
          if (imported.treasures && Array.isArray(imported.treasures)) {
            saveTreasuresToStorage(imported.treasures);
          }
          if (imported.config) {
            handleUpdateConfig(imported.config);
          }
          if (imported.assistant) {
            handleSaveAssistant(imported.assistant);
          }
          setDataSwitchingMessage(null);
          showToast('本丸卷宗导入成功！', 'success');
          setIsSettingsOpen(false);
        }, 600);
      } catch (err) {
        setDataSwitchingMessage(null);
        showToast('导入失败：卷宗文件格式不正确', 'warning');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleToggleTheme = () => {
    const nextTheme = config.theme === 'dark' ? 'light' : 'dark';
    handleUpdateConfig({ theme: nextTheme });
    showToast(`天时流转：已切换为${nextTheme === 'dark' ? '夜阑 (暗色)' : '白昼 (亮色)'}`);
  };

  const handleConfirmWelcome = (saniwaName: string, honmaruName: string) => {
    handleUpdateConfig({
      saniwaName,
      honmaruName,
      hasInitializedProfile: true,
    });
    setIsWelcomeModalOpen(false);
    showToast(`恭迎【${saniwaName}】主殿！正式入驻【${honmaruName}_本丸】`, 'success');

    // Pop up today's daily fortune right after welcome
    setTimeout(() => {
      setIsFortuneModalOpen(true);
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col relative selection:bg-[var(--sakura-pink)] selection:text-[var(--text-color)]">
      <ToastContainer toasts={toasts} />

      {/* Ceremonial Startup Sword Mon Loading Stage */}
      {isAppInitializing && (
        <SwordMonLoader
          size="fullscreen"
          text={`${config.honmaruName || '本丸'}手札·敬启`}
          subtext="跨越千年流光 · 审神者就任记录册展开中..."
        />
      )}

      {/* Ceremonial Data Switching Overlay */}
      {dataSwitchingMessage && (
        <SwordMonLoader
          size="fullscreen"
          text={dataSwitchingMessage}
          subtext="卷宗调阅中 · 请稍候..."
        />
      )}

      {/* Top Header */}
      <Header
        honmaruName={config.honmaruName || '大和'}
        saniwaName={config.saniwaName || '审神者'}
        onOpenNewNote={handleOpenNewNote}
        onOpenDaozhang={() => setIsDaozhangOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenFortune={() => setIsFortuneModalOpen(true)}
        onEditProfile={() => setIsWelcomeModalOpen(true)}
        daozhangCount={daozhangRecords.length}
        theme={config.theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Notes, Neiban, and Divination Area */}
      <main className="flex-1 flex flex-col pb-20">
        <NotesSection
          notes={notes}
          neibanRecords={neibanRecords}
          daozhangRecords={daozhangRecords}
          honmaruName={config.honmaruName || '大和'}
          saniwaName={config.saniwaName || '主殿'}
          onOpenNote={handleOpenNoteForEdit}
          onAddNeiban={handleAddNeiban}
          onToggleNeiban={handleToggleNeiban}
          onUpdateNeibanStatus={handleUpdateNeibanStatus}
          onDeleteNeiban={handleDeleteNeiban}
          onLoadPresetNeiban={handleLoadPresetNeiban}
          showToast={showToast}
        />
      </main>

      {/* Bottom Assistant Widget (Click to designate secretary or view today's fortune) */}
      <div className="fixed bottom-4 left-4 z-20 flex items-center gap-2">
        <div
          onClick={() => setIsAssistantOpen(true)}
          title="点击任命近侍或查看今日签文"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--panel-color)] border border-[var(--sakura-pink)] shadow-md hover:scale-105 transition-all cursor-pointer group"
        >
          <div className="w-6 h-6 rounded-full bg-[var(--sakura-soft)] flex items-center justify-center text-[var(--sakura-deep)] group-hover:bg-[var(--sakura-pink)] transition-colors">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            {assistant.school && (
              <span className="text-[10px] text-[var(--text-muted)]">
                [{assistant.school}]
              </span>
            )}
            <span className="font-bold font-serif text-[var(--sakura-deep)]">
              {assistant.name || '设置近侍'}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] tracking-wider">
              参上
            </span>
          </div>
        </div>

        {/* Quick Fortune Button right beside assistant badge */}
        <button
          onClick={() => setIsFortuneModalOpen(true)}
          title="聆听近侍今日签文与谏言"
          className="w-8 h-8 rounded-full bg-[var(--panel-color)] border border-[var(--sakura-pink)] shadow-md hover:scale-110 text-xs font-serif font-bold text-[var(--header-red)] hover:bg-[var(--sakura-soft)] transition-all cursor-pointer flex items-center justify-center shrink-0"
        >
          <span className="text-xs leading-none">签</span>
        </button>
      </div>

      {/* Modals */}
      <DaozhangModal
        isOpen={isDaozhangOpen}
        onClose={() => setIsDaozhangOpen(false)}
        records={daozhangRecords}
        treasures={treasures}
        onSaveRecord={handleSaveDaozhang}
        onDeleteRecord={handleDeleteDaozhang}
        onSaveTreasure={handleSaveTreasure}
        onDeleteTreasure={handleDeleteTreasure}
        onLoadPresetSwords={handleLoadPresetSwords}
        onDesignateAssistant={(name, school) => {
          handleSaveAssistant({ name, school });
        }}
        showToast={showToast}
      />

      <NoteEditorModal
        isOpen={isNoteEditorOpen}
        onClose={() => setIsNoteEditorOpen(false)}
        note={activeNoteForEdit}
        onSaveNote={handleSaveNote}
        onDeleteNote={handleDeleteNote}
        confirmDelete={config.confirmDelete}
        showToast={showToast}
      />

      <AssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        assistant={assistant}
        daozhangRecords={daozhangRecords}
        onSaveAssistant={handleSaveAssistant}
        onOpenFortune={() => setIsFortuneModalOpen(true)}
        onOpenDaozhang={() => setIsDaozhangOpen(true)}
        showToast={showToast}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onLoadPresetSwords={handleLoadPresetSwords}
        onLoadPresetNeiban={handleLoadPresetNeiban}
        showToast={showToast}
      />

      <WelcomeModal
        isOpen={isWelcomeModalOpen}
        initialSaniwaName={config.saniwaName || ''}
        initialHonmaruName={config.honmaruName || ''}
        onConfirm={handleConfirmWelcome}
      />

      <DailyFortuneModal
        isOpen={isFortuneModalOpen}
        onClose={() => setIsFortuneModalOpen(false)}
        fortune={dailyFortune}
        onRefreshQuote={handleRefreshFortune}
        honmaruName={config.honmaruName || '大和'}
      />
    </div>
  );
}
