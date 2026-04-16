import { z } from 'zod';
import { CreatePlayerSchema } from '@/schemas/player-schema';
import { advanceSeasonAges, applyFormationToSquad, getInitialTeams } from '@/data/teams';
import { FORMACOES, type ConferenciaLiga, type FormacaoNome, type TeamSquadPlayer, type Time } from '@/types/team';

/**
 * Chaves do localStorage
 */
export const STORAGE_KEYS = {
  PLAYER: 'soccer-stars:player',
  LEAGUE: 'soccer-stars:league',
  SAVE_SLOTS: 'soccer-stars:save-slots',
} as const;

/**
 * Schema para validar dados da liga
 */
const LeagueDataSchema = z.object({
  times: z.array(z.any()), // Simplificado por ora
  resultados: z.array(z.any()),
  rodadaAtual: z.number().int().min(1).max(22),
  timeProtagonista: z.union([z.number().int(), z.string()]).nullable(),
});

/**
 * Tipos inferidos
 */
type PlayerData = z.infer<typeof CreatePlayerSchema>;
type LeagueData = z.infer<typeof LeagueDataSchema>;
type SaveSlotId = 1 | 2 | 3;

const CareerSaveSchema = z.object({
  slotId: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  createdAt: z.string(),
  updatedAt: z.string(),
  temporadaAtual: z.number().int().min(1),
  protagonista: CreatePlayerSchema.extend({
    avatar: z.string().optional(),
  }),
  liga: z.object({
    times: z.array(z.any()),
    rodadaAtual: z.number().int().min(1).max(22).default(1),
    resultados: z.array(z.object({
      rodada: z.number().int().min(1).max(22),
      timeCasaId: z.string(),
      timeVisitanteId: z.string(),
      golsCasa: z.number().int().min(0).max(99),
      golsVisitante: z.number().int().min(0).max(99),
    })).default([]),
  }),
});

const SaveSlotsSchema = z.object({
  slots: z.array(CareerSaveSchema.nullable()).length(3),
});

export type CareerSave = z.infer<typeof CareerSaveSchema>;
export type SaveSlotsState = z.infer<typeof SaveSlotsSchema>;
export type CareerMatchResult = CareerSave['liga']['resultados'][number];
export type CareerRoundFixture = {
  rodada: number;
  conferencia: ConferenciaLiga;
  timeCasa: Time;
  timeVisitante: Time;
};

type CareerLigaState = {
  times: Time[];
  rodadaAtual: number;
  resultados: CareerMatchResult[];
};

export type ConferenceStanding = {
  time: Time;
  pj: number;
  v: number;
  e: number;
  d: number;
  pts: number;
};

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const storage = window.localStorage as Partial<Storage> | undefined;
  if (
    !storage ||
    typeof storage.getItem !== 'function' ||
    typeof storage.setItem !== 'function' ||
    typeof storage.removeItem !== 'function'
  ) {
    return null;
  }

  return storage as Storage;
}

function calculateAvailableNumbers(squad: TeamSquadPlayer[]): number[] {
  const used = new Set(squad.map((player) => player.numero));
  return Array.from({ length: 99 }, (_, i) => i + 1).filter((n) => !used.has(n));
}

function normalizeLigaState(liga: CareerSave['liga']): CareerLigaState {
  return {
    times: liga.times as Time[],
    rodadaAtual: liga.rodadaAtual ?? 1,
    resultados: liga.resultados ?? [],
  };
}

function getConferenceTeamPool(times: Time[], conference: ConferenciaLiga): Time[] {
  return [...times]
    .filter((time) => time.conferencia === conference)
    .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
}

function rotateRoundRobin(ids: string[]): string[] {
  if (ids.length < 2) return ids;
  return [ids[0], ids[ids.length - 1], ...ids.slice(1, -1)];
}

