/**
 * Tipos relacionados ao jogador e seus atributos
 */

export type PlayerPosition = 
  | 'GK'  // Goleiro
  | 'DF'  // Defensor (Zagueiro)
  | 'MF'  // Meio-Campista (Meia)
  | 'FW'; // Atacante (Forward)

export interface PlayerAttributes {
  // Atributos Ofensivos (min: 1, max: 5)
  chute: number;
  drible: number;
  passe: number;
  
  // Atributos Defensivos (min: 1, max: 5)
  bloqueio: number;
  desarme: number;
  interceptacao: number;
}

export interface GoalkeeperAttributes {
  // Atributos exclusivos do Goleiro (total: 6 pontos)
  captura: number;
  espalme: number;
}

export interface Player {
  id: string;
  nome: string;
  numero: number; // Automático baseado no time
  posicao: PlayerPosition;
  atributos: PlayerAttributes;
  energia: number; // 0-10
  energiaMaxima: number; // 10
  isProtagonista: boolean;
  timeId: string;
  avatarUrl?: string; // Imagem escolhida pelo jogador (protagonista)
}

export interface Goalkeeper {
  id: string;
  nome: string;
  numero: number;
  atributos: GoalkeeperAttributes;
  timeId: string;
}

// Constantes de atributos
export const TOTAL_PONTOS_ATRIBUTOS = 18;
export const PONTOS_OBRIGATORIOS = 6; // 1 em cada atributo (obrigatório)
export const PONTOS_LIVRES = 12; // 18 - 6 = 12 pontos para distribuir livremente
export const MIN_ATRIBUTO = 1;
export const MAX_ATRIBUTO = 5;

// Constantes de energia
export const ENERGIA_INICIAL = 10;
export const ENERGIA_MAXIMA = 10;
export const REGENERACAO_INTERVALO = 5;
export const PENALIDADE_SEM_ENERGIA = -2; // 1d20 - 2 quando energia = 0

// Mapeamento de posições permitidas por zona (para enfrentamento aleatório)
export const POSICOES_POR_ZONA: Record<string, PlayerPosition[]> = {
  'DF1': ['DF', 'MF'],
  'MI1': ['DF', 'MF'],
  'MC': ['DF', 'MF', 'FW'],
  'MI2': ['MF', 'FW'],
  'DF2': ['MF', 'FW'], // Zona de ataque adversária
};
