import type { 
  PlayerAttributes,
  GoalkeeperAction
} from '@/types/player';

type AcaoOfensiva = 'chute' | 'drible' | 'passe';
type AcaoDefensiva = 'bloqueio' | 'desarme' | 'interceptacao';

interface ResultadoConfronto {
  vencedor: 'atacante' | 'defensor';
  acaoOfensiva: AcaoOfensiva;
  acaoDefensiva: AcaoDefensiva;
  rolagemAtacante: number;
  rolagemDefensor: number;
  totalAtacante: number;
  totalDefensor: number;
  atributoAtacante: number;
  atributoDefensor: number;
}

/**
 * Mapeamento de ação ofensiva para ação defensiva
 * 
 * Novo sistema (3 atributos):
 * - Chute → Bloqueio (ambos usam Potência)
 * - Drible → Desarme (ambos usam Rapidez)
 * - Passe → Interceptação (ambos usam Técnica)
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
 * Obtém o valor do atributo ofensivo baseado no novo sistema (3 atributos)
 * 
 * Mapeamento:
 * - Chute → Potência
 * - Drible → Rapidez
 * - Passe → Técnica
 */
function obterAtributoOfensivo(
  acaoOfensiva: AcaoOfensiva,
  atributos: PlayerAttributes
): number {
  switch (acaoOfensiva) {
    case 'chute':
      return atributos.potencia;
    case 'drible':
      return atributos.rapidez;
    case 'passe':
      return atributos.tecnica;
    default:
      return 0; // Fallback
  }
}

/**
 * Obtém o valor do atributo defensivo baseado no novo sistema (3 atributos)
 * 
 * Mapeamento:
 * - Bloqueio → Potência
 * - Desarme → Rapidez
 * - Interceptação → Técnica
 */
function obterAtributoDefensivo(
  acaoDefensiva: AcaoDefensiva,
  atributos: PlayerAttributes
): number {
  switch (acaoDefensiva) {
    case 'bloqueio':
      return atributos.potencia;
    case 'desarme':
      return atributos.rapidez;
    case 'interceptacao':
      return atributos.tecnica;
    default:
      return 0; // Fallback
  }
}

/**
 * Escolhe aleatoriamente a ação do goleiro (Captura ou Espalme)
 */
export function escolherAcaoGoleiro(): GoalkeeperAction {
  return Math.random() < 0.5 ? 'captura' : 'espalme';
}

/**
 * Calcula o bônus do goleiro baseado na ação escolhida
 * 
 * Regras:
 * - Espalme: floor((Potência + Rapidez) / 2)
 * - Captura: floor((Potência + Técnica) / 2)
 */
export function calcularBonusGoleiro(
  acao: GoalkeeperAction,
  atributos: PlayerAttributes
): number {
  if (acao === 'espalme') {
    return Math.floor((atributos.potencia + atributos.rapidez) / 2);
  } else {
    return Math.floor((atributos.potencia + atributos.tecnica) / 2);
  }
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
  atributosAtacante: PlayerAttributes,
  atributosDefensor: PlayerAttributes,
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

/**
 * Executa confronto especial contra goleiro
 * 
 * O goleiro escolhe aleatoriamente entre Captura e Espalme, cada um
 * com sua própria fórmula de cálculo de bônus.
 * 
 * @param acaoOfensiva - Deve ser 'chute' (único cenário com goleiro)
 * @param atributosAtacante - Atributos do atacante
 * @param atributosGoleiro - Atributos do goleiro
 * @param energiaAtacante - Energia do atacante
 * @param energiaGoleiro - Energia do goleiro
 * @returns Resultado do confronto + ação do goleiro
 */
export function executarConfrontoGoleiro(
  acaoOfensiva: 'chute',
  atributosAtacante: PlayerAttributes,
  atributosGoleiro: PlayerAttributes,
  energiaAtacante: number,
  energiaGoleiro: number
): ResultadoConfronto & { acaoGoleiro: GoalkeeperAction } {
  const acaoGoleiro = escolherAcaoGoleiro();
  const bonusGoleiro = calcularBonusGoleiro(acaoGoleiro, atributosGoleiro);
  
  const atributoAtacante = obterAtributoOfensivo(acaoOfensiva, atributosAtacante);
  const modificadorAtacante = calcularModificadorEnergia(energiaAtacante);
  const modificadorGoleiro = calcularModificadorEnergia(energiaGoleiro);

  let rolagemAtacante: number;
  let rolagemGoleiro: number;
  let totalAtacante: number;
  let totalGoleiro: number;
  let vencedor: 'atacante' | 'defensor';

  // Loop até ter vencedor
  do {
    rolagemAtacante = rolarDado();
    rolagemGoleiro = rolarDado();

    totalAtacante = rolagemAtacante + atributoAtacante + modificadorAtacante;
    totalGoleiro = rolagemGoleiro + bonusGoleiro + modificadorGoleiro;

    if (totalAtacante > totalGoleiro) {
      vencedor = 'atacante'; // GOL!
      break;
    } else if (totalGoleiro > totalAtacante) {
      vencedor = 'defensor'; // Defesa do goleiro
      break;
    }
  } while (true);

  return {
    vencedor,
    acaoOfensiva: 'chute',
    acaoDefensiva: 'bloqueio', // Representação genérica
    rolagemAtacante,
    rolagemDefensor: rolagemGoleiro,
    totalAtacante,
    totalDefensor: totalGoleiro,
    atributoAtacante,
    atributoDefensor: bonusGoleiro,
    acaoGoleiro,
  };
}
