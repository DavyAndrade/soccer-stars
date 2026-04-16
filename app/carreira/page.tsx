import { CarreiraClient } from './carreira-client';

interface CarreiraPageProps {
  searchParams: Promise<{ slot?: string; seasonTransition?: string; fromSeason?: string; toSeason?: string }>;
}

export default async function CarreiraPage({ searchParams }: CarreiraPageProps) {
  const params = await searchParams;
  const parsedSlot = Number(params.slot ?? '1');
  const slot: 1 | 2 | 3 = parsedSlot === 2 || parsedSlot === 3 ? parsedSlot : 1;
  const seasonTransition = params.seasonTransition === '1';
  const fromSeason = Number(params.fromSeason ?? '0');
  const toSeason = Number(params.toSeason ?? '0');
  const seasonTransitionInfo =
    seasonTransition && Number.isFinite(fromSeason) && Number.isFinite(toSeason) && toSeason > fromSeason
      ? { fromSeason, toSeason }
      : null;

  return <CarreiraClient slot={slot} seasonTransitionInfo={seasonTransitionInfo} />;
}
