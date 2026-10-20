import React, { useState, useEffect } from 'react';
import {
  Note,
  NeibanRecord,
  NeibanStatus,
  DaozhangRecord,
  TreasureItem,
  WeeklyPlannerData,
  BenwanConfig,
  Assistant,
  ExpeditionRecord,
  ForgeRecord,
  DismantleRecord,
  COMMON_SWORD_TYPES,
  SwordType,
  ColorTheme,
  ForgeRecipe,
  WordCard,
} from './types';
import {
  INITIAL_NOTES,
  INITIAL_NEIBAN,
  INITIAL_PRESET_SWORDS,
  CLASSIC_PRESET_SWORDS,
  CLASSIC_PRESET_NEIBAN,
  INITIAL_PRESET_TREASURES,
  INITIAL_WEEKLY_PLANNER,
  INITIAL_EXPEDITIONS,
  INITIAL_FORGE_RECORDS,
  INITIAL_DISMANTLE_RECORDS,
  INITIAL_FORGE_RECIPES,
  REFERENCE_FORGE_RECIPES,
} from './presetData';
import { DEFAULT_WORD_CARDS } from './wordCardData';
import { APP_DEFAULT_ABOUT } from './changelogData';
import { Header } from './components/Header';
import { NotesSection } from './components/NotesSection';
import { WeeklyPlanner } from './components/WeeklyPlanner';
import { DaozhangModal } from './components/DaozhangModal';
import { NoteEditorModal } from './components/NoteEditorModal';
import { AssistantModal } from './components/AssistantModal';
import { SettingsModal } from './components/SettingsModal';
import { WelcomeModal } from './components/WelcomeModal';
import { DailyFortuneModal } from './components/DailyFortuneModal';
import { AttendantBubble } from './components/AttendantBubble';
import { WordCardModal } from './components/WordCardModal';
import { generateDailyFortune, DailyFortune } from './dailyFortuneData';
import { ToastContainer, ToastMessage } from './components/Toast';
import { SwordMonLoader } from './components/SwordMonLoader';
import { SceneryOverlay } from './components/SceneryOverlay';
import { soundManager } from './utils/soundManager';
import { UserCheck, Sparkles, MessageSquare } from 'lucide-react';

