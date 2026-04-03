import { create } from 'zustand';
import type { ZonaCampo, AcaoPartida } from '@/types/match';

/**
 * Estado da partida
 */
interface MatchState {
  // Placar
  placarCasa: number;
  placarVisitante: number;

  // Posse de bola
  posseTime: 'casa' | 'visitante';

  // Zona atual
  zonaAtual: ZonaCampo;

  // Tempo
  minutoAtual: number;
  acrescimos1Tempo: number;
  acrescimos2Tempo: number;

  // Energia
  energiaProtagonista: number;
  energiaAdversario: number;

  // Histórico
  historicoAcoes: AcaoPartida[];

  // Actions
  marcarGol: (time: 'casa' | 'visitante') => void;
  setPosse: (time: 'casa' | 'visitante') => void;
  setZona: (zona: ZonaCampo) => void;
  avancarMinuto: () => void;
  setAcrescimos: (tempo: 1 | 2, minutos: number) => void;
  consumirEnergia: (jogador: 'protagonista' | 'adversario') => void;
  regenerarEnergia: () => void;
  adicionarAcao: (acao: AcaoPartida) => void;
  reset: () => void;
}

/**
 * Estado inicial da partida
 */
const initialState = {
  placarCasa: 0,
  placarVisitante: 0,
  posseTime: 'casa' as const,
  zonaAtual: 'MC' as ZonaCampo,
  minutoAtual: 0,
  acrescimos1Tempo: 0,
  acrescimos2Tempo: 0,
  energiaProtagonista: 10,
  energiaAdversario: 10,
  historicoAcoes: [],
};

/**
 * Store Zustand para estado da partida
 * 
 * Responsabilidades:
 * - Gerenciar placar, posse, zona atual
 * - Controlar tempo e energia
 * - Registrar histórico de ações
 */
export const useMatchStore = create<MatchState>((set) => ({
  ...initialState,

  marcarGol: (time) => set((state) => ({
    placarCasa: time === 'casa' ? state.placarCasa + 1 : state.placarCasa,
    placarVisitante: time === 'visitante' ? state.placarVisitante + 1 : state.placarVisitante,
    zonaAtual: 'MC', // Resetar para meio-campo após gol
  })),

  setPosse: (time) => set({ posseTime: time }),

  setZona: (zona) => set({ zonaAtual: zona }),

  avancarMinuto: () => set((state) => ({
    minutoAtual: state.minutoAtual + 1,
  })),

  setAcrescimos: (tempo, minutos) => set((state) => ({
    acrescimos1Tempo: tempo === 1 ? minutos : state.acrescimos1Tempo,
    acrescimos2Tempo: tempo === 2 ? minutos : state.acrescimos2Tempo,
  })),

  consumirEnergia: (jogador) => set((state) => {
    if (jogador === 'protagonista') {
      return {
        energiaProtagonista: Math.max(0, state.energiaProtagonista - 1),
      };
    }
    return {
      energiaAdversario: Math.max(0, state.energiaAdversario - 1),
    };
  }),

  regenerarEnergia: () => set((state) => ({
    energiaProtagonista: Math.min(10, state.energiaProtagonista + 5),
    energiaAdversario: Math.min(10, state.energiaAdversario + 5),
  })),

  adicionarAcao: (acao) => set((state) => ({
    historicoAcoes: [...state.historicoAcoes, acao],
  })),

  reset: () => set(initialState),
}));

/**
 * Seletor: Calcula tempo restante da partida
 * Tempo total é dinâmico: no 1º tempo usa apenas acréscimos do 1º tempo
 */
export const selectTempoRestante = (state: MatchState): number => {
  const fimPrimeiroTempo = 45 + state.acrescimos1Tempo;
  
  // Se ainda no 1º tempo, calcular apenas até o fim do 1º tempo
  if (state.minutoAtual < fimPrimeiroTempo) {
    return fimPrimeiroTempo - state.minutoAtual;
  }
  
  // Se no 2º tempo ou após, calcular até o fim do jogo
  const tempoTotal = 90 + state.acrescimos1Tempo + state.acrescimos2Tempo;
  return tempoTotal - state.minutoAtual;
};

/**
 * Seletor: Determina período atual da partida
 */
export const selectPeriodoAtual = (state: MatchState): 'primeiro_tempo' | 'intervalo' | 'segundo_tempo' | 'finalizado' => {
  const fimPrimeiroTempo = 45 + state.acrescimos1Tempo;
  const tempoTotal = 90 + state.acrescimos1Tempo + state.acrescimos2Tempo;

  if (state.minutoAtual < fimPrimeiroTempo) {
    return 'primeiro_tempo';
  }
  
  if (state.minutoAtual === fimPrimeiroTempo) {
    return 'intervalo';
  }
  
  if (state.minutoAtual < tempoTotal) {
    return 'segundo_tempo';
  }
  
  return 'finalizado';
};
