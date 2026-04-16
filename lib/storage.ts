import { z } from 'zod';
import { CreatePlayerSchema } from '@/schemas/player-schema';
import { advanceSeasonAges, getInitialTeams } from '@/data/teams';
import type { Time } from '@/types/team';

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

/**
 * Salvar dados do jogador no localStorage
 */
export function savePlayerData(data: PlayerData): void {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEYS.PLAYER, serialized);
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
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.PLAYER);
    
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
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEYS.LEAGUE, serialized);
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
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.LEAGUE);
    
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
  try {
    localStorage.removeItem(STORAGE_KEYS.PLAYER);
    localStorage.removeItem(STORAGE_KEYS.LEAGUE);
    localStorage.removeItem(STORAGE_KEYS.SAVE_SLOTS);
  } catch (error) {
    console.error('[Storage] Erro ao limpar dados:', error);
  }
}

export function loadSaveSlots(): SaveSlotsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVE_SLOTS);
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
  try {
    localStorage.setItem(STORAGE_KEYS.SAVE_SLOTS, JSON.stringify(data));
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

export function createCareerFromPlayer(player: PlayerData, slotId: SaveSlotId): CareerSave {
  const teams = getInitialTeams();
  return {
    slotId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    temporadaAtual: 1,
    protagonista: player,
    liga: { times: teams },
  };
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
