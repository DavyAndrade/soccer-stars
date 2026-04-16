'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getNextCareerMatch, loadCareerSlot } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { CareerNav } from '@/components/carreira/career-nav';

interface CarreiraClientProps {
  slot: 1 | 2 | 3;
  seasonTransitionInfo?: {
    fromSeason: number;
    toSeason: number;
  } | null;
}

const LEAGUE_NAME_BY_CONFERENCE = {
  EAST: 'Prince Takamado U18 Premier League East',
  WEST: 'Prince Takamado U18 Premier League West',
} as const;

const FLAG_BY_NATIONALITY: Record<string, string> = {
  'Japão': '🇯🇵',
  'Coreia do Sul': '🇰🇷',
  'Brasil': '🇧🇷',
  'Argentina': '🇦🇷',
  'Espanha': '🇪🇸',
  'Portugal': '🇵🇹',
};

const POSITION_LABEL: Record<string, string> = {
  GK: 'Goleiro (GK)',
  DF: 'Defensor (DF)',
  MF: 'Meio-Campista (MF)',
  FW: 'Atacante (FW)',
};

function hexToRgba(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) {
    return `rgba(63, 63, 70, ${alpha})`;
  }
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getLeagueName(conference: unknown): string {
  if (conference === 'EAST' || conference === 'WEST') {
    return LEAGUE_NAME_BY_CONFERENCE[conference];
  }
  return 'Liga não definida';
}

function getNationalityFlag(nacionalidade: string): string {
  return FLAG_BY_NATIONALITY[nacionalidade] ?? '🏳️';
}

function getPositionLabel(posicao: string): string {
  return POSITION_LABEL[posicao] ?? posicao;
}

export function CarreiraClient({ slot, seasonTransitionInfo = null }: CarreiraClientProps) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [save, setSave] = useState<ReturnType<typeof loadCareerSlot>>(null);
  const [showSeasonTransition, setShowSeasonTransition] = useState(Boolean(seasonTransitionInfo));

  useEffect(() => {
    setSave(loadCareerSlot(slot));
    setIsHydrated(true);
  }, [slot]);

  useEffect(() => {
    setShowSeasonTransition(Boolean(seasonTransitionInfo));
  }, [seasonTransitionInfo]);

  const team = useMemo(() => {
    if (!save) return null;
    return save.liga.times.find((current) => current.id === save.protagonista.timeId) ?? null;
  }, [save]);

  if (!isHydrated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold">Carregando carreira...</h1>
      </main>
    );
  }

  if (!save) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold">Carreira não encontrada</h1>
        <p className="text-center text-sm text-muted-foreground">
          O slot {slot} está vazio. Escolha um slot com save para continuar.
        </p>
        <Button onClick={() => router.push('/saves?mode=continue')}>Ir para Saves</Button>
      </main>
    );
  }

  const leagueName = getLeagueName(team?.conferencia);
  const teamPrimary = team?.corPrimaria ?? '#3f3f46';
  const nextMatch = team ? getNextCareerMatch(save, team.id) : null;
  const surfaceStyle = {
    borderColor: hexToRgba(teamPrimary, 0.35),
    backgroundColor: 'rgba(24, 24, 27, 0.35)',
  };

  return (
    <main className="min-h-screen w-full px-4 py-8 pb-24 md:px-8 md:pb-8 md:pl-[20rem]">
      <CareerNav slot={slot} current="hub" teamPrimary={teamPrimary} />

      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Central da Carreira</h1>
          <p className="text-sm text-muted-foreground">
            Slot {slot} • Temporada {save.temporadaAtual} • Liga: {leagueName}
          </p>
        </header>

        {showSeasonTransition && seasonTransitionInfo ? (
          <section className="rounded-xl border border-emerald-500/40 bg-emerald-950/20 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-emerald-200">Nova temporada iniciada</h2>
                <p className="mt-1 text-sm text-emerald-100/90">
                  Você concluiu a temporada {seasonTransitionInfo.fromSeason} e iniciou a temporada {seasonTransitionInfo.toSeason}.
                </p>
                <p className="mt-1 text-xs text-emerald-100/70">
                  A fase regular reiniciou na rodada 1 com tabela atualizada.
                </p>
              </div>
              <Button variant="outline" onClick={() => setShowSeasonTransition(false)}>
                Fechar
              </Button>
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border p-4" style={surfaceStyle}>
            <h2 className="text-2xl font-semibold">Meu Jogador</h2>
            <div className="mt-3 flex items-center gap-4">
              {save.protagonista.avatar ? (
                <img
                  src={save.protagonista.avatar}
                  alt={`Aparência de ${save.protagonista.nome}`}
                  className="h-20 w-20 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-border text-xs text-muted-foreground">
                  Sem imagem
                </div>
              )}
              <div className="space-y-1 text-sm">
                <p className="text-base font-semibold">
                  {save.protagonista.nome} {getNationalityFlag(save.protagonista.nacionalidade)}
                </p>
                <p>{getPositionLabel(save.protagonista.posicao)} • {save.protagonista.idade}y</p>
              </div>
            </div>
            <Button
              className="mt-4 w-full sm:w-auto"
              variant="outline"
              onClick={() => router.push(`/criar-jogador?slot=${slot}&mode=edit`)}
            >
              Editar Protagonista
            </Button>
          </article>

          <article className="rounded-xl border p-4" style={surfaceStyle}>
              <h2 className="text-lg font-semibold">Próxima Partida</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {team && nextMatch
                  ? `Rodada ${nextMatch.rodada}: ${nextMatch.isHome ? `${team.nome} vs ${nextMatch.opponent.nome}` : `${nextMatch.opponent.nome} vs ${team.nome}`}`
                  : 'Adversário ainda não definido'}
              </p>
            <Button className="mt-3" onClick={() => router.push(`/partida?slot=${slot}`)}>
              Jogar Partida
            </Button>
          </article>
        </section>

        <section>
          <article className="rounded-xl border p-4" style={surfaceStyle}>
            <h2 className="text-lg font-semibold">Atalhos</h2>
            <div className="mt-3 flex flex-col gap-2">
              <Button onClick={() => router.push(`/carreira/time?slot=${slot}`)}>Abrir página do Time</Button>
              <Button variant="outline" onClick={() => router.push(`/partida?slot=${slot}`)}>
                Ir para Partida
              </Button>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
