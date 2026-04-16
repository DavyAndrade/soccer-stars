'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getConferenceStandings, loadCareerSlot } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { CareerNav } from '@/components/carreira/career-nav';

interface CarreiraLigaClientProps {
  slot: 1 | 2 | 3;
}

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

function renderConferenceLabel(conference: 'EAST' | 'WEST'): string {
  return conference === 'EAST'
    ? 'Prince Takamado U18 Premier League East'
    : 'Prince Takamado U18 Premier League West';
}

export function CarreiraLigaClient({ slot }: CarreiraLigaClientProps) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [save, setSave] = useState<ReturnType<typeof loadCareerSlot>>(null);

  useEffect(() => {
    setSave(loadCareerSlot(slot));
    setIsHydrated(true);
  }, [slot]);

  const team = useMemo(() => {
    if (!save) return null;
    return save.liga.times.find((current) => current.id === save.protagonista.timeId) ?? null;
  }, [save]);

  const eastStandings = useMemo(() => {
    if (!save) return [];
    return getConferenceStandings(save, 'EAST');
  }, [save]);

  const westStandings = useMemo(() => {
    if (!save) return [];
    return getConferenceStandings(save, 'WEST');
  }, [save]);

  if (!isHydrated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold">Carregando liga...</h1>
      </main>
    );
  }

  if (!save || !team) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold">Dados da liga não encontrados</h1>
        <Button onClick={() => router.push(`/carreira?slot=${slot}`)}>Voltar para Carreira</Button>
      </main>
    );
  }

  const teamPrimary = team.corPrimaria ?? '#3f3f46';
  const surfaceStyle = {
    borderColor: hexToRgba(teamPrimary, 0.32),
    backgroundColor: 'rgba(24, 24, 27, 0.35)',
  };
  const rowHighlightStyle = { backgroundColor: hexToRgba(teamPrimary, 0.16) };

  return (
    <main className="min-h-screen w-full px-4 py-8 pb-24 md:px-8 md:pb-8 md:pl-80">
      <CareerNav slot={slot} current="league" teamPrimary={teamPrimary} />

      <div className="space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold">Liga</h1>
          <p className="text-sm text-muted-foreground">
            Slot {slot} • Temporada {save.temporadaAtual} • Rodada {save.liga.rodadaAtual}
          </p>
        </header>

        <section className="grid gap-4 xl:grid-cols-2">
          {([
            { conference: 'EAST' as const, standings: eastStandings },
            { conference: 'WEST' as const, standings: westStandings },
          ]).map(({ conference, standings }) => (
            <article key={conference} className="rounded-xl border p-4" style={surfaceStyle}>
              <h2 className="text-lg font-semibold">{renderConferenceLabel(conference)}</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b text-left" style={{ borderColor: hexToRgba(teamPrimary, 0.35) }}>
                      <th className="px-2 py-2">Pos.</th>
                      <th className="px-2 py-2">Time</th>
                      <th className="px-2 py-2">Pts</th>
                      <th className="px-2 py-2">PJ</th>
                      <th className="px-2 py-2">V</th>
                      <th className="px-2 py-2">E</th>
                      <th className="px-2 py-2">D</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((standing, index) => {
                      const isMyTeam = standing.time.id === team.id;
                      return (
                        <tr
                          key={standing.time.id}
                          className="border-b"
                          style={{
                            borderColor: hexToRgba(teamPrimary, 0.2),
                            ...(isMyTeam ? rowHighlightStyle : {}),
                          }}
                        >
                          <td className="px-2 py-2">{index + 1}</td>
                          <td className="px-2 py-2">{standing.time.nome}</td>
                          <td className="px-2 py-2">{standing.pts}</td>
                          <td className="px-2 py-2">{standing.pj}</td>
                          <td className="px-2 py-2">{standing.v}</td>
                          <td className="px-2 py-2">{standing.e}</td>
                          <td className="px-2 py-2">{standing.d}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
