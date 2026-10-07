import React, { useState, useRef } from 'react';
import { BenwanConfig, ColorTheme, SceneryType, AmbientSoundType } from '../types';
import {
  X,
  Moon,
  Sun,
  Monitor,
  Download,
  Upload,
  ShieldAlert,
  Sparkles,
  BookOpen,
  Palette,
  Check,
  History,
  ChevronDown,
  ChevronUp,
  Tag,
  Smartphone,
  Share2,
  Volume2,
  VolumeX,
  Wind,
  Music,
  Droplets,
  Feather,
  Bell,
  Trash2,
} from 'lucide-react';
import { soundManager } from '../utils/soundManager';
import {
  APP_VERSION,
  APP_FULL_TITLE,
  APP_DEFAULT_ABOUT,
  CHANGELOG_HISTORY,
} from '../changelogData';
import { MikazukiIcon } from './MikazukiIcon';

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
  const [showChangelog, setShowChangelog] = useState(false);
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
          <div>
            <h3 className="text-base font-bold text-[var(--header-red)] font-serif tracking-wider">
              本丸常务与配置
            </h3>
            <span className="text-[10px] text-[var(--text-muted)] font-serif">
              {APP_FULL_TITLE} · {APP_VERSION}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-color)] hover:bg-[var(--search-bg)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col gap-5 overflow-y-auto text-xs">
          {/* Section 0: 本丸名号与审神者尊号 (置顶最先展现) */}
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

          {/* Official Tool Announcement & Expandable Changelog Banner (置于名册下方) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-[var(--sakura-soft)]/70 to-[var(--search-bg)] border border-[var(--sakura-pink)]/60 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold font-serif text-[var(--header-red)]">
                <Tag className="w-3.5 h-3.5 text-[var(--sakura-deep)]" />
                <span>{APP_FULL_TITLE}</span>
                <span className="px-1.5 py-0.2 rounded-full bg-[var(--sakura-deep)] text-white text-[9px] font-mono">
                  {APP_VERSION}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowChangelog((prev) => !prev)}
                className="flex items-center gap-1 text-[11px] font-serif text-[var(--sakura-deep)] hover:underline cursor-pointer font-medium"
              >
                <History className="w-3.5 h-3.5" />
                <span>{showChangelog ? '收起更新日志' : '查看更新日志'}</span>
                {showChangelog ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--text-color)] font-serif opacity-90">
              专为审神者量身构筑的日常事务随笔、内番名册排班与刀账册管理工具。跨越千年流光，于现代静守本丸岁月。
            </p>

            {/* Expandable Changelog Component */}
            {showChangelog && (
              <div className="mt-3 pt-3 border-t border-[var(--sakura-pink)]/40 space-y-3 animate-fadeIn">
                <div className="text-[11px] font-bold font-serif text-[var(--text-color)] flex items-center justify-between">
                  <span>📜 历朝更新日志与版本履历</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">最新发布：{CHANGELOG_HISTORY[0].version}</span>
                </div>
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {CHANGELOG_HISTORY.map((rel) => (
                    <div
                      key={rel.version}
                      className="p-2.5 rounded-lg bg-[var(--panel-color)] border border-[var(--border-color)] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-serif font-bold text-[var(--text-color)] text-xs">
                          <span className="font-mono text-[var(--sakura-deep)]">{rel.version}</span>
                          <span>·</span>
                          <span>{rel.title}</span>
                          {rel.badge && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-sans">
                              {rel.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">{rel.date}</span>
                      </div>
                      <ul className="space-y-1 text-[11px] text-[var(--text-color)] opacity-90 font-serif list-none pl-0">
                        {rel.highlights.map((h, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-[var(--accent-gold)] shrink-0">•</span>
                            <span className="leading-snug">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section: 手机桌面App封面与封装 */}
          <div className="space-y-3 pb-4 border-b border-[var(--border-color)]">
            <h4 className="font-bold text-[var(--header-red)] text-sm flex items-center gap-1.5 font-serif">
              <Smartphone className="w-4 h-4" />
              手机 App 桌面封装与封面
            </h4>

            <div className="p-3.5 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] space-y-3">
              <div className="flex items-center gap-3">
                {/* 100% Reliable Inline Vector Icon Preview */}
                <div className="w-13 h-13 rounded-2xl shadow-md border border-[var(--sakura-pink)] overflow-hidden shrink-0 bg-[#0f1123] flex items-center justify-center p-0.5">
                  <MikazukiIcon className="w-full h-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-black text-sm text-[var(--text-color)]">
                      本丸手札
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--sakura-soft)] text-[var(--sakura-deep)] text-[10px] font-mono border border-[var(--sakura-pink)]/40 font-semibold">
                      桌面应用名
                    </span>
                  </div>
                </div>
              </div>

              {/* Install guide tip box */}
              <div className="p-2.5 rounded-lg bg-[var(--panel-color)] border border-[var(--border-color)] text-[11px] font-serif space-y-1.5 text-[var(--text-color)] opacity-95">
                <div className="flex items-center gap-1 font-bold text-[var(--header-red)]">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>如何一键“添加到手机主屏幕”？</span>
                </div>
                <div className="space-y-1 pl-1 text-[11px] leading-relaxed">
                  <p>
                    • <strong>苹果 iPhone / iPad (Safari 浏览器)</strong>：点击底部的「<strong>分享</strong>」按钮（带箭头的方框）➔ 往下滑动并选择「<strong>添加到主屏幕</strong>」➔ 点击「添加」。
                  </p>
                  <p>
                    • <strong>安卓设备 (Chrome / 手机自带浏览器)</strong>：点击右上角「<strong>⋮ 菜单</strong>」➔ 选择「<strong>安装应用</strong>」或「<strong>添加到主屏幕</strong>」。
                  </p>
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

          {/* Section: 时令景趣轻动效 (Seasonal Scenery) */}
          <div className="space-y-3 pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[var(--header-red)] text-sm flex items-center gap-1.5 font-serif">
                <Wind className="w-4 h-4" />
                本丸时令景趣 (轻盈动效)
              </h4>
              <span className="text-[11px] text-[var(--text-muted)] font-serif">
                当前：{
                  {
                    sakura: '春樱纷落',
                    maple: '秋枫红叶',
                    snow: '冬日初雪',
                    firefly: '夏夜流萤',
                    none: '静水无动',
                  }[config.scenery || 'sakura']
                }
              </span>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed font-serif">
              轻量纯净动效，微风过处庭院花瓣与流萤轻泛（极度省电，可自由停歇）：
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'sakura' as SceneryType, name: '春樱纷落', icon: '🌸', desc: '粉樱飘曳' },
                { id: 'maple' as SceneryType, name: '秋枫红叶', icon: '🍁', desc: '丹枫飘落' },
                { id: 'snow' as SceneryType, name: '冬日初雪', icon: '❄️', desc: '轻雪纷飞' },
                { id: 'firefly' as SceneryType, name: '夏夜流萤', icon: '✨', desc: '幽微萤火' },
                { id: 'none' as SceneryType, name: '静寂清屏', icon: '🍃', desc: '关闭动效' },
              ].map((sc) => {
                const isSelected = (config.scenery || 'sakura') === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      onUpdateConfig({ scenery: sc.id });
                      showToast(`已更换时令景趣为【${sc.name}】`);
                    }}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--sakura-deep)] bg-[var(--sakura-soft)] text-[var(--header-red)] font-bold shadow-2xs'
                        : 'border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    <span className="text-lg">{sc.icon}</span>
                    <span className="text-xs font-serif">{sc.name}</span>
                    <span className="text-[9px] opacity-75 font-serif">{sc.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: 回廊环境音律与手帐触控音效 (Ambient Soundscape) */}
          <div className="space-y-3 pb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[var(--header-red)] text-sm flex items-center gap-1.5 font-serif">
                <Music className="w-4 h-4" />
                回廊和风音律与触控声景
              </h4>

              {/* Master Audio Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.audioEnabled || false}
                  onChange={(e) => {
                    const enabled = e.target.checked;
                    onUpdateConfig({ audioEnabled: enabled });
                    if (enabled) {
                      soundManager.playWindbell();
                      showToast('回廊风铃已启，点击轻抚皆有灵动清音');
                    } else {
                      showToast('环境音已归入静寂');
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--sakura-deep)]" />
              </label>
            </div>

            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed font-serif">
              默认静音。开启后，轻触按钮、翻阅刀账、摇出神签时伴随灵动声效；支持原生合成声或自定义上传音频：
            </p>

            {/* Sound selection modes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'windbell' as AmbientSoundType, name: '黄铜风铃', desc: '空灵金石回响', icon: Bell },
                { id: 'paper' as AmbientSoundType, name: '宣纸翻页', desc: '古朴纸页摩擦', icon: BookOpen },
                { id: 'brush' as AmbientSoundType, name: '落笔凝墨', desc: '提笔柔韧点触', icon: Feather },
                { id: 'rain' as AmbientSoundType, name: '回廊微雨', desc: '檐下甘霖滴答', icon: Droplets },
              ].map((snd) => {
                const isSelected = (config.ambientSoundType || 'windbell') === snd.id;
                const Icon = snd.icon;
                return (
                  <button
                    key={snd.id}
                    type="button"
                    onClick={() => {
                      onUpdateConfig({ ambientSoundType: snd.id });
                      soundManager.playInteractionSound(snd.id, undefined, 'click');
                      showToast(`已选用【${snd.name}】触控声景`);
                    }}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[var(--accent-gold)] bg-[var(--sakura-soft)] text-[var(--accent-gold)] font-bold shadow-2xs'
                        : 'border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-muted)] hover:text-[var(--text-color)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-serif">{snd.name}</span>
                    <span className="text-[9px] opacity-75 font-serif">{snd.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Audio Upload Option */}
            <div className="p-3 rounded-xl bg-[var(--search-bg)] border border-[var(--border-color)] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-serif font-bold text-xs text-[var(--text-color)] flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                  <span>自定义上传专属音效 (MP3 / WAV / OGG)</span>
                </span>
                {config.customAudioUrl && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[10px] font-mono">
                    已载入专属音
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--panel-color)] text-[var(--text-color)] hover:border-[var(--sakura-pink)] text-xs font-serif cursor-pointer">
                  <span>挑选本地音频文件</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (rev) => {
                        const base64 = rev.target?.result as string;
                        onUpdateConfig({
                          ambientSoundType: 'custom',
                          customAudioUrl: base64,
                          customAudioName: file.name.slice(0, 20),
                        });
                        soundManager.playCustomAudio(base64);
                        showToast(`已成功录用专属音频【${file.name.slice(0, 16)}】`);
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="hidden"
                  />
                </label>

                {config.customAudioUrl ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundManager.playCustomAudio(config.customAudioUrl!);
                      }}
                      className="px-2.5 py-1 rounded-md bg-[var(--sakura-soft)] text-[var(--sakura-deep)] text-xs font-serif cursor-pointer hover:bg-[var(--sakura-pink)]/40"
                    >
                      试听
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateConfig({
                          ambientSoundType: 'windbell',
                          customAudioUrl: undefined,
                          customAudioName: undefined,
                        });
                        showToast('已移除自定义音频，复归黄铜风铃');
                      }}
                      className="p-1 text-red-500 hover:text-red-700 cursor-pointer"
                      title="移除专属音频"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] text-[var(--text-muted)] font-serif">
                    未配置时默认使用纯粹空灵的回廊风铃
                  </span>
                )}
              </div>
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

          {/* Section 4: 题词与铭文 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[var(--header-red)] text-sm flex items-center gap-1.5 font-serif">
                <Sparkles className="w-4 h-4" />
                本丸事记题词与主殿铭文
              </h4>
              <button
                type="button"
                onClick={() => onUpdateConfig({ about: APP_DEFAULT_ABOUT })}
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--sakura-deep)] transition-colors cursor-pointer font-serif"
                title="重置为官方规范题词"
              >
                恢复默认
              </button>
            </div>
            <textarea
              value={config.about}
              onChange={(e) => onUpdateConfig({ about: e.target.value })}
              rows={3}
              placeholder="例：本丸事记&#10;审神者专用手帐工具 | 于现代记录"
              className="w-full p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] leading-relaxed focus:outline-hidden focus:border-[var(--sakura-deep)] font-serif text-xs"
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
