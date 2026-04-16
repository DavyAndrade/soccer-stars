import type { ZonaCampo } from '@/types/match';
import type { PlayerAttributes } from '@/types/player';

type AcaoOfensiva = 'chute' | 'drible' | 'passe';
type PeriodoPartida = 'primeiro_tempo' | 'intervalo' | 'segundo_tempo' | 'finalizado';

/**
 * Contexto da partida para tomada de decisão da IA
 */
export interface ContextoPartida {
  zona: ZonaCampo;
  energia: number;
  placarNPC: number;
  placarOponente: number;
  minuto: number;
  periodo: PeriodoPartida;
}

/**
 * Pesos para seleção ponderada de ações
 */
interface PesosAcao {
  chute: number;
  drible: number;
  passe: number;
}

/**
 * Calcula o peso para a ação "chute" baseado no contexto
 * 
 * Regras:
 * - Chute só é permitido em MI2 ou DF2
 * - Peso aumenta quando NPC está perdendo
 * - Peso aumenta drasticamente nos últimos minutos perdendo
 * - Novo sistema: Chute usa POTÊNCIA
 */
export function calcularPesoChute(
  contexto: ContextoPartida,
  atributos: PlayerAttributes
): number {
  const { zona, energia, placarNPC, placarOponente, minuto, periodo } = contexto;

  // Chute só é permitido em MI2 ou DF2
  if (zona !== 'MI2' && zona !== 'DF2') {
    return 0;
  }

  let peso = atributos.potencia * 2 + (zona === 'DF2' ? 6 : 2);

  // Modificador de placar
  const diferencaPlacar = placarOponente - placarNPC;
  if (diferencaPlacar > 0) {
    peso += diferencaPlacar * 4;
  } else if (diferencaPlacar < 0) {
    peso -= Math.abs(diferencaPlacar) * 3;
  }

  if (energia <= 2) {
    peso -= 3;
  }

  if (periodo === 'segundo_tempo' && minuto >= 75 && diferencaPlacar > 0) {
    peso += (minuto - 74) * 1.2;
  }

  if (periodo === 'segundo_tempo' && minuto >= 85 && diferencaPlacar < 0) {
    peso -= 4;
  }

  return Math.max(0, peso);
}

/**
 * Calcula o peso para a ação "drible" baseado no contexto
 * 
 * Regras:
 * - Drible avança zona automaticamente se vencer
 * - Peso aumenta com energia alta (drible é arriscado)
 * - Peso reduz drasticamente se energia = 0 (penalidade -2)
 * - Atributo de drible influencia diretamente
 */
export function calcularPesoDrible(
  contexto: ContextoPartida,
  atributos: PlayerAttributes
): number {
  const { zona, energia, placarNPC, placarOponente, minuto, periodo } = contexto;

  let peso = atributos.rapidez * 1.8;

  const multiplicadorZona =
    zona === 'DF1'
      ? 0.45
      : zona === 'MI1'
        ? 0.7
        : zona === 'MC'
          ? 1
          : zona === 'MI2'
            ? 1.15
            : 0.85;
  peso *= multiplicadorZona;

  if (energia === 0) {
    peso *= 0.15;
  } else if (energia <= 2) {
    peso *= 0.4;
  } else if (energia <= 3) {
    peso *= 0.7;
  } else if (energia >= 8) {
    peso += 2;
  }

  const diferencaPlacar = placarNPC - placarOponente;
  if (periodo === 'segundo_tempo' && minuto >= 70 && diferencaPlacar > 0) {
    peso *= 0.75;
  } else if (periodo === 'segundo_tempo' && minuto >= 75 && diferencaPlacar < 0) {
    peso *= 1.1;
  }

  return Math.max(0, peso);
}

/**
 * Calcula o peso para a ação "passe" baseado no contexto
 * 
 * Regras:
 * - Passe avança zona se vencer (para frente apenas)
 * - Peso aumenta quando energia está baixa (conservar)
 * - Peso aumenta quando NPC está ganhando (jogo seguro)
 * - Atributo de passe influencia diretamente
 */
