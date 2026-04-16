'use client';

import { useRouter } from 'next/navigation';
import { CriarJogadorForm } from '@/components/jogador/criar-jogador-form';
import { createCareerFromPlayer, saveCareerSlot } from '@/lib/storage';
import { usePlayerStore } from '@/store/player-store';
import type { CreatePlayerInput } from '@/schemas/player-schema';

interface CriarJogadorClientProps {
  slotId: 1 | 2 | 3;
}

export function CriarJogadorClient({ slotId }: CriarJogadorClientProps) {
  const router = useRouter();
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

    const career = createCareerFromPlayer(data, slotId);
    saveCareerSlot(slotId, career);

    router.push(`/partida?slot=${slotId}`);
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-8">
      <CriarJogadorForm onSubmit={handleCreatePlayer} />
    </main>
  );
}
