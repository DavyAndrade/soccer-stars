'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CriarJogadorForm } from '@/components/jogador/criar-jogador-form';
import { createCareerFromPlayer, loadCareerSlot, saveCareerSlot } from '@/lib/storage';
import { usePlayerStore } from '@/store/player-store';
import type { CreatePlayerInput } from '@/schemas/player-schema';
import { Button } from '@/components/ui/button';

interface CriarJogadorClientProps {
  slotId: 1 | 2 | 3;
  mode: 'new' | 'edit';
}

export function CriarJogadorClient({ slotId, mode }: CriarJogadorClientProps) {
  const router = useRouter();
  const existingSave = useMemo(() => loadCareerSlot(slotId), [slotId]);
  const {
    setNome,
    setPosicao,
    setAtributos,
    setAvatar,
    setTime,
    setNumeroCamisa,
    setNacionalidade,
    setIdade,
  } = usePlayerStore();

  const handleCreatePlayer = (data: CreatePlayerInput) => {
    setNome(data.nome);
    setPosicao(data.posicao);
    setAtributos(data.atributos);
    setAvatar(data.avatar);
    setTime(data.timeId);
    setNumeroCamisa(data.numeroCamisa);
    setNacionalidade(data.nacionalidade);
    setIdade(data.idade);

    const career = mode === 'edit' && existingSave
      ? {
        ...existingSave,
        protagonista: data,
        updatedAt: new Date().toISOString(),
      }
      : createCareerFromPlayer(data, slotId);
    saveCareerSlot(slotId, career);

    router.push(`/carreira?slot=${slotId}`);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-8">
      <div className="mb-4">
        <Button variant="outline" onClick={() => router.push('/saves?mode=new')}>
          Voltar para Saves
        </Button>
      </div>
      <CriarJogadorForm
        onSubmit={handleCreatePlayer}
        initialData={mode === 'edit' ? existingSave?.protagonista : undefined}
        submitLabel={mode === 'edit' ? 'Salvar Alterações' : 'Criar Jogador'}
      />
    </main>
  );
}
