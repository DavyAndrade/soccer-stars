import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCareerFromPlayer, loadCareerSlot, saveCareerSlot, updateTeamEscalacao } from '@/lib/storage';

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
  nacionalidade: 'Japao',
  idade: 16,
  atributos: {
    potencia: 3,
    rapidez: 4,
    tecnica: 2,
  },
};

describe('career team lineup persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('persiste imediatamente troca entre titular e reserva', () => {
    const save = createCareerFromPlayer(playerData, 1);
    saveCareerSlot(1, save);

    const before = loadCareerSlot(1);
    expect(before).toBeTruthy();
    if (!before) return;

    const team = before.liga.times.find((current) => current.id === before.protagonista.timeId);
    expect(team).toBeTruthy();
    if (!team) return;

    const titulares = team.jogadores.filter((jogador) => jogador.titular);
    const reservas = team.jogadores.filter((jogador) => !jogador.titular);
    const titular =
      titulares.find((starter) => reservas.some((bench) => bench.posicao === starter.posicao)) ?? titulares[0];
    const reserva =
      reservas.find((bench) => bench.posicao === titular?.posicao) ?? reservas[0];

    expect(titular).toBeTruthy();
    expect(reserva).toBeTruthy();
    if (!titular || !reserva) return;

    const titularesIds = titulares.map((jogador) => (jogador.id === titular.id ? reserva.id : jogador.id));
    const updated = updateTeamEscalacao(1, team.id, {
      formacaoNome: team.formacao.nome,
      titularesIds,
    });

    expect(updated).toBeTruthy();

    const reloaded = loadCareerSlot(1);
    expect(reloaded).toBeTruthy();
    if (!reloaded) return;

    const updatedTeam = reloaded.liga.times.find((current) => current.id === team.id);
    expect(updatedTeam).toBeTruthy();
    if (!updatedTeam) return;

    expect(updatedTeam.jogadores.find((jogador) => jogador.id === titular.id)?.titular).toBe(false);
    expect(updatedTeam.jogadores.find((jogador) => jogador.id === reserva.id)?.titular).toBe(true);
  });

  it('garante exatamente 11 titulares mesmo com payload incompleto', () => {
    const save = createCareerFromPlayer(playerData, 1);
    saveCareerSlot(1, save);

    const before = loadCareerSlot(1);
    expect(before).toBeTruthy();
    if (!before) return;

    const team = before.liga.times.find((current) => current.id === before.protagonista.timeId);
    expect(team).toBeTruthy();
    if (!team) return;

    const firstStarter = team.jogadores.find((jogador) => jogador.titular);
    expect(firstStarter).toBeTruthy();
    if (!firstStarter) return;

    const updated = updateTeamEscalacao(1, team.id, {
      formacaoNome: team.formacao.nome,
      titularesIds: [firstStarter.id],
    });

    expect(updated).toBeTruthy();
    if (!updated) return;

    const updatedTeam = updated.liga.times.find((current) => current.id === team.id);
    expect(updatedTeam).toBeTruthy();
    if (!updatedTeam) return;

    expect(updatedTeam.jogadores.filter((jogador) => jogador.titular)).toHaveLength(11);
  });
});
