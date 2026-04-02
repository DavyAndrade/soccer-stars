/**
 * Tipos relacionados à partida de futebol
 */

export type ZonaCampo = 'DF1' | 'MI1' | 'MC' | 'MI2' | 'DF2';

export type AcaoOfensiva = 'CHUTE' | 'DRIBLE' | 'PASSE';
export type AcaoDefensiva = 'BLOQUEIO' | 'DESARME' | 'INTERCEPTACAO';
export type AcaoGoleiro = 'CAPTURA' | 'ESPALME';

export interface ResultadoConfronto {
  atacante: {
    jogadorId: string;
    acao: AcaoOfensiva;
    atributo: number;
    dado: number;
    total: number;
  };
  defensor: {
    jogadorId: string;
    acao: AcaoDefensiva;
    atributo: number;
    dado: number;
    total: number;
  };
  vencedor: 'atacante' | 'defensor';
  consequencia: ConsequenciaAcao;
}

export interface ResultadoGoleiro {
  chute: number;
  goleiro: {
    id: string;
    acao: AcaoGoleiro;
    atributo: number;
    dado: number;
    total: number;
  };
  resultado: 'GOL' | 'DEFESA_CAPTURA' | 'DEFESA_ESPALME';
}

export type ConsequenciaAcao =
  | { tipo: 'AVANCA_ZONA'; novaZona: ZonaCampo }
  | { tipo: 'MANTEM_POSSE'; zona: ZonaCampo }
  | { tipo: 'PERDE_POSSE'; novoPortadorId: string; zona: ZonaCampo }
  | { tipo: 'CHUTE_GOLEIRO'; resultado: ResultadoGoleiro }
  | { tipo: 'BOLA_SOBRA'; timeId: string; zona: ZonaCampo };

export interface EstadoPartida {
  minuto: number;
  periodo: 'PRIMEIRO_TEMPO' | 'INTERVALO' | 'SEGUNDO_TEMPO' | 'FINALIZADO';
  placar: {
    casa: number;
    visitante: number;
  };
  posse: {
    timeId: string;
    jogadorId: string;
    zona: ZonaCampo;
  };
  timeCasa: string;
  timeVisitante: string;
}

export const MINUTO_INTERVALO = 45;
export const MINUTO_FIM_JOGO = 90;
export const ZONA_INICIAL: ZonaCampo = 'MC';

// Mapeamento automático de defesa baseado na ação ofensiva
export const MAPEAMENTO_DEFESA: Record<AcaoOfensiva, AcaoDefensiva> = {
  CHUTE: 'BLOQUEIO',
  DRIBLE: 'DESARME',
  PASSE: 'INTERCEPTACAO',
};
