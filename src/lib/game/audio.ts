export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  private music: GainNode | null = null;
  private muted = false;
  private drone: OscillatorNode[] = [];
  private droneGain: GainNode | null = null;

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.music = this.ctx.createGain();
      this.sfx.gain.value = 0.28;
      this.music.gain.value = 0.07;
      this.master.gain.value = this.muted ? 0 : 1;
      this.sfx.connect(this.master);
      this.music.connect(this.master);
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.03);
    }
  }

  resume() {
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  private env(duration: number, peak: number, attack = 0.008): GainNode | null {
    if (!this.ctx || !this.sfx) return null;
    const g = this.ctx.createGain();
    const t = this.ctx.currentTime;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    g.connect(this.sfx);
    return g;
  }

  private tone(freq: number, duration: number, type: OscillatorType, peak: number, detune = 0) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq * (1 + (Math.random() * 2 - 1) * 0.03);
    osc.detune.value = detune;
    const g = this.env(duration, peak);
    if (!g) return;
    osc.connect(g);
    osc.start();
    osc.stop(this.ctx.currentTime + duration + 0.02);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  type() {
    this.tone(880 + Math.random() * 80, 0.05, "square", 0.12);
  }

  lock() {
    this.tone(520, 0.08, "triangle", 0.16);
    this.tone(780, 0.1, "sine", 0.08);
  }

  laser() {
    if (!this.ctx || !this.sfx) return;
    const osc = this.ctx.createOscillator();
    osc.type = "sawtooth";
    const t = this.ctx.currentTime;
    osc.frequency.setValueAtTime(920, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.09);
    const g = this.env(0.1, 0.1, 0.004);
    if (!g) return;
    osc.connect(g);
    osc.start();
    osc.stop(t + 0.12);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  explode() {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime;
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.28, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(220, t + 0.25);
    const g = this.env(0.28, 0.45, 0.004);
    if (!g) return;
    src.connect(filter);
    filter.connect(g);
    src.start();
    src.stop(t + 0.3);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      g.disconnect();
    };
    this.tone(140, 0.22, "sine", 0.2);
  }

  miss() {
    this.tone(180, 0.12, "square", 0.1);
    this.tone(160, 0.14, "sawtooth", 0.06);
  }

  wave() {
    this.tone(392, 0.22, "triangle", 0.12);
    this.tone(588, 0.28, "sine", 0.08);
  }

  gameOver() {
    this.tone(330, 0.25, "triangle", 0.14);
    this.tone(247, 0.4, "sine", 0.12);
    this.tone(196, 0.55, "sine", 0.1);
  }

  startDrone() {
    if (!this.ctx || !this.music || this.drone.length) return;
    const g = this.ctx.createGain();
    g.gain.value = 0.0001;
    g.connect(this.music);
    this.droneGain = g;
    const freqs = [110, 164.81, 246];
    for (const f of freqs) {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      osc.connect(g);
      osc.start();
      this.drone.push(osc);
    }
    g.gain.exponentialRampToValueAtTime(1, this.ctx.currentTime + 1.2);
  }

  stopDrone() {
    if (!this.ctx || !this.droneGain) return;
    const g = this.droneGain;
    g.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.2);
    const nodes = [...this.drone];
    this.drone = [];
    this.droneGain = null;
    window.setTimeout(() => {
      for (const n of nodes) {
        try {
          n.stop();
          n.disconnect();
        } catch {
          /* already stopped */
        }
      }
      g.disconnect();
    }, 600);
  }
}
