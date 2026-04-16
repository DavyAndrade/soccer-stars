import type * as Phaser from 'phaser';
import { createGameConfig } from '@/game/config';

export async function createSoccerStarsGame(parent: string | HTMLElement): Promise<Phaser.Game> {
  const PhaserRuntime = await import('phaser');
  return new PhaserRuntime.Game(createGameConfig(PhaserRuntime, parent));
}
