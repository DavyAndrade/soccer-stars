import { CarreiraClient } from './carreira-client';

interface CarreiraPageProps {
  searchParams: Promise<{ slot?: string }>;
}

export default async function CarreiraPage({ searchParams }: CarreiraPageProps) {
  const params = await searchParams;
  const parsedSlot = Number(params.slot ?? '1');
  const slot: 1 | 2 | 3 = parsedSlot === 2 || parsedSlot === 3 ? parsedSlot : 1;

  return <CarreiraClient slot={slot} />;
}
