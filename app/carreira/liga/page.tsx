import { CarreiraLigaClient } from './liga-client';

interface CarreiraLigaPageProps {
  searchParams: Promise<{ slot?: string }>;
}

export default async function CarreiraLigaPage({ searchParams }: CarreiraLigaPageProps) {
  const params = await searchParams;
  const parsedSlot = Number(params.slot ?? '1');
  const slot: 1 | 2 | 3 = parsedSlot === 2 || parsedSlot === 3 ? parsedSlot : 1;

  return <CarreiraLigaClient slot={slot} />;
}
