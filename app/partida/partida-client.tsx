'use client';

import { useEffect, useState } from 'react';
import { PhaserMatch } from '@/components/partida/phaser-match';
import { loadCareerSlot } from '@/lib/storage';

interface PartidaClientProps {
  slot: 1 | 2 | 3;
}

export function PartidaClient({ slot }: PartidaClientProps) {
  const [save, setSave] = useState<ReturnType<typeof loadCareerSlot>>(null);

  useEffect(() => {
    setSave(loadCareerSlot(slot));
  }, [slot]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-semibold">Partida</h1>
      {save && (
        <p className="text-sm text-muted-foreground">
          Slot {slot} • {save.protagonista.nome} • Temporada {save.temporadaAtual}
        </p>
      )}
      <PhaserMatch />
    </main>
  );
}
