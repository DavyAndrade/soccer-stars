import type { 
  AcaoOfensiva, 
  AcaoDefensiva, 
  PlayerAttributes, 
  GoalkeeperAttributes 
} from '@/types/player';
import type { ResultadoConfronto } from '@/types/match';

/**
 * Mapeamento de ação ofensiva para ação defensiva
 * 
 * Regras do GDD:
 * - Chute → Bloqueio
 * - Drible → Desarme
 * - Passe → Interceptação
 */
export const MAPEAMENTO_DEFESA_TIPO: Record<AcaoOfensiva, AcaoDefensiva> = {
  chute: 'bloqueio',
  drible: 'desarme',
  passe: 'interceptacao',
} as const;

/**
 * Rola um d20 (1-20)
 */
export function rolarDado(): number {
  return Math.floor(Math.random() * 20) + 1;
}

/**
 * Calcula modificador de energia
 * 
 * Regras:
 * - Energia > 0: sem modificador (0)
 * - Energia = 0: penalidade de -2
 * - Energia < 0: sem modificador (edge case, não deveria acontecer)
 */
export function calcularModificadorEnergia(energia: number): number {
  if (energia === 0) {
    return -2;
  }
  return 0;
}

/**
 * Determina a ação defensiva automática baseada na ação ofensiva
 */
export function determinarAcaoDefensiva(acaoOfensiva: AcaoOfensiva): AcaoDefensiva {
  return MAPEAMENTO_DEFESA_TIPO[acaoOfensiva];
}

/**
 * Obtém o valor do atributo ofensivo
 */
function obterAtributoOfensivo(
  acaoOfensiva: AcaoOfensiva,
  atributos: PlayerAttributes | GoalkeeperAttributes
): number {
  // Se for goleiro e a ação for chute, usar captura
  if ('captura' in atributos && acaoOfensiva === 'chute') {
    return atributos.captura;
  }

  // Jogador de campo
  if (acaoOfensiva === 'chute' && 'chute' in atributos) {
    return atributos.chute;
  }
  if (acaoOfensiva === 'drible' && 'drible' in atributos) {
    return atributos.drible;
  }
  if (acaoOfensiva === 'passe' && 'passe' in atributos) {
    return atributos.passe;
  }

  // Fallback (não deveria acontecer)
  return 0;
}

/**
 * Obtém o valor do atributo defensivo
 */
function obterAtributoDefensivo(
  acaoDefensiva: AcaoDefensiva,
  atributos: PlayerAttributes | GoalkeeperAttributes
): number {
  // Se for goleiro e a defesa for bloqueio, usar captura
  if ('captura' in atributos && acaoDefensiva === 'bloqueio') {
    return atributos.captura;
  }

  // Jogador de campo
  if (acaoDefensiva === 'bloqueio' && 'bloqueio' in atributos) {
    return atributos.bloqueio;
  }
  if (acaoDefensiva === 'desarme' && 'desarme' in atributos) {
    return atributos.desarme;
  }
  if (acaoDefensiva === 'interceptacao' && 'interceptacao' in atributos) {
    return atributos.interceptacao;
  }

  // Fallback (não deveria acontecer)
  return 0;
}

/**
 * Executa um confronto entre atacante e defensor
 * 
 * Fórmula:
 * - Atacante: d20 + atributoOfensivo + modificadorEnergia
 * - Defensor: d20 + atributoDefensivo + modificadorEnergia
 * - Empate: re-rolar até ter vencedor
 * 
 * @param acaoOfensiva - Ação do atacante (chute, drible, passe)
 * @param atributosAtacante - Atributos do atacante
 * @param atributosDefensor - Atributos do defensor
 * @param energiaAtacante - Energia atual do atacante (0-10)
 * @param energiaDefensor - Energia atual do defensor (0-10)
 * @returns Resultado do confronto
 */
export function executarConfronto(
  acaoOfensiva: AcaoOfensiva,
  atributosAtacante: PlayerAttributes | GoalkeeperAttributes,
  atributosDefensor: PlayerAttributes | GoalkeeperAttributes,
  energiaAtacante: number,
  energiaDefensor: number
): ResultadoConfronto {
  const acaoDefensiva = determinarAcaoDefensiva(acaoOfensiva);

  // Valores constantes (não mudam durante re-rolagens)
  const atributoAtacante = obterAtributoOfensivo(acaoOfensiva, atributosAtacante);
  const atributoDefensor = obterAtributoDefensivo(acaoDefensiva, atributosDefensor);
  const modificadorAtacante = calcularModificadorEnergia(energiaAtacante);
  const modificadorDefensor = calcularModificadorEnergia(energiaDefensor);

  let rolagemAtacante: number;
  let rolagemDefensor: number;
  let totalAtacante: number;
  let totalDefensor: number;
  let vencedor: 'atacante' | 'defensor';

  // Loop até ter vencedor (empate re-rola)
  do {
    rolagemAtacante = rolarDado();
    rolagemDefensor = rolarDado();

    totalAtacante = rolagemAtacante + atributoAtacante + modificadorAtacante;
    totalDefensor = rolagemDefensor + atributoDefensor + modificadorDefensor;

    if (totalAtacante > totalDefensor) {
      vencedor = 'atacante';
      break;
    } else if (totalDefensor > totalAtacante) {
      vencedor = 'defensor';
      break;
    }
    // Empate: loop continua automaticamente
  } while (true);

  return {
    vencedor,
    acaoOfensiva,
    acaoDefensiva,
    rolagemAtacante,
    rolagemDefensor,
    totalAtacante,
    totalDefensor,
    atributoAtacante,
    atributoDefensor,
  };
}