function getConferenceRoundPairings(teamIds: string[], round: number): Array<[string, string]> {
  if (teamIds.length % 2 !== 0 || teamIds.length < 2) return [];
  const roundsPerLeg = teamIds.length - 1;
  const normalizedRound = ((round - 1) % roundsPerLeg) + 1;
  const secondLeg = round > roundsPerLeg;
  let rotating = [...teamIds];

  for (let currentRound = 1; currentRound <= normalizedRound; currentRound += 1) {
    const pairs: Array<[string, string]> = [];
    for (let i = 0; i < rotating.length / 2; i += 1) {
      const home = rotating[i];
      const away = rotating[rotating.length - 1 - i];
      if (!home || !away) continue;
      pairs.push(currentRound % 2 === 1 ? [home, away] : [away, home]);
    }
    if (currentRound === normalizedRound) {
      return secondLeg ? pairs.map(([home, away]) => [away, home]) : pairs;
    }
    rotating = rotateRoundRobin(rotating);
  }

  return [];
}

function toFixture(
  teamsById: Map<string, Time>,
  rodada: number,
  conference: ConferenciaLiga,
  pair: [string, string],
): CareerRoundFixture | null {
  const timeCasa = teamsById.get(pair[0]);
  const timeVisitante = teamsById.get(pair[1]);
  if (!timeCasa || !timeVisitante) return null;
  return { rodada, conferencia: conference, timeCasa, timeVisitante };
}

export function getCareerRoundFixtures(save: CareerSave, rodada: number): CareerRoundFixture[] {
  const liga = normalizeLigaState(save.liga);
  const teamsById = new Map(liga.times.map((team) => [team.id, team]));
  const conferences: ConferenciaLiga[] = ['EAST', 'WEST'];
  const fixtures: CareerRoundFixture[] = [];

  conferences.forEach((conference) => {
    const pool = getConferenceTeamPool(liga.times, conference);
    const pairings = getConferenceRoundPairings(pool.map((team) => team.id), rodada);
    pairings.forEach((pair) => {
      const fixture = toFixture(teamsById, rodada, conference, pair);
      if (fixture) fixtures.push(fixture);
    });
  });

  return fixtures;
}

export function getNextCareerMatch(save: CareerSave, teamId: string): { rodada: number; team: Time; opponent: Time; isHome: boolean } | null {
  const liga = normalizeLigaState(save.liga);
  const team = liga.times.find((current) => current.id === teamId);
  if (!team) return null;

  const fixture = getCareerRoundFixtures(save, liga.rodadaAtual).find(
    (current) => current.timeCasa.id === team.id || current.timeVisitante.id === team.id,
  );
  if (!fixture) return null;
  const isHome = fixture.timeCasa.id === team.id;
  const opponent = isHome ? fixture.timeVisitante : fixture.timeCasa;

  return {
    rodada: liga.rodadaAtual,
    team,
    opponent,
    isHome,
  };
}

export function getConferenceStandings(save: CareerSave, conference: ConferenciaLiga): ConferenceStanding[] {
  const liga = normalizeLigaState(save.liga);
  const pool = getConferenceTeamPool(liga.times, conference);
  const poolSet = new Set(pool.map((time) => time.id));

  const standingsMap = new Map<string, ConferenceStanding>(
    pool.map((time) => [
      time.id,
      { time, pj: 0, v: 0, e: 0, d: 0, pts: 0 },
    ]),
  );

  liga.resultados.forEach((resultado) => {
    if (!poolSet.has(resultado.timeCasaId) || !poolSet.has(resultado.timeVisitanteId)) return;

    const casa = standingsMap.get(resultado.timeCasaId);
    const visitante = standingsMap.get(resultado.timeVisitanteId);
    if (!casa || !visitante) return;

    casa.pj += 1;
    visitante.pj += 1;

    if (resultado.golsCasa > resultado.golsVisitante) {
      casa.v += 1;
      casa.pts += 3;
      visitante.d += 1;
      return;
    }

    if (resultado.golsCasa < resultado.golsVisitante) {
      visitante.v += 1;
      visitante.pts += 3;
      casa.d += 1;
      return;
    }

    casa.e += 1;
    visitante.e += 1;
    casa.pts += 1;
    visitante.pts += 1;
  });

  return [...standingsMap.values()].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.v !== a.v) return b.v - a.v;
    return a.time.nome.localeCompare(b.time.nome, 'pt-BR');
  });
}

