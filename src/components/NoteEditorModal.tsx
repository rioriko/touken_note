import React, { useState, useEffect } from 'react';
import { Note, NoteTag } from '../types';
import { X, Trash2, Check, AlertTriangle } from 'lucide-react';

interface NoteEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onSaveNote: (note: { content: string; tag: string; date?: string }, isNew: boolean) => void;
  onDeleteNote: (id: string) => void;
  confirmDelete: boolean;
  showToast: (msg: string) => void;
}

const AVAILABLE_TAGS: NoteTag[] = [
  '日常',
  '内番',
  '马当番',
  '畑当番',
  '手合场',
  '寝当番',
  '出征',
  '远征',
  '演练',
  '刀装',
];

export const NoteEditorModal: React.FC<NoteEditorModalProps> = ({
  isOpen,
  onClose,
  note,
  onSaveNote,
  onDeleteNote,
  confirmDelete,
  showToast,
}) => {
  const [content, setContent] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('日常');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setSelectedTag(note.tag || '日常');
    } else {
      setContent('');
      setSelectedTag('日常');
    }
    setIsConfirmingDelete(false);
  }, [note, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      showToast('奏帖内容不可为空白');
      return;
    }
    onSaveNote({ content: content.trim(), tag: selectedTag }, !note);
    onClose();
  };

  const handleDelete = () => {
    if (!note) return;
    if (confirmDelete && !isConfirmingDelete) {
      setIsConfirmingDelete(true);
      return;
    }
    onDeleteNote(note.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--panel-color)] rounded-xl shadow-2xl border border-[var(--sakura-pink)]/60 flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[var(--sakura-pink)]/40 flex items-center justify-between bg-[var(--sakura-soft)]/30">
          <div>
            <h3 className="text-base font-bold text-[var(--header-red)] font-serif tracking-wider">
              {note ? '披阅与修改奏帖' : '书写本丸新奏帖'}
            </h3>
            {note && (
              <span className="text-[11px] text-[var(--text-muted)] font-mono">
                作于: {note.date}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 flex-1 flex flex-col gap-4 overflow-y-auto">
          {/* Tag Selector */}
          <div>
            <label className="block text-xs font-semibold text-[var(--text-color)] mb-1.5">
              奏帖分类便签
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer ${
                    selectedTag === tag
                      ? 'bg-[var(--sakura-deep)] text-white font-medium shadow-2xs'
                      : 'bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)] border border-[var(--border-color)]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div className="flex-1 flex flex-col min-h-[180px]">
            <label className="block text-xs font-semibold text-[var(--text-color)] mb-1.5">
              奏帖记事内容
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="在此记录本丸军政、出征履历、锻刀心得或日常事务..."
              rows={8}
              autoFocus
              className="w-full flex-1 p-3 text-sm rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] leading-relaxed focus:outline-hidden focus:border-[var(--sakura-deep)] resize-y font-serif"
            />
          </div>

          {/* Confirmation Warning if deleting */}
          {isConfirmingDelete && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                <span>确认要坚决销毁此份奏帖吗？无法找回。</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-2 py-0.5 rounded border border-gray-300 text-gray-700 bg-white"
                >
                  保留
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-2 py-0.5 rounded bg-red-600 text-white font-semibold"
                >
                  确认销毁
                </button>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between">
            {note && !isConfirmingDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>销毁奏帖</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg border border-[var(--border-color)] text-xs text-[var(--text-color)] hover:bg-[var(--search-bg)] cursor-pointer"
              >
                折返
              </button>
              <button
                type="submit"
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white text-xs font-semibold hover:bg-[var(--sakura-deep)]/90 shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>封缄保存</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
