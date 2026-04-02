/**
 * Tipos relacionados a times e formações
 */

import type { Player, Goalkeeper, PlayerPosition } from './player';

export interface Time {
  id: string;
  nome: string;
  corPrimaria: string; // Cor do uniforme (hex)
  corSecundaria: string; // Cor secundária (hex)
  escudo?: string; // URL do escudo (opcional)
  goleiro: Goalkeeper;
  jogadores: Player[]; // 10 jogadores de linha
  formacao: Formacao;
  numerosDisponiveis: number[]; // Números de camisa disponíveis
}

export interface Formacao {
  nome: FormacaoNome; // Ex: '4-3-3'
  distribuicao: DistribuicaoZonas;
}

export type FormacaoNome = '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2' | '4-5-1' | '3-4-3';

export interface DistribuicaoZonas {
  DF1: number; // Número de jogadores na zona
  MI1: number;
  MC: number;
  MI2: number;
  DF2: number;
}

// Formações pré-definidas
export const FORMACOES: Record<FormacaoNome, DistribuicaoZonas> = {
  '4-3-3': { DF1: 4, MI1: 3, MC: 0, MI2: 0, DF2: 3 },
  '4-4-2': { DF1: 4, MI1: 4, MC: 0, MI2: 0, DF2: 2 },
  '4-2-3-1': { DF1: 4, MI1: 2, MC: 3, MI2: 0, DF2: 1 },
  '3-5-2': { DF1: 3, MI1: 5, MC: 0, MI2: 0, DF2: 2 },
  '4-5-1': { DF1: 4, MI1: 5, MC: 0, MI2: 0, DF2: 1 },
  '3-4-3': { DF1: 3, MI1: 4, MC: 0, MI2: 0, DF2: 3 },
};

// Números de camisa padrão (1-11)
export const NUMEROS_CAMISA_PADRAO = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

// Interface para liga/campeonato
export interface Liga {
  id: string;
  nome: string;
  temporada: string; // Ex: "2026"
  times: Time[];
  rodadas: Rodada[];
}

export interface Rodada {
  numero: number;
  partidas: PartidaLiga[];
}

export interface PartidaLiga {
  id: string;
  timeCasaId: string;
  timeVisitanteId: string;
  placar?: {
    casa: number;
    visitante: number;
  };
  finalizada: boolean;
}