export function registerCareerMatchResult(
  slotId: SaveSlotId,
  goalsFor: number,
  goalsAgainst: number,
): CareerSave | null {
  const current = loadCareerSlot(slotId);
  if (!current) return null;

  const liga = normalizeLigaState(current.liga);
  const nextMatch = getNextCareerMatch(current, current.protagonista.timeId);
  if (!nextMatch) return current;

  const isHome = liga.rodadaAtual % 2 === 1;
  const result: CareerMatchResult = {
    rodada: liga.rodadaAtual,
    timeCasaId: isHome ? nextMatch.team.id : nextMatch.opponent.id,
    timeVisitanteId: isHome ? nextMatch.opponent.id : nextMatch.team.id,
    golsCasa: isHome ? goalsFor : goalsAgainst,
    golsVisitante: isHome ? goalsAgainst : goalsFor,
  };

  const updated: CareerSave = {
    ...current,
    updatedAt: new Date().toISOString(),
    liga: {
      ...liga,
      resultados: [...liga.resultados, result],
      rodadaAtual: Math.min(22, liga.rodadaAtual + 1),
      times: liga.times,
    },
  };

  saveCareerSlot(slotId, updated);
  return updated;
}

function calculateTeamStrength(team: Time): number {
  const starters = team.jogadores.filter((player) => player.titular).slice(0, 11);
  const source = starters.length > 0 ? starters : team.jogadores.slice(0, 11);
  if (source.length === 0) return 3;
  const total = source.reduce(
    (sum, player) => sum + player.atributos.potencia + player.atributos.rapidez + player.atributos.tecnica,
    0,
  );
  return total / (source.length * 3);
}

function sampleGoals(expectedGoals: number): number {
  let goals = 0;
  for (let i = 0; i < 6; i += 1) {
    const threshold = expectedGoals / (i + 2.4);
    if (Math.random() < threshold) goals += 1;
  }
  return goals;
}

function simulateFixtureScore(timeCasa: Time, timeVisitante: Time): { golsCasa: number; golsVisitante: number } {
  const strengthCasa = calculateTeamStrength(timeCasa);
  const strengthVisitante = calculateTeamStrength(timeVisitante);
  const expectedCasa = Math.max(0.35, Math.min(2.9, 1.2 + (strengthCasa - strengthVisitante) * 0.35));
  const expectedVisitante = Math.max(0.25, Math.min(2.7, 1.0 + (strengthVisitante - strengthCasa) * 0.3));

  return {
    golsCasa: sampleGoals(expectedCasa),
    golsVisitante: sampleGoals(expectedVisitante),
  };
}

function hasRoundResult(
  resultados: CareerMatchResult[],
  rodada: number,
  timeCasaId: string,
  timeVisitanteId: string,
): boolean {
  return resultados.some(
    (result) =>
      result.rodada === rodada &&
      result.timeCasaId === timeCasaId &&
      result.timeVisitanteId === timeVisitanteId,
  );
}

