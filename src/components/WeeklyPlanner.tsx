import React, { useState } from 'react';
import { WeeklyPlannerData, WeekdayKey, WeeklyTodoItem } from '../types';
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
} from 'lucide-react';
import { soundManager } from '../utils/soundManager';

interface WeeklyPlannerProps {
  planner: WeeklyPlannerData;
  onSavePlanner: (data: WeeklyPlannerData) => void;
  showToast: (msg: string) => void;
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

export const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({
  planner,
  onSavePlanner,
  showToast,
  audioEnabled = false,
}) => {
  const [newTodoInputs, setNewTodoInputs] = useState<{ [key in WeekdayKey]?: string }>({});
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState(planner.goalMemo || '');
  const [isEditingSticky, setIsEditingSticky] = useState(false);
  const [stickyText, setStickyText] = useState(planner.todoStickyNotes || '');

  // 一键对齐当前现实时间周数
  const handleSyncCurrentRealTime = () => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const date = now.getDate();
    // 计算当月第几周 (1-5)
    const currentWeek = Math.min(5, Math.max(1, Math.ceil(date / 7)));

    if (audioEnabled) soundManager.playInteractionSound('paper', undefined, 'flip');

    onSavePlanner({
      ...planner,
      year: now.getFullYear(),
      monthIndex: currentMonth,
      weekIndex: currentWeek,
    });
    showToast(`已对齐现世时间：${now.getFullYear()}年 ${currentMonth}月 · 第${currentWeek}周`);
  };

  // Toggle Month Index (1-12)
  const handleSelectMonth = (m: number) => {
    if (audioEnabled) soundManager.playInteractionSound('paper', undefined, 'flip');
    onSavePlanner({
      ...planner,
      monthIndex: m,
    });
  };

  // Toggle Week Index (1-5)
  const handleSelectWeek = (w: number) => {
    if (audioEnabled) soundManager.playInteractionSound('paper', undefined, 'flip');
    onSavePlanner({
      ...planner,
      weekIndex: w,
    });
  };

  // Add Item to a specific Day
  const handleAddTodo = (day: WeekdayKey) => {
    const text = (newTodoInputs[day] || '').trim();
    if (!text) return;

    if (audioEnabled) soundManager.playInteractionSound('brush', undefined, 'stroke');

    const currentList = planner.days[day] || [];
    const newItem: WeeklyTodoItem = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
      text,
      done: false,
    };

    onSavePlanner({
      ...planner,
      days: {
        ...planner.days,
        [day]: [...currentList, newItem],
      },
    });

    setNewTodoInputs((prev) => ({ ...prev, [day]: '' }));
  };

  // Toggle Checkbox Item
  const handleToggleTodo = (day: WeekdayKey, id: string) => {
    if (audioEnabled) soundManager.playInteractionSound('paper', undefined, 'click');

    const currentList = planner.days[day] || [];
    const updated = currentList.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );

    onSavePlanner({
      ...planner,
      days: {
        ...planner.days,
        [day]: updated,
      },
    });
  };

  // Delete Item
  const handleDeleteTodo = (day: WeekdayKey, id: string) => {
    const currentList = planner.days[day] || [];
    const updated = currentList.filter((item) => item.id !== id);

    onSavePlanner({
      ...planner,
      days: {
        ...planner.days,
        [day]: updated,
      },
    });
  };

  // Save Goal Memo Post-it
  const handleSaveGoal = () => {
    setIsEditingGoal(false);
    onSavePlanner({
      ...planner,
      goalMemo: goalText,
    });
    showToast('已更新每周寄语备考');
  };

  // Save Bottom-right TO DO sticky
  const handleSaveSticky = () => {
    setIsEditingSticky(false);
    onSavePlanner({
      ...planner,
      todoStickyNotes: stickyText,
    });
    showToast('已更新重点 TO DO 待办看板');
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
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--sakura-soft)] text-[var(--sakura-deep)] text-xs font-serif font-bold border border-[var(--sakura-pink)]">
              周度手札 · 第 {planner.weekIndex || 1} 周
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-serif mt-1">
            纸面胶带手帐 · 记录主殿每周日常修习、出阵备忘与生活计划
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
              onClick={() => {
                const currentW = planner.weekIndex || 1;
                const nextW = currentW > 1 ? currentW - 1 : 5;
                handleSelectWeek(nextW);
              }}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)] cursor-pointer transition-colors border-r border-[var(--border-color)]"
              title="上一周"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-serif font-bold text-[var(--text-color)] px-2.5 py-1">
              {planner.year || 2026}年 · {planner.monthIndex || 10}月 第{planner.weekIndex || 1}周
            </span>
            <button
              onClick={() => {
                const currentW = planner.weekIndex || 1;
                const nextW = currentW < 5 ? currentW + 1 : 1;
                handleSelectWeek(nextW);
              }}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)] cursor-pointer transition-colors border-l border-[var(--border-color)]"
              title="下一周"
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
              <span>月份与周度打卡盘 (轻触数字手绘圆圈)</span>
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-normal font-mono">
              打卡记录：{planner.monthIndex}月 · 第{planner.weekIndex}周
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
                  const isChecked = planner.monthIndex === m;
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
                  const isChecked = planner.monthIndex === m;
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
                  const isChecked = planner.weekIndex === w;
                  return (
                    <button
                      key={w}
                      onClick={() => handleSelectWeek(w)}
                      className="py-2 text-center border-r last:border-r-0 border-[var(--sakura-pink)] relative hover:bg-[var(--sakura-soft)] cursor-pointer transition-colors font-mono"
                    >
                      <span className="text-[var(--text-color)]">{w}</span>
                      {isChecked && (
                        <span className="absolute inset-1 border-2 border-pink-500 rounded-full scale-90 -rotate-12 pointer-events-none opacity-90 shadow-xs flex items-center justify-center">
                          <span className="text-[9px] text-pink-600 font-bold select-none">★</span>
                        </span>
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
                placeholder="写下每周定好的目标，一周后确认是否达成。例如：计划每日必做事务、早睡早起、背单词、远征满勤..."
                rows={4}
                className="w-full p-2.5 text-xs rounded-xl border border-[var(--sakura-pink)] bg-[var(--panel-color)] text-[var(--text-color)] focus:outline-hidden font-serif resize-none leading-relaxed"
              />
              <div className="flex justify-end">
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
              {planner.goalMemo ||
                '每周定好目标，一周后确认是否达成。\n用 habit tracker 来提高做事效率，\n计划每日必做的事情。'}
            </p>
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
              <div className="flex justify-end">
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
              {planner.todoStickyNotes ||
                '12.21  逛街买谷\n12.25  现世聚会\n12.27  连队战十万魂达成'}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Helper renderer for each weekday card
  function renderDayCard(dayObj: { key: WeekdayKey; en: string; cn: string; short: string }) {
    const list = planner.days[dayObj.key] || [];
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
