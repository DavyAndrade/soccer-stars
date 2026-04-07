import { create } from 'zustand';
import type { PlayerPosition, PlayerAttributes } from '@/types/player';

/**
 * Estado do jogador protagonista
 */
interface PlayerState {
  // Dados do jogador
  nome: string;
  posicao: PlayerPosition | null;
  atributos: PlayerAttributes | null; // Agora todos usam PlayerAttributes
  avatar?: string;
  time: string | null;
  numeroCamisa: number | null;

  // Actions
  setNome: (nome: string) => void;
  setPosicao: (posicao: PlayerPosition) => void;
  setAtributos: (atributos: PlayerAttributes) => void;
  setAvatar: (avatar: string | undefined) => void;
  setTime: (time: string) => void;
  setNumeroCamisa: (numero: number) => void;
  reset: () => void;
}

/**
 * Seletor computado: verifica se todos os dados obrigatórios estão preenchidos
 */
export const selectIsComplete = (state: PlayerState): boolean => {
  return !!(
    state.nome &&
    state.nome.trim().length >= 2 &&
    state.posicao &&
    state.atributos &&
    state.time &&
    state.numeroCamisa !== null
  );
};

/**
 * Estado inicial
 */
const initialState = {
  nome: '',
  posicao: null,
  atributos: null,
  avatar: undefined,
  time: null,
  numeroCamisa: null,
};

/**
 * Store Zustand para o jogador protagonista
 * 
 * Responsabilidades:
 * - Armazenar dados do protagonista criado
 * - Validar completude dos dados
 * - Integrar com LocalStorage (futuro)
 */
export const usePlayerStore = create<PlayerState>((set) => ({
  ...initialState,

  setNome: (nome) => set({ nome: nome.trim() }),

  setPosicao: (posicao) => set({ posicao }),

  setAtributos: (atributos) => set({ atributos }),

  setAvatar: (avatar) => set({ avatar }),

  setTime: (time) => set({ time }),

  setNumeroCamisa: (numero) => set({ numeroCamisa: numero }),

  reset: () => set(initialState),
}));
