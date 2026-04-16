/**
 * Tipos relacionados ao jogador e seus atributos
 */

export type PlayerPosition = 
  | 'GK'  // Goleiro
  | 'DF'  // Defensor (Zagueiro)
  | 'MF'  // Meio-Campista (Meia)
  | 'FW'; // Atacante (Forward)

export interface PlayerAttributes {
  // Sistema universal de 3 atributos (min: 1, max: 5)
  // Todos os jogadores (incluindo GK) usam estes atributos
  potencia: number;  // Chute (ataque) + Bloqueio (defesa)
  rapidez: number;   // Drible (ataque) + Desarme (defesa)
  tecnica: number;   // Passe (ataque) + Interceptação (defesa)
}

// Tipo específico para ações do goleiro (não é um atributo, é uma escolha durante defesa)
export type GoalkeeperAction = 'captura' | 'espalme';

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
  nacionalidade?: string;
  idade?: number;
}

// Goleiro agora usa mesma interface Player (atributos universais)
// Removido interface Goalkeeper separada

// Constantes de atributos (novo sistema - 3 atributos)
export const TOTAL_PONTOS_ATRIBUTOS = 9;
export const PONTOS_OBRIGATORIOS = 3; // 1 em cada atributo (obrigatório)
export const PONTOS_LIVRES = 6; // 9 - 3 = 6 pontos para distribuir livremente
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
