import { z } from 'zod';
import { CreatePlayerSchema } from '@/schemas/player-schema';

/**
 * Chaves do localStorage
 */
export const STORAGE_KEYS = {
  PLAYER: 'soccer-stars:player',
  LEAGUE: 'soccer-stars:league',
} as const;

/**
 * Schema para validar dados da liga
 */
const LeagueDataSchema = z.object({
  times: z.array(z.any()), // Simplificado por ora
  resultados: z.array(z.any()),
  rodadaAtual: z.number().int().min(1).max(22),
  timeProtagonista: z.number().int().nullable(),
});

/**
 * Tipos inferidos
 */
type PlayerData = z.infer<typeof CreatePlayerSchema>;
type LeagueData = z.infer<typeof LeagueDataSchema>;

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
  } catch (error) {
    console.error('[Storage] Erro ao limpar dados:', error);
  }
}
