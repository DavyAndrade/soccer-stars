import { z } from 'zod';
import { CreatePlayerSchema } from '@/schemas/player-schema';
import { advanceSeasonAges, applyFormationToSquad, getInitialTeams } from '@/data/teams';
import { FORMACOES, type FormacaoNome, type TeamSquadPlayer, type Time } from '@/types/team';

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
  }),
});

const SaveSlotsSchema = z.object({
  slots: z.array(CareerSaveSchema.nullable()).length(3),
});

export type CareerSave = z.infer<typeof CareerSaveSchema>;
export type SaveSlotsState = z.infer<typeof SaveSlotsSchema>;

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
  return Array.from({ length: 30 }, (_, i) => i + 1).filter((n) => !used.has(n));
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
  return current.slots[slotId - 1];
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
    liga: { times: teams },
  };
}

export function updateCareerProtagonista(slotId: SaveSlotId, protagonista: PlayerData): CareerSave | null {
  const current = loadCareerSlot(slotId);
  if (!current) return null;

  const updated: CareerSave = {
    ...current,
    protagonista,
    updatedAt: new Date().toISOString(),
    liga: {
      times: syncProtagonista(current.liga.times as Time[], protagonista, slotId),
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

  const updatedTimes = (current.liga.times as Time[]).map((time) => {
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
      times: updatedTimes,
    },
  };

  saveCareerSlot(slotId, updated);
  return updated;
}

export function advanceSeason(save: CareerSave): CareerSave {
  const nextTimes = advanceSeasonAges(save.liga.times as Time[]);
  return {
    ...save,
    temporadaAtual: save.temporadaAtual + 1,
    updatedAt: new Date().toISOString(),
    liga: { times: nextTimes },
  };
}
