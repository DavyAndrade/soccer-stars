import { CriarJogadorClient } from './criar-jogador-client';

interface CriarJogadorPageProps {
  searchParams: Promise<{ slot?: string }>;
}

export default async function CriarJogadorPage({ searchParams }: CriarJogadorPageProps) {
  const params = await searchParams;
  const parsedSlot = Number(params.slot ?? '1');
  const slotId: 1 | 2 | 3 = parsedSlot === 2 || parsedSlot === 3 ? parsedSlot : 1;

  return <CriarJogadorClient slotId={slotId} />;
}
