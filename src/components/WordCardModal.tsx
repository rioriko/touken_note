import React, { useState } from 'react';
import { WordCard, BenwanConfig, Assistant } from '../types';
import {
  X,
  Plus,
  Trash2,
  Upload,
  Download,
  BookOpen,
  Sparkles,
  Search,
  Clock,
  Play,
  RotateCcw,
  Check,
  Edit2,
  FileText,
  Sliders,
  MessageSquareQuote,
} from 'lucide-react';
import { DEFAULT_WORD_CARDS } from '../wordCardData';

interface WordCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  wordCards: WordCard[];
  onSaveWordCards: (cards: WordCard[]) => void;
  config: BenwanConfig;
  onUpdateConfig: (config: Partial<BenwanConfig>) => void;
  assistant: Assistant;
  onTriggerBubbleTest: () => void;
  showToast: (msg: string, type?: 'info' | 'success' | 'warning') => void;
}

export const WordCardModal: React.FC<WordCardModalProps> = ({
  isOpen,
  onClose,
  wordCards,
  onSaveWordCards,
  config,
  onUpdateConfig,
  assistant,
  onTriggerBubbleTest,
  showToast,
}) => {
  // Tabs: 'input' (单条/批量录入), 'manage' (字卡列表), 'settings' (时长与弹出设置)
  const [activeTab, setActiveTab] = useState<'input' | 'manage'>('input');
  const [inputMode, setInputMode] = useState<'single' | 'batch'>('single');

  // Single card form
  const [singleText, setSingleText] = useState('');
  const [singleAuthor, setSingleAuthor] = useState(assistant.name || '');
  const [singleCategory, setSingleCategory] = useState('问候');

  // Batch card form
  const [batchText, setBatchText] = useState('');
  const [batchAuthor, setBatchAuthor] = useState(assistant.name || '');
  const [batchCategory, setBatchCategory] = useState('日常');

  // Search filter in manage list
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editCardText, setEditCardText] = useState('');
  const [editCardAuthor, setEditCardAuthor] = useState('');
  const [editCardCategory, setEditCardCategory] = useState('');

  // Interval duration preset options
  const INTERVAL_PRESETS = [
    { label: '30秒 (测试)', seconds: 30 },
    { label: '1分钟', seconds: 60 },
    { label: '3分钟', seconds: 180 },
    { label: '5分钟', seconds: 300 },
    { label: '10分钟', seconds: 600 },
    { label: '15分钟', seconds: 900 },
  ];

  if (!isOpen) return null;

  // Add single card
  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleText.trim()) {
      showToast('请输入字卡台词或语录内容', 'warning');
      return;
    }
    const newCard: WordCard = {
      id: `card-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      text: singleText.trim(),
      author: singleAuthor.trim() || assistant.name || '近侍',
      category: singleCategory.trim() || '日常',
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newCard, ...wordCards];
    onSaveWordCards(updated);
    setSingleText('');
    showToast(`已成功收录字卡【${newCard.author}】：${newCard.text.slice(0, 12)}...`, 'success');
  };

  // Add batch cards
  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchText.trim()) {
      showToast('请输入至少一条字卡内容', 'warning');
      return;
    }
    const lines = batchText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      showToast('未检测到有效文本内容', 'warning');
      return;
    }

    const newCards: WordCard[] = lines.map((line, idx) => {
      // If line has "作者: 内容" or "【作者】内容", parse intelligently
      let author = batchAuthor.trim() || assistant.name || '近侍';
      let content = line;
      const bracketMatch = line.match(/^【(.*?)】\s*(.+)$/);
      if (bracketMatch) {
        author = bracketMatch[1];
        content = bracketMatch[2];
      } else {
        const colonMatch = line.match(/^([^：:]{1,10})[：:]\s*(.+)$/);
        if (colonMatch) {
          author = colonMatch[1];
          content = colonMatch[2];
        }
      }

      return {
        id: `card-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        text: content,
        author,
        category: batchCategory.trim() || '日常',
        createdAt: new Date().toISOString().split('T')[0],
      };
    });

    const updated = [...newCards, ...wordCards];
    onSaveWordCards(updated);
    setBatchText('');
    showToast(`批量录入成功！新增收录 ${newCards.length} 振言叶字卡`, 'success');
  };

  // Delete card
  const handleDeleteCard = (id: string) => {
    const updated = wordCards.filter((c) => c.id !== id);
    onSaveWordCards(updated);
    showToast('已移除该振字卡');
  };

  // Start inline edit
  const handleStartEdit = (card: WordCard) => {
    setEditingCardId(card.id);
    setEditCardText(card.text);
    setEditCardAuthor(card.author || '');
    setEditCardCategory(card.category || '');
  };

  // Save inline edit
  const handleSaveEdit = (id: string) => {
    if (!editCardText.trim()) return;
    const updated = wordCards.map((c) => {
      if (c.id === id) {
        return {
          ...c,
          text: editCardText.trim(),
          author: editCardAuthor.trim() || assistant.name || '近侍',
          category: editCardCategory.trim() || '日常',
        };
      }
      return c;
    });
    onSaveWordCards(updated);
    setEditingCardId(null);
    showToast('字卡修订已保存', 'success');
  };

  // Load preset templates
  const handleLoadPresets = () => {
    const existingTexts = new Set(wordCards.map((c) => c.text));
    const toAdd = DEFAULT_WORD_CARDS.filter((p) => !existingTexts.has(p.text));
    if (toAdd.length === 0) {
      showToast('典范字卡库已全部在库中，无需重复导入', 'info');
      return;
    }
    const updated = [...wordCards, ...toAdd];
    onSaveWordCards(updated);
    showToast(`已增补导入 ${toAdd.length} 振经典近侍语录范本！`, 'success');
  };

  // Upload file (txt or json)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
              onSaveWordCards(updated);
              showToast(`从 JSON 成功载入 ${validCards.length} 振字卡！`, 'success');
            } else {
              showToast('未能从文件中解析出有效字卡', 'warning');
            }
          }
        } else {
          // Plain text: one quote per line
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
            onSaveWordCards(updated);
            showToast(`从 TXT 文档顺利导入 ${newCards.length} 振字卡！`, 'success');
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

  // Export word cards (TXT or JSON)
  const handleExportTxt = () => {
    if (wordCards.length === 0) {
      showToast('当前暂无可导出的字卡', 'warning');
      return;
    }
    const lines = wordCards.map((c) => `【${c.author || assistant.name}】${c.text}`);
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `本丸近侍言叶字卡_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('已导出纯文本字卡文卷', 'success');
  };

  // Clear all
  const handleClearAll = () => {
    if (window.confirm('确定要清空字卡语库中的所有内容吗？此操作不可逆。')) {
      onSaveWordCards([]);
      showToast('已清空字卡语库');
    }
  };

  // Filtered list
  const filteredCards = wordCards.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.text.toLowerCase().includes(q) ||
      (c.author && c.author.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q))
    );
  });

  const currentInterval = config.bubbleInterval || 60;
  const isBubbleEnabled = config.bubbleEnabled !== false;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[var(--panel-color)] rounded-2xl shadow-2xl border border-[var(--sakura-pink)]/70 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[var(--sakura-pink)]/40 flex items-center justify-between bg-[var(--sakura-soft)]/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--sakura-deep)] text-white flex items-center justify-center shadow-xs">
              <MessageSquareQuote className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--header-red)] font-serif tracking-wider">
                  近侍言叶字卡录
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[var(--sakura-deep)] text-white text-[10px] font-mono">
                  共 {wordCards.length} 振字卡
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-serif">
                自定义近侍台词与寄语语库 · 定时随机抽取气泡呈递
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Quick Config Bar: Interval & Bubble Toggle */}
        <div className="px-5 py-3 border-b border-[var(--border-color)] bg-[var(--search-bg)]/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 font-serif font-bold text-[var(--text-color)]">
              <Clock className="w-3.5 h-3.5 text-[var(--sakura-deep)]" />
              <span>气泡弹出间隔：</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {INTERVAL_PRESETS.map((p) => {
                const isSelected = currentInterval === p.seconds;
                return (
                  <button
                    key={p.seconds}
                    type="button"
                    onClick={() => {
                      onUpdateConfig({ bubbleInterval: p.seconds });
                      showToast(`已调整气泡问候间隔为【${p.label}】`);
                    }}
                    className={`px-2 py-0.8 rounded text-[11px] font-serif transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[var(--sakura-deep)] text-white font-bold shadow-2xs'
                        : 'bg-[var(--panel-color)] text-[var(--text-muted)] hover:text-[var(--text-color)] border border-[var(--border-color)]'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Switch */}
            <label className="flex items-center gap-2 cursor-pointer font-serif text-[11px]">
              <span className="text-[var(--text-color)]">
                气泡问候：<strong>{isBubbleEnabled ? '开启中' : '已静候'}</strong>
              </span>
              <input
                type="checkbox"
                checked={isBubbleEnabled}
                onChange={(e) => {
                  onUpdateConfig({ bubbleEnabled: e.target.checked });
                  showToast(e.target.checked ? '已开启近侍气泡问候' : '已关闭近侍气泡问候');
                }}
                className="sr-only peer"
              />
              <div className="w-8 h-4.5 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[var(--sakura-deep)] relative"></div>
            </label>

            {/* Test Trigger Button */}
            <button
              type="button"
              onClick={onTriggerBubbleTest}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--sakura-soft)] text-[var(--sakura-deep)] border border-[var(--sakura-pink)] hover:bg-[var(--sakura-pink)]/40 font-serif text-[11px] font-bold cursor-pointer transition-colors"
              title="在左下角立即展示气泡"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>立即抽取测试</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[var(--border-color)] px-5 pt-2 bg-[var(--panel-color)] gap-4 text-xs font-serif font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('input')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'input'
                ? 'border-[var(--sakura-deep)] text-[var(--sakura-deep)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>输入字卡 (录入与上传)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manage')}
            className={`pb-2 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'manage'
                ? 'border-[var(--sakura-deep)] text-[var(--sakura-deep)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>检视与管理字库 ({wordCards.length})</span>
          </button>
        </div>

        {/* Tab 1: Input & Import */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {activeTab === 'input' ? (
            <div className="space-y-5">
              {/* Top Sub-Mode Toggle: Single Card vs Batch Card */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInputMode('single')}
                    className={`px-3 py-1.5 rounded-lg font-serif transition-colors cursor-pointer ${
                      inputMode === 'single'
                        ? 'bg-[var(--sakura-deep)] text-white font-bold shadow-2xs'
                        : 'bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)] border border-[var(--border-color)]'
                    }`}
                  >
                    单条精致录入
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('batch')}
                    className={`px-3 py-1.5 rounded-lg font-serif transition-colors cursor-pointer ${
                      inputMode === 'batch'
                        ? 'bg-[var(--sakura-deep)] text-white font-bold shadow-2xs'
                        : 'bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)] border border-[var(--border-color)]'
                    }`}
                  >
                    多行批量输入 (换行即一条)
                  </button>
                </div>

                {/* Import & Presets Quick Actions */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] hover:border-[var(--sakura-deep)] font-serif cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                    <span>上传字卡 (TXT/JSON)</span>
                    <input
                      type="file"
                      accept=".txt,.json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleLoadPresets}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--sakura-pink)] bg-[var(--sakura-soft)] text-[var(--sakura-deep)] hover:bg-[var(--sakura-pink)]/40 font-serif font-bold cursor-pointer transition-colors"
                    title="载入官方整理的20振经典台词与问候"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>载入典范范本</span>
                  </button>
                </div>
              </div>

              {/* Input Form */}
              {inputMode === 'single' ? (
                <form onSubmit={handleAddSingle} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-color)] mb-1 font-serif">
                        发言刀剑男士 / 出处
                      </label>
                      <input
                        type="text"
                        value={singleAuthor}
                        onChange={(e) => setSingleAuthor(e.target.value)}
                        placeholder={`默认近侍：${assistant.name || '近侍'}`}
                        className="w-full px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-color)] mb-1 font-serif">
                        语录分类标签
                      </label>
                      <div className="flex gap-1.5">
                        {['问候', '日常', '关怀', '激励', '玄学'].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setSingleCategory(cat)}
                            className={`px-2 py-1 rounded text-[10px] font-serif transition-colors cursor-pointer ${
                              singleCategory === cat
                                ? 'bg-[var(--sakura-deep)] text-white font-bold'
                                : 'bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)] border border-[var(--border-color)]'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-color)] mb-1 font-serif">
                      字卡言叶内容 (气泡展示的台词) *
                    </label>
                    <textarea
                      value={singleText}
                      onChange={(e) => setSingleText(e.target.value)}
                      placeholder="例：今天我有可爱一点吗？主，也要多宠爱我一些哦。"
                      rows={3}
                      className="w-full p-3 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif leading-relaxed focus:outline-hidden focus:border-[var(--sakura-deep)]"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--sakura-deep)] text-white font-serif font-bold text-xs shadow-xs hover:bg-[var(--sakura-deep)]/90 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>收录并保存此字卡</span>
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleAddBatch} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-color)] mb-1 font-serif">
                        默认作者名 (若某行无指定作者时采用)
                      </label>
                      <input
                        type="text"
                        value={batchAuthor}
                        onChange={(e) => setBatchAuthor(e.target.value)}
                        placeholder={`默认：${assistant.name || '近侍'}`}
                        className="w-full px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--text-color)] mb-1 font-serif">
                        默认分类
                      </label>
                      <input
                        type="text"
                        value={batchCategory}
                        onChange={(e) => setBatchCategory(e.target.value)}
                        placeholder="例：日常 / 随笔"
                        className="w-full px-3 py-1.5 rounded-md border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-color)] mb-1 font-serif">
                      批量输入语录 (每行一条字卡；可写【刀剑男士】台词 或 直接写台词) *
                    </label>
                    <textarea
                      value={batchText}
                      onChange={(e) => setBatchText(e.target.value)}
                      placeholder={`【加州清光】今天我有可爱一点吗？主，也要多宠爱我一些哦。\n【山姥切国广】……不要看着我。说我是冒牌货吧？\n【三日月宗近】哈哈哈，甚好甚好。今日也辛苦了，主公。\n主殿，回廊的风很轻柔，要一起喝杯茶吗？`}
                      rows={6}
                      className="w-full p-3 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif leading-relaxed font-mono focus:outline-hidden focus:border-[var(--sakura-deep)] text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--text-muted)] font-serif">
                      提示：支持从记事本或网页直接全选复制粘贴，系统会自动逐行拆分为独立字卡。
                    </span>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--sakura-deep)] text-white font-serif font-bold text-xs shadow-xs hover:bg-[var(--sakura-deep)]/90 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>批量录入并保存</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Quick Preview of Last Added Cards */}
              <div className="pt-4 border-t border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-serif font-bold text-xs text-[var(--header-red)]">
                    📜 最近录入的字卡 (前 3 振)
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('manage')}
                    className="text-[11px] text-[var(--sakura-deep)] hover:underline cursor-pointer font-serif"
                  >
                    查看全部 {wordCards.length} 振 ➔
                  </button>
                </div>

                {wordCards.length === 0 ? (
                  <div className="p-4 rounded-lg bg-[var(--search-bg)] text-center text-[var(--text-muted)] font-serif">
                    字卡库尚无收录，您可以手动输入或点击上方「载入典范范本」快速填充！
                  </div>
                ) : (
                  <div className="space-y-2">
                    {wordCards.slice(0, 3).map((c) => (
                      <div
                        key={c.id}
                        className="p-2.5 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] flex items-start justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="font-serif font-bold text-xs text-[var(--sakura-deep)]">
                              【{c.author || assistant.name}】
                            </span>
                            {c.category && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-[var(--sakura-soft)] text-[var(--sakura-deep)] border border-[var(--sakura-pink)]/30 font-serif">
                                {c.category}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-serif text-[var(--text-color)] line-clamp-1">
                            “{c.text}”
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Tab 2: Manage word cards */
            <div className="space-y-4">
              {/* Search & Actions Bar */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="relative flex-1 min-w-[12rem]">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="搜索字卡内容、男士名讳或分类..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif text-xs"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportTxt}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] hover:border-[var(--sakura-deep)] font-serif cursor-pointer"
                    title="导出为纯文本文件"
                  >
                    <Download className="w-3 h-3 text-[var(--sakura-deep)]" />
                    <span>导出TXT</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-red-300 dark:border-red-900 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-300 hover:bg-red-100 font-serif cursor-pointer"
                    title="清空所有字卡"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>清空字库</span>
                  </button>
                </div>
              </div>

              {/* Cards List */}
              <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
                {filteredCards.length === 0 ? (
                  <div className="p-8 rounded-xl bg-[var(--search-bg)] text-center text-[var(--text-muted)] font-serif">
                    未找到相符的字卡。可切换至「输入字卡」增录或点击「载入典范范本」。
                  </div>
                ) : (
                  filteredCards.map((c) => {
                    const isEditing = editingCardId === c.id;
                    return (
                      <div
                        key={c.id}
                        className="p-3 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] space-y-2 transition-all hover:border-[var(--sakura-pink)]"
                      >
                        {isEditing ? (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                value={editCardAuthor}
                                onChange={(e) => setEditCardAuthor(e.target.value)}
                                placeholder="刀剑名讳"
                                className="px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-serif text-xs"
                              />
                              <input
                                type="text"
                                value={editCardCategory}
                                onChange={(e) => setEditCardCategory(e.target.value)}
                                placeholder="分类标签"
                                className="px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-serif text-xs"
                              />
                            </div>
                            <textarea
                              value={editCardText}
                              onChange={(e) => setEditCardText(e.target.value)}
                              rows={2}
                              className="w-full p-2 rounded border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-serif text-xs"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingCardId(null)}
                                className="px-2.5 py-1 rounded border border-[var(--border-color)] text-[var(--text-muted)] font-serif cursor-pointer"
                              >
                                取消
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(c.id)}
                                className="px-3 py-1 rounded bg-[var(--sakura-deep)] text-white font-serif font-bold cursor-pointer"
                              >
                                保存修订
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-serif font-bold text-xs text-[var(--header-red)]">
                                  【{c.author || assistant.name}】
                                </span>
                                {c.category && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-[var(--sakura-soft)] text-[var(--sakura-deep)] border border-[var(--sakura-pink)]/30 font-serif">
                                    {c.category}
                                  </span>
                                )}
                                {c.createdAt && (
                                  <span className="text-[9px] text-[var(--text-muted)] font-mono">
                                    {c.createdAt}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-serif text-[var(--text-color)] leading-relaxed">
                                “{c.text}”
                              </p>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEdit(c)}
                                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--panel-color)] cursor-pointer"
                                title="编辑字卡"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCard(c.id)}
                                className="p-1 rounded text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
                                title="移除字卡"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--search-bg)]/40 flex items-center justify-between text-xs">
          <span className="text-[11px] text-[var(--text-muted)] font-serif">
            近侍将以每 {currentInterval} 秒在主界面随机抽取并弹出气泡
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white text-xs font-semibold hover:bg-[var(--sakura-deep)]/90 cursor-pointer shadow-xs font-serif"
          >
            保存并退下
          </button>
        </div>
      </div>
    </div>
  );
};
