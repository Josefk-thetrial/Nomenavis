import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameApp } from "@/components/game/GameApp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return <main className="min-h-dvh bg-bg" />;
  }
  return (
    <main className="min-h-dvh bg-bg">
      <GameApp />
    </main>
  );
}
