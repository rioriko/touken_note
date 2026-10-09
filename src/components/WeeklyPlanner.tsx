import React, { useState, useEffect, useMemo } from 'react';
import { WeeklyPlannerData, WeekdayKey, WeeklyTodoItem, SingleWeekRecord } from '../types';
import {
  Calendar,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Edit3,
  RotateCcw,
  Copy,
  FolderPlus,
} from 'lucide-react';
import { soundManager } from '../utils/soundManager';

interface WeeklyPlannerProps {
  planner: WeeklyPlannerData;
  onSavePlanner: (data: WeeklyPlannerData) => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning') => void;
  audioEnabled?: boolean;
}

// 严谨顺序：周一到周日 (MON -> TUE -> WED -> THU -> FRI -> SAT -> SUN)
const ORDERED_WEEKDAYS: { key: WeekdayKey; en: string; cn: string; short: string }[] = [
  { key: 'mon', en: 'MON', cn: '周一 · 月曜日', short: '周一' },
  { key: 'tue', en: 'TUE', cn: '周二 · 火曜日', short: '周二' },
  { key: 'wed', en: 'WED', cn: '周三 · 水曜日', short: '周三' },
  { key: 'thu', en: 'THU', cn: '周四 · 木曜日', short: '周四' },
  { key: 'fri', en: 'FRI', cn: '周五 · 金曜日', short: '周五' },
  { key: 'sat', en: 'SAT', cn: '周六 · 土曜日', short: '周六' },
  { key: 'sun', en: 'SUN', cn: '周日 · 日曜日', short: '周日' },
];

