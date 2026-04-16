'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { loadSaveSlots } from '@/lib/storage';
import { Button } from '@/components/ui/button';

type Mode = 'new' | 'continue';

interface SavesClientProps {
  mode: Mode;
}

export function SavesClient({ mode }: SavesClientProps) {
  const router = useRouter();
  const data = useMemo(() => loadSaveSlots(), []);

  const handleSelectSlot = (slot: 1 | 2 | 3) => {
    const save = data.slots[slot - 1];

    if (mode === 'new') {
      router.push(`/criar-jogador?slot=${slot}`);
      return;
    }

    if (save) {
      router.push(`/partida?slot=${slot}`);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <h1 className="text-3xl font-bold">
        {mode === 'new' ? 'Escolha um slot para Nova Carreira' : 'Escolha um slot para Continuar'}
      </h1>

      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((slot) => {
          const save = data.slots[slot - 1];
          const isEmpty = !save;
          const disabled = mode === 'continue' && isEmpty;

          return (
            <section key={slot} className="rounded-xl border border-border p-4">
              <h2 className="text-lg font-semibold">Slot {slot}</h2>
              {save ? (
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p><strong>Jogador:</strong> {save.protagonista.nome}</p>
                  <p><strong>Time:</strong> {save.protagonista.timeId}</p>
                  <p><strong>Temporada:</strong> {save.temporadaAtual}</p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">Vazio</p>
              )}

              <Button
                className="mt-4 w-full"
                variant={mode === 'new' ? 'default' : 'outline'}
                disabled={disabled}
                onClick={() => handleSelectSlot(slot as 1 | 2 | 3)}
              >
                {mode === 'new' ? 'Usar Slot' : 'Continuar'}
              </Button>
            </section>
          );
        })}
      </div>
    </main>
  );
}
