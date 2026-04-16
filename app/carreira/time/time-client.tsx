'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadCareerSlot, updateTeamEscalacao } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { FORMACOES, type FormacaoNome, type TeamSquadPlayer, type Time } from '@/types/team';
import { CareerNav } from '@/components/carreira/career-nav';

interface CarreiraTimeClientProps {
  slot: 1 | 2 | 3;
}

const LEAGUE_NAME_BY_CONFERENCE = {
  EAST: 'Prince Takamado U18 Premier League East',
  WEST: 'Prince Takamado U18 Premier League West',
} as const;

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

function countPositions(players: { posicao: string }[]) {
  const counts = { GK: 0, DF: 0, MF: 0, FW: 0 };
  for (const player of players) {
    if (player.posicao in counts) {
      counts[player.posicao as keyof typeof counts] += 1;
    }
  }
  return counts;
}

function formationRows(formacaoNome: FormacaoNome): Array<{ posicao: 'DF' | 'MF' | 'FW'; qtd: number }> {
  if (formacaoNome === '4-2-3-1') {
    return [
      { posicao: 'DF', qtd: 4 },
      { posicao: 'MF', qtd: 2 },
      { posicao: 'MF', qtd: 3 },
      { posicao: 'FW', qtd: 1 },
    ];
  }

  const [df, mf, fw] = formacaoNome.split('-').map(Number);
  return [
    { posicao: 'DF', qtd: df },
    { posicao: 'MF', qtd: mf },
    { posicao: 'FW', qtd: fw },
  ];
}

function splitLineupForField(jogadores: TeamSquadPlayer[], formacaoNome: FormacaoNome) {
  const titulares = jogadores.filter((jogador) => jogador.titular);
  const byPosition = {
    GK: titulares.filter((jogador) => jogador.posicao === 'GK'),
    DF: titulares.filter((jogador) => jogador.posicao === 'DF'),
    MF: titulares.filter((jogador) => jogador.posicao === 'MF'),
    FW: titulares.filter((jogador) => jogador.posicao === 'FW'),
  };
  const sortedAll = [...titulares].sort((a, b) => a.numero - b.numero);
  const used = new Set<string>();

  const goleiro =
    byPosition.GK[0] ??
    sortedAll[0] ??
    null;
  if (goleiro) used.add(goleiro.id);

  const rows = formationRows(formacaoNome).map((row) => {
    const candidates = byPosition[row.posicao]
      .filter((jogador) => !used.has(jogador.id))
      .sort((a, b) => a.numero - b.numero);
    const selected = candidates.slice(0, row.qtd);
    selected.forEach((jogador) => used.add(jogador.id));

    if (selected.length < row.qtd) {
      const fallback = sortedAll.filter((jogador) => !used.has(jogador.id)).slice(0, row.qtd - selected.length);
      fallback.forEach((jogador) => used.add(jogador.id));
      return [...selected, ...fallback];
    }
    return selected;
  });

  return { goleiro, rows };
}

