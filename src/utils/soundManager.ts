// Web Audio API pure synthesizer for authentic Honmaru traditional soundscapes
// Zero external network requests, zero byte bloat, 100% offline-ready

class HonmaruSoundManager {
  private ctx: AudioContext | null = null;
  private customAudio: HTMLAudioElement | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // 1. 本丸回廊风铃声（Furinstep · 清脆空灵的黄铜风铃长鸣与微风轻晃）
  playWindbell() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Frequencies of classic Japanese brass / bronze furin
    const baseFreqs = [1760, 2637, 3520]; // A6, E7, A7 harmonics
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.22, now);
    masterGain.connect(ctx.destination);

    baseFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Slight detune for shimmering metallic feel
      osc.frequency.setValueAtTime(freq + (idx === 1 ? 5 : -4), now);

      // Strike envelope: instant attack, long crystal decay
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4 / (idx + 1), now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8 + idx * 0.4);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 2.2);
    });
  }

  // 2. 翻阅手帐宣纸摩擦声 (Paper rustle / flip)
  playPaperFlip() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Noise buffer for gentle fiber paper friction
    const bufferSize = ctx.sampleRate * 0.25; // 250ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter to sound like soft rice paper / parchment
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(800, now + 0.2);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.25);
  }

  // 3. 落笔墨水声 (Brush touch / gentle wood clack)
  playBrushStroke() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.09);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // 4. 雨落回廊的微甘霖滴声 (Raindrop on wooden veranda)
  playVerandaRaindrop() {
    const ctx = this.getContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.12);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // 5. 播放用户自定义上传的音频
  playCustomAudio(dataUrl: string) {
    if (!dataUrl) return;
    try {
      if (!this.customAudio || this.customAudio.src !== dataUrl) {
        this.customAudio = new Audio(dataUrl);
      }
      this.customAudio.currentTime = 0;
      this.customAudio.volume = 0.5;
      this.customAudio.play().catch(() => {});
    } catch {
      // Fallback to windbell if custom fails
      this.playWindbell();
    }
  }

  // Unified Trigger based on current settings
  playInteractionSound(
    soundType: 'windbell' | 'paper' | 'brush' | 'rain' | 'custom' = 'windbell',
    customUrl?: string,
    actionType: 'click' | 'flip' | 'stroke' = 'click'
  ) {
    if (soundType === 'custom' && customUrl) {
      this.playCustomAudio(customUrl);
      return;
    }

    if (actionType === 'flip') {
      this.playPaperFlip();
      return;
    }

    if (actionType === 'stroke') {
      this.playBrushStroke();
      return;
    }

    switch (soundType) {
      case 'paper':
        this.playPaperFlip();
        break;
      case 'brush':
        this.playBrushStroke();
        break;
      case 'rain':
        this.playVerandaRaindrop();
        break;
      case 'windbell':
      default:
        this.playWindbell();
        break;
    }
  }
}

export const soundManager = new HonmaruSoundManager();
