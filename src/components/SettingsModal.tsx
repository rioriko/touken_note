import React from 'react';
import { BenwanConfig, ColorTheme } from '../types';
import { X, Moon, Sun, Monitor, Download, Upload, ShieldAlert, Sparkles, BookOpen, Palette, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BenwanConfig;
  onUpdateConfig: (config: Partial<BenwanConfig>) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLoadPresetSwords: () => void;
  onLoadPresetNeiban?: () => void;
  showToast: (msg: string) => void;
}

const COLOR_THEMES: {
  id: ColorTheme;
  name: string;
  tagline: string;
  lightDesc: string;
  darkDesc: string;
  previewClass: string;
  badgeColor: string;
}[] = [
  {
    id: 'sakura',
    name: '樱',
    tagline: '初春盛景 · 樱花本丸',
    lightDesc: '粉樱落雪与暖白雅致',
    darkDesc: '玄夜静阑与深绯绯樱',
    previewClass: 'from-[#fdf0f2] via-[#f8c3cd] to-[#e06a68]',
    badgeColor: '#e06a68',
  },
  {
    id: 'koubai',
    name: '红梅',
    tagline: '踏雪寻梅 · 正红本丸',
    lightDesc: '正红梅赤与绢白纸本',
    darkDesc: '漆夜玄炭与炽红火梅',
    previewClass: 'from-[#fdf0ee] via-[#f5b5b1] to-[#a51d24]',
    badgeColor: '#a51d24',
  },
  {
    id: 'take',
    name: '竹',
    tagline: '空山幽篁 · 翠竹本丸',
    lightDesc: '低饱和幽篁青与青白宣纸',
    darkDesc: '墨竹青玄与静夜幽篁翠',
    previewClass: 'from-[#eff5f0] via-[#bcd5c1] to-[#2d5a3c]',
    badgeColor: '#2d5a3c',
  },
  {
    id: 'fuji',
    name: '富士',
    tagline: '雪山灵峰 · 灵曜本丸',
    lightDesc: '雪白、雾白、富士浅蓝、山影蓝与富士金',
    darkDesc: '富士夜空、深蓝灰、冰川蓝与月下金',
    previewClass: 'from-[#FCFCFA] via-[#B9D4E3] to-[#7FA9C0]',
    badgeColor: '#7FA9C0',
  },
  {
    id: 'wisteria',
    name: '紫藤',
    tagline: '紫藤漫垂 · 幽夜本丸',
    lightDesc: '靛蓝至紫藤渐变晕染',
    darkDesc: '玄靛深夜与幽月荧紫',
    previewClass: 'from-[#f3effc] via-[#d0c2ee] to-[#513693]',
    badgeColor: '#513693',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateConfig,
  onExportData,
  onImportData,
  onLoadPresetSwords,
  onLoadPresetNeiban,
  showToast,
}) => {
  if (!isOpen) return null;

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
          <h3 className="text-base font-bold text-[var(--header-red)] font-serif tracking-wider">
            本丸常务与配置
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col gap-5 overflow-y-auto text-xs">
          {/* Section 0: 本丸名号与审神者尊号 */}
          <div className="space-y-3 pb-4 border-b border-[var(--border-color)]">
            <h4 className="font-bold text-[var(--header-red)] text-sm flex items-center gap-1.5 font-serif">
              <Sparkles className="w-4 h-4" />
              本丸名册与尊号
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)]">
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-color)] mb-1 font-serif">
                  审神者名讳 / 尊号
                </label>
                <input
                  type="text"
                  value={config.saniwaName || ''}
                  onChange={(e) => onUpdateConfig({ saniwaName: e.target.value })}
                  placeholder="例：主殿"
                  className="w-full px-3 py-1.5 text-xs rounded-md border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-serif"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[var(--text-color)] mb-1 font-serif">
                  本丸名号 (当前为: {config.honmaruName || '大和'}_本丸)
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={config.honmaruName || ''}
                    onChange={(e) => onUpdateConfig({ honmaruName: e.target.value })}
                    placeholder="例：大和、相模、浅樱"
                    className="flex-1 px-3 py-1.5 text-xs rounded-md border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] font-serif font-bold"
                  />
                  <span className="text-[11px] font-serif text-[var(--text-muted)] px-1.5 py-1 rounded bg-[var(--panel-color)] border border-[var(--border-color)]">
                    _本丸
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: 常务 */}
          <div className="space-y-3 pb-4 border-b border-[var(--border-color)]">
            <h4 className="font-bold text-[var(--header-red)] text-sm flex items-center gap-1.5 font-serif">
              <ShieldAlert className="w-4 h-4" />
              常务防误
            </h4>
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)]">
              <div>
                <span className="font-semibold text-[var(--text-color)] block">
                  销毁前需要请示 (二次确认)
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  销毁奏帖或刀剑档案时弹出警示，防止失手删改。
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.confirmDelete}
                  onChange={(e) => onUpdateConfig({ confirmDelete: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--sakura-deep)]"></div>
              </label>
            </div>
          </div>

          {/* Section 2: 本丸雅意色系 (Color Themes) */}
          <div className="space-y-3 pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[var(--header-red)] text-sm flex items-center gap-1.5 font-serif">
                <Palette className="w-4 h-4" />
                本丸景致色调 (五色雅意)
              </h4>
              <span className="text-[11px] text-[var(--text-muted)] font-serif">
                当前：{COLOR_THEMES.find((t) => t.id === (config.colorTheme || 'sakura'))?.name || '樱'}
              </span>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              自选审神者心仪之庭院色系，白昼与夜阑模式均经过精心配色调校：
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {COLOR_THEMES.map((themeItem) => {
                const isSelected = (config.colorTheme || 'sakura') === themeItem.id;
                return (
                  <button
                    key={themeItem.id}
                    type="button"
                    onClick={() => {
                      onUpdateConfig({ colorTheme: themeItem.id });
                      showToast(`已更换本丸景致色调为【${themeItem.name}】`);
                    }}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-[var(--sakura-deep)] bg-[var(--sakura-soft)] shadow-sm'
                        : 'border-[var(--border-color)] bg-[var(--search-bg)] hover:border-[var(--sakura-pink)]'
                    }`}
                  >
                    {/* Visual Color Swatch */}
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${themeItem.previewClass} shadow-2xs border border-black/10 shrink-0 flex items-center justify-center`}
                    >
                      {isSelected && (
                        <Check className="w-4 h-4 text-white drop-shadow-md stroke-[3]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-serif font-bold text-xs text-[var(--text-color)]">
                          {themeItem.name}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] font-serif">
                          {themeItem.tagline.split('·')[0].trim()}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-snug truncate">
                        昼: {themeItem.lightDesc}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] mt-0.2 leading-snug truncate">
                        夜: {themeItem.darkDesc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2.5: 日夜交替 (Theme Mode) */}
          <div className="space-y-3 pb-4 border-b border-[var(--border-color)]">
            <h4 className="font-bold text-[var(--header-red)] text-sm flex items-center gap-1.5 font-serif">
              <Moon className="w-4 h-4" />
              日夜交替 (明暗模式)
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdateConfig({ theme: 'light' })}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  config.theme === 'light'
                    ? 'border-[var(--sakura-deep)] bg-[var(--sakura-soft)] text-[var(--header-red)] font-bold shadow-2xs'
                    : 'border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
                }`}
              >
                <Sun className="w-5 h-5 text-[var(--accent-gold)]" />
                <span>白昼 (亮色)</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateConfig({ theme: 'dark' })}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  config.theme === 'dark'
                    ? 'border-[var(--sakura-deep)] bg-[var(--sakura-soft)] text-[var(--header-red)] font-bold shadow-2xs'
                    : 'border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
                }`}
              >
                <Moon className="w-5 h-5 text-[var(--sakura-deep)]" />
                <span>夜阑 (暗色)</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateConfig({ theme: 'system' })}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  config.theme === 'system'
                    ? 'border-[var(--sakura-deep)] bg-[var(--sakura-soft)] text-[var(--header-red)] font-bold shadow-2xs'
                    : 'border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
                }`}
              >
                <Monitor className="w-5 h-5 text-[var(--text-muted)]" />
                <span>顺应天时</span>
              </button>
            </div>
          </div>

          {/* Section 3: 卷宗交接 (Data Backup & Import) */}
          <div className="space-y-3 pb-4 border-b border-[var(--border-color)]">
            <h4 className="font-bold text-[var(--header-red)] text-sm flex items-center gap-1.5 font-serif">
              <Download className="w-4 h-4" />
              卷宗交接 (数据备份与导入)
            </h4>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              将奏帖、内番当值名册、本丸刀账及近侍配置打包为 JSON 卷宗。更换设备或清理浏览器时可随时导入恢复。
            </p>

            <div className="flex flex-wrap gap-2.5 items-center">
              <button
                onClick={onExportData}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-[var(--sakura-deep)] font-medium cursor-pointer shadow-2xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-[var(--sakura-deep)]" />
                <span>导出本丸卷宗</span>
              </button>

              <label className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)] text-[var(--text-color)] hover:border-[var(--sakura-deep)] font-medium cursor-pointer shadow-2xs transition-colors">
                <Upload className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                <span>导入卷宗文件</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportData}
                  className="hidden"
                />
              </label>

              <button
                onClick={onLoadPresetSwords}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--sakura-soft)] border border-[var(--sakura-pink)] text-[var(--sakura-deep)] hover:bg-[var(--sakura-pink)]/40 font-medium cursor-pointer transition-colors"
                title="载入14振经典刀剑示范数据"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>载入典范刀账</span>
              </button>

              {onLoadPresetNeiban && (
                <button
                  onClick={onLoadPresetNeiban}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 font-medium cursor-pointer transition-colors"
                  title="载入内番当值示例数据"
                >
                  <span>🌾</span>
                  <span>载入内番示例</span>
                </button>
              )}
            </div>
          </div>

          {/* Section 4: 题词 */}
          <div className="space-y-2">
            <h4 className="font-bold text-[var(--header-red)] text-sm flex items-center gap-1.5 font-serif">
              <Sparkles className="w-4 h-4" />
              本丸题词与主殿铭文
            </h4>
            <textarea
              value={config.about}
              onChange={(e) => onUpdateConfig({ about: e.target.value })}
              rows={3}
              placeholder="在此写下致主殿或近侍的勉励之辞..."
              className="w-full p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] leading-relaxed focus:outline-hidden focus:border-[var(--sakura-deep)] font-serif"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--search-bg)]/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--sakura-deep)] text-white text-xs font-semibold hover:bg-[var(--sakura-deep)]/90 cursor-pointer shadow-xs"
          >
            退下
          </button>
        </div>
      </div>
    </div>
  );
};
