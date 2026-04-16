'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { deleteCareerSlot, loadSaveSlots } from '@/lib/storage';
import { Button } from '@/components/ui/button';

type Mode = 'new' | 'continue';

interface SavesClientProps {
  mode: Mode;
}

export function SavesClient({ mode }: SavesClientProps) {
  const router = useRouter();
  const emptySlots: ReturnType<typeof loadSaveSlots> = { slots: [null, null, null] };
  const [isHydrated, setIsHydrated] = useState(false);
  const [data, setData] = useState<ReturnType<typeof loadSaveSlots>>(() => emptySlots);

  useEffect(() => {
    setData(loadSaveSlots());
    setIsHydrated(true);
  }, []);

  const handleSelectSlot = (slot: 1 | 2 | 3) => {
    const save = data.slots[slot - 1];

    if (mode === 'new') {
      router.push(`/criar-jogador?slot=${slot}`);
      return;
    }

    if (save) {
      router.push(`/carreira?slot=${slot}`);
    }
  };

  const handleDeleteSlot = (slot: 1 | 2 | 3) => {
    const save = data.slots[slot - 1];
    if (!save) return;

    const confirmDelete = window.confirm(`Excluir o save do Slot ${slot}? Essa ação não pode ser desfeita.`);
    if (!confirmDelete) return;

    deleteCareerSlot(slot);
    setData(loadSaveSlots());
  };

  if (!isHydrated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10">
        <h1 className="text-3xl font-bold">
          {mode === 'new' ? 'Escolha um slot para Nova Carreira' : 'Escolha um slot para Continuar'}
        </h1>
        <p className="text-sm text-muted-foreground">Carregando saves...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-10">
      <div>
        <Button variant="outline" onClick={() => router.push('/')}>
          Voltar ao Menu Inicial
        </Button>
      </div>
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
                <Button
                  className="mt-2 w-full"
                  variant="destructive"
                  disabled={isEmpty}
                  onClick={() => handleDeleteSlot(slot as 1 | 2 | 3)}
                >
                  Excluir Save
                </Button>
              </section>
            );
          })}
      </div>
    </main>
  );
}
