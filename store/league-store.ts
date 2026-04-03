import { create } from 'zustand';
import type { Time } from '@/types/team';

/**
 * Time com estatísticas da liga
 */
interface TimeComEstatisticas extends Time {
  pontos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsMarcados: number;
  golsSofridos: number;
  saldoGols: number;
}

/**
 * Resultado de uma partida
 */
interface ResultadoPartida {
  rodada: number;
  timeCasaId: number;
  timeVisitanteId: number;
  golsCasa: number;
  golsVisitante: number;
}

/**
 * Estado da liga
 */
interface LeagueState {
  // Dados da liga
  times: TimeComEstatisticas[];
  resultados: ResultadoPartida[];
  rodadaAtual: number;
  timeProtagonista: number | null;

  // Actions
  inicializarLiga: (times: Time[], timeProtagonista: number) => void;
  registrarResultado: (resultado: ResultadoPartida) => void;
  avancarRodada: () => void;
  reset: () => void;
}

/**
 * Estado inicial
 */
const initialState = {
  times: [],
  resultados: [],
  rodadaAtual: 1,
  timeProtagonista: null,
};

/**
 * Máximo de rodadas (ida e volta = 22)
 */
const MAX_RODADAS = 22;

/**
 * Store Zustand para estado da liga
 * 
 * Responsabilidades:
 * - Gerenciar times e classificação
 * - Registrar resultados de partidas
 * - Controlar rodadas
 */
export const useLeagueStore = create<LeagueState>((set) => ({
  ...initialState,

  inicializarLiga: (times, timeProtagonista) => {
    const timesComEstatisticas: TimeComEstatisticas[] = times.map((time) => ({
      ...time,
      pontos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsMarcados: 0,
      golsSofridos: 0,
      saldoGols: 0,
    }));

    set({
      times: timesComEstatisticas,
      timeProtagonista,
      rodadaAtual: 1,
      resultados: [],
    });
  },

  registrarResultado: (resultado) => set((state) => {
    const { timeCasaId, timeVisitanteId, golsCasa, golsVisitante } = resultado;

    // Determinar vencedor
    const casaVenceu = golsCasa > golsVisitante;
    const empate = golsCasa === golsVisitante;
    const visitanteVenceu = golsVisitante > golsCasa;

    // Atualizar estatísticas
    const timesAtualizados = state.times.map((time) => {
      // Time da casa
      if (time.id === timeCasaId) {
        return {
          ...time,
          pontos: time.pontos + (casaVenceu ? 3 : empate ? 1 : 0),
          vitorias: time.vitorias + (casaVenceu ? 1 : 0),
          empates: time.empates + (empate ? 1 : 0),
          derrotas: time.derrotas + (visitanteVenceu ? 1 : 0),
          golsMarcados: time.golsMarcados + golsCasa,
          golsSofridos: time.golsSofridos + golsVisitante,
          saldoGols: time.saldoGols + (golsCasa - golsVisitante),
        };
      }

      // Time visitante
      if (time.id === timeVisitanteId) {
        return {
          ...time,
          pontos: time.pontos + (visitanteVenceu ? 3 : empate ? 1 : 0),
          vitorias: time.vitorias + (visitanteVenceu ? 1 : 0),
          empates: time.empates + (empate ? 1 : 0),
          derrotas: time.derrotas + (casaVenceu ? 1 : 0),
          golsMarcados: time.golsMarcados + golsVisitante,
          golsSofridos: time.golsSofridos + golsCasa,
          saldoGols: time.saldoGols + (golsVisitante - golsCasa),
        };
      }

      return time;
    });

    return {
      times: timesAtualizados,
      resultados: [...state.resultados, resultado],
    };
  }),

  avancarRodada: () => set((state) => ({
    rodadaAtual: Math.min(state.rodadaAtual + 1, MAX_RODADAS),
  })),

  reset: () => set(initialState),
}));

/**
 * Seletor: Retorna classificação ordenada
 * 
 * Critérios:
 * 1. Pontos (decrescente)
 * 2. Saldo de gols (decrescente)
 * 3. Gols marcados (decrescente)
 */
export const selectClassificacao = (state: LeagueState): TimeComEstatisticas[] => {
  return [...state.times].sort((a, b) => {
    // 1º critério: Pontos
    if (b.pontos !== a.pontos) {
      return b.pontos - a.pontos;
    }

    // 2º critério: Saldo de gols
    if (b.saldoGols !== a.saldoGols) {
      return b.saldoGols - a.saldoGols;
    }

    // 3º critério: Gols marcados
    return b.golsMarcados - a.golsMarcados;
  });
};

/**
 * Seletor: Retorna próxima partida do protagonista
 * 
 * Nota: Implementação básica
 * TODO: Gerar tabela de confrontos completa (ida e volta)
 */
export const selectProximaPartida = (state: LeagueState): ResultadoPartida | null => {
  if (!state.timeProtagonista) {
    return null;
  }

  // Por ora, retorna null
  // A geração de tabela será implementada quando necessário
  return null;
};