export function CarreiraTimeClient({ slot }: CarreiraTimeClientProps) {
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);
  const [save, setSave] = useState<ReturnType<typeof loadCareerSlot>>(null);

  useEffect(() => {
    setSave(loadCareerSlot(slot));
    setIsHydrated(true);
  }, [slot]);

  const team = useMemo(() => {
    if (!save) return null;
    return save.liga.times.find((t) => t.id === save.protagonista.timeId) ?? null;
  }, [save]);

  const [teamDraft, setTeamDraft] = useState<Time | null>(null);
  useEffect(() => {
    setTeamDraft(team as Time | null);
  }, [team]);

  const ranking = useMemo(() => {
    if (!save || !team) return [];
    return [...save.liga.times]
      .filter((currentTeam) => currentTeam.conferencia === team.conferencia)
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [save, team]);

  if (!isHydrated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold">Carregando time...</h1>
      </main>
    );
  }

  if (!save || !teamDraft || !team) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold">Dados do time não encontrados</h1>
        <Button onClick={() => router.push(`/carreira?slot=${slot}`)}>Voltar</Button>
      </main>
    );
  }

  const leagueName = getLeagueName(team.conferencia);
  const teamPrimary = team.corPrimaria ?? '#3f3f46';
  const surfaceStyle = {
    borderColor: hexToRgba(teamPrimary, 0.32),
    backgroundColor: 'rgba(24, 24, 27, 0.35)',
  };
  const rowHighlightStyle = { backgroundColor: hexToRgba(teamPrimary, 0.16) };
  const formacoes = Object.keys(FORMACOES) as FormacaoNome[];
  const titularesCount = teamDraft.jogadores.filter((jogador) => jogador.titular).length;
  const titulares = teamDraft.jogadores.filter((jogador) => jogador.titular);
  const reservas = teamDraft.jogadores.filter((jogador) => !jogador.titular);
  const positionCounts = countPositions(teamDraft.jogadores);
  const field = splitLineupForField(teamDraft.jogadores, teamDraft.formacao.nome);

  const handleToggleTitular = (playerId: string) => {
    setTeamDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        jogadores: current.jogadores.map((jogador) =>
          jogador.id === playerId ? { ...jogador, titular: !jogador.titular } : jogador
        ),
      };
    });
  };

  const handleChangeFormacao = (formacaoNome: FormacaoNome) => {
    setTeamDraft((current) => {
      if (!current) return current;
      return {
        ...current,
        formacao: {
          nome: formacaoNome,
          distribuicao: FORMACOES[formacaoNome],
        },
      };
    });
  };

  const handleSaveEscalacao = () => {
    const updated = updateTeamEscalacao(slot, teamDraft.id, {
      formacaoNome: teamDraft.formacao.nome,
      titularesIds: teamDraft.jogadores.filter((jogador) => jogador.titular).map((jogador) => jogador.id),
    });
    if (updated) setSave(updated);
  };

  return (
    <main className="min-h-screen w-full px-4 py-8 pb-24 md:px-8 md:pb-8 md:pl-[20rem]">
      <CareerNav slot={slot} current="team" teamPrimary={teamPrimary} />

      <div className="min-w-0 space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Gestão do Time</h1>
          <p className="text-sm text-muted-foreground">
            Slot {slot} • {team.nome} • {leagueName}
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border p-4" style={surfaceStyle}>
          <h2 className="text-lg font-semibold">Informações do Time</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p><strong>Time:</strong> {team.nome}</p>
            <p><strong>Conferência:</strong> {team.conferencia}</p>
            <p><strong>Formação:</strong> {teamDraft.formacao.nome}</p>
            <p><strong>Cores:</strong> {team.corPrimaria} / {team.corSecundaria}</p>
            <p>
              <strong>Elenco:</strong> GK {positionCounts.GK} • DF {positionCounts.DF} • MF {positionCounts.MF} • FW {positionCounts.FW}
            </p>
          </div>
        </article>

        <article className="rounded-xl border p-4" style={surfaceStyle}>
          <h2 className="text-lg font-semibold">Tabela da Conferência</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ borderColor: hexToRgba(teamPrimary, 0.35) }}>
                  <th className="px-2 py-2">#</th>
                  <th className="px-2 py-2">Time</th>
                  <th className="px-2 py-2">Pts</th>
                  <th className="px-2 py-2">J</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((currentTeam, index) => {
                  const isMyTeam = currentTeam.id === team.id;
                  return (
                    <tr
                      key={currentTeam.id}
                      className="border-b"
                      style={{
                        borderColor: hexToRgba(teamPrimary, 0.2),
                        ...(isMyTeam ? rowHighlightStyle : {}),
                      }}
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
        </article>
        </section>

        <section className="rounded-xl border p-4" style={surfaceStyle}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Escalação</h2>
          <div className="flex items-center gap-2 text-sm">
            <label htmlFor="formacao">Formação</label>
            <select
              id="formacao"
              className="h-9 rounded-md border border-input bg-background px-2"
              value={teamDraft.formacao.nome}
              onChange={(e) => handleChangeFormacao(e.target.value as FormacaoNome)}
            >
              {formacoes.map((formacaoNome) => (
                <option key={formacaoNome} value={formacaoNome}>
                  {formacaoNome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Selecione exatamente 11 titulares. Total atual: <strong>{titularesCount}/11</strong>
        </p>

        <div className="mt-4 rounded-xl border border-border bg-emerald-900/20 p-4">
          <div className="mx-auto flex max-w-3xl flex-col gap-5 rounded-xl border border-white/20 bg-emerald-700/20 p-4">
            <div className="flex items-center justify-center gap-2">
              {field.goleiro ? (
                <div className="rounded-md border border-white/30 bg-white/10 px-2 py-1 text-xs">
                  #{field.goleiro.numero} {field.goleiro.nome}
                </div>
              ) : (
                <div className="text-xs text-white/70">Sem GK titular</div>
              )}
            </div>
            {field.rows.map((row, idx) => (
              <div key={`${row[0]?.id ?? 'row'}-${idx}`} className="flex flex-wrap items-center justify-center gap-2">
                {row.map((jogador) => (
                  <div key={jogador.id} className="rounded-md border border-white/30 bg-white/10 px-2 py-1 text-xs">
                    #{jogador.numero} {jogador.nome}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-border p-3">
            <h3 className="mb-2 text-sm font-semibold">Titulares ({titulares.length})</h3>
            <div className="space-y-2">
              {titulares.map((jogador) => (
                <div key={jogador.id} className="flex items-center justify-between rounded-md border border-border px-2 py-1.5 text-sm">
                  <span>#{jogador.numero} {jogador.nome} ({jogador.posicao})</span>
                  <Button size="sm" variant="outline" onClick={() => handleToggleTitular(jogador.id)}>
                    Reserva
                  </Button>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-border p-3">
            <h3 className="mb-2 text-sm font-semibold">Reservas ({reservas.length})</h3>
            <div className="space-y-2">
              {reservas.map((jogador) => (
                <div key={jogador.id} className="flex items-center justify-between rounded-md border border-border px-2 py-1.5 text-sm">
                  <span>#{jogador.numero} {jogador.nome} ({jogador.posicao})</span>
                  <Button size="sm" variant="outline" onClick={() => handleToggleTitular(jogador.id)}>
                    Titular
                  </Button>
                </div>
              ))}
            </div>
          </article>
        </div>

        <Button className="mt-4" disabled={titularesCount !== 11} onClick={handleSaveEscalacao}>
          Salvar Escalação
        </Button>
        </section>
      </div>
    </main>
  );
}