export function calcularPesoPasse(
  contexto: ContextoPartida,
  atributos: PlayerAttributes
): number {
  const { zona, energia, placarNPC, placarOponente, minuto, periodo } = contexto;

  let peso = atributos.tecnica * 2.1;

  if (zona === 'DF1') peso += 6;
  if (zona === 'MI1') peso += 4;
  if (zona === 'MC') peso += 2;
  if (zona === 'DF2') peso -= 1;

  if (energia <= 2) {
    peso += 5;
  } else if (energia <= 4) {
    peso += 2;
  }

  const diferencaPlacar = placarNPC - placarOponente;
  if (diferencaPlacar > 0) {
    peso += diferencaPlacar * 2;
    if (periodo === 'segundo_tempo' && minuto >= 70) {
      peso += 3;
    }
  } else if (diferencaPlacar < 0 && periodo === 'segundo_tempo' && minuto >= 75 && (zona === 'MI2' || zona === 'DF2')) {
    peso -= 2;
  }

  return Math.max(0, peso);
}

/**
 * Seleciona uma ação baseada em pesos ponderados
 * 
 * Probabilidade proporcional aos pesos:
 * - Se chute = 10, drible = 5, passe = 5 → total = 20
 * - Chute: 50%, Drible: 25%, Passe: 25%
 */
export function selecionarAcaoPonderada(pesos: PesosAcao): AcaoOfensiva {
  const total = pesos.chute + pesos.drible + pesos.passe;

  // Se todos os pesos são 0, fallback para passe
  if (total === 0) {
    return 'passe';
  }

  const ordenadas: Array<{ acao: AcaoOfensiva; peso: number }> = [
    { acao: 'chute' as AcaoOfensiva, peso: pesos.chute },
    { acao: 'drible' as AcaoOfensiva, peso: pesos.drible },
    { acao: 'passe' as AcaoOfensiva, peso: pesos.passe },
  ].sort((a, b) => b.peso - a.peso);

  const melhor = ordenadas[0];
  const segunda = ordenadas[1];
  const terceira = ordenadas[2];
  if (
    melhor &&
    segunda &&
    terceira &&
    melhor.peso >= 6 &&
    melhor.peso >= segunda.peso * 1.6 &&
    segunda.peso >= terceira.peso * 1.15
  ) {
    return melhor.acao;
  }

  const random = Math.random() * total;
  let acumulado = 0;

  // Chute
  acumulado += pesos.chute;
  if (random < acumulado) {
    return 'chute';
  }

  // Drible
  acumulado += pesos.drible;
  if (random < acumulado) {
    return 'drible';
  }

  // Passe (fallback)
  return 'passe';
}

/**
 * Decide qual ação o NPC deve tomar baseado no contexto da partida
 * 
 * Sistema de decisão ponderado:
 * 1. Calcula pesos para cada ação (chute, drible, passe)
 * 2. Pesos são influenciados por:
 *    - Atributos do jogador
 *    - Zona atual (chute só em MI2/DF2)
 *    - Energia disponível
 *    - Placar (agressivo perdendo, conservador ganhando)
 *    - Tempo restante (urgência nos minutos finais)
 * 3. Seleciona ação aleatoriamente proporcional aos pesos
 * 
 * @param contexto - Estado atual da partida
 * @param atributos - Atributos do NPC
 * @returns Ação escolhida
 */
export function decidirAcaoNPC(
  contexto: ContextoPartida,
  atributos: PlayerAttributes
): AcaoOfensiva {
  const pesos: PesosAcao = {
    chute: calcularPesoChute(contexto, atributos),
    drible: calcularPesoDrible(contexto, atributos),
    passe: calcularPesoPasse(contexto, atributos),
  };

  return selecionarAcaoPonderada(pesos);
}
