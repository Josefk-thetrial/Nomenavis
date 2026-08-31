import type { Floater, Laser, Particle, Ship, UiSnapshot } from "./types";
import type { Sprites } from "./assets";

export interface Palette {
  bg: string;
  surface: string;
  fg: string;
  muted: string;
  accent: string;
  danger: string;
  parchment: string;
}

export function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string, fb: string) => s.getPropertyValue(name).trim() || fb;
  return {
    bg: v("--color-bg", "#08090c"),
    surface: v("--color-surface", "#13151c"),
    fg: v("--color-fg", "#f0efe8"),
    muted: v("--color-muted", "#8e9188"),
    accent: v("--color-accent", "#c5cdd6"),
    danger: v("--color-danger", "#c45c4a"),
    parchment: v("--color-parchment", "#d7c4a3"),
  };
}

export interface World {
  w: number;
  h: number;
  t: number;
  ships: Ship[];
  lasers: Laser[];
  particles: Particle[];
  floaters: Floater[];
  playerX: number;
  playerY: number;
  lockedId: number | null;
  trauma: number;
  reduceMotion: boolean;
  shakeOn: boolean;
  phase: UiSnapshot["phase"];
}

function noise(t: number) {
  return Math.sin(t * 17.13) * 0.45 + Math.sin(t * 9.2) * 0.35 + Math.sin(t * 3.7) * 0.2;
}

