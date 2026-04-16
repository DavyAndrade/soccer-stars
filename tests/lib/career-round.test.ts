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
});
