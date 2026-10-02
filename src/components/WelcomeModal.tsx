import React, { useState } from 'react';
import { Sparkles, Scroll, Check, User, Landmark } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  initialSaniwaName?: string;
  initialHonmaruName?: string;
  onConfirm: (saniwaName: string, honmaruName: string) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  initialSaniwaName = '',
  initialHonmaruName = '',
  onConfirm,
}) => {
  const [saniwaInput, setSaniwaInput] = useState(initialSaniwaName);
  const [honmaruInput, setHonmaruInput] = useState(initialHonmaruName);
  const [isConfirmStep, setIsConfirmStep] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleNextToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const sName = saniwaInput.trim();
    const hName = honmaruInput.trim();

    if (!sName) {
      setErrorMsg('请赐下审神者的尊号/名字');
      return;
    }
    if (!hName) {
      setErrorMsg('请为本丸拟定名号');
      return;
    }

    setErrorMsg('');
    setIsConfirmStep(true);
  };

  const handleFinalEnter = () => {
    const sName = saniwaInput.trim() || '审神者';
    const hName = honmaruInput.trim() || '大和';
    onConfirm(sName, hName);
  };

  const quickHonmaruNames = ['大和', '相模', '山城', '浅樱', '枫华', '星霜', '紫宸'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm transition-all duration-300">
      <div
        className="w-full max-w-lg bg-[var(--panel-color)] rounded-2xl shadow-2xl border-2 border-[var(--sakura-pink)] overflow-hidden transition-all animate-fadeIn"
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* Top Decorative Header */}
        <div className="px-6 py-5 bg-[var(--sakura-soft)] border-b border-[var(--sakura-pink)]/60 text-center relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
            <Scroll className="w-32 h-32 text-[var(--header-red)]" />
          </div>

          <div className="w-12 h-12 rounded-full mx-auto mb-2 bg-[var(--card-bg)] border border-[var(--sakura-pink)] flex items-center justify-center text-[var(--header-red)] shadow-xs">
            <Sparkles className="w-6 h-6 text-[var(--sakura-deep)]" />
          </div>

          <h2 className="text-xl font-black tracking-widest text-[var(--header-red)] font-serif">
            {isConfirmStep ? '本丸就任确认帖' : '本丸开辟 · 审神者就任'}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1 tracking-wider font-serif">
            {isConfirmStep
              ? '主殿，请核验本丸铭册与名牒，印契一成便启本丸事记'
              : '时光溯洄，刀剑男士齐聚。请录入主公名牒与本丸名号'}
          </p>
        </div>

        {/* Step 1: Input Form */}
        {!isConfirmStep ? (
          <form onSubmit={handleNextToConfirm} className="p-6 flex flex-col gap-5 text-xs">
            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-serif text-center animate-shake">
                {errorMsg}
              </div>
            )}

            {/* Saniwa Name */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-color)] mb-1.5 font-serif flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[var(--sakura-deep)]" />
                审神者名讳 / 尊号 <span className="text-[var(--header-red)]">*</span>
              </label>
              <input
                type="text"
                value={saniwaInput}
                onChange={(e) => {
                  setSaniwaInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="例：主殿、千鹤、晴明"
                autoFocus
                maxLength={20}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif text-sm focus:outline-hidden focus:border-[var(--sakura-deep)] transition-colors"
              />
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                刀剑男士以此名向您请安，记录于近侍辅佐与本丸档案中。
              </p>
            </div>

            {/* Honmaru Name */}
            <div>
              <label className="block text-xs font-bold text-[var(--text-color)] mb-1.5 font-serif flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-[var(--sakura-deep)]" />
                本丸名号 <span className="text-[var(--header-red)]">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={honmaruInput}
                  onChange={(e) => {
                    setHonmaruInput(e.target.value);
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="例：大和、相模、浅樱"
                  maxLength={16}
                  className="flex-1 px-3.5 py-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--search-bg)] text-[var(--text-color)] font-serif text-sm font-bold tracking-wide focus:outline-hidden focus:border-[var(--sakura-deep)] transition-colors"
                />
                <span className="text-sm font-serif font-bold text-[var(--text-muted)] shrink-0 px-2 py-2 rounded-lg bg-[var(--search-bg)] border border-[var(--border-color)]">
                  本丸
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)] mt-1">
                进入手札页面后，左上方将冠以「
                <span className="font-bold text-[var(--header-red)]">
                  {honmaruInput.trim() || '大和'}
                </span>
                _本丸」之名。
              </p>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                <span className="text-[10px] text-[var(--text-muted)]">古刹雅称推荐:</span>
                {quickHonmaruNames.map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => {
                      setHonmaruInput(name);
                      if (errorMsg) setErrorMsg('');
                    }}
                    className="px-2 py-0.5 rounded-md bg-[var(--search-bg)] border border-[var(--border-color)] text-[11px] text-[var(--text-color)] hover:bg-[var(--sakura-soft)] hover:border-[var(--sakura-deep)] hover:text-[var(--header-red)] transition-colors cursor-pointer"
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[var(--sakura-deep)] text-white text-xs font-bold font-serif hover:bg-[var(--sakura-deep)]/90 shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              >
                <span>下一步：核验名册</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Confirmation Modal */
          <div className="p-6 flex flex-col gap-5 text-xs animate-fadeIn">
            {/* Scroll Certificate Preview */}
            <div className="bg-[var(--search-bg)] border-2 border-[var(--accent-gold)]/40 rounded-xl p-5 relative border-l-8 border-l-[var(--accent-gold)]">
              <div className="text-center pb-3 border-b border-[var(--border-color)]">
                <span className="text-[11px] text-[var(--text-muted)] font-serif tracking-widest block mb-1">
                  时空政厅 · 审神者任命状
                </span>
                <div className="text-xl font-serif font-black text-[var(--header-red)] tracking-widest">
                  {saniwaInput.trim()} 殿
                </div>
              </div>

              <div className="my-4 text-center space-y-2">
                <p className="text-xs text-[var(--text-color)] font-serif leading-relaxed">
                  兹受命领衔镇守于
                </p>
                <div className="inline-block px-4 py-1.5 rounded-lg bg-[var(--sakura-soft)] border border-[var(--sakura-pink)]">
                  <span className="text-base font-serif font-black text-[var(--header-red)] tracking-wider">
                    {honmaruInput.trim()}_本丸
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] font-serif">
                  掌统刀剑男士，披阅本丸事记，封缄日常奏帖。
                </p>
              </div>

              <div className="text-[10px] text-[var(--text-muted)] font-mono text-right pt-2 border-t border-[var(--border-color)]/60">
                起契时日: {new Date().toISOString().split('T')[0]}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsConfirmStep(false)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border-color)] text-xs text-[var(--text-color)] hover:bg-[var(--search-bg)] font-serif cursor-pointer transition-colors"
              >
                重拟名号
              </button>
              <button
                type="button"
                onClick={handleFinalEnter}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[var(--sakura-deep)] text-white text-xs font-bold font-serif hover:bg-[var(--sakura-deep)]/90 shadow-md cursor-pointer flex items-center justify-center gap-1.5 transition-transform active:scale-95"
              >
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
                <span>核准就任 · 进入本丸手札</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
