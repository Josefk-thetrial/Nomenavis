import { loadSprites, type Sprites } from "./assets";
import { GameAudio } from "./audio";
import { charsMatch, firstLetter, pickFigure, waveConfig } from "./names";
import { drawWorld, readPalette, type Palette } from "./render";
import { highScoreOf, loadSave, patchSettings, recordScore } from "./save";
import type {
  Floater,
  HighScore,
  Hull,
  Laser,
  Particle,
  Phase,
  SaveData,
  Ship,
  UiSnapshot,
  Figure,
} from "./types";

const STEP = 1 / 60;
const LIVES = 3;

function emptyUi(save: SaveData): UiSnapshot {
  return {
    phase: "title",
    score: 0,
    highScore: highScoreOf(save.scores),
    combo: 0,
    maxCombo: 0,
    lives: LIVES,
    wave: 1,
    lockedName: "",
    typed: 0,
    lastHint: "",
    lastName: "",
    hintAge: 99,
    isNewRecord: false,
    shipsDestroyed: 0,
    letters: 0,
    misses: 0,
    muted: save.muted,
    shake: save.shake,
    scores: save.scores,
    waveBanner: "",
    waveBannerAge: 99,
    kbOffset: 0,
  };
}

export class Engine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private onUi: (ui: UiSnapshot) => void;
  private raf = 0;
  private last = 0;
  private acc = 0;
  private t = 0;
  private w = 390;
  private h = 700;
  private dpr = 1;
  private phase: Phase = "title";
  private prevPhase: Phase = "title";
  private score = 0;
  private combo = 0;
  private maxCombo = 0;
  private lives = LIVES;
  private wave = 1;
  private quota = 8;
  private spawnTimer = 0.4;
  private ships: Ship[] = [];
  private lasers: Laser[] = [];
  private particles: Particle[] = [];
  private floaters: Floater[] = [];
  private lockedId: number | null = null;
  private nextId = 1;
  private used = new Set<string>();
  private shipsDestroyed = 0;
  private letters = 0;
  private misses = 0;
  private trauma = 0;
  private hitstop = 0;
  private playerX = 0;
  private playerY = 0;
  private lastHint = "";
  private lastName = "";
  private hintAge = 99;
  private waveBanner = "";
  private waveBannerAge = 99;
  private isNewRecord = false;
  private save: SaveData;
  private audio = new GameAudio();
  private sprites: Sprites = { player: null, aliens: [null, null, null], bg: null };
  private pal: Palette | null = null;
  private reduceMotion = false;
  private running = false;
  private kbOffset = 0;
  private ro: ResizeObserver | null = null;
  private uiPulse = 0;

  constructor(canvas: HTMLCanvasElement, onUi: (ui: UiSnapshot) => void) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas 2D indisponível");
    this.ctx = ctx;
    this.onUi = onUi;
    this.save = loadSave();
    this.audio.setMuted(this.save.muted);
    this.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.resize();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas.parentElement ?? canvas);
    this.seedAttract();
    this.emit();
  }

  async boot() {
    this.sprites = await loadSprites();
    this.pal = readPalette();
    this.emit();
  }

  startLoop() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const tick = (now: number) => {
      if (!this.running) return;
      let dt = Math.min((now - this.last) / 1000, 0.1);
      this.last = now;
      if (this.hitstop > 0) {
        this.hitstop -= dt;
        dt *= 0.12;
      }
      this.acc += dt;
      while (this.acc >= STEP) {
        this.sim(STEP);
        this.acc -= STEP;
      }
      this.draw();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  destroy() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.ro?.disconnect();
    this.audio.stopDrone();
  }

  unlockAudio() {
    this.audio.unlock();
    this.audio.startDrone();
  }

  setKbOffset(px: number) {
    this.kbOffset = Math.max(0, px);
  }

  snapshot(): UiSnapshot {
    const locked = this.ships.find((s) => s.id === this.lockedId);
    return {
      phase: this.phase,
      score: this.score,
      highScore: Math.max(highScoreOf(this.save.scores), this.score),
      combo: this.combo,
      maxCombo: this.maxCombo,
      lives: this.lives,
      wave: this.wave,
      lockedName: locked?.figure.name ?? "",
      typed: locked?.typed ?? 0,
      lastHint: this.lastHint,
      lastName: this.lastName,
      hintAge: this.hintAge,
      isNewRecord: this.isNewRecord,
      shipsDestroyed: this.shipsDestroyed,
      letters: this.letters,
      misses: this.misses,
      muted: this.save.muted,
      shake: this.save.shake,
      scores: this.save.scores,
      waveBanner: this.waveBanner,
      waveBannerAge: this.waveBannerAge,
      kbOffset: this.kbOffset,
    };
  }

  play() {
    this.unlockAudio();
    this.resetRun();
    this.phase = "playing";
    this.waveBanner = "Onda 1";
    this.waveBannerAge = 0;
    this.audio.wave();
    this.emit();
  }

  pause() {
    if (this.phase !== "playing") return;
    this.phase = "paused";
    this.emit();
  }

  resume() {
    if (this.phase !== "paused") return;
    this.phase = "playing";
    this.emit();
  }

  toTitle() {
    this.phase = "title";
    this.ships = [];
    this.lasers = [];
    this.particles = [];
    this.floaters = [];
    this.lockedId = null;
    this.used = new Set();
    this.seedAttract();
    this.emit();
  }

  openHow(from: Phase = this.phase) {
    this.prevPhase = from === "howto" ? "title" : from;
    this.phase = "howto";
    this.emit();
  }

  openScores() {
    this.prevPhase = this.phase === "scores" ? "title" : this.phase;
    this.phase = "scores";
    this.emit();
  }

  closeOverlay() {
    if (this.phase === "howto" || this.phase === "scores") {
      this.phase = this.prevPhase === "playing" ? "paused" : this.prevPhase;
      if (this.phase === "howto" || this.phase === "scores") this.phase = "title";
      this.emit();
    }
  }

  toggleMute() {
    this.save = patchSettings(this.save, { muted: !this.save.muted });
    this.audio.setMuted(this.save.muted);
    this.emit();
  }

  toggleShake() {
    this.save = patchSettings(this.save, { shake: !this.save.shake });
    this.emit();
  }

  typeChar(raw: string) {
    if (this.phase !== "playing") return;
    if (raw.length !== 1) return;
    if (!/[\p{L} \-']/u.test(raw)) return;

    if (this.lockedId != null) {
      const ship = this.ships.find((s) => s.id === this.lockedId);
      if (!ship) {
        this.lockedId = null;
        this.typeChar(raw);
        return;
      }
      const expected = ship.figure.name[ship.typed];
      if (expected && charsMatch(raw, expected)) this.accept(ship);
      else this.miss();
      return;
    }

    const candidates = this.ships.filter(
      (s) => s.typed === 0 && charsMatch(raw, s.figure.name[0] ?? ""),
    );
    if (!candidates.length) {
      this.miss();
      return;
    }
    candidates.sort((a, b) => b.y - a.y);
    const target = candidates[0]!;
    this.lockedId = target.id;
    this.audio.lock();
    this.accept(target);
  }

  typeString(s: string) {
    for (const ch of s) this.typeChar(ch);
  }

  debugShips() {
    return this.ships.map((s) => ({
      name: s.figure.name,
      typed: s.typed,
      y: Math.round(s.y),
    }));
  }

  private resetRun() {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.lives = LIVES;
    this.wave = 1;
    this.quota = waveConfig(1).quota;
    this.spawnTimer = 0.9;
    this.ships = [];
    this.lasers = [];
    this.particles = [];
    this.floaters = [];
    this.lockedId = null;
    this.used = new Set();
    this.shipsDestroyed = 0;
    this.letters = 0;
    this.misses = 0;
    this.trauma = 0;
    this.hitstop = 0;
    this.lastHint = "";
    this.lastName = "";
    this.hintAge = 99;
    this.isNewRecord = false;
    this.playerX = this.w / 2;
    this.playerY = this.h - 78;
  }

  private seedAttract() {
    this.ships = [];
    this.playerX = this.w / 2;
    this.playerY = this.h - 78;
    for (let i = 0; i < 3; i++) {
      const fig = pickFigure(3 + i, this.used, new Set(this.ships.map((s) => firstLetter(s.figure.name))));
      if (!fig) continue;
      this.used.add(fig.name);
      this.ships.push(this.makeShip(fig, 70 + i * ((this.w - 140) / 2), this.h * 0.48 + (i % 2) * 56, true));
    }
  }

  private makeShip(figure: Figure, x: number, y: number, attract = false): Ship {
    const hull = (Math.floor(Math.random() * 3) as Hull);
    return {
      id: this.nextId++,
      figure,
      typed: 0,
      x,
      y,
      vx: attract ? (Math.random() * 18 - 9) : 0,
      wobble: Math.random() * Math.PI * 2,
      hull,
      bob: Math.random() * Math.PI * 2,
    };
  }

  private sim(dt: number) {
    this.t += dt;
    this.hintAge += dt;
    this.waveBannerAge += dt;
    this.trauma = Math.max(0, this.trauma - dt * 1.85);

    if (this.phase === "title" || this.phase === "howto" || this.phase === "scores") {
      this.simAttract(dt);
      this.stepFx(dt);
      return;
    }
    if (this.phase !== "playing") {
      this.stepFx(dt);
      return;
    }

    const cfg = waveConfig(this.wave);
    this.playerY = this.h - 78 - Math.min(this.kbOffset * 0.15, 24);
    const locked = this.ships.find((s) => s.id === this.lockedId);
    const targetX = locked ? locked.x : this.w / 2;
    this.playerX += (targetX - this.playerX) * (1 - Math.exp(-5.5 * dt));

    this.uiPulse += dt;
    if (this.uiPulse > 0.12) {
      this.uiPulse = 0;
      this.emit();
    }

    this.spawnTimer -= dt;
    if (this.ships.length < cfg.maxShips && this.quota > this.ships.length && this.spawnTimer <= 0) {
      this.spawn();
      this.spawnTimer = cfg.spawnInterval;
    }

    const speed = cfg.speed * (this.h / 720);
    for (const ship of this.ships) {
      ship.wobble += dt;
      ship.x += Math.sin(ship.wobble * 1.3) * 18 * dt;
      ship.x = Math.max(48, Math.min(this.w - 48, ship.x));
      ship.y += speed * dt;
      if (ship.y > this.playerY - 36) this.crash(ship);
    }

    this.stepFx(dt);

    if (this.quota <= 0 && this.ships.length === 0 && this.lives > 0) this.nextWave();
  }

  private simAttract(dt: number) {
    this.playerX += (this.w / 2 - this.playerX) * (1 - Math.exp(-3 * dt));
    this.playerY = this.h - 78;
    for (const ship of this.ships) {
      ship.wobble += dt;
      ship.x += Math.sin(ship.wobble) * 12 * dt;
      ship.y += 10 * dt;
      if (ship.y > this.h * 0.55) ship.y = 70;
      ship.x = Math.max(48, Math.min(this.w - 48, ship.x));
    }
  }

  private stepFx(dt: number) {
    for (const l of this.lasers) l.life -= dt;
    this.lasers = this.lasers.filter((l) => l.life > 0);
    for (const p of this.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 40 * dt;
    }
    if (this.particles.length > 220) this.particles.splice(0, this.particles.length - 220);
    this.particles = this.particles.filter((p) => p.life > 0);
    for (const f of this.floaters) {
      f.life -= dt;
      f.y -= 22 * dt;
    }
    this.floaters = this.floaters.filter((f) => f.life > 0);
  }

  private spawn() {
    const blocked = new Set(this.ships.map((s) => firstLetter(s.figure.name)));
    const fig = pickFigure(this.wave, this.used, blocked);
    if (!fig) return;
    this.used.add(fig.name);
    let x = 56 + Math.random() * (this.w - 112);
    for (let i = 0; i < 8; i++) {
      const clash = this.ships.some((s) => Math.abs(s.x - x) < 70 && s.y < 140);
      if (!clash) break;
      x = 56 + Math.random() * (this.w - 112);
    }
    this.ships.push(this.makeShip(fig, x, -40));
  }

  private accept(ship: Ship) {
    ship.typed += 1;
    this.letters += 1;
    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    const gained = 10 + Math.min(this.combo, 20);
    this.score += gained;
    this.audio.type();
    this.audio.laser();
    this.fireLaser(ship);
    this.burst(ship.x, ship.y, 5, this.pal?.parchment ?? "#d7c4a3");
    this.trauma = Math.min(1, this.trauma + 0.08);
    if (ship.typed >= ship.figure.name.length) this.destroyShip(ship);
    this.emit();
  }

  private destroyShip(ship: Ship) {
    const bonus = 40 + ship.figure.name.length * 12 + Math.min(this.combo, 12) * 8;
    this.score += bonus;
    this.shipsDestroyed += 1;
    this.quota = Math.max(0, this.quota - 1);
    this.lastName = ship.figure.name;
    this.lastHint = ship.figure.hint;
    this.hintAge = 0;
    this.floaters.push({
      text: `+${bonus}`,
      x: ship.x,
      y: ship.y - 10,
      life: 0.8,
      maxLife: 0.8,
    });
    this.explode(ship.x, ship.y);
    this.audio.explode();
    this.trauma = Math.min(1, this.trauma + 0.42);
    this.hitstop = this.reduceMotion ? 0 : 0.045;
    if (this.lockedId === ship.id) this.lockedId = null;
    this.ships = this.ships.filter((s) => s.id !== ship.id);
  }

  private crash(ship: Ship) {
    this.explode(ship.x, ship.y);
    this.audio.explode();
    this.trauma = Math.min(1, this.trauma + 0.7);
    this.hitstop = this.reduceMotion ? 0 : 0.08;
    if (this.lockedId === ship.id) this.lockedId = null;
    this.ships = this.ships.filter((s) => s.id !== ship.id);
    this.quota = Math.max(0, this.quota - 1);
    this.combo = 0;
    this.lives -= 1;
    if (this.lives <= 0) this.finish();
    this.emit();
  }

  private miss() {
    this.misses += 1;
    this.combo = 0;
    this.audio.miss();
    this.trauma = Math.min(1, this.trauma + 0.12);
    this.emit();
  }

  private nextWave() {
    this.wave += 1;
    const cfg = waveConfig(this.wave);
    this.quota = cfg.quota;
    this.spawnTimer = 0.55;
    this.score += 120 * this.wave;
    this.waveBanner = `Onda ${this.wave}`;
    this.waveBannerAge = 0;
    this.audio.wave();
    if (this.used.size > 70) this.used.clear();
    this.emit();
  }

  private finish() {
    this.phase = "gameover";
    this.audio.gameOver();
    const entry: HighScore = {
      score: this.score,
      wave: this.wave,
      ships: this.shipsDestroyed,
      at: Date.now(),
    };
    const result = recordScore(this.save, entry);
    this.save = result.save;
    this.isNewRecord = result.isNew;
    this.emit();
  }

  private fireLaser(ship: Ship) {
    this.lasers.push({
      x0: this.playerX,
      y0: this.playerY - 40,
      x1: ship.x,
      y1: ship.y + 8,
      life: 0.1,
      maxLife: 0.1,
    });
  }

  private burst(x: number, y: number, n: number, color: string) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 90;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0.25 + Math.random() * 0.25,
        maxLife: 0.5,
        size: 1.4 + Math.random() * 1.6,
        color,
        kind: "spark",
      });
    }
  }

  private explode(x: number, y: number) {
    const pal = this.pal;
    this.burst(x, y, 18, pal?.fg ?? "#f0efe8");
    this.burst(x, y, 10, pal?.parchment ?? "#d7c4a3");
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 40,
        vy: -20 - Math.random() * 30,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        size: 6 + Math.random() * 8,
        color: pal?.muted ?? "#8e9188",
        kind: "smoke",
      });
    }
  }

  private resize() {
    const parent = this.canvas.parentElement ?? this.canvas;
    const rect = parent.getBoundingClientRect();
    this.w = Math.max(320, rect.width);
    this.h = Math.max(480, rect.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.floor(this.w * this.dpr);
    this.canvas.height = Math.floor(this.h * this.dpr);
    this.canvas.style.width = `${this.w}px`;
    this.canvas.style.height = `${this.h}px`;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.playerY = this.h - 78;
    if (this.phase !== "playing") this.playerX = this.w / 2;
  }

  private draw() {
    if (!this.pal) this.pal = readPalette();
    drawWorld(
      this.ctx,
      {
        w: this.w,
        h: this.h,
        t: this.t,
        ships: this.ships,
        lasers: this.lasers,
        particles: this.particles,
        floaters: this.floaters,
        playerX: this.playerX,
        playerY: this.playerY,
        lockedId: this.lockedId,
        trauma: this.trauma,
        reduceMotion: this.reduceMotion,
        shakeOn: this.save.shake,
        phase: this.phase,
      },
      this.sprites,
      this.pal,
    );
  }

  private emit() {
    this.onUi(this.snapshot());
  }
}
