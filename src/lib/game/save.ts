import type { HighScore, SaveData } from "./types";

const KEY = "nomenavis-save-v1";
const VERSION = 1;
const MAX_SCORES = 10;

const defaults: SaveData = {
  version: VERSION,
  scores: [],
  muted: false,
  shake: true,
};

function migrate(raw: SaveData): SaveData {
  const s: SaveData = { ...defaults, ...raw, version: VERSION };
  s.scores = Array.isArray(raw.scores)
    ? raw.scores
        .filter((x) => x && typeof x.score === "number")
        .slice(0, MAX_SCORES)
    : [];
  s.muted = Boolean(raw.muted);
  s.shake = raw.shake !== false;
  return s;
}

export function loadSave(): SaveData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults, scores: [] };
    const parsed = JSON.parse(raw) as SaveData;
    return migrate(parsed);
  } catch {
    return { ...defaults, scores: [] };
  }
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...data, version: VERSION }));
  } catch {
    /* private mode / quota */
  }
}

export function highScoreOf(scores: HighScore[]): number {
  return scores[0]?.score ?? 0;
}

export function recordScore(save: SaveData, entry: HighScore): { save: SaveData; isNew: boolean } {
  if (entry.score <= 0) return { save, isNew: false };
  const scores = [...save.scores, entry]
    .sort((a, b) => b.score - a.score || b.at - a.at)
    .slice(0, MAX_SCORES);
  const isNew = scores[0]?.at === entry.at && entry.score > 0;
  const next = { ...save, scores };
  writeSave(next);
  return { save: next, isNew };
}

export function patchSettings(save: SaveData, patch: Partial<Pick<SaveData, "muted" | "shake">>): SaveData {
  const next = { ...save, ...patch };
  writeSave(next);
  return next;
}
