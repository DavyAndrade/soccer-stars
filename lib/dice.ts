/**
 * Sistema de rolagem de dados
 */

export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export function rollD5(): number {
  return Math.floor(Math.random() * 5) + 1;
}

export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

export function calcularAcrescimos(periodo: 'PRIMEIRO_TEMPO' | 'SEGUNDO_TEMPO'): number {
  return periodo === 'PRIMEIRO_TEMPO' ? rollD5() : rollD10();
}