// Helper to generate unique key per week: "${year}-M${monthIndex}-W${weekIndex}"
export function getWeekKey(year: number, monthIndex: number, weekIndex: number): string {
  return `${year}-M${monthIndex}-W${weekIndex}`;
}

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  planner,
  onSavePlanner,
  showToast,
  audioEnabled = false,
}) => {
  const currentYear = planner.year || 2026;
  const currentMonth = planner.monthIndex || 10;
  const currentWeek = planner.weekIndex || 1;
  const currentWeekKey = getWeekKey(currentYear, currentMonth, currentWeek);

  // 从按周独立存储的 weeks 字典中读取当前周的数据
  const currentWeekRecord: SingleWeekRecord = useMemo(() => {
    if (planner.weeks && planner.weeks[currentWeekKey]) {
      const rec = planner.weeks[currentWeekKey];
      return {
        goalMemo: rec.goalMemo ?? '',
        days: rec.days ?? { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
        todoStickyNotes: rec.todoStickyNotes ?? '',
      };
    }
    // 兼容初始或旧数据根层级字段
    if (
      planner.days &&
      Object.keys(planner.days).length > 0 &&
      planner.year === currentYear &&
      planner.monthIndex === currentMonth &&
      planner.weekIndex === currentWeek
    ) {
      return {
        goalMemo: planner.goalMemo ?? '',
        days: planner.days ?? { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
        todoStickyNotes: planner.todoStickyNotes ?? '',
      };
    }
    // 全新空白周
    return {
      goalMemo: '',
      days: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
      todoStickyNotes: '',
    };
  }, [
    planner.weeks,
    currentWeekKey,
    planner.year,
    planner.monthIndex,
    planner.weekIndex,
    planner.days,
    planner.goalMemo,
    planner.todoStickyNotes,
    currentYear,
    currentMonth,
    currentWeek,
  ]);

  const [newTodoInputs, setNewTodoInputs] = useState<{ [key in WeekdayKey]?: string }>({});
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState(currentWeekRecord.goalMemo || '');
  const [isEditingSticky, setIsEditingSticky] = useState(false);
  const [stickyText, setStickyText] = useState(currentWeekRecord.todoStickyNotes || '');

  // 当切换周或月份时，同步输入状态，防止跨周污染
  useEffect(() => {
    setGoalText(currentWeekRecord.goalMemo || '');
    setStickyText(currentWeekRecord.todoStickyNotes || '');
    setIsEditingGoal(false);
    setIsEditingSticky(false);
    setNewTodoInputs({});
  }, [currentWeekKey]);

  // 更新当前周数据的高阶函数，严格保证仅修改 weeks[currentWeekKey]
  const updateCurrentWeek = (updater: (prev: SingleWeekRecord) => SingleWeekRecord) => {
    const updatedRecord = updater(currentWeekRecord);
    const updatedWeeks = {
      ...(planner.weeks || {}),
      [currentWeekKey]: updatedRecord,
    };

    onSavePlanner({
      ...planner,
      year: currentYear,
      monthIndex: currentMonth,
      weekIndex: currentWeek,
      days: updatedRecord.days,
      goalMemo: updatedRecord.goalMemo || '',
      todoStickyNotes: updatedRecord.todoStickyNotes || '',
      weeks: updatedWeeks,
    });
  };

  // 统计某周记录的待办与便签总数（用于在月周面板显示小圆点）
  const getWeekRecordCount = (year: number, m: number, w: number): number => {
    const key = getWeekKey(year, m, w);
    const rec = planner.weeks?.[key];
    if (!rec) {
      if (planner.year === year && planner.monthIndex === m && planner.weekIndex === w && planner.days) {
        return Object.values(planner.days).reduce((acc, list) => acc + (list?.length || 0), 0);
      }
      return 0;
    }
    let count = 0;
    if (rec.days) {
      for (const list of Object.values(rec.days)) {
        if (list) count += list.length;
      }
    }
    if (rec.goalMemo?.trim()) count += 1;
    if (rec.todoStickyNotes?.trim()) count += 1;
    return count;
  };

  // 当前周所有待办项总数
  const totalItemsInCurrentWeek = useMemo(() => {
    let count = 0;
    for (const list of Object.values(currentWeekRecord.days)) {
      if (list) count += list.length;
    }
    return count;
  }, [currentWeekRecord.days]);

  // 一键对齐当前现实时间周数
  const handleSyncCurrentRealTime = () => {
    const now = new Date();
    const currentM = now.getMonth() + 1; // 1-12
    const date = now.getDate();
    const currentW = Math.min(5, Math.max(1, Math.ceil(date / 7)));

    if (audioEnabled) soundManager.playInteractionSound('paper', undefined, 'flip');

    const targetKey = getWeekKey(now.getFullYear(), currentM, currentW);
    const targetRecord = planner.weeks?.[targetKey] || {
      goalMemo: '',
      days: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
      todoStickyNotes: '',
    };

    onSavePlanner({
      ...planner,
      year: now.getFullYear(),
      monthIndex: currentM,
      weekIndex: currentW,
      days: targetRecord.days,
      goalMemo: targetRecord.goalMemo || '',
      todoStickyNotes: targetRecord.todoStickyNotes || '',
    });
    showToast(`已对齐现世时间：${now.getFullYear()}年 ${currentM}月 · 第${currentW}周`);
  };

  // 切换月份 (1-12)
  const handleSelectMonth = (m: number) => {
    if (audioEnabled) soundManager.playInteractionSound('paper', undefined, 'flip');
    const targetKey = getWeekKey(currentYear, m, currentWeek);
    const targetRecord = planner.weeks?.[targetKey] || {
      goalMemo: '',
      days: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
      todoStickyNotes: '',
    };

    onSavePlanner({
      ...planner,
      monthIndex: m,
      days: targetRecord.days,
      goalMemo: targetRecord.goalMemo || '',
      todoStickyNotes: targetRecord.todoStickyNotes || '',
    });
  };

  // 切换周数 (1-5)
  const handleSelectWeek = (w: number) => {
    if (audioEnabled) soundManager.playInteractionSound('paper', undefined, 'flip');
    const targetKey = getWeekKey(currentYear, currentMonth, w);
    const targetRecord = planner.weeks?.[targetKey] || {
      goalMemo: '',
      days: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
      todoStickyNotes: '',
    };

    onSavePlanner({
      ...planner,
      weekIndex: w,
      days: targetRecord.days,
      goalMemo: targetRecord.goalMemo || '',
      todoStickyNotes: targetRecord.todoStickyNotes || '',
    });
  };

  // 上一周导航 (跨月支持)
  const handlePrevWeek = () => {
    if (audioEnabled) soundManager.playInteractionSound('paper', undefined, 'flip');
    let targetYear = currentYear;
    let targetMonth = currentMonth;
    let targetW = currentWeek - 1;

    if (targetW < 1) {
      targetW = 5;
      targetMonth = currentMonth - 1;
      if (targetMonth < 1) {
        targetMonth = 12;
        targetYear -= 1;
      }
    }

    const targetKey = getWeekKey(targetYear, targetMonth, targetW);
    const targetRecord = planner.weeks?.[targetKey] || {
      goalMemo: '',
      days: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
      todoStickyNotes: '',
    };

    onSavePlanner({
      ...planner,
      year: targetYear,
      monthIndex: targetMonth,
      weekIndex: targetW,
      days: targetRecord.days,
      goalMemo: targetRecord.goalMemo || '',
      todoStickyNotes: targetRecord.todoStickyNotes || '',
    });
  };

  // 下一周导航 (跨月支持)
  const handleNextWeek = () => {
    if (audioEnabled) soundManager.playInteractionSound('paper', undefined, 'flip');
    let targetYear = currentYear;
    let targetMonth = currentMonth;
    let targetW = currentWeek + 1;

    if (targetW > 5) {
      targetW = 1;
      targetMonth = currentMonth + 1;
      if (targetMonth > 12) {
        targetMonth = 1;
        targetYear += 1;
      }
    }

    const targetKey = getWeekKey(targetYear, targetMonth, targetW);
    const targetRecord = planner.weeks?.[targetKey] || {
      goalMemo: '',
      days: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
      todoStickyNotes: '',
    };

    onSavePlanner({
      ...planner,
      year: targetYear,
      monthIndex: targetMonth,
      weekIndex: targetW,
      days: targetRecord.days,
      goalMemo: targetRecord.goalMemo || '',
      todoStickyNotes: targetRecord.todoStickyNotes || '',
    });
  };

  // 添加今日待办
  const handleAddTodo = (day: WeekdayKey) => {
    const text = (newTodoInputs[day] || '').trim();
    if (!text) return;

    if (audioEnabled) soundManager.playInteractionSound('brush', undefined, 'stroke');

    const newItem: WeeklyTodoItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      text,
      done: false,
    };

    updateCurrentWeek((prev) => {
      const list = prev.days[day] || [];
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: [...list, newItem],
        },
      };
    });

    setNewTodoInputs((prev) => ({ ...prev, [day]: '' }));
  };

  // 勾选待办
  const handleToggleTodo = (day: WeekdayKey, id: string) => {
    if (audioEnabled) soundManager.playInteractionSound('paper', undefined, 'click');

    updateCurrentWeek((prev) => {
      const list = prev.days[day] || [];
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: list.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
        },
      };
    });
  };

  // 删除待办
  const handleDeleteTodo = (day: WeekdayKey, id: string) => {
    updateCurrentWeek((prev) => {
      const list = prev.days[day] || [];
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: list.filter((item) => item.id !== id),
        },
      };
    });
  };

  // 保存周度目标便签
  const handleSaveGoal = () => {
    setIsEditingGoal(false);
    updateCurrentWeek((prev) => ({
      ...prev,
      goalMemo: goalText,
    }));
    showToast(`已保存 ${currentMonth}月第${currentWeek}周 目标寄语备考`);
  };

  // 保存右下角 TO DO 看板
  const handleSaveSticky = () => {
    setIsEditingSticky(false);
    updateCurrentWeek((prev) => ({
      ...prev,
      todoStickyNotes: stickyText,
    }));
    showToast(`已保存 ${currentMonth}月第${currentWeek}周 重点待办看板`);
  };

  // 一键复制上一周待办事项 (便利日常习惯，不改变历史上一周)
  const handleCopyFromPreviousWeek = () => {
    let prevYear = currentYear;
    let prevMonth = currentMonth;
    let prevW = currentWeek - 1;
    if (prevW < 1) {
      prevW = 5;
      prevMonth = currentMonth - 1;
      if (prevMonth < 1) {
        prevMonth = 12;
        prevYear -= 1;
      }
    }
    const prevKey = getWeekKey(prevYear, prevMonth, prevW);
    const prevRecord = planner.weeks?.[prevKey];

    if (!prevRecord || !prevRecord.days || Object.values(prevRecord.days).every((list) => !list || list.length === 0)) {
      showToast(`上一周 (${prevMonth}月第${prevW}周) 暂无已记录的待办事项可复制`, 'warning');
      return;
    }

    // 克隆上一周的待办列表，但将完成状态重置为未完成
    const clonedDays: { [key in WeekdayKey]?: WeeklyTodoItem[] } = {};
    for (const day of ORDERED_WEEKDAYS) {
      const prevList = prevRecord.days[day.key] || [];
      clonedDays[day.key] = prevList.map((item) => ({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
        text: item.text,
        done: false,
      }));
    }

    updateCurrentWeek((prev) => ({
      ...prev,
      days: clonedDays,
      goalMemo: prev.goalMemo || prevRecord.goalMemo || '',
      todoStickyNotes: prev.todoStickyNotes || prevRecord.todoStickyNotes || '',
    }));

    showToast(`已从上周 (${prevMonth}月第${prevW}周) 复制日常待办清单到本周！`, 'success');
  };

  // 一键清空本周计划
  const handleClearCurrentWeek = () => {
    if (!window.confirm(`确定要清空【${currentYear}年 ${currentMonth}月 第${currentWeek}周】的所有待办与便签吗？此操作不会影响其他周的记录。`)) {
      return;
    }

    updateCurrentWeek(() => ({
      goalMemo: '',
      days: { mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: [] },
      todoStickyNotes: '',
    }));
    showToast(`已清空 ${currentMonth}月第${currentWeek}周 计划`);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* ================= SECTION 1: HEADER & TITLE ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-dashed border-[var(--sakura-pink)] pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight text-[var(--header-red)]">
              Weekly Planner
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--sakura-soft)] text-[var(--sakura-deep)] text-xs font-serif font-bold border border-[var(--sakura-pink)] shadow-2xs">
              周度手札 · {currentMonth}月 第 {currentWeek} 周
            </span>
            <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--search-bg)] px-2 py-0.5 rounded border border-[var(--border-color)]">
              键档: {currentWeekKey}
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-serif mt-1">
            纸面胶带手帐 · 每周独立归档保存，换周互不干扰 · 记录主殿日常修习与出阵计划
          </p>
        </div>

        {/* Quick week navigation & Realtime Sync button */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={handleSyncCurrentRealTime}
            title="一键打卡当前现实月份与周数"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--sakura-deep)] hover:border-[var(--sakura-pink)] text-xs font-serif cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>对齐今日周</span>
          </button>

          <div className="flex items-center border border-[var(--border-color)] rounded-lg bg-[var(--panel-color)] shadow-2xs overflow-hidden">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)] cursor-pointer transition-colors border-r border-[var(--border-color)]"
              title="上一周 (支持跨月)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-serif font-bold text-[var(--text-color)] px-2.5 py-1 min-w-[130px] text-center">
              {currentYear}年 · {currentMonth}月 第{currentWeek}周
            </span>
            <button
              onClick={handleNextWeek}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)] cursor-pointer transition-colors border-l border-[var(--border-color)]"
              title="下一周 (支持跨月)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= SECTION 2: TOP TRACKER & GOAL POST-IT ================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Left: Month (1-12) & Week (1-5) Matrix with Drawn Rings */}
        <div className="md:col-span-7 p-4 rounded-2xl bg-[var(--panel-color)] border-2 border-[var(--sakura-pink)] shadow-sm relative overflow-hidden">
          {/* Subtle Corner Washi Tape */}
          <div className="absolute -top-2 left-6 w-16 h-5 bg-[var(--sakura-deep)]/25 -rotate-3 backdrop-blur-xs border-x border-dashed border-white/50 pointer-events-none" />

          <div className="text-xs font-serif font-bold text-[var(--header-red)] mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>月份与周度打卡盘 (轻触数字独立切换)</span>
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-normal font-mono">
              当前手札：{currentMonth}月 · 第{currentWeek}周 (独立存录)
            </span>
          </div>

          <div className="border border-[var(--sakura-pink)] rounded-xl overflow-hidden text-xs font-serif">
            {/* Month Row 1 (1-6) */}
            <div className="flex border-b border-[var(--sakura-pink)] bg-[var(--sakura-soft)]/40">
              <div className="w-16 shrink-0 py-2 px-2 text-center font-bold text-[var(--header-red)] border-r border-[var(--sakura-pink)] flex items-center justify-center">
                Month
              </div>
              <div className="grid grid-cols-6 flex-1">
                {[1, 2, 3, 4, 5, 6].map((m) => {
                  const isChecked = currentMonth === m;
                  return (
                    <button
                      key={m}
                      onClick={() => handleSelectMonth(m)}
                      className="py-2 text-center border-r last:border-r-0 border-[var(--sakura-pink)] relative hover:bg-[var(--sakura-soft)] cursor-pointer transition-colors font-mono"
                    >
                      <span className="text-[var(--text-color)]">{m}</span>
                      {isChecked && (
                        <span className="absolute inset-1 border-2 border-red-500 rounded-full scale-90 -rotate-6 pointer-events-none opacity-85 shadow-xs flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 opacity-60" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Month Row 2 (7-12) */}
            <div className="flex border-b border-[var(--sakura-pink)]">
              <div className="w-16 shrink-0 py-2 px-2 text-center text-[var(--text-muted)] border-r border-[var(--sakura-pink)] flex items-center justify-center text-[10px]">
                (续)
              </div>
              <div className="grid grid-cols-6 flex-1">
                {[7, 8, 9, 10, 11, 12].map((m) => {
                  const isChecked = currentMonth === m;
                  return (
                    <button
                      key={m}
                      onClick={() => handleSelectMonth(m)}
                      className="py-2 text-center border-r last:border-r-0 border-[var(--sakura-pink)] relative hover:bg-[var(--sakura-soft)] cursor-pointer transition-colors font-mono"
                    >
                      <span className="text-[var(--text-color)]">{m}</span>
                      {isChecked && (
                        <span className="absolute inset-1 border-2 border-red-500 rounded-full scale-90 rotate-3 pointer-events-none opacity-85 shadow-xs flex items-center justify-center">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 opacity-60" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Week Row (1-5) */}
            <div className="flex bg-[var(--sakura-soft)]/40">
              <div className="w-16 shrink-0 py-2 px-2 text-center font-bold text-[var(--header-red)] border-r border-[var(--sakura-pink)] flex items-center justify-center">
                Week
              </div>
              <div className="grid grid-cols-5 flex-1">
                {[1, 2, 3, 4, 5].map((w) => {
                  const isChecked = currentWeek === w;
                  const recordedCount = getWeekRecordCount(currentYear, currentMonth, w);
                  const hasEntries = recordedCount > 0;

                  return (
                    <button
                      key={w}
                      onClick={() => handleSelectWeek(w)}
                      className="py-2 text-center border-r last:border-r-0 border-[var(--sakura-pink)] relative hover:bg-[var(--sakura-soft)] cursor-pointer transition-colors font-mono group"
                      title={`${currentMonth}月第${w}周 (${hasEntries ? `已存录 ${recordedCount} 条计划` : '暂无记录'})`}
                    >
                      <span className="text-[var(--text-color)]">{w}</span>
                      {isChecked && (
                        <span className="absolute inset-1 border-2 border-pink-500 rounded-full scale-90 -rotate-12 pointer-events-none opacity-90 shadow-xs flex items-center justify-center">
                          <span className="text-[9px] text-pink-600 font-bold select-none">★</span>
                        </span>
                      )}
                      {/* Recorded Entry Dot Indicator */}
                      {hasEntries && !isChecked && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--sakura-deep)] opacity-70" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Goal & Habit Tracker Post-it 便签纸 */}
        <div className="md:col-span-5 p-4 rounded-2xl bg-[var(--sakura-soft)] border-2 border-[var(--sakura-pink)] shadow-sm relative rotate-1 transition-transform hover:rotate-0">
          {/* Half-transparent washi tape on top of the note */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-white/70 border-x border-dashed border-gray-400/50 shadow-2xs backdrop-blur-xs rotate-1 pointer-events-none" />

          <div className="flex items-center justify-between mb-2 mt-1">
            <span className="font-serif font-bold text-xs text-[var(--header-red)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>本周目标与习惯备考 (Habit Tracker)</span>
            </span>
            <button
              onClick={() => {
                if (isEditingGoal) handleSaveGoal();
                else setIsEditingGoal(true);
              }}
              className="text-[11px] font-serif text-[var(--sakura-deep)] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditingGoal ? '保存' : '编辑'}</span>
            </button>
          </div>

          {isEditingGoal ? (
            <div className="space-y-2">
              <textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="写下本周定好的目标，一周后确认是否达成。例如：计划每日必做事务、早睡早起、背单词、远征满勤..."
                rows={4}
                className="w-full p-2.5 text-xs rounded-xl border border-[var(--sakura-pink)] bg-[var(--panel-color)] text-[var(--text-color)] focus:outline-hidden font-serif resize-none leading-relaxed"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingGoal(false)}
                  className="px-2.5 py-1 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveGoal}
                  className="px-3 py-1 rounded-lg bg-[var(--sakura-deep)] text-white text-xs font-serif font-bold cursor-pointer"
                >
                  保存便签
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs font-serif text-[var(--text-color)] leading-relaxed whitespace-pre-line min-h-[72px] opacity-90">
              {currentWeekRecord.goalMemo || (
                <span className="italic text-[var(--text-muted)] opacity-70">
                  「主殿，本周尚未题写目标。可点击右上角『编辑』记下本周生活与修习备考。」
                </span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Week Operation Bar (Copy routine tasks / Clean current week) */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] text-xs font-serif flex-wrap">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--text-color)]">
            【{currentYear}年 {currentMonth}月 · 第{currentWeek}周】待办手札
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">
            (共 {totalItemsInCurrentWeek} 项待办)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyFromPreviousWeek}
            title="将上一周的例行待办清单复制到本周（自动重置为未完成状态）"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--panel-color)] border border-[var(--border-color)] text-[var(--sakura-deep)] hover:border-[var(--sakura-pink)] hover:bg-[var(--sakura-soft)] transition-colors cursor-pointer text-[11px] font-semibold"
          >
            <Copy className="w-3 h-3" />
            <span>复制上周待办</span>
          </button>

          {totalItemsInCurrentWeek > 0 && (
            <button
              onClick={handleClearCurrentWeek}
              title="仅清空本周的所有待办，其他周记录保持不变"
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--panel-color)] border border-[var(--border-color)] text-gray-500 hover:text-red-500 hover:border-red-200 transition-colors cursor-pointer text-[11px]"
            >
              <Trash2 className="w-3 h-3" />
              <span>清空本周</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= SECTION 3: STRICT MON -> SUN ORDERED DAYS ================= */}
      {/* 
        手机移动端：按 周一 (MON) -> 周二 (TUE) -> 周三 (WED) -> 周四 (THU) -> 周五 (FRI) -> 周六 (SAT) -> 周日 (SUN) 严格由上至下单列垂直排列！
        桌面平板宽屏端：自适应 2 到 3 列网格，但严格按 1,2,3,4,5,6,7 的自然阅读习惯顺序横向流排！
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        {/* Day 1: MON 周一 */}
        {renderDayCard(ORDERED_WEEKDAYS[0])}

        {/* Day 2: TUE 周二 */}
        {renderDayCard(ORDERED_WEEKDAYS[1])}

        {/* Day 3: WED 周三 */}
        {renderDayCard(ORDERED_WEEKDAYS[2])}

        {/* Day 4: THU 周四 */}
        {renderDayCard(ORDERED_WEEKDAYS[3])}

        {/* Day 5: FRI 周五 */}
        {renderDayCard(ORDERED_WEEKDAYS[4])}

        {/* Day 6: SAT 周六 */}
        {renderDayCard(ORDERED_WEEKDAYS[5])}

        {/* Day 7: SUN 周日 */}
        {renderDayCard(ORDERED_WEEKDAYS[6])}

        {/* Column Extra: Hand-drawn style TO DO Memo Board (Matching image) */}
        <div className="p-4 rounded-2xl bg-[var(--panel-color)] border-2 border-[var(--sakura-deep)] shadow-md relative -rotate-1 transition-transform hover:rotate-0">
          {/* Bright yellow washi tape */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-amber-300/80 border-x border-dashed border-amber-600/40 shadow-2xs backdrop-blur-xs -rotate-2 pointer-events-none" />

          <div className="flex items-center justify-between mb-3 mt-1">
            <div className="font-serif font-extrabold text-lg tracking-widest text-[var(--header-red)]">
              TO DO
            </div>
            <button
              onClick={() => {
                if (isEditingSticky) handleSaveSticky();
                else setIsEditingSticky(true);
              }}
              className="text-[11px] font-serif text-[var(--sakura-deep)] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditingSticky ? '保存' : '编辑'}</span>
            </button>
          </div>

          {isEditingSticky ? (
            <div className="space-y-2">
              <textarea
                value={stickyText}
                onChange={(e) => setStickyText(e.target.value)}
                placeholder="记录本周特别日程、重要聚会或备忘节点，如：&#10;12.21 逛街买谷&#10;12.25 现世聚会&#10;12.27 连队战冲刺十万魂"
                rows={5}
                className="w-full p-2.5 text-xs rounded-xl border border-[var(--sakura-pink)] bg-[var(--search-bg)] text-[var(--text-color)] focus:outline-hidden font-serif resize-none leading-relaxed"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingSticky(false)}
                  className="px-2.5 py-1 rounded-lg text-xs text-[var(--text-muted)] hover:text-[var(--text-color)] cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveSticky}
                  className="px-3 py-1 rounded-lg bg-[var(--sakura-deep)] text-white text-xs font-serif font-bold cursor-pointer"
                >
                  保存看板
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs font-serif text-[var(--text-color)] leading-loose whitespace-pre-line min-h-[90px] font-semibold opacity-90 pl-1">
              {currentWeekRecord.todoStickyNotes || (
                <span className="italic text-[var(--text-muted)] font-normal opacity-70">
                  暂无重点待办。可点击右上角『编辑』写下本周日程。
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper renderer for each weekday card
  function renderDayCard(dayObj: { key: WeekdayKey; en: string; cn: string; short: string }) {
    const list = currentWeekRecord.days[dayObj.key] || [];
    const inputValue = newTodoInputs[dayObj.key] || '';

    return (
      <div
        key={dayObj.key}
        className="p-4 rounded-2xl bg-[var(--panel-color)] border-2 border-[var(--sakura-pink)] shadow-sm relative transition-all hover:shadow-md group"
      >
        {/* Pink/Theme-matched Washi Tape in center */}
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-18 h-5 bg-[var(--sakura-pink)]/50 border-x border-dashed border-white/60 shadow-2xs backdrop-blur-xs -rotate-1 pointer-events-none" />

        {/* Card Header: MON / TUE Pill Badge */}
        <div className="flex items-center justify-between mb-3 mt-0.5">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--sakura-soft)] text-[var(--header-red)] text-xs font-serif font-black tracking-wider border border-[var(--sakura-pink)]/60">
              {dayObj.en}
            </span>
            <span className="text-[11px] font-semibold text-[var(--text-color)] font-serif">
              {dayObj.cn}
            </span>
          </div>

          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            {list.filter((t) => t.done).length}/{list.length}
          </span>
        </div>

        {/* Checklist */}
        <div className="space-y-1.5 min-h-[75px]">
          {list.length === 0 ? (
            <div className="text-[11px] text-[var(--text-muted)] font-serif py-3 text-center opacity-60">
              点击下方添加今日修习计划
            </div>
          ) : (
            list.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-2 p-1 rounded-md hover:bg-[var(--sakura-soft)]/50 transition-colors group/item"
              >
                <button
                  type="button"
                  onClick={() => handleToggleTodo(dayObj.key, item.id)}
                  className="flex items-start gap-2 text-left flex-1 min-w-0 cursor-pointer"
                >
                  <span className="shrink-0 mt-0.5 text-[var(--sakura-deep)]">
                    {item.done ? (
                      <CheckSquare className="w-3.5 h-3.5 fill-[var(--sakura-soft)] stroke-[2.2]" />
                    ) : (
                      <Square className="w-3.5 h-3.5 stroke-[1.8] text-[var(--text-muted)]" />
                    )}
                  </span>
                  <span
                    className={`text-xs font-serif leading-snug break-words ${
                      item.done
                        ? 'line-through text-[var(--text-muted)] opacity-60'
                        : 'text-[var(--text-color)]'
                    }`}
                  >
                    {item.text}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteTodo(dayObj.key, item.id)}
                  className="opacity-0 group-hover/item:opacity-100 p-0.5 text-[var(--text-muted)] hover:text-red-600 transition-opacity cursor-pointer shrink-0"
                  title="删除此项"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Input box to add item */}
        <div className="mt-3 pt-2.5 border-t border-[var(--border-color)] flex items-center gap-1.5">
          <input
            type="text"
            value={inputValue}
            onChange={(e) =>
              setNewTodoInputs((prev) => ({
                ...prev,
                [dayObj.key]: e.target.value,
              }))
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTodo(dayObj.key);
              }
            }}
            placeholder="录入新计划..."
            className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] focus:outline-hidden focus:border-[var(--sakura-deep)] font-serif"
          />
          <button
            type="button"
            onClick={() => handleAddTodo(dayObj.key)}
            className="p-1 rounded-lg bg-[var(--sakura-soft)] text-[var(--sakura-deep)] border border-[var(--sakura-pink)] hover:bg-[var(--sakura-deep)] hover:text-white transition-colors cursor-pointer shrink-0"
            title="添加"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }
};