export function finalizeCareerRound(
  slotId: SaveSlotId,
  protagonistGoals: number,
  opponentGoals: number,
): CareerSave | null {
  const current = loadCareerSlot(slotId);
  if (!current) return null;

  const liga = normalizeLigaState(current.liga);
  const nextMatch = getNextCareerMatch(current, current.protagonista.timeId);
  if (!nextMatch) return current;

  const fixtures = getCareerRoundFixtures(current, liga.rodadaAtual);
  if (fixtures.length === 0) return current;

  const protagonistResult: CareerMatchResult = {
    rodada: liga.rodadaAtual,
    timeCasaId: nextMatch.isHome ? nextMatch.team.id : nextMatch.opponent.id,
    timeVisitanteId: nextMatch.isHome ? nextMatch.opponent.id : nextMatch.team.id,
    golsCasa: nextMatch.isHome ? protagonistGoals : opponentGoals,
    golsVisitante: nextMatch.isHome ? opponentGoals : protagonistGoals,
  };

  const roundResults: CareerMatchResult[] = fixtures
    .filter(
      (fixture) =>
        !hasRoundResult(liga.resultados, liga.rodadaAtual, fixture.timeCasa.id, fixture.timeVisitante.id),
    )
    .map((fixture) => {
      if (
        (fixture.timeCasa.id === nextMatch.team.id && fixture.timeVisitante.id === nextMatch.opponent.id) ||
        (fixture.timeCasa.id === nextMatch.opponent.id && fixture.timeVisitante.id === nextMatch.team.id)
      ) {
        return protagonistResult;
      }

      const simulated = simulateFixtureScore(fixture.timeCasa, fixture.timeVisitante);
      return {
        rodada: liga.rodadaAtual,
        timeCasaId: fixture.timeCasa.id,
        timeVisitanteId: fixture.timeVisitante.id,
        golsCasa: simulated.golsCasa,
        golsVisitante: simulated.golsVisitante,
      };
    });

  const updated: CareerSave = {
    ...current,
    updatedAt: new Date().toISOString(),
    liga: {
      ...liga,
      resultados: [...liga.resultados, ...roundResults],
      rodadaAtual: Math.min(22, liga.rodadaAtual + 1),
      times: liga.times,
    },
  };

  saveCareerSlot(slotId, updated);
  return updated;
}

function buildProtagonista(player: PlayerData, slotId: SaveSlotId): TeamSquadPlayer {
  return {
    id: `protagonista-${slotId}`,
    nome: player.nome,
    numero: player.numeroCamisa,
    posicao: player.posicao,
    atributos: player.atributos,
    energia: 10,
    energiaMaxima: 10,
    isProtagonista: true,
    timeId: player.timeId,
    avatarUrl: player.avatar,
    nacionalidade: player.nacionalidade,
    idade: player.idade,
    titular: false,
  };
}

function syncProtagonista(times: Time[], protagonista: PlayerData, slotId: SaveSlotId): Time[] {
  const protagonistaJogador = buildProtagonista(protagonista, slotId);

  const cleared = times.map((time) => ({
    ...time,
    jogadores: time.jogadores.filter((jogador) => !jogador.isProtagonista),
  }));

  return cleared.map((time) => {
    if (time.id !== protagonista.timeId) {
      return {
        ...time,
        numerosDisponiveis: calculateAvailableNumbers(time.jogadores),
      };
    }

    const conflitantes = time.jogadores.filter((jogador) => jogador.numero === protagonista.numeroCamisa);
    const semConflito = conflitantes.length > 0
      ? time.jogadores.filter((jogador) => jogador.numero !== protagonista.numeroCamisa)
      : time.jogadores;

    const reservaMesmoCargo = semConflito.find(
      (jogador) => jogador.posicao === protagonista.posicao && !jogador.titular
    );
    const substitutoId = reservaMesmoCargo?.id ?? semConflito.find((jogador) => !jogador.titular)?.id;

    const baseSquad = substitutoId
      ? semConflito.filter((jogador) => jogador.id !== substitutoId)
      : semConflito.slice(0, Math.max(0, semConflito.length - 1));

    const jogadoresAtualizados = applyFormationToSquad([...baseSquad, protagonistaJogador], time.formacao.nome);
    return {
      ...time,
      jogadores: jogadoresAtualizados,
      numerosDisponiveis: calculateAvailableNumbers(jogadoresAtualizados),
    };
  });
}

/**
 * Salvar dados do jogador no localStorage
 */
export function savePlayerData(data: PlayerData): void {
  const storage = getBrowserStorage();
  if (!storage) return;

  try {
    const serialized = JSON.stringify(data);
    storage.setItem(STORAGE_KEYS.PLAYER, serialized);
  } catch (error) {
    console.error('[Storage] Erro ao salvar dados do jogador:', error);
  }
}

/**
 * Carregar dados do jogador do localStorage
 * 
 * Retorna null se:
 * - Não houver dados salvos
 * - Dados estiverem corrompidos
 * - Validação Zod falhar
 */
