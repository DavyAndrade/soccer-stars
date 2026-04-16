import { PartidaClient } from './partida-client';

interface PartidaPageProps {
  searchParams: Promise<{ slot?: string }>;
}

export default async function PartidaPage({ searchParams }: PartidaPageProps) {
  const params = await searchParams;
  const parsedSlot = Number(params.slot ?? '1');
  const slot: 1 | 2 | 3 = parsedSlot === 2 || parsedSlot === 3 ? parsedSlot : 1;

  return <PartidaClient slot={slot} />;
}
