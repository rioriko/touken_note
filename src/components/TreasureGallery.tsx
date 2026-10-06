import React, { useState, useRef, useMemo } from 'react';
import { TreasureItem, TreasureTag, DaozhangRecord } from '../types';
import {
  Gift,
  Upload,
  Plus,
  Trash2,
  X,
  Filter,
  Eye,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  Heart,
  ZoomIn,
  Camera,
  Grid,
  Layers,
  ArrowLeft,
  Check,
} from 'lucide-react';

interface TreasureGalleryProps {
  treasures: TreasureItem[];
  swords: DaozhangRecord[];
  onSaveTreasure: (item: TreasureItem) => void;
  onDeleteTreasure: (id: string) => void;
  filterSwordId?: string | null;
  onClearSwordFilter?: () => void;
  showToast: (msg: string) => void;
  onClose?: () => void;
}

const PRESET_TAGS: TreasureTag[] = [
  '男士肖像',
  '出阵战绩',
  '近侍手绘',
  '本丸景趣',
  '现世谷美',
  '特别机密',
];

export const TreasureGallery: React.FC<TreasureGalleryProps> = ({
  treasures,
  swords,
  onSaveTreasure,
  onDeleteTreasure,
  filterSwordId,
  onClearSwordFilter,
  showToast,
  onClose,
}) => {
  const [activeTag, setActiveTag] = useState<string>('全部');
  const [selectedSwordId, setSelectedSwordId] = useState<string>(filterSwordId || 'all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [lightboxItem, setLightboxItem] = useState<TreasureItem | null>(null);
  const [viewMode, setViewMode] = useState<'wall' | 'compact'>('wall');

  // Form states for adding/editing treasure
  const [formTitle, setFormTitle] = useState('');
  const [formTag, setFormTag] = useState<TreasureTag>('男士肖像');
  const [formSwordId, setFormSwordId] = useState<string>(filterSwordId || '');
  const [formCaption, setFormCaption] = useState('');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered treasures
  const filteredTreasures = useMemo(() => {
    return treasures.filter((item) => {
      const matchTag = activeTag === '全部' || item.tag === activeTag;
      const matchSword =
        selectedSwordId === 'all' || !selectedSwordId || item.swordId === selectedSwordId;
      return matchTag && matchSword;
    });
  }, [treasures, activeTag, selectedSwordId]);

  // Handle local image file upload with client-side canvas compression to save storage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('请选择有效的图片文件（JPG、PNG、WEBP 等）');
      return;
    }

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using canvas
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // 0.82 quality gives great visual fidelity with low byte size
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setImagePreview(compressedDataUrl);
          if (!formTitle) {
            const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
            setFormTitle(fileNameWithoutExt.slice(0, 24));
          }
        }
        setIsCompressing(false);
      };
      img.onerror = () => {
        setIsCompressing(false);
        showToast('图片加载失败，请重试');
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleOpenUpload = (presetSwordId?: string) => {
    setImagePreview('');
    setFormTitle('');
    setFormTag('男士肖像');
    setFormSwordId(presetSwordId || filterSwordId || '');
    setFormCaption('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setIsUploadModalOpen(true);
  };

  const handleSubmitTreasure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      showToast('请先选择或上传宝物照片');
      return;
    }

    const matchedSword = swords.find((s) => s.id === formSwordId);
    // Random subtle tilt between -3.5 and +3.5 deg for ins/polaroid wall feel
    const randomTilt = Math.round((Math.random() * 7 - 3.5) * 10) / 10;

    const newTreasure: TreasureItem = {
      id: `tr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: formTitle.trim() || '本丸宝藏留念',
      imageUrl: imagePreview,
      date: formDate || new Date().toISOString().split('T')[0],
      tag: formTag,
      swordId: formSwordId || undefined,
      swordName: matchedSword ? matchedSword.name : undefined,
      caption: formCaption.trim() || undefined,
      rotation: randomTilt,
    };

    onSaveTreasure(newTreasure);
    setIsUploadModalOpen(false);
    showToast(`宝物【${newTreasure.title}】已妥帖入藏！`);
  };

  const handleDeleteItem = (id: string, title: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onDeleteTreasure(id);
    if (lightboxItem?.id === id) {
      setLightboxItem(null);
    }
    showToast(`已将【${title}】从宝物库移除`);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[var(--card-bg)] text-[var(--text-color)]">
      {/* Top Bar inside TreasureGallery */}
      <div className="px-4 py-3 border-b border-[var(--sakura-pink)]/40 bg-[var(--search-bg)]/60 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--sakura-soft)] flex items-center justify-center text-[var(--header-red)] shadow-2xs">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-black text-sm text-[var(--header-red)] tracking-wider">
                本丸御宝物库
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[var(--sakura-soft)] text-[var(--sakura-deep)] border border-[var(--sakura-pink)]/40">
                {treasures.length} 件宝物
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-serif">
              ins风拍立得回廊挂饰墙 · 珍藏男士肖像、战绩留影与现世谷美
            </p>
          </div>
        </div>

        {/* View toggle and Upload Button */}
        <div className="flex items-center gap-2">
          {/* Wall vs Compact view */}
          <div className="flex items-center rounded-lg border border-[var(--border-color)] p-0.5 bg-[var(--panel-color)]">
            <button
              onClick={() => setViewMode('wall')}
              className={`p-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                viewMode === 'wall'
                  ? 'bg-[var(--sakura-deep)] text-white shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
              }`}
              title="ins风拍立得回廊相片墙"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                viewMode === 'compact'
                  ? 'bg-[var(--sakura-deep)] text-white shadow-2xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
              }`}
              title="精炼网格画廊"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => handleOpenUpload()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white hover:bg-[var(--sakura-deep)]/90 text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>收纳宝物</span>
          </button>
        </div>
      </div>

      {/* Filter and sword select bar */}
      <div className="px-4 py-2 border-b border-[var(--border-color)]/70 bg-[var(--panel-color)] flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Tag tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar max-w-full">
          <button
            onClick={() => setActiveTag('全部')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-serif transition-colors cursor-pointer shrink-0 ${
              activeTag === '全部'
                ? 'bg-[var(--sakura-soft)] text-[var(--sakura-deep)] font-bold border border-[var(--sakura-pink)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
            }`}
          >
            全部 ({treasures.length})
          </button>
          {PRESET_TAGS.map((t) => {
            const count = treasures.filter((x) => x.tag === t).length;
            return (
              <button
                key={t}
                onClick={() => setActiveTag(t)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-serif transition-colors cursor-pointer shrink-0 ${
                  activeTag === t
                    ? 'bg-[var(--sakura-soft)] text-[var(--sakura-deep)] font-bold border border-[var(--sakura-pink)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'
                }`}
              >
                {t} {count > 0 && <span className="opacity-70">({count})</span>}
              </button>
            );
          })}
        </div>

        {/* Sword dropdown selector */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <span className="text-[11px] text-[var(--text-muted)] font-serif">关联男士:</span>
          <select
            value={selectedSwordId}
            onChange={(e) => {
              setSelectedSwordId(e.target.value);
              if (onClearSwordFilter && e.target.value === 'all') {
                onClearSwordFilter();
              }
            }}
            className="text-[11px] px-2 py-1 rounded border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif focus:outline-hidden"
          >
            <option value="all">全本丸男士</option>
            {swords.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.number})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Wall Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[radial-gradient(#e0d7cb_1px,transparent_1px)] dark:bg-[radial-gradient(#3a3335_1px,transparent_1px)] [background-size:16px_16px]">
        {filteredTreasures.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--panel-color)]/80 max-w-md mx-auto space-y-3 p-6">
            <div className="w-14 h-14 rounded-full bg-[var(--sakura-soft)] flex items-center justify-center text-[var(--sakura-deep)] mx-auto shadow-2xs">
              <Gift className="w-7 h-7" />
            </div>
            <div className="font-serif font-bold text-sm text-[var(--text-color)]">
              {activeTag !== '全部' || selectedSwordId !== 'all'
                ? '此项分类下暂无入藏宝物'
                : '御宝物库尚虚位以待'}
            </div>
            <p className="text-xs text-[var(--text-muted)] font-serif leading-relaxed">
              可上传男士立绘特写、出阵胜利截屏、本丸春樱冬雪景趣，或是主殿珍藏的现世谷美照片。
            </p>
            <button
              onClick={() => handleOpenUpload(selectedSwordId !== 'all' ? selectedSwordId : undefined)}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--sakura-deep)] text-white text-xs font-serif font-bold hover:bg-[var(--sakura-deep)]/90 cursor-pointer shadow-md transition-all active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>呈递第一件宝物照片</span>
            </button>
          </div>
        ) : viewMode === 'wall' ? (
          /* INS Polaroids Wall Layout with wooden clips and slight tilt */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-7 items-start">
            {filteredTreasures.map((item, idx) => {
              const rot = typeof item.rotation === 'number' ? item.rotation : ((idx % 5) - 2) * 1.5;
              return (
                <div
                  key={item.id}
                  onClick={() => setLightboxItem(item)}
                  style={{
                    transform: `rotate(${rot}deg)`,
                  }}
                  className="group relative bg-[#fdfbf7] dark:bg-[#232023] p-3 pt-4 pb-4 rounded-md shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:rotate-0 hover:z-20 border border-[#e8dfd5] dark:border-[#42393d] cursor-pointer"
                >
                  {/* Decorative Washi Tape / Wooden Clip at Top */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 w-12 h-4 bg-[var(--sakura-pink)]/80 dark:bg-[var(--sakura-deep)]/80 shadow-xs border border-white/40 transform -rotate-2 rounded-2xs" />

                  {/* Photo Frame Container */}
                  <div className="relative aspect-4/3 sm:aspect-square w-full overflow-hidden rounded-xs bg-[#f4eee6] dark:bg-[#1a1718] border border-black/5 dark:border-white/5">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Tag badge floating */}
                    <div className="absolute top-2 left-2">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-serif font-bold bg-black/60 text-white backdrop-blur-xs">
                        {item.tag}
                      </span>
                    </div>

                    {/* Hover Overlay with Lightbox zoom icon */}
                    <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <span className="p-2 rounded-full bg-white/90 text-black shadow-md">
                        <ZoomIn className="w-4 h-4" />
                      </span>
                    </div>
                  </div>

                  {/* Polaroid Bottom Inscription Margin */}
                  <div className="mt-3 px-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-serif font-bold text-xs text-[#3c2f2f] dark:text-[#f3eee9] truncate">
                        {item.title}
                      </h4>
                      {item.swordName && (
                        <span className="shrink-0 text-[10px] font-serif px-1.5 py-0.2 rounded bg-[var(--sakura-soft)] text-[var(--sakura-deep)] border border-[var(--sakura-pink)]/30">
                          {item.swordName}
                        </span>
                      )}
                    </div>

                    {item.caption && (
                      <p className="mt-1 text-[11px] text-[#6e5d53] dark:text-[#b8aba4] font-serif line-clamp-2 leading-relaxed italic">
                        “{item.caption}”
                      </p>
                    )}

                    <div className="mt-2 pt-1.5 border-t border-[#eee4d8] dark:border-[#383134] flex items-center justify-between text-[10px] text-[#8e7e74] dark:text-[#8f8286] font-mono">
                      <span>{item.date}</span>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteItem(item.id, item.title, e)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:text-red-700 transition-opacity cursor-pointer"
                        title="自宝物库撤下"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Compact Gallery Grid Mode */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {filteredTreasures.map((item) => (
              <div
                key={item.id}
                onClick={() => setLightboxItem(item)}
                className="group relative rounded-xl overflow-hidden border border-[var(--border-color)] bg-[var(--panel-color)] shadow-xs hover:shadow-md cursor-pointer transition-all hover:-translate-y-1"
              >
                <div className="aspect-square w-full bg-[var(--search-bg)] relative overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <div className="absolute top-1.5 left-1.5">
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-serif font-bold bg-black/60 text-white backdrop-blur-xs">
                      {item.tag}
                    </span>
                  </div>
                </div>
                <div className="p-2 space-y-0.5">
                  <div className="font-serif font-bold text-xs truncate text-[var(--text-color)]">
                    {item.title}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
                    <span>{item.swordName || '通用'}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload/Add Treasure Modal */}
      {isUploadModalOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setIsUploadModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[var(--panel-color)] rounded-2xl shadow-2xl border border-[var(--sakura-pink)]/60 flex flex-col max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-[var(--sakura-pink)]/40 flex items-center justify-between bg-[var(--sakura-soft)]/40">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[var(--header-red)]" />
                <h3 className="font-serif font-bold text-sm text-[var(--header-red)]">
                  呈递宝物 · 珍藏入库
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitTreasure} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Image Picker with Preview */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-color)] mb-1 font-serif">
                  宝物照片 / 立绘截影 <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />

                {imagePreview ? (
                  <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden border-2 border-[var(--sakura-pink)] group bg-black/5">
                    <img
                      src={imagePreview}
                      alt="预览"
                      className="w-full h-full object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 text-white font-serif text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>更换照片</span>
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[var(--sakura-pink)]/70 rounded-xl p-6 text-center cursor-pointer hover:bg-[var(--sakura-soft)]/30 transition-colors space-y-2"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--sakura-soft)] flex items-center justify-center text-[var(--sakura-deep)] mx-auto">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div className="font-serif font-bold text-[var(--text-color)]">
                      {isCompressing ? '压缩并载入中...' : '点击上传本地照片 / 截屏'}
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] font-serif">
                      支持相册选取、手机拍照；客户端自适应轻量化序列化存储
                    </p>
                  </div>
                )}
              </div>

              {/* Title & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-color)] mb-1 font-serif">
                    宝物题名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="例：加州清光特上刀装连胜"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-color)] mb-1 font-serif">
                    宝物分类
                  </label>
                  <select
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value as TreasureTag)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif"
                  >
                    {PRESET_TAGS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Associate with Sword & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-color)] mb-1 font-serif">
                    绑定刀剑男士 (可选专属)
                  </label>
                  <select
                    value={formSwordId}
                    onChange={(e) => setFormSwordId(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif"
                  >
                    <option value="">-- 无特定归属 (全本丸) --</option>
                    {swords.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.number})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-color)] mb-1 font-serif">
                    留念收纳日期
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-mono"
                  />
                </div>
              </div>

              {/* Caption / Note */}
              <div>
                <label className="block text-xs font-semibold text-[var(--text-color)] mb-1 font-serif">
                  拍立得手帐回忆小注
                </label>
                <textarea
                  value={formCaption}
                  onChange={(e) => setFormCaption(e.target.value)}
                  rows={2}
                  placeholder="在此写下一两句当时出阵、锻刀或收到周边的悸动与回忆..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-[var(--border-color)] text-xs font-serif text-[var(--text-color)] hover:bg-[var(--search-bg)] cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!imagePreview || isCompressing}
                  className="px-5 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white text-xs font-serif font-bold hover:bg-[var(--sakura-deep)]/90 shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>正式入藏</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Modal (High definition view) */}
      {lightboxItem && (
        <div
          className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setLightboxItem(null)}
        >
          <div
            className="max-w-3xl w-full bg-[var(--panel-color)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--sakura-pink)] flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--search-bg)]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-serif font-bold bg-[var(--sakura-soft)] text-[var(--sakura-deep)]">
                  {lightboxItem.tag}
                </span>
                <h3 className="font-serif font-bold text-sm text-[var(--text-color)]">
                  {lightboxItem.title}
                </h3>
              </div>
              <button
                onClick={() => setLightboxItem(null)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Stage */}
            <div className="flex-1 bg-black/95 flex items-center justify-center p-3 overflow-hidden">
              <img
                src={lightboxItem.imageUrl}
                alt={lightboxItem.title}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded shadow-lg"
              />
            </div>

            {/* Footer Inscription details */}
            <div className="p-4 bg-[var(--panel-color)] border-t border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                {lightboxItem.caption ? (
                  <p className="text-xs font-serif text-[var(--text-color)] italic leading-relaxed">
                    “{lightboxItem.caption}”
                  </p>
                ) : (
                  <p className="text-[11px] font-serif text-[var(--text-muted)]">
                    此宝物尚未题写备忘小注。
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--text-muted)] font-mono">
                  {lightboxItem.swordName && (
                    <span className="font-serif text-[var(--sakura-deep)] font-semibold">
                      所属男士：{lightboxItem.swordName}
                    </span>
                  )}
                  <span>收纳时间：{lightboxItem.date}</span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteItem(lightboxItem.id, lightboxItem.title)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-serif cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>撤下此宝物</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
