import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCareerFromPlayer,
  finalizeCareerRound,
  getCareerRoundFixtures,
  getConferenceStandings,
  getNextCareerMatch,
  saveCareerSlot,
} from '@/lib/storage';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

const playerData = {
  nome: 'Aoi',
  posicao: 'MF' as const,
  timeId: 'tokyo-verdy-u18',
  numeroCamisa: 10,
  nacionalidade: 'Japão',
  idade: 16,
  atributos: {
    potencia: 3,
    rapidez: 4,
    tecnica: 2,
  },
};

describe('career round simulation', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('gera 12 partidas por rodada somando EAST e WEST', () => {
    const save = createCareerFromPlayer(playerData, 1);
    const fixtures = getCareerRoundFixtures(save, 1);
    expect(fixtures).toHaveLength(12);

    const hasProtagonistMatch = fixtures.some(
      (fixture) => fixture.timeCasa.id === playerData.timeId || fixture.timeVisitante.id === playerData.timeId,
    );
    expect(hasProtagonistMatch).toBe(true);
  });

  it('finaliza rodada do protagonista e simula os demais jogos', () => {
    const save = createCareerFromPlayer(playerData, 1);
    saveCareerSlot(1, save);

    const nextMatch = getNextCareerMatch(save, playerData.timeId);
    expect(nextMatch).toBeTruthy();

    const updated = finalizeCareerRound(1, 2, 1);
    expect(updated).toBeTruthy();
    if (!updated || !nextMatch) return;

    expect(updated.liga.rodadaAtual).toBe(2);
    const roundOneResults = updated.liga.resultados.filter((result) => result.rodada === 1);
    expect(roundOneResults).toHaveLength(12);

    const protagonistResult = roundOneResults.find(
      (result) =>
        (result.timeCasaId === nextMatch.team.id && result.timeVisitanteId === nextMatch.opponent.id) ||
        (result.timeCasaId === nextMatch.opponent.id && result.timeVisitanteId === nextMatch.team.id),
    );

    expect(protagonistResult).toBeTruthy();
    if (!protagonistResult) return;

    if (nextMatch.isHome) {
      expect(protagonistResult.golsCasa).toBe(2);
      expect(protagonistResult.golsVisitante).toBe(1);
    } else {
      expect(protagonistResult.golsCasa).toBe(1);
      expect(protagonistResult.golsVisitante).toBe(2);
    }
  });

  it('atualiza classificação da conferência com PJ/V/E/D/Pts', () => {
    const save = createCareerFromPlayer(playerData, 1);
    saveCareerSlot(1, save);
    const updated = finalizeCareerRound(1, 1, 0);
    expect(updated).toBeTruthy();
    if (!updated) return;

    const standings = getConferenceStandings(updated, 'EAST');
    expect(standings).toHaveLength(12);
    expect(standings.every((row) => row.pj === 1)).toBe(true);
  });

  it('acumula estatísticas do protagonista ao concluir rodada', () => {
    const save = createCareerFromPlayer(playerData, 1);
    saveCareerSlot(1, save);

    const updated = finalizeCareerRound(1, 1, 0, {
      partidas: 1,
      gols: 1,
      assistencias: 1,
      chutes: { total: 3, certos: 2 },
      dribles: { total: 4, certos: 3 },
      passes: { total: 5, certos: 4 },
      bloqueios: { total: 2, certos: 1 },
      desarmes: { total: 6, certos: 4 },
      interceptacoes: { total: 7, certos: 5 },
    });

    expect(updated).toBeTruthy();
    if (!updated) return;

    expect(updated.estatisticasProtagonista.partidas).toBe(1);
    expect(updated.estatisticasProtagonista.gols).toBe(1);
    expect(updated.estatisticasProtagonista.assistencias).toBe(1);
    expect(updated.estatisticasProtagonista.chutes).toEqual({ total: 3, certos: 2 });
    expect(updated.estatisticasProtagonista.dribles).toEqual({ total: 4, certos: 3 });
    expect(updated.estatisticasProtagonista.passes).toEqual({ total: 5, certos: 4 });
    expect(updated.estatisticasProtagonista.bloqueios).toEqual({ total: 2, certos: 1 });
    expect(updated.estatisticasProtagonista.desarmes).toEqual({ total: 6, certos: 4 });
    expect(updated.estatisticasProtagonista.interceptacoes).toEqual({ total: 7, certos: 5 });
  });

  it('vira automaticamente para a próxima temporada ao concluir a rodada 22', () => {
    const save = createCareerFromPlayer(playerData, 1);
    saveCareerSlot(1, {
      ...save,
      liga: {
        ...save.liga,
        rodadaAtual: 22,
      },
    });

    const updated = finalizeCareerRound(1, 2, 0);
    expect(updated).toBeTruthy();
    if (!updated) return;

    expect(updated.temporadaAtual).toBe(2);
    expect(updated.liga.rodadaAtual).toBe(1);
    expect(updated.liga.resultados).toHaveLength(0);
    expect(updated.historicoFinais).toHaveLength(1);

    const final = updated.historicoFinais[0];
    expect(final).toBeTruthy();
    if (!final) return;

    const eastTeam = updated.liga.times.find((time) => time.id === final.timeEastId);
    const westTeam = updated.liga.times.find((time) => time.id === final.timeWestId);
    expect(eastTeam?.conferencia).toBe('EAST');
    expect(westTeam?.conferencia).toBe('WEST');
    expect(final.temporada).toBe(1);
    expect([final.timeEastId, final.timeWestId]).toContain(final.campeaoId);
  });

  it('preserva protagonista e recompõe elenco para 3 GK, 8 DF, 8 MF e 8 FW após virada', () => {
    const save = createCareerFromPlayer(playerData, 1);
    const protagonistaTime = save.liga.times.find((time) => time.id === playerData.timeId);
    expect(protagonistaTime).toBeTruthy();
    if (!protagonistaTime) return;

    // Força cenário de envelhecimento para validar recomposição do elenco.
    const jogadoresEnvelhecidos = protagonistaTime.jogadores.map((jogador) => ({
      ...jogador,
      idade: jogador.isProtagonista ? 19 : 18,
    }));

    saveCareerSlot(1, {
      ...save,
      liga: {
        ...save.liga,
        rodadaAtual: 22,
        times: save.liga.times.map((time) =>
          time.id === protagonistaTime.id
            ? {
                ...time,
                jogadores: jogadoresEnvelhecidos,
              }
            : time,
        ),
      },
    });

    const updated = finalizeCareerRound(1, 1, 0);
    expect(updated).toBeTruthy();
    if (!updated) return;

    const updatedTeam = updated.liga.times.find((time) => time.id === playerData.timeId);
    expect(updatedTeam).toBeTruthy();
    if (!updatedTeam) return;

    const counts = updatedTeam.jogadores.reduce(
      (acc, jogador) => {
        acc[jogador.posicao] += 1;
        return acc;
      },
      { GK: 0, DF: 0, MF: 0, FW: 0 },
    );

    expect(counts.GK).toBe(3);
    expect(counts.DF).toBe(8);
    expect(counts.MF).toBe(8);
    expect(counts.FW).toBe(8);

    const protagonista = updatedTeam.jogadores.find((jogador) => jogador.isProtagonista);
    expect(protagonista).toBeTruthy();
    expect(protagonista?.nome).toBe(updated.protagonista.nome);
  });
});
