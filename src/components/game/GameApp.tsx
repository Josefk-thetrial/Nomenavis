import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  BookOpen,
  Pause,
  Play,
  RotateCcw,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Engine } from "@/lib/game/engine";
import type { UiSnapshot } from "@/lib/game/types";
import { cn } from "@/lib/utils";

const INITIAL: UiSnapshot = {
  phase: "title",
  score: 0,
  highScore: 0,
  combo: 0,
  maxCombo: 0,
  lives: 3,
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
  muted: false,
  shake: true,
  scores: [],
  waveBanner: "",
  waveBannerAge: 99,
  kbOffset: 0,
};

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [ui, setUi] = useState<UiSnapshot>(INITIAL);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new Engine(canvas, setUi);
    engineRef.current = engine;
    void engine.boot();
    engine.startLoop();

    const onKey = (e: KeyboardEvent) => {
      const phase = engine.snapshot().phase;
      if (e.key === "Escape") {
        if (phase === "playing") engine.pause();
        else if (phase === "paused") engine.resume();
        else if (phase === "howto" || phase === "scores") engine.closeOverlay();
        return;
      }
      if (e.repeat || phase !== "playing") return;
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) return;
      if (e.key.length === 1) {
        e.preventDefault();
        engine.typeChar(e.key);
      }
    };
    window.addEventListener("keydown", onKey);

    const onVis = () => {
      engine.unlockAudio();
      if (document.hidden && engine.snapshot().phase === "playing") engine.pause();
    };
    document.addEventListener("visibilitychange", onVis);

    const vv = window.visualViewport;
    const onVv = () => {
      if (!vv) return;
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      engine.setKbOffset(offset);
      setUi((u) => ({ ...u, kbOffset: offset }));
    };
    vv?.addEventListener("resize", onVv);
    vv?.addEventListener("scroll", onVv);

    (window as unknown as { __nomenavis: object }).__nomenavis = {
      type: (s: string) => engine.typeString(s),
      play: () => engine.play(),
      snapshot: () => engine.snapshot(),
      ships: () => engine.debugShips(),
    };

    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("visibilitychange", onVis);
      vv?.removeEventListener("resize", onVv);
      vv?.removeEventListener("scroll", onVv);
      engine.destroy();
    };
  }, []);

  useEffect(() => {
    if (ui.phase === "playing") inputRef.current?.focus();
  }, [ui.phase]);

  const e = () => engineRef.current;

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-bg text-fg select-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        aria-hidden
      />

      {ui.phase === "playing" && <Hud ui={ui} onPause={() => e()?.pause()} />}

      {ui.phase === "title" && (
        <Title
          ui={ui}
          onPlay={() => e()?.play()}
          onHow={() => e()?.openHow("title")}
          onScores={() => e()?.openScores()}
          onMute={() => e()?.toggleMute()}
        />
      )}

      {ui.phase === "paused" && (
        <PauseMenu
          ui={ui}
          onResume={() => e()?.resume()}
          onHow={() => e()?.openHow("paused")}
          onQuit={() => e()?.toTitle()}
          onMute={() => e()?.toggleMute()}
          onShake={() => e()?.toggleShake()}
        />
      )}

      {ui.phase === "gameover" && (
        <GameOver
          ui={ui}
          onRetry={() => e()?.play()}
          onMenu={() => e()?.toTitle()}
        />
      )}

      {ui.phase === "howto" && <HowTo onClose={() => e()?.closeOverlay()} />}

      {ui.phase === "scores" && <Scores ui={ui} onClose={() => e()?.closeOverlay()} />}

      <input
        ref={inputRef}
        aria-label="Digite o nome da nave"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        inputMode="text"
        enterKeyHint="done"
        className={cn(
          "absolute left-1/2 z-20 -translate-x-1/2 bg-surface/90 text-fg",
          "border border-border rounded-md px-3 text-base",
          "focus:outline-none focus:ring-2 focus:ring-accent/40",
          ui.phase === "playing" ? "md:sr-only" : "sr-only",
        )}
        style={{
          bottom: ui.phase === "playing" ? `calc(12px + ${ui.kbOffset}px)` : 0,
          width: "min(92vw, 420px)",
          height: 44,
        }}
        onChange={(ev) => {
          const v = ev.target.value;
          e()?.typeString(v);
          ev.target.value = "";
        }}
        onBlur={() => {
          if (engineRef.current?.snapshot().phase === "playing") {
            inputRef.current?.focus();
          }
        }}
      />
    </div>
  );
}

