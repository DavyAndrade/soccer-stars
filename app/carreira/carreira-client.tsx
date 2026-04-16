'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { loadCareerSlot } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { getInitialTeams } from '@/data/teams';

interface CarreiraClientProps {
  slot: 1 | 2 | 3;
}

const LEAGUE_NAME_BY_CONFERENCE = {
  EAST: 'Takamado U18 Premier League East',
  WEST: 'Takamado U18 Premier League West',
} as const;

function getLeagueName(conference: unknown): string {
  if (conference === 'EAST' || conference === 'WEST') {
    return LEAGUE_NAME_BY_CONFERENCE[conference];
  }
  return 'Liga não definida';
}

function countPositions(players: { posicao: string }[]) {
  const counts = { GK: 0, DF: 0, MF: 0, FW: 0 };
  for (const player of players) {
    if (player.posicao in counts) {
      counts[player.posicao as keyof typeof counts] += 1;
    }
  }
  return counts;
}

export function CarreiraClient({ slot }: CarreiraClientProps) {
  const router = useRouter();
  const save = useMemo(() => loadCareerSlot(slot), [slot]);
  const allTeams = useMemo(() => getInitialTeams(), []);

  const team = useMemo(() => {
    if (!save) return null;
    return save.liga.times.find((t) => t.id === save.protagonista.timeId) ?? null;
  }, [save]);

  const ranking = useMemo(() => {
    const source = save?.liga.times ?? allTeams;
    const conference = team?.conferencia;
    const filtered = conference ? source.filter((currentTeam) => currentTeam.conferencia === conference) : source;
    return [...filtered].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [allTeams, save, team]);

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

  const positionCounts = team ? countPositions(team.jogadores) : { GK: 0, DF: 0, MF: 0, FW: 0 };
  const leagueName = getLeagueName(team?.conferencia);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Central da Carreira</h1>
        <p className="text-sm text-muted-foreground">
          Slot {slot} • Temporada {save.temporadaAtual} • Jogador: {save.protagonista.nome}
        </p>
        <div>
          <Button variant="outline" onClick={() => router.push('/')}>
            Voltar ao Menu Inicial
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-border p-4">
          <h2 className="text-lg font-semibold">Protagonista</h2>
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
              <p><strong>Nome:</strong> {save.protagonista.nome}</p>
              <p><strong>Posição:</strong> {save.protagonista.posicao}</p>
              <p><strong>Nacionalidade:</strong> {save.protagonista.nacionalidade}</p>
              <p><strong>Idade:</strong> {save.protagonista.idade}</p>
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

        <article className="rounded-xl border border-border p-4">
          <h2 className="text-lg font-semibold">Informações do Time</h2>
          {team ? (
            <div className="mt-3 space-y-2 text-sm">
              <p><strong>Time:</strong> {team.nome}</p>
              <p><strong>Conferência:</strong> {team.conferencia}</p>
              <p><strong>Liga:</strong> {leagueName}</p>
              <p><strong>Formação:</strong> {team.formacao.nome}</p>
              <p><strong>Cores:</strong> {team.corPrimaria} / {team.corSecundaria}</p>
              <p>
                <strong>Elenco:</strong> GK {positionCounts.GK} • DF {positionCounts.DF} • MF {positionCounts.MF} • FW {positionCounts.FW}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Time do protagonista não encontrado.</p>
          )}
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-border p-4">
          <h2 className="text-lg font-semibold">Próximo Passo</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Em breve você terá calendário, treinos e gestão de temporada aqui. Por ora, prossiga para a partida.
          </p>
          <Button className="mt-4 w-full sm:w-auto" onClick={() => router.push(`/partida?slot=${slot}`)}>
            Ir para Partida
          </Button>
        </article>
      </section>

      <section className="rounded-xl border border-border p-4">
        <h2 className="text-lg font-semibold">
          {leagueName}
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Time</th>
                <th className="px-2 py-2">Pts</th>
                <th className="px-2 py-2">J</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((currentTeam, index) => {
                const isProtagonistTeam = currentTeam.id === save.protagonista.timeId;
                return (
                  <tr
                    key={currentTeam.id}
                    className={`border-b border-border/60 ${isProtagonistTeam ? 'bg-primary/10' : ''}`}
                  >
                    <td className="px-2 py-2">{index + 1}</td>
                    <td className="px-2 py-2">{currentTeam.nome}</td>
                    <td className="px-2 py-2">0</td>
                    <td className="px-2 py-2">0</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
