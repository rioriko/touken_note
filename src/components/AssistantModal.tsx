import React, { useState, useEffect } from 'react';
import { Assistant } from '../types';
import { X, Sparkles, Check, UserCheck } from 'lucide-react';

interface AssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistant: Assistant;
  onSaveAssistant: (asst: Assistant) => void;
  onOpenFortune?: () => void;
  showToast: (msg: string) => void;
}

export const AssistantModal: React.FC<AssistantModalProps> = ({
  isOpen,
  onClose,
  assistant,
  onSaveAssistant,
  onOpenFortune,
  showToast,
}) => {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');

  useEffect(() => {
    if (assistant) {
      setName(assistant.name || '');
      setSchool(assistant.school || '');
    }
  }, [assistant, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('需指定近侍刀剑男士的名讳');
      return;
    }
    onSaveAssistant({
      name: name.trim(),
      school: school.trim(),
    });
    showToast(`近侍已任命：【${name.trim()}】参上！`);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--panel-color)] rounded-xl shadow-2xl border border-[var(--sakura-pink)]/60 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[var(--sakura-pink)]/40 flex items-center justify-between bg-[var(--sakura-soft)]/30">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[var(--header-red)]" />
            <h3 className="text-base font-bold text-[var(--header-red)] font-serif tracking-wider">
              本丸近侍任命
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">
          <p className="text-[var(--text-muted)] leading-relaxed">
            指派一位心仪的刀剑男士辅佐主殿的日常事务，随时在左下角恭候审神者的军令与垂询。
          </p>

          <div>
            <label className="block font-semibold text-[var(--text-color)] mb-1">
              刀剑男士名讳 <span className="text-[var(--header-red)]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例：加州清光、三日月宗近、山姥切国广"
              required
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] focus:outline-hidden focus:border-[var(--sakura-deep)] text-xs font-serif font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-[var(--text-color)] mb-1">
              流派或刀种 (可选)
            </label>
            <input
              type="text"
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="例：打刀、三条、粟田口、堀川"
              className="w-full px-3 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] focus:outline-hidden focus:border-[var(--sakura-deep)] text-xs"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="text-[var(--text-muted)] text-[10px] w-full">常用近侍推选：</span>
            {['加州清光', '三日月宗近', '山姥切国广', '压切长谷部', '鹤丸国永'].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setName(n)}
                className="px-2 py-0.5 rounded bg-[var(--search-bg)] border border-[var(--border-color)] text-[11px] text-[var(--text-color)] hover:bg-[var(--sakura-soft)] hover:text-[var(--sakura-deep)]"
              >
                {n}
              </button>
            ))}
          </div>

          {onOpenFortune && (
            <div className="p-3 rounded-xl bg-[var(--sakura-soft)]/50 border border-[var(--sakura-pink)]/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-[var(--text-color)] block text-xs font-serif">
                  近侍今日晨鉴与签文
                </span>
                <span className="text-[10px] text-[var(--text-muted)]">
                  聆听当前近侍的每日箴言、运势吉相与宜忌提醒
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFortune();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--card-bg)] text-[var(--sakura-deep)] border border-[var(--sakura-pink)] text-xs font-serif font-bold hover:bg-[var(--sakura-deep)] hover:text-white transition-all cursor-pointer shadow-xs"
              >
                <span>查看今日签文</span>
              </button>
            </div>
          )}

          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-color)] hover:bg-[var(--search-bg)] cursor-pointer"
            >
              暂不变更
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white font-semibold hover:bg-[var(--sakura-deep)]/90 shadow-xs cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>正式就任</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