export default function App() {
  // Application Data States
  const [notes, setNotes] = useState<Note[]>([]);
  const [neibanRecords, setNeibanRecords] = useState<NeibanRecord[]>([]);
  const [daozhangRecords, setDaozhangRecords] = useState<DaozhangRecord[]>([]);
  const [treasures, setTreasures] = useState<TreasureItem[]>([]);
  const [expeditions, setExpeditions] = useState<ExpeditionRecord[]>([]);
  const [forgeRecords, setForgeRecords] = useState<ForgeRecord[]>([]);
  const [dismantleRecords, setDismantleRecords] = useState<DismantleRecord[]>([]);
  const [forgeRecipes, setForgeRecipes] = useState<ForgeRecipe[]>(INITIAL_FORGE_RECIPES);
  const [weeklyPlanner, setWeeklyPlanner] = useState<WeeklyPlannerData>(INITIAL_WEEKLY_PLANNER);
  const [activeMainView, setActiveMainView] = useState<'notes' | 'planner'>('notes');
  const [config, setConfig] = useState<BenwanConfig>({
    confirmDelete: true,
    theme: 'system',
    about: APP_DEFAULT_ABOUT,
    honmaruName: '大和',
    saniwaName: '审神者',
    hasInitializedProfile: false,
    scenery: 'sakura',
    audioEnabled: false,
    ambientSoundType: 'windbell',
    bubbleEnabled: true,
    bubbleInterval: 60,
    bubbleDuration: 14,
  });
  const [assistant, setAssistant] = useState<Assistant>({
    name: '加州清光',
    school: '打刀',
  });

  // Word Cards & Attendant Bubble States
  const [wordCards, setWordCards] = useState<WordCard[]>(DEFAULT_WORD_CARDS);
  const [isWordCardModalOpen, setIsWordCardModalOpen] = useState(false);
  const [isBubbleVisible, setIsBubbleVisible] = useState(false);
  const [activeBubbleCard, setActiveBubbleCard] = useState<WordCard | null>(null);

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
        level: r.level !== undefined ? r.level : 1,
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

      // Load weekly planner from localStorage
      const savedPlanner = localStorage.getItem('benwan_planner');
      if (savedPlanner) {
        try {
          const parsedPlanner = JSON.parse(savedPlanner);
          // 确保按周独立保存的 weeks 结构健全，并将根层级历史数据平滑迁入当前周
          if (!parsedPlanner.weeks || typeof parsedPlanner.weeks !== 'object') {
            const currentKey = `${parsedPlanner.year || 2026}-M${parsedPlanner.monthIndex || 10}-W${parsedPlanner.weekIndex || 1}`;
            parsedPlanner.weeks = {
              [currentKey]: {
                goalMemo: parsedPlanner.goalMemo || '',
                days: parsedPlanner.days || {},
                todoStickyNotes: parsedPlanner.todoStickyNotes || '',
              },
            };
          }
          setWeeklyPlanner(parsedPlanner);
        } catch {
          setWeeklyPlanner(INITIAL_WEEKLY_PLANNER);
        }
      } else {
        setWeeklyPlanner(INITIAL_WEEKLY_PLANNER);
      }

      // Load expedition records from localStorage
      const savedExpeditions = localStorage.getItem('benwan_expeditions');
      if (savedExpeditions) {
        try {
          const parsedExp = JSON.parse(savedExpeditions);
          if (Array.isArray(parsedExp)) {
            setExpeditions(parsedExp);
          } else {
            setExpeditions(INITIAL_EXPEDITIONS);
          }
        } catch {
          setExpeditions(INITIAL_EXPEDITIONS);
        }
      } else {
        setExpeditions(INITIAL_EXPEDITIONS);
      }

      // Load forge records from localStorage (Default: empty [] "无收录" state)
      const savedForges = localStorage.getItem('benwan_forges');
      if (savedForges) {
        try {
          const parsedForges = JSON.parse(savedForges);
          if (Array.isArray(parsedForges)) {
            setForgeRecords(parsedForges);
          } else {
            setForgeRecords([]);
          }
        } catch {
          setForgeRecords([]);
        }
      } else {
        // 初始为无收录干净状态，审神者可自行记录或点击“载入流水范本”
        setForgeRecords([]);
      }

      // Load dismantle records from localStorage
      const savedDismantles = localStorage.getItem('benwan_dismantles');
      if (savedDismantles) {
        try {
          const parsedDismantles = JSON.parse(savedDismantles);
          if (Array.isArray(parsedDismantles)) {
            setDismantleRecords(parsedDismantles);
          } else {
            setDismantleRecords(INITIAL_DISMANTLE_RECORDS);
          }
        } catch {
          setDismantleRecords(INITIAL_DISMANTLE_RECORDS);
        }
      } else {
        setDismantleRecords(INITIAL_DISMANTLE_RECORDS);
      }

      // Load custom forge recipes from localStorage (Default: empty [] "无收录")
      const savedRecipes = localStorage.getItem('benwan_forge_recipes');
      if (savedRecipes) {
        try {
          const parsedRecipes = JSON.parse(savedRecipes);
          if (Array.isArray(parsedRecipes)) {
            setForgeRecipes(parsedRecipes);
          } else {
            setForgeRecipes(INITIAL_FORGE_RECIPES);
          }
        } catch {
          setForgeRecipes(INITIAL_FORGE_RECIPES);
        }
      } else {
        setForgeRecipes(INITIAL_FORGE_RECIPES);
      }

      // Load word cards from localStorage
      const savedWordCards = localStorage.getItem('benwan_word_cards');
      if (savedWordCards) {
        try {
          const parsedCards = JSON.parse(savedWordCards);
          if (Array.isArray(parsedCards) && parsedCards.length > 0) {
            setWordCards(parsedCards);
          } else {
            setWordCards(DEFAULT_WORD_CARDS);
          }
        } catch {
          setWordCards(DEFAULT_WORD_CARDS);
        }
      } else {
        setWordCards(DEFAULT_WORD_CARDS);
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

  // Expedition Battle Reports handlers
  const saveExpeditionsToStorage = (updated: ExpeditionRecord[]) => {
    setExpeditions(updated);
    localStorage.setItem('benwan_expeditions', JSON.stringify(updated));
  };

  const handleAddExpedition = (record: Omit<ExpeditionRecord, 'id'>) => {
    const newEntry: ExpeditionRecord = {
      id: `exp-${Date.now()}`,
      ...record,
    };
    const updated = [newEntry, ...expeditions];
    saveExpeditionsToStorage(updated);
  };

  const handleUpdateExpedition = (record: ExpeditionRecord) => {
    const updated = expeditions.map((e) => (e.id === record.id ? record : e));
    saveExpeditionsToStorage(updated);
  };

  const handleDeleteExpedition = (id: string) => {
    const updated = expeditions.filter((e) => e.id !== id);
    saveExpeditionsToStorage(updated);
    showToast('已移除该卷远征战报');
  };

  const handleLoadPresetExpeditions = () => {
    setDataSwitchingMessage('正在开卷呈纳典范远征战报...');
    setTimeout(() => {
      saveExpeditionsToStorage(INITIAL_EXPEDITIONS);
      setDataSwitchingMessage(null);
      showToast('已成功载入典范远征战报范本', 'success');
    }, 550);
  };

  // Forge & Dismantle handlers
  const saveForgesToStorage = (updated: ForgeRecord[]) => {
    setForgeRecords(updated);
    localStorage.setItem('benwan_forges', JSON.stringify(updated));
  };

  const saveDismantlesToStorage = (updated: DismantleRecord[]) => {
    setDismantleRecords(updated);
    localStorage.setItem('benwan_dismantles', JSON.stringify(updated));
  };

  const handleAddForge = (record: Omit<ForgeRecord, 'id'>) => {
    const newEntry: ForgeRecord = {
      id: `forge-${Date.now()}`,
      ...record,
    };
    const updatedForges = [newEntry, ...forgeRecords];
    saveForgesToStorage(updatedForges);

    // 联合互动：刀账同名刃保有数量 +1
    const trimmedName = record.swordName.trim();
    const existingIndex = daozhangRecords.findIndex((r) => r.name === trimmedName);

    if (existingIndex >= 0) {
      const current = daozhangRecords[existingIndex];
      const newCount = (current.count !== undefined ? current.count : 1) + 1;
      const newForgeCount = (current.forgeCount || 1) + 1;
      const updatedSword: DaozhangRecord = {
        ...current,
        count: newCount,
        forgeCount: newForgeCount,
      };
      const updatedDaozhang = [...daozhangRecords];
      updatedDaozhang[existingIndex] = updatedSword;
      saveDaozhangToStorage(updatedDaozhang);
      showToast(`🔥 炉火盛放！【${trimmedName}】顺利显现，本丸在库增至 ${newCount} 振！`, 'success');
    } else {
      // 刀账尚无此刃：自动登用录入刀账！
      const matchClassic = CLASSIC_PRESET_SWORDS.find((s) => s.name === trimmedName);
      const newSword: DaozhangRecord = {
        id: `dz-${Date.now()}`,
        number: matchClassic?.number || `No.${String(daozhangRecords.length + 1).padStart(3, '0')}`,
        name: trimmedName,
        swordType: record.swordType || matchClassic?.swordType || '打刀',
        school: matchClassic?.school || '本丸',
        date: record.date || new Date().toISOString().split('T')[0],
        notes: matchClassic?.notes || `于 ${record.date} 执炉锻造初次显现（耗资：木${record.charcoal}/钢${record.steel}/水${record.coolant}/石${record.whetstone}）。`,
        count: 1,
        forgeCount: 1,
        dismantleCount: 0,
        level: 1,
        bondLevel: 1,
      };
      saveDaozhangToStorage([newSword, ...daozhangRecords]);
      showToast(`🎉 新刃显现！【${trimmedName}】已正式登用录入本丸刀账典籍！`, 'success');
    }
  };

  const handleDeleteForge = (id: string) => {
    const updated = forgeRecords.filter((f) => f.id !== id);
    saveForgesToStorage(updated);
    showToast('已移除该条锻刀流水');
  };

  const handleAddDismantle = (record: Omit<DismantleRecord, 'id'>) => {
    const newEntry: DismantleRecord = {
      id: `dismantle-${Date.now()}`,
      ...record,
    };
    const updatedDismantles = [newEntry, ...dismantleRecords];
    saveDismantlesToStorage(updatedDismantles);

    // 联合互动：刀账对应刀剑男士保有振数扣减
    const trimmedName = record.swordName.trim();
    const existingIndex = daozhangRecords.findIndex((r) => r.name === trimmedName);

    if (existingIndex >= 0) {
      const current = daozhangRecords[existingIndex];
      const oldCount = current.count !== undefined ? current.count : 1;
      const newCount = Math.max(0, oldCount - (record.count || 1));
      const newDismantleCount = (current.dismantleCount || 0) + (record.count || 1);
      const updatedSword: DaozhangRecord = {
        ...current,
        count: newCount,
        dismantleCount: newDismantleCount,
      };
      const updatedDaozhang = [...daozhangRecords];
      updatedDaozhang[existingIndex] = updatedSword;
      saveDaozhangToStorage(updatedDaozhang);
      showToast(`✂️ 已刀解【${trimmedName}】${record.count}振，回收精纯资材！在库现余 ${newCount} 振`, 'success');
    } else {
      showToast(`✂️ 已记录刀解【${trimmedName}】${record.count}振，资材已纳库！`, 'success');
    }
  };

  const handleDeleteDismantle = (id: string) => {
    const target = dismantleRecords.find((d) => d.id === id);
    const updated = dismantleRecords.filter((d) => d.id !== id);
    saveDismantlesToStorage(updated);

    // 撤销刀解，返还振数至刀账
    if (target) {
      const trimmedName = target.swordName.trim();
      const existingIndex = daozhangRecords.findIndex((r) => r.name === trimmedName);
      if (existingIndex >= 0) {
        const current = daozhangRecords[existingIndex];
        const updatedSword: DaozhangRecord = {
          ...current,
          count: (current.count !== undefined ? current.count : 1) + (target.count || 1),
          dismantleCount: Math.max(0, (current.dismantleCount || 0) - (target.count || 1)),
        };
        const updatedDaozhang = [...daozhangRecords];
        updatedDaozhang[existingIndex] = updatedSword;
        saveDaozhangToStorage(updatedDaozhang);
      }
    }
    showToast('已撤销该条刀解记录，对应刃数已恢复刀账保有量');
  };

  const handleLoadPresetForges = () => {
    setDataSwitchingMessage('正在开卷呈纳典范锻刀流水...');
    setTimeout(() => {
      saveForgesToStorage(INITIAL_FORGE_RECORDS);
      setDataSwitchingMessage(null);
      showToast('已成功载入典范锻刀流水', 'success');
    }, 550);
  };

  const handleLoadPresetDismantles = () => {
    setDataSwitchingMessage('正在开卷呈纳典范刀解记录...');
    setTimeout(() => {
      saveDismantlesToStorage(INITIAL_DISMANTLE_RECORDS);
      setDataSwitchingMessage(null);
      showToast('已成功载入典范刀解记录', 'success');
    }, 550);
  };

  const handleClearForges = () => {
    saveForgesToStorage([]);
    console.log('localStorage benwan_forges:', localStorage.getItem('benwan_forges'));
  };

  // Forge Custom Recipes Handlers
  const saveForgeRecipesToStorage = (updated: ForgeRecipe[]) => {
    setForgeRecipes(updated);
    localStorage.setItem('benwan_forge_recipes', JSON.stringify(updated));
  };

  const handleAddForgeRecipe = (recipe: Omit<ForgeRecipe, 'id'>) => {
    const newEntry: ForgeRecipe = {
      id: `recipe-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...recipe,
    };
    const updated = [newEntry, ...forgeRecipes];
    saveForgeRecipesToStorage(updated);
  };

  const handleUpdateForgeRecipe = (recipe: ForgeRecipe) => {
    const updated = forgeRecipes.map((r) => (r.id === recipe.id ? recipe : r));
    saveForgeRecipesToStorage(updated);
  };

  const handleDeleteForgeRecipe = (id: string) => {
    const updated = forgeRecipes.filter((r) => r.id !== id);
    saveForgeRecipesToStorage(updated);
  };

  const handleLoadReferenceRecipes = () => {
    const existingNames = new Set(forgeRecipes.map((r) => r.name));
    const toAdd = REFERENCE_FORGE_RECIPES.filter((ref) => !existingNames.has(ref.name));
    const updated = [...forgeRecipes, ...(toAdd.length > 0 ? toAdd : REFERENCE_FORGE_RECIPES)];
    saveForgeRecipesToStorage(updated);
  };

  const handleClearForgeRecipes = () => {
    saveForgeRecipesToStorage([]);
  };

  // Export Data JSON
  const handleExportData = () => {
    const dataToExport = {
      notes,
      neibanRecords,
      daozhangRecords,
      treasures,
      expeditions,
      forgeRecords,
      dismantleRecords,
      forgeRecipes,
      weeklyPlanner,
      wordCards,
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
          if (imported.expeditions && Array.isArray(imported.expeditions)) {
            saveExpeditionsToStorage(imported.expeditions);
          }
          if (imported.forgeRecords && Array.isArray(imported.forgeRecords)) {
            saveForgesToStorage(imported.forgeRecords);
          }
          if (imported.dismantleRecords && Array.isArray(imported.dismantleRecords)) {
            saveDismantlesToStorage(imported.dismantleRecords);
          }
          if (imported.forgeRecipes && Array.isArray(imported.forgeRecipes)) {
            saveForgeRecipesToStorage(imported.forgeRecipes);
          }
          if (imported.weeklyPlanner) {
            saveWeeklyPlannerToStorage(imported.weeklyPlanner);
          }
          if (imported.wordCards && Array.isArray(imported.wordCards)) {
            saveWordCardsToStorage(imported.wordCards);
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

  const saveWeeklyPlannerToStorage = (updated: WeeklyPlannerData) => {
    setWeeklyPlanner(updated);
    localStorage.setItem('benwan_planner', JSON.stringify(updated));
  };

  // Word Cards & Attendant Bubble Handlers
  const saveWordCardsToStorage = (updated: WordCard[]) => {
    setWordCards(updated);
    localStorage.setItem('benwan_word_cards', JSON.stringify(updated));
  };

  const handleDrawNextBubbleCard = () => {
    if (wordCards.length === 0) return;
    let nextCard: WordCard;
    if (wordCards.length > 1 && activeBubbleCard) {
      const candidates = wordCards.filter((c) => c.id !== activeBubbleCard.id);
      nextCard = candidates[Math.floor(Math.random() * candidates.length)] || wordCards[0];
    } else {
      nextCard = wordCards[Math.floor(Math.random() * wordCards.length)];
    }
    setActiveBubbleCard(nextCard);
    setIsBubbleVisible(true);
  };

  const handleUploadWordCards = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            const validCards: WordCard[] = parsed.map((item, idx) => ({
              id: item.id || `card-${Date.now()}-${idx}`,
              text: typeof item === 'string' ? item : item.text || '',
              author: item.author || assistant.name || '近侍',
              category: item.category || '导入',
              createdAt: item.createdAt || new Date().toISOString().split('T')[0],
            })).filter((c) => c.text.length > 0);

            if (validCards.length > 0) {
              const updated = [...validCards, ...wordCards];
              saveWordCardsToStorage(updated);
              showToast(`从 JSON 成功载入 ${validCards.length} 振字卡！`, 'success');
            } else {
              showToast('未能从文件中解析出有效字卡', 'warning');
            }
          }
        } else {
          const lines = text
            .split('\n')
            .map((l) => l.trim())
            .filter((l) => l.length > 0);

          if (lines.length > 0) {
            const newCards: WordCard[] = lines.map((line, idx) => {
              let author = assistant.name || '近侍';
              let content = line;
              const bracketMatch = line.match(/^【(.*?)】\s*(.+)$/);
              if (bracketMatch) {
                author = bracketMatch[1];
                content = bracketMatch[2];
              }
              return {
                id: `card-${Date.now()}-${idx}`,
                text: content,
                author,
                category: '导入',
                createdAt: new Date().toISOString().split('T')[0],
              };
            });
            const updated = [...newCards, ...wordCards];
            saveWordCardsToStorage(updated);
            showToast(`从 TXT 文卷顺利载入 ${newCards.length} 振字卡！`, 'success');
          } else {
            showToast('文本文件内容为空', 'warning');
          }
        }
      } catch (err) {
        showToast('字卡解析失败，请确保格式正确', 'warning');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Periodic Bubble Greetings Timer: pops up every interval seconds
  useEffect(() => {
    if (config.bubbleEnabled === false || wordCards.length === 0) {
      return;
    }

    const intervalSec = Math.max(10, config.bubbleInterval || 60);
    const timer = setInterval(() => {
      handleDrawNextBubbleCard();
    }, intervalSec * 1000);

    return () => clearInterval(timer);
  }, [config.bubbleEnabled, config.bubbleInterval, wordCards, activeBubbleCard]);

  // Auto-dismiss bubble after duration (default 14 seconds)
  useEffect(() => {
    if (!isBubbleVisible) return;
    const duration = (config.bubbleDuration || 14) * 1000;
    const timer = setTimeout(() => {
      setIsBubbleVisible(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [isBubbleVisible, activeBubbleCard, config.bubbleDuration]);

  // Initial welcome bubble after slight delay if enabled
  useEffect(() => {
    const timer = setTimeout(() => {
      if (config.bubbleEnabled !== false && wordCards.length > 0 && !activeBubbleCard) {
        handleDrawNextBubbleCard();
      }
    }, 3800);
    return () => clearTimeout(timer);
  }, []);

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

      {/* Seasonal Honmaru Scenery Overlay (Floating petals, snow, fireflies) */}
      <SceneryOverlay scenery={config.scenery || 'sakura'} />

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
        activeMainView={activeMainView}
        onSelectMainView={(v) => {
          if (config.audioEnabled) soundManager.playInteractionSound('paper', undefined, 'flip');
          setActiveMainView(v);
        }}
        onOpenNewNote={() => {
          if (config.audioEnabled) soundManager.playInteractionSound(config.ambientSoundType, config.customAudioUrl, 'stroke');
          handleOpenNewNote();
        }}
        onOpenDaozhang={() => {
          if (config.audioEnabled) soundManager.playInteractionSound(config.ambientSoundType, config.customAudioUrl, 'flip');
          setIsDaozhangOpen(true);
        }}
        onOpenSettings={() => {
          if (config.audioEnabled) soundManager.playInteractionSound(config.ambientSoundType, config.customAudioUrl, 'click');
          setIsSettingsOpen(true);
        }}
        onOpenFortune={() => {
          if (config.audioEnabled) soundManager.playInteractionSound(config.ambientSoundType, config.customAudioUrl, 'click');
          setIsFortuneModalOpen(true);
        }}
        onEditProfile={() => setIsWelcomeModalOpen(true)}
        daozhangCount={daozhangRecords.length}
        theme={config.theme}
        onToggleTheme={handleToggleTheme}
        audioEnabled={config.audioEnabled || false}
        onToggleAudio={() => {
          const next = !config.audioEnabled;
          handleUpdateConfig({ audioEnabled: next });
          if (next) {
            soundManager.playInteractionSound(config.ambientSoundType, config.customAudioUrl, 'click');
            showToast('回廊风铃已启，点击轻抚皆有灵动清音');
          } else {
            showToast('环境音已归入静寂');
          }
        }}
      />

      {/* Main Area: 奏帖随笔便签 or 周度手札 (Weekly Planner) */}
      <main className="flex-1 flex flex-col pb-20">
        {activeMainView === 'notes' ? (
          <NotesSection
            notes={notes}
            neibanRecords={neibanRecords}
            daozhangRecords={daozhangRecords}
            expeditions={expeditions}
            forgeRecords={forgeRecords}
            dismantleRecords={dismantleRecords}
            forgeRecipes={forgeRecipes}
            dailyFortune={dailyFortune}
            honmaruName={config.honmaruName || '大和'}
            saniwaName={config.saniwaName || '主殿'}
            onOpenNote={handleOpenNoteForEdit}
            onAddNeiban={handleAddNeiban}
            onToggleNeiban={handleToggleNeiban}
            onUpdateNeibanStatus={handleUpdateNeibanStatus}
            onDeleteNeiban={handleDeleteNeiban}
            onLoadPresetNeiban={handleLoadPresetNeiban}
            onAddExpedition={handleAddExpedition}
            onUpdateExpedition={handleUpdateExpedition}
            onDeleteExpedition={handleDeleteExpedition}
            onLoadPresetExpeditions={handleLoadPresetExpeditions}
            onAddForge={handleAddForge}
            onDeleteForge={handleDeleteForge}
            onAddDismantle={handleAddDismantle}
            onDeleteDismantle={handleDeleteDismantle}
            onLoadPresetForges={handleLoadPresetForges}
            onLoadPresetDismantles={handleLoadPresetDismantles}
            onClearForges={handleClearForges}
            onAddForgeRecipe={handleAddForgeRecipe}
            onUpdateForgeRecipe={handleUpdateForgeRecipe}
            onDeleteForgeRecipe={handleDeleteForgeRecipe}
            onLoadReferenceRecipes={handleLoadReferenceRecipes}
            onClearForgeRecipes={handleClearForgeRecipes}
            onOpenDaozhang={() => setIsDaozhangOpen(true)}
            showToast={showToast}
          />
        ) : (
          <WeeklyPlanner
            planner={weeklyPlanner}
            onSavePlanner={saveWeeklyPlannerToStorage}
            showToast={showToast}
            audioEnabled={config.audioEnabled || false}
          />
        )}
      </main>

      {/* Attendant Speech Bubble (Image 1 location: directly above assistant badge) */}
      <AttendantBubble
        card={activeBubbleCard}
        assistant={assistant}
        isVisible={isBubbleVisible}
        onDismiss={() => setIsBubbleVisible(false)}
        onDrawNext={handleDrawNextBubbleCard}
        onOpenSettings={() => setIsWordCardModalOpen(true)}
        audioEnabled={config.audioEnabled || false}
      />

      {/* Bottom Assistant Widget (Click to designate secretary or listen to quotes) */}
      <div className="fixed bottom-4 left-4 z-20 flex items-center gap-2">
        <div
          onClick={() => {
            // Clicking badge triggers a fresh attendant quote bubble
            handleDrawNextBubbleCard();
          }}
          title="点击聆听近侍言叶问候 (长按或点击头像任命近侍)"
          className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[var(--panel-color)] border border-[var(--sakura-pink)] shadow-md hover:scale-105 transition-all cursor-pointer group select-none"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsAssistantOpen(true);
            }}
            title="点击任命或更换近侍"
            className="w-6 h-6 rounded-full bg-[var(--sakura-soft)] flex items-center justify-center text-[var(--sakura-deep)] group-hover:bg-[var(--sakura-pink)] transition-colors hover:scale-110"
          >
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

        {/* Quick Bubble Toggle Button */}
        <button
          onClick={() => {
            if (isBubbleVisible) {
              setIsBubbleVisible(false);
            } else {
              handleDrawNextBubbleCard();
            }
          }}
          title={isBubbleVisible ? '隐去近侍气泡' : '浮现近侍言叶气泡'}
          className={`w-8 h-8 rounded-full bg-[var(--panel-color)] border border-[var(--sakura-pink)] shadow-md hover:scale-110 text-xs font-serif transition-all cursor-pointer flex items-center justify-center shrink-0 ${
            isBubbleVisible
              ? 'bg-[var(--sakura-soft)] text-[var(--sakura-deep)]'
              : 'text-[var(--text-muted)] hover:text-[var(--sakura-deep)]'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
        </button>

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
        forgeRecords={forgeRecords}
        dismantleRecords={dismantleRecords}
        onSaveRecord={handleSaveDaozhang}
        onDeleteRecord={handleDeleteDaozhang}
        onSaveTreasure={handleSaveTreasure}
        onDeleteTreasure={handleDeleteTreasure}
        onLoadPresetSwords={handleLoadPresetSwords}
        onDesignateAssistant={(name, school) => {
          handleSaveAssistant({ name, school });
        }}
        onNavigateToForge={() => {
          setIsDaozhangOpen(false);
          setActiveMainView('notes');
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
        wordCards={wordCards}
        onOpenWordCardModal={() => setIsWordCardModalOpen(true)}
        onUploadWordCards={handleUploadWordCards}
        onTriggerBubbleTest={handleDrawNextBubbleCard}
        showToast={showToast}
      />

      <WordCardModal
        isOpen={isWordCardModalOpen}
        onClose={() => setIsWordCardModalOpen(false)}
        wordCards={wordCards}
        onSaveWordCards={saveWordCardsToStorage}
        config={config}
        onUpdateConfig={handleUpdateConfig}
        assistant={assistant}
        onTriggerBubbleTest={handleDrawNextBubbleCard}
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
        neibanRecords={neibanRecords}
        onRefreshQuote={handleRefreshFortune}
        honmaruName={config.honmaruName || '大和'}
      />
    </div>
  );
}