function Hud({ ui, onPause }: { ui: UiSnapshot; onPause: () => void }) {
  const acc =
    ui.letters + ui.misses === 0 ? 100 : Math.round((ui.letters / (ui.letters + ui.misses)) * 100);
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="flex items-start justify-between gap-3 px-4 pt-[max(12px,env(safe-area-inset-top))]">
        <div>
          <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-muted">Pontos</p>
          <p className="font-sans text-2xl font-medium tabular-nums leading-tight text-fg">{ui.score}</p>
          <p className="font-sans text-xs text-muted tabular-nums">Recorde {ui.highScore}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={onPause}
            className="pointer-events-auto flex size-11 items-center justify-center rounded-md border border-border bg-surface/80 text-fg"
            aria-label="Pausar"
          >
            <Pause className="size-4" strokeWidth={1.75} />
          </button>
          <div className="flex gap-1.5" aria-label={`${ui.lives} vidas`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "block h-1.5 w-5 rounded-full",
                  i < ui.lives ? "bg-fg" : "bg-subtle",
                )}
              />
            ))}
          </div>
          <p className="font-sans text-xs uppercase tracking-[0.16em] text-muted">Onda {ui.wave}</p>
        </div>
      </div>

      {ui.combo >= 3 && (
        <p className="absolute left-1/2 top-24 -translate-x-1/2 font-display text-xl text-parchment tabular-nums">
          Combo {ui.combo}
        </p>
      )}

      {ui.waveBannerAge < 1.6 && (
        <p className="absolute left-1/2 top-28 -translate-x-1/2 font-display text-2xl tracking-wide text-fg">
          {ui.waveBanner}
        </p>
      )}

      {ui.hintAge < 2.8 && ui.lastName && (
        <div className="absolute left-4 top-28 max-w-[220px]">
          <p className="font-display text-base text-fg">{ui.lastName}</p>
          <p className="font-sans text-xs text-muted">{ui.lastHint}</p>
        </div>
      )}

      {ui.lockedName && (
        <div
          className="absolute left-1/2 w-[min(92vw,420px)] -translate-x-1/2 text-center"
          style={{ bottom: `calc(64px + ${ui.kbOffset}px)` }}
        >
          <p className="font-sans text-lg font-medium tracking-wide">
            {ui.lockedName.split("").map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                className={cn(
                  i < ui.typed && "text-muted",
                  i === ui.typed && "text-parchment",
                  i > ui.typed && "text-fg",
                )}
              >
                {ch === " " ? "·" : ch}
              </span>
            ))}
          </p>
          <p className="mt-1 font-sans text-xs text-subtle">
            Precisão {acc}% · {ui.shipsDestroyed} naves
          </p>
        </div>
      )}
    </div>
  );
}

function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/55 px-4">
      <div
        className={cn(
          "w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

function Btn({
  children,
  onClick,
  variant = "primary",
}: {
  children: ReactNode;
  onClick: () => void;
  variant?: "primary" | "ghost";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 w-full items-center justify-center gap-2 rounded-md text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.98]",
        variant === "primary" && "bg-fg text-accent-fg",
        variant === "ghost" && "border border-border bg-transparent text-fg",
      )}
    >
      {children}
    </button>
  );
}

