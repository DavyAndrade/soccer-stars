'use client';

import { useEffect, useRef } from 'react';
import type * as Phaser from 'phaser';
import { createSoccerStarsGame } from '@/game/create-game';

export function PhaserMatch() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let game: Phaser.Game | null = null;
    let destroyed = false;

    void (async () => {
      if (!containerRef.current) return;
      game = await createSoccerStarsGame(containerRef.current);

      if (destroyed) {
        game.destroy(true);
      }
    })();

    return () => {
      destroyed = true;
      if (game) {
        game.destroy(true);
      }
    };
  }, []);

  return (
    <section className="w-full">
      <div
        ref={containerRef}
        className="h-[70vh] min-h-[500px] w-full overflow-hidden rounded-xl border border-border"
        aria-label="Container do jogo Phaser"
      />
    </section>
  );
}
