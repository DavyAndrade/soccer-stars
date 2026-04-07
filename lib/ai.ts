import type { ZonaCampo, AcaoOfensiva, PeriodoPartida } from '@/types/match';
import type { PlayerAttributes } from '@/types/player';

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
  const { zona, placarNPC, placarOponente, minuto, periodo } = contexto;

  // Chute só é permitido em MI2 ou DF2
  if (zona !== 'MI2' && zona !== 'DF2') {
    return 0;
  }

  let peso = atributos.potencia * 3; // Base: potência x3 (chute usa potência)

  // Modificador de placar
  const diferencaPlacar = placarOponente - placarNPC;
  if (diferencaPlacar > 0) {
    // Perdendo: aumenta urgência
    peso += diferencaPlacar * 5;
  } else if (diferencaPlacar < 0) {
    // Ganhando: reduz um pouco
    peso -= Math.abs(diferencaPlacar) * 1;
  }

  // Modificador de tempo (urgência nos minutos finais)
  if (periodo === 'segundo_tempo' && minuto >= 80 && diferencaPlacar > 0) {
    // Perdendo nos últimos 10 minutos: URGÊNCIA MÁXIMA
    peso += (minuto - 80) * 3;
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
  const { energia } = contexto;

  let peso = atributos.rapidez * 2; // Base: rapidez x2 (drible usa rapidez)

  // Modificador de energia
  if (energia === 0) {
    // Energia zero: grande penalidade, evitar drible
    peso *= 0.3;
  } else if (energia >= 7) {
    // Energia alta: boost em drible (agressivo)
    peso += (energia - 6) * 1.5;
  } else if (energia <= 3) {
    // Energia baixa: reduz drible
    peso *= 0.7;
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
  const { energia, placarNPC, placarOponente } = contexto;

  let peso = atributos.tecnica * 2; // Base: técnica x2 (passe usa técnica)

  // Modificador de energia (conservar quando baixa)
  if (energia <= 2) {
    // Energia muito baixa: preferir passe (não gasta energia adicional)
    peso += 5;
  } else if (energia <= 4) {
    peso += 2;
  }

  // Modificador de placar
  const diferencaPlacar = placarNPC - placarOponente;
  if (diferencaPlacar > 0) {
    // Ganhando: jogo seguro, preferir passe
    peso += diferencaPlacar * 2;
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