export function loadPlayerData(): PlayerData | null {
  const storage = getBrowserStorage();
  if (!storage) return null;

  try {
    const serialized = storage.getItem(STORAGE_KEYS.PLAYER);
    
    if (!serialized) {
      return null;
    }

    const parsed = JSON.parse(serialized);
    
    // Validar com Zod
    const result = CreatePlayerSchema.safeParse(parsed);
    
    if (!result.success) {
      console.error('[Storage] Validação de dados do jogador falhou:', result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('[Storage] Erro ao carregar dados do jogador:', error);
    return null;
  }
}

/**
 * Salvar dados da liga no localStorage
 */
export function saveLeagueData(data: LeagueData): void {
  const storage = getBrowserStorage();
  if (!storage) return;

  try {
    const serialized = JSON.stringify(data);
    storage.setItem(STORAGE_KEYS.LEAGUE, serialized);
  } catch (error) {
    console.error('[Storage] Erro ao salvar dados da liga:', error);
  }
}

/**
 * Carregar dados da liga do localStorage
 * 
 * Retorna null se:
 * - Não houver dados salvos
 * - Dados estiverem corrompidos
 * - Validação Zod falhar
 */
export function loadLeagueData(): LeagueData | null {
  const storage = getBrowserStorage();
  if (!storage) return null;

  try {
    const serialized = storage.getItem(STORAGE_KEYS.LEAGUE);
    
    if (!serialized) {
      return null;
    }

    const parsed = JSON.parse(serialized);
    
    // Validar com Zod
    const result = LeagueDataSchema.safeParse(parsed);
    
    if (!result.success) {
      console.error('[Storage] Validação de dados da liga falhou:', result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.error('[Storage] Erro ao carregar dados da liga:', error);
    return null;
  }
}

/**
 * Limpar todos os dados do jogo do localStorage
 */
export function clearAllData(): void {
  const storage = getBrowserStorage();
  if (!storage) return;

  try {
    storage.removeItem(STORAGE_KEYS.PLAYER);
    storage.removeItem(STORAGE_KEYS.LEAGUE);
    storage.removeItem(STORAGE_KEYS.SAVE_SLOTS);
  } catch (error) {
    console.error('[Storage] Erro ao limpar dados:', error);
  }
}

export function loadSaveSlots(): SaveSlotsState {
  const storage = getBrowserStorage();
  if (!storage) {
    return { slots: [null, null, null] };
  }

  try {
    const raw = storage.getItem(STORAGE_KEYS.SAVE_SLOTS);
    if (!raw) {
      return { slots: [null, null, null] };
    }

    const parsed = JSON.parse(raw);
    const result = SaveSlotsSchema.safeParse(parsed);
    if (!result.success) {
      console.error('[Storage] Save slots inválidos:', result.error);
      return { slots: [null, null, null] };
    }
    return result.data;
  } catch (error) {
    console.error('[Storage] Erro ao carregar save slots:', error);
    return { slots: [null, null, null] };
  }
}

export function saveSaveSlots(data: SaveSlotsState): void {
  const storage = getBrowserStorage();
  if (!storage) return;

  try {
    storage.setItem(STORAGE_KEYS.SAVE_SLOTS, JSON.stringify(data));
  } catch (error) {
    console.error('[Storage] Erro ao salvar save slots:', error);
  }
}

export function saveCareerSlot(slotId: SaveSlotId, save: Omit<CareerSave, 'slotId'> | CareerSave): void {
  const current = loadSaveSlots();
  current.slots[slotId - 1] = { ...save, slotId };
  saveSaveSlots(current);
}

export function loadCareerSlot(slotId: SaveSlotId): CareerSave | null {
  const current = loadSaveSlots();
  const save = current.slots[slotId - 1];
  if (!save) return null;

  const normalizedTimes = (save.liga.times as Time[]).map((time) => {
    const titularesCount = time.jogadores.filter((jogador) => jogador.titular).length;
    const jogadores =
      titularesCount === 11
        ? time.jogadores
        : applyFormationToSquad(time.jogadores, time.formacao.nome);
    return {
      ...time,
      jogadores,
      numerosDisponiveis: calculateAvailableNumbers(jogadores),
    };
  });

  const needsUpdate = normalizedTimes.some((time, index) => {
    const previous = save.liga.times[index] as Time | undefined;
    return (
      JSON.stringify(previous?.jogadores) !== JSON.stringify(time.jogadores) ||
      JSON.stringify(previous?.numerosDisponiveis) !== JSON.stringify(time.numerosDisponiveis)
    );
  });

  if (!needsUpdate) {
    return save;
  }

  const normalized: CareerSave = {
    ...save,
    updatedAt: new Date().toISOString(),
    liga: {
      ...save.liga,
      times: normalizedTimes,
    },
  };

  saveCareerSlot(slotId, normalized);
  return normalized;
}

export function deleteCareerSlot(slotId: SaveSlotId): void {
  const current = loadSaveSlots();
  current.slots[slotId - 1] = null;
  saveSaveSlots(current);
}

export function createCareerFromPlayer(player: PlayerData, slotId: SaveSlotId): CareerSave {
  const teams = syncProtagonista(getInitialTeams(), player, slotId);
  return {
    slotId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    temporadaAtual: 1,
    protagonista: player,
    liga: { times: teams, rodadaAtual: 1, resultados: [] },
  };
}

export function updateCareerProtagonista(slotId: SaveSlotId, protagonista: PlayerData): CareerSave | null {
  const current = loadCareerSlot(slotId);
  if (!current) return null;
  const liga = normalizeLigaState(current.liga);

  const updated: CareerSave = {
    ...current,
    protagonista,
    updatedAt: new Date().toISOString(),
    liga: {
      ...liga,
      times: syncProtagonista(liga.times, protagonista, slotId),
    },
  };

  saveCareerSlot(slotId, updated);
  return updated;
}

type UpdateEscalacaoPayload = {
  formacaoNome: FormacaoNome;
  titularesIds: string[];
};

export function updateTeamEscalacao(
  slotId: SaveSlotId,
  teamId: string,
  payload: UpdateEscalacaoPayload
): CareerSave | null {
  const current = loadCareerSlot(slotId);
  if (!current) return null;
  const liga = normalizeLigaState(current.liga);

  const updatedTimes = liga.times.map((time) => {
    if (time.id !== teamId) {
      return time;
    }

    const titularesSet = new Set(payload.titularesIds);
    let jogadores = time.jogadores.map((jogador) => ({ ...jogador, titular: titularesSet.has(jogador.id) }));
    const titularesAtuais = jogadores.filter((jogador) => jogador.titular);

    if (titularesAtuais.length < 11) {
      const reservas = jogadores.filter((jogador) => !jogador.titular);
      reservas.slice(0, 11 - titularesAtuais.length).forEach((jogador) => {
        jogador.titular = true;
      });
    }

    if (jogadores.filter((jogador) => jogador.titular).length > 11) {
      let extras = jogadores.filter((jogador) => jogador.titular).length - 11;
      jogadores = jogadores.map((jogador) => {
        if (extras > 0 && jogador.titular) {
          extras -= 1;
          return { ...jogador, titular: false };
        }
        return jogador;
      });
    }

    return {
      ...time,
      formacao: {
        nome: payload.formacaoNome,
        distribuicao: FORMACOES[payload.formacaoNome],
      },
      jogadores,
      numerosDisponiveis: calculateAvailableNumbers(jogadores),
    };
  });

  const updated: CareerSave = {
    ...current,
    updatedAt: new Date().toISOString(),
    liga: {
      ...liga,
      times: updatedTimes,
    },
  };

  saveCareerSlot(slotId, updated);
  return updated;
}

export function advanceSeason(save: CareerSave): CareerSave {
  const liga = normalizeLigaState(save.liga);
  const nextTimes = advanceSeasonAges(liga.times);
  return {
    ...save,
    temporadaAtual: save.temporadaAtual + 1,
    updatedAt: new Date().toISOString(),
    liga: { ...liga, times: nextTimes, rodadaAtual: 1, resultados: [] },
  };
}
