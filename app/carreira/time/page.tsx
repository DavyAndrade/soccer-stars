import { CarreiraTimeClient } from './time-client';

interface CarreiraTimePageProps {
  searchParams: Promise<{ slot?: string }>;
}

export default async function CarreiraTimePage({ searchParams }: CarreiraTimePageProps) {
  const params = await searchParams;
  const parsedSlot = Number(params.slot ?? '1');
  const slot: 1 | 2 | 3 = parsedSlot === 2 || parsedSlot === 3 ? parsedSlot : 1;

  return <CarreiraTimeClient slot={slot} />;
}