export function drawWorld(
  ctx: CanvasRenderingContext2D,
  world: World,
  sprites: Sprites,
  pal: Palette,
) {
  const { w, h } = world;
  ctx.save();
  const shakeAmt = world.shakeOn && !world.reduceMotion ? world.trauma * world.trauma : 0;
  if (shakeAmt > 0.01) {
    ctx.translate(noise(world.t * 40) * 14 * shakeAmt, noise(world.t * 33 + 2) * 10 * shakeAmt);
    ctx.rotate(noise(world.t * 21 + 1) * 0.018 * shakeAmt);
  }

  ctx.fillStyle = pal.bg;
  ctx.fillRect(-40, -40, w + 80, h + 80);

  if (sprites.bg) {
    const img = sprites.bg;
    const scale = Math.max(w / img.width, h / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    ctx.globalAlpha = 0.72;
    ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
    ctx.globalAlpha = 1;
  }

  drawStars(ctx, world, pal);
  drawDanger(ctx, world, pal);

  for (const p of world.particles) {
    if (p.kind === "smoke") drawSmoke(ctx, p);
    else drawSpark(ctx, p);
  }

  for (const laser of world.lasers) drawLaser(ctx, laser, pal);

  for (const ship of world.ships) {
    drawShip(ctx, ship, sprites, pal, ship.id === world.lockedId, world.t, h, w);
  }

  drawPlayer(ctx, world, sprites, pal);

  for (const f of world.floaters) drawFloater(ctx, f, pal);

  const g = ctx.createRadialGradient(w / 2, h * 0.4, h * 0.15, w / 2, h * 0.5, h * 0.85);
  g.addColorStop(0, "rgba(8,9,12,0)");
  g.addColorStop(1, "rgba(8,9,12,0.55)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}

function drawStars(ctx: CanvasRenderingContext2D, world: World, pal: Palette) {
  const { w, h, t } = world;
  ctx.save();
  ctx.fillStyle = pal.fg;
  for (let i = 0; i < 70; i++) {
    const seed = i * 97.13;
    const x = ((seed * 13) % 1) * w;
    const layer = 0.25 + (i % 3) * 0.2;
    const y = (((seed * 7) % 1) * h + t * 8 * layer) % h;
    const a = 0.15 + (i % 5) * 0.08;
    ctx.globalAlpha = a;
    const s = i % 9 === 0 ? 1.6 : 0.8;
    ctx.fillRect(x, y, s, s);
    if (i % 11 === 0) {
      ctx.globalAlpha = a * 0.5;
      ctx.fillRect(x - 2, y + 0.4, 5, 0.6);
      ctx.fillRect(x + 0.4, y - 2, 0.6, 5);
    }
  }
  ctx.restore();
}

function drawDanger(ctx: CanvasRenderingContext2D, world: World, pal: Palette) {
  const { w, h } = world;
  const zone = h * 0.18;
  const g = ctx.createLinearGradient(0, h - zone, 0, h);
  g.addColorStop(0, "rgba(196,92,74,0)");
  g.addColorStop(1, "rgba(196,92,74,0.16)");
  ctx.fillStyle = g;
  ctx.fillRect(0, h - zone, w, zone);
  ctx.strokeStyle = pal.danger;
  ctx.globalAlpha = 0.25;
  ctx.setLineDash([4, 8]);
  ctx.beginPath();
  ctx.moveTo(16, h - zone);
  ctx.lineTo(w - 16, h - zone);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

function shipSize(ship: Ship) {
  const longName = ship.figure.name.length > 10;
  const base = longName ? 58 : 52;
  if (ship.hull === 1) return { w: base * 1.15, h: base * 0.78 };
  if (ship.hull === 2) return { w: base * 0.85, h: base * 1.05 };
  return { w: base, h: base * 0.82 };
}

function drawShip(
  ctx: CanvasRenderingContext2D,
  ship: Ship,
  sprites: Sprites,
  pal: Palette,
  locked: boolean,
  t: number,
  viewH: number,
  viewW: number,
) {
  const { w, h } = shipSize(ship);
  const bob = Math.sin(t * 2.2 + ship.bob) * 2.5;
  const y = ship.y + bob;
  const img = sprites.aliens[ship.hull];
  const threat = Math.min(1, Math.max(0, (y - viewH * 0.55) / (viewH * 0.35)));

  ctx.save();
  ctx.translate(ship.x, y);
  if (locked) {
    ctx.shadowColor = pal.parchment;
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.ellipse(0, 4, w * 0.7, h * 0.55, 0, 0, Math.PI * 2);
    ctx.strokeStyle = pal.parchment;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  }

  if (img) {
    ctx.save();
    ctx.rotate(Math.PI);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  } else {
    drawFallbackAlien(ctx, ship.hull, w, h, pal, threat);
  }

  if (threat > 0.35) {
    ctx.globalAlpha = (threat - 0.35) * 0.5;
    ctx.fillStyle = pal.danger;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.4, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.restore();

    drawNameplate(ctx, ship, pal, locked, y + h * 0.48, viewH, viewW);
}

function drawFallbackAlien(
  ctx: CanvasRenderingContext2D,
  hull: number,
  w: number,
  h: number,
  pal: Palette,
  threat: number,
) {
  ctx.fillStyle = pal.surface;
  ctx.strokeStyle = threat > 0.5 ? pal.danger : pal.accent;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  if (hull === 1) {
    ctx.ellipse(0, 0, w * 0.48, h * 0.32, 0, 0, Math.PI * 2);
  } else if (hull === 2) {
    ctx.moveTo(0, h * 0.45);
    ctx.lineTo(w * 0.4, -h * 0.35);
    ctx.lineTo(0, -h * 0.15);
    ctx.lineTo(-w * 0.4, -h * 0.35);
    ctx.closePath();
  } else {
    ctx.moveTo(0, -h * 0.4);
    ctx.lineTo(w * 0.45, h * 0.15);
    ctx.lineTo(w * 0.2, h * 0.4);
    ctx.lineTo(-w * 0.2, h * 0.4);
    ctx.lineTo(-w * 0.45, h * 0.15);
    ctx.closePath();
  }
  ctx.fill();
  ctx.stroke();
}

function drawNameplate(
  ctx: CanvasRenderingContext2D,
  ship: Ship,
  pal: Palette,
  locked: boolean,
  y: number,
  viewH: number,
  viewW: number,
) {
  const name = ship.figure.name;
  const typed = ship.typed;
  const size = locked ? 16 : 14;
  ctx.font = `500 ${size}px "IBM Plex Sans", system-ui, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  const gap = 1.2;
  let total = 0;
  const widths: number[] = [];
  for (const ch of name) {
    const glyph = ch === " " ? "·" : ch;
    const ww = ctx.measureText(glyph).width + gap;
    widths.push(ww);
    total += ww;
  }
  const padX = 10;
  const boxW = total + padX * 2;
  const boxH = 26;
  let boxY = y + 6;
  if (boxY + boxH > viewH - 88) boxY = y - 40;
  const boxX = Math.max(8, Math.min(ship.x - boxW / 2, viewW - boxW - 8));

  ctx.save();
  roundRect(ctx, boxX, boxY, boxW, boxH, 8);
  ctx.fillStyle = locked ? "rgba(19,21,28,0.92)" : "rgba(8,9,12,0.78)";
  ctx.fill();
  ctx.strokeStyle = locked ? pal.parchment : pal.accent;
  ctx.globalAlpha = locked ? 0.7 : 0.25;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.globalAlpha = 1;

  let cx = boxX + padX;
  for (let i = 0; i < name.length; i++) {
    const ch = name[i] === " " ? "·" : name[i]!;
    const done = i < typed;
    const next = i === typed;
    if (done) {
      ctx.fillStyle = pal.muted;
      ctx.globalAlpha = 0.45;
    } else if (next) {
      ctx.fillStyle = locked ? pal.parchment : pal.fg;
      ctx.globalAlpha = 1;
    } else {
      ctx.fillStyle = pal.fg;
      ctx.globalAlpha = locked ? 0.92 : 0.78;
    }
    ctx.fillText(ch, cx, boxY + boxH / 2 + 0.5);
    if (next) {
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = locked ? pal.parchment : pal.accent;
      ctx.fillRect(cx, boxY + boxH - 5, Math.max(6, widths[i]! - gap), 1.5);
    }
    cx += widths[i]!;
  }
  ctx.restore();
}

function drawPlayer(ctx: CanvasRenderingContext2D, world: World, sprites: Sprites, pal: Palette) {
  const { playerX: x, playerY: y, t } = world;
  const flicker = 0.65 + Math.sin(t * 18) * 0.2;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = pal.parchment;
  ctx.globalAlpha = 0.35 * flicker;
  ctx.beginPath();
  ctx.moveTo(-5, 10);
  ctx.lineTo(0, 28 + flicker * 10);
  ctx.lineTo(5, 10);
  ctx.fill();
  ctx.globalAlpha = 1;

  const img = sprites.player;
  const pw = 46;
  const ph = 92;
  if (img) {
    ctx.drawImage(img, -pw / 2, -ph / 2, pw, ph);
  } else {
    ctx.fillStyle = pal.fg;
    ctx.strokeStyle = pal.accent;
    ctx.beginPath();
    ctx.moveTo(0, -36);
    ctx.lineTo(16, 22);
    ctx.lineTo(0, 10);
    ctx.lineTo(-16, 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawLaser(ctx: CanvasRenderingContext2D, laser: Laser, pal: Palette) {
  const a = laser.life / laser.maxLife;
  ctx.save();
  ctx.strokeStyle = pal.fg;
  ctx.globalAlpha = a;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(laser.x0, laser.y0);
  ctx.lineTo(laser.x1, laser.y1);
  ctx.stroke();
  ctx.strokeStyle = pal.parchment;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

function drawSpark(ctx: CanvasRenderingContext2D, p: Particle) {
  const a = p.life / p.maxLife;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * (0.4 + a), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawSmoke(ctx: CanvasRenderingContext2D, p: Particle) {
  const a = (p.life / p.maxLife) * 0.35;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = p.color;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * (1.4 - p.life / p.maxLife), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFloater(ctx: CanvasRenderingContext2D, f: Floater, pal: Palette) {
  const k = f.life / f.maxLife;
  ctx.save();
  ctx.globalAlpha = k;
  ctx.fillStyle = pal.parchment;
  ctx.font = '600 13px "IBM Plex Sans", system-ui, sans-serif';
  ctx.textAlign = "center";
  ctx.fillText(f.text, f.x, f.y - (1 - k) * 18);
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
