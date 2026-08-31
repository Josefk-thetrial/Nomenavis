export type Phase = "title" | "playing" | "paused" | "gameover" | "howto" | "scores";

export type Era = "antigo" | "medieval" | "moderno" | "contemporaneo";

export type Hull = 0 | 1 | 2;

export interface Figure {
  name: string;
  era: Era;
  hint: string;
}

export interface Ship {
  id: number;
  figure: Figure;
  typed: number;
  x: number;
  y: number;
  vx: number;
  wobble: number;
  hull: Hull;
  bob: number;
}

export interface Laser {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  life: number;
  maxLife: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  kind: "spark" | "smoke" | "ember";
}

export interface Floater {
  text: string;
  x: number;
  y: number;
  life: number;
  maxLife: number;
}

export interface HighScore {
  score: number;
  wave: number;
  ships: number;
  at: number;
}

export interface SaveData {
  version: number;
  scores: HighScore[];
  muted: boolean;
  shake: boolean;
}

export interface UiSnapshot {
  phase: Phase;
  score: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  lives: number;
  wave: number;
  lockedName: string;
  typed: number;
  lastHint: string;
  lastName: string;
  hintAge: number;
  isNewRecord: boolean;
  shipsDestroyed: number;
  letters: number;
  misses: number;
  muted: boolean;
  shake: boolean;
  scores: HighScore[];
  waveBanner: string;
  waveBannerAge: number;
  kbOffset: number;
}

export interface WaveConfig {
  maxShips: number;
  speed: number;
  spawnInterval: number;
  minLen: number;
  maxLen: number;
  allowSpaces: boolean;
  quota: number;
}