function Title({
  ui,
  onPlay,
  onHow,
  onScores,
  onMute,
}: {
  ui: UiSnapshot;
  onPlay: () => void;
  onHow: () => void;
  onScores: () => void;
  onMute: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-end px-5 pb-[max(28px,env(safe-area-inset-bottom))] pt-[max(20px,env(safe-area-inset-top))]">
      <button
        type="button"
        onClick={onMute}
        className="absolute right-4 top-[max(12px,env(safe-area-inset-top))] flex size-11 items-center justify-center rounded-md border border-border bg-surface/70 text-fg"
        aria-label={ui.muted ? "Ativar som" : "Silenciar"}
      >
        {ui.muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>

      <div className="mb-auto mt-[18vh] text-center">
        <p className="font-sans text-xs font-medium uppercase tracking-[0.28em] text-muted">nomen · navis</p>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-[-0.03em] text-fg">Nomenavis</h1>
        <p className="mt-3 font-sans text-sm text-muted">Digite o nome. Destrua a nave.</p>
        {ui.highScore > 0 && (
          <p className="mt-4 font-sans text-xs tabular-nums text-subtle">Recorde {ui.highScore}</p>
        )}
      </div>

      <div className="flex w-full max-w-sm flex-col gap-2">
        <Btn onClick={onPlay}>
          <Play className="size-4" strokeWidth={1.75} />
          Jogar
        </Btn>
        <Btn variant="ghost" onClick={onScores}>
          <Trophy className="size-4" strokeWidth={1.75} />
          Recordes
        </Btn>
        <Btn variant="ghost" onClick={onHow}>
          <BookOpen className="size-4" strokeWidth={1.75} />
          Como jogar
        </Btn>
      </div>
    </div>
  );
}

function PauseMenu({
  ui,
  onResume,
  onHow,
  onQuit,
  onMute,
  onShake,
}: {
  ui: UiSnapshot;
  onResume: () => void;
  onHow: () => void;
  onQuit: () => void;
  onMute: () => void;
  onShake: () => void;
}) {
  return (
    <Panel>
      <p className="font-display text-2xl text-fg">Pausa</p>
      <p className="mt-1 font-sans text-sm text-muted tabular-nums">
        {ui.score} pontos · onda {ui.wave}
      </p>
      <div className="mt-5 flex flex-col gap-2">
        <Btn onClick={onResume}>Continuar</Btn>
        <Btn variant="ghost" onClick={onHow}>
          Como jogar
        </Btn>
        <Btn variant="ghost" onClick={onMute}>
          {ui.muted ? "Som desligado" : "Som ligado"}
        </Btn>
        <Btn variant="ghost" onClick={onShake}>
          {ui.shake ? "Tremor ligado" : "Tremor desligado"}
        </Btn>
        <Btn variant="ghost" onClick={onQuit}>
          Menu
        </Btn>
      </div>
    </Panel>
  );
}

function GameOver({
  ui,
  onRetry,
  onMenu,
}: {
  ui: UiSnapshot;
  onRetry: () => void;
  onMenu: () => void;
}) {
  const acc =
    ui.letters + ui.misses === 0 ? 0 : Math.round((ui.letters / (ui.letters + ui.misses)) * 100);
  return (
    <Panel>
      <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">Fim de jogo</p>
      <h2 className="mt-1 font-display text-3xl text-fg">Arquivo encerrado</h2>
      {ui.isNewRecord && (
        <p className="mt-2 font-sans text-sm text-parchment">Novo recorde</p>
      )}
      <p className="mt-4 font-display text-4xl tabular-nums leading-none text-fg">{ui.score}</p>
      <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 font-sans text-sm">
        <div>
          <dt className="text-muted">Onda</dt>
          <dd className="tabular-nums text-fg">{ui.wave}</dd>
        </div>
        <div>
          <dt className="text-muted">Naves</dt>
          <dd className="tabular-nums text-fg">{ui.shipsDestroyed}</dd>
        </div>
        <div>
          <dt className="text-muted">Precisão</dt>
          <dd className="tabular-nums text-fg">{acc}%</dd>
        </div>
        <div>
          <dt className="text-muted">Combo</dt>
          <dd className="tabular-nums text-fg">{ui.maxCombo}</dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-col gap-2">
        <Btn onClick={onRetry}>
          <RotateCcw className="size-4" strokeWidth={1.75} />
          Jogar de novo
        </Btn>
        <Btn variant="ghost" onClick={onMenu}>
          Menu
        </Btn>
      </div>
    </Panel>
  );
}

function HowTo({ onClose }: { onClose: () => void }) {
  const steps = [
    { t: "Leia a nave", d: "Cada invasora carrega o nome de uma personalidade histórica." },
    { t: "Trave o alvo", d: "A primeira letra escolhe a nave mais ameaçadora com aquele início." },
    { t: "Complete o nome", d: "Cada letra dispara. Acentos são opcionais; espaços contam." },
    { t: "Não deixe descer", d: "Três vidas. Se a nave alcançar a sua, o arquivo perde uma." },
  ];
  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-2xl text-fg">Como jogar</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex size-11 items-center justify-center rounded-md text-muted"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>
      </div>
      <ol className="mt-4 space-y-4">
        {steps.map((s, i) => (
          <li key={s.t} className="flex gap-3">
            <span className="font-sans text-xs tabular-nums text-subtle">{i + 1}</span>
            <div>
              <p className="font-sans text-sm font-medium text-fg">{s.t}</p>
              <p className="mt-0.5 font-sans text-sm text-muted">{s.d}</p>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-6">
        <Btn onClick={onClose}>Entendi</Btn>
      </div>
    </Panel>
  );
}

function Scores({ ui, onClose }: { ui: UiSnapshot; onClose: () => void }) {
  return (
    <Panel>
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-display text-2xl text-fg">Recordes</h2>
        <button
          type="button"
          onClick={onClose}
          className="flex size-11 items-center justify-center rounded-md text-muted"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>
      </div>
      {ui.scores.length === 0 ? (
        <p className="mt-6 font-sans text-sm text-muted">Nenhuma pontuação ainda. Jogue uma partida.</p>
      ) : (
        <ol className="mt-4 space-y-2">
          {ui.scores.map((s, i) => (
            <li
              key={`${s.at}-${s.score}`}
              className="flex items-baseline justify-between gap-3 border-b border-border py-2 last:border-0"
            >
              <span className="font-sans text-xs tabular-nums text-subtle">{i + 1}</span>
              <span className="flex-1 font-sans text-sm tabular-nums text-fg">{s.score}</span>
              <span className="font-sans text-xs text-muted">onda {s.wave}</span>
              <span className="font-sans text-xs tabular-nums text-subtle">{s.ships} naves</span>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-6">
        <Btn onClick={onClose}>Fechar</Btn>
      </div>
    </Panel>
  );
}
