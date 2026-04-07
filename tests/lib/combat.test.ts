import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  executarConfronto,
  executarConfrontoGoleiro,
  determinarAcaoDefensiva,
  calcularModificadorEnergia,
  calcularBonusGoleiro,
  escolherAcaoGoleiro,
  rolarDado,
  MAPEAMENTO_DEFESA_TIPO,
} from '@/lib/combat';
import type { 
  AcaoOfensiva, 
  AcaoDefensiva, 
  PlayerAttributes,
  GoalkeeperAction
} from '@/types/player';

describe('combat-system (novo sistema - 3 atributos)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('MAPEAMENTO_DEFESA_TIPO', () => {
    it('deve mapear Chute para Bloqueio', () => {
      expect(MAPEAMENTO_DEFESA_TIPO['chute']).toBe('bloqueio');
    });

    it('deve mapear Drible para Desarme', () => {
      expect(MAPEAMENTO_DEFESA_TIPO['drible']).toBe('desarme');
    });

    it('deve mapear Passe para Interceptação', () => {
      expect(MAPEAMENTO_DEFESA_TIPO['passe']).toBe('interceptacao');
    });
  });

  describe('rolarDado', () => {
    it('deve rolar um d20 (1-20)', () => {
      const resultado = rolarDado();
      expect(resultado).toBeGreaterThanOrEqual(1);
      expect(resultado).toBeLessThanOrEqual(20);
      expect(Number.isInteger(resultado)).toBe(true);
    });

    it('deve gerar valores diferentes em múltiplas chamadas', () => {
      const resultados = new Set();
      for (let i = 0; i < 100; i++) {
        resultados.add(rolarDado());
      }
      expect(resultados.size).toBeGreaterThanOrEqual(10);
    });
  });

  describe('calcularModificadorEnergia', () => {
    it('deve retornar 0 quando energia > 0', () => {
      expect(calcularModificadorEnergia(10)).toBe(0);
      expect(calcularModificadorEnergia(5)).toBe(0);
      expect(calcularModificadorEnergia(1)).toBe(0);
    });

    it('deve retornar -2 quando energia é 0', () => {
      expect(calcularModificadorEnergia(0)).toBe(-2);
    });

    it('deve retornar 0 quando energia é negativa (edge case)', () => {
      expect(calcularModificadorEnergia(-1)).toBe(0);
    });
  });

  describe('determinarAcaoDefensiva', () => {
    it('deve retornar "bloqueio" para ação "chute"', () => {
      expect(determinarAcaoDefensiva('chute')).toBe('bloqueio');
    });

    it('deve retornar "desarme" para ação "drible"', () => {
      expect(determinarAcaoDefensiva('drible')).toBe('desarme');
    });

    it('deve retornar "interceptacao" para ação "passe"', () => {
      expect(determinarAcaoDefensiva('passe')).toBe('interceptacao');
    });
  });

  describe('executarConfronto (novo sistema)', () => {
    const atributosAtacante: PlayerAttributes = {
      potencia: 5,
      rapidez: 3,
      tecnica: 1,
    };

    const atributosDefensor: PlayerAttributes = {
      potencia: 1,
      rapidez: 3,
      tecnica: 5,
    };

    it('atacante vence chute: d20(15) + potência(5) = 20 vs d20(10) + potência(1) = 11', () => {
      vi.spyOn(globalThis.Math, 'random')
        .mockReturnValueOnce(0.70)
        .mockReturnValueOnce(0.45);

      const resultado = executarConfronto(
        'chute',
        atributosAtacante,
        atributosDefensor,
        10,
        10
      );

      expect(resultado.vencedor).toBe('atacante');
      expect(resultado.acaoOfensiva).toBe('chute');
      expect(resultado.acaoDefensiva).toBe('bloqueio');
      expect(resultado.atributoAtacante).toBe(5);
      expect(resultado.atributoDefensor).toBe(1);
    });

    it('defensor vence passe: d20(8) + técnica(1) = 9 vs d20(12) + técnica(5) = 17', () => {
      vi.spyOn(globalThis.Math, 'random')
        .mockReturnValueOnce(0.35)
        .mockReturnValueOnce(0.55);

      const resultado = executarConfronto(
        'passe',
        atributosAtacante,
        atributosDefensor,
        10,
        10
      );

      expect(resultado.vencedor).toBe('defensor');
      expect(resultado.acaoOfensiva).toBe('passe');
      expect(resultado.acaoDefensiva).toBe('interceptacao');
      expect(resultado.atributoAtacante).toBe(1);
      expect(resultado.atributoDefensor).toBe(5);
    });
  });

  describe('calcularBonusGoleiro', () => {
    const atributos: PlayerAttributes = {
      potencia: 3,
      rapidez: 2,
      tecnica: 4,
    };

    it('espalme: floor((potencia + rapidez) / 2) = floor((3 + 2) / 2) = 2', () => {
      const bonus = calcularBonusGoleiro('espalme', atributos);
      expect(bonus).toBe(2);
    });

    it('captura: floor((potencia + tecnica) / 2) = floor((3 + 4) / 2) = 3', () => {
      const bonus = calcularBonusGoleiro('captura', atributos);
      expect(bonus).toBe(3);
    });

    it('deve arredondar para baixo quando resultado é quebrado', () => {
      const atributosImpares: PlayerAttributes = {
        potencia: 5,
        rapidez: 4,
        tecnica: 3,
      };

      expect(calcularBonusGoleiro('espalme', atributosImpares)).toBe(4);
      expect(calcularBonusGoleiro('captura', atributosImpares)).toBe(4);
    });
  });

  describe('executarConfrontoGoleiro', () => {
    const atributosAtacante: PlayerAttributes = {
      potencia: 5,
      rapidez: 3,
      tecnica: 1,
    };

    const atributosGoleiro: PlayerAttributes = {
      potencia: 3,
      rapidez: 2,
      tecnica: 4,
    };

    it('deve escolher ação do goleiro e usar bônus correto (captura)', () => {
      vi.spyOn(globalThis.Math, 'random')
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.70)
        .mockReturnValueOnce(0.45);

      const resultado = executarConfrontoGoleiro(
        'chute',
        atributosAtacante,
        atributosGoleiro,
        10,
        10
      );

      expect(resultado.acaoGoleiro).toBe('captura');
      expect(resultado.atributoDefensor).toBe(3);
      expect(resultado.totalAtacante).toBe(20);
      expect(resultado.totalDefensor).toBe(13);
      expect(resultado.vencedor).toBe('atacante');
    });

    it('deve escolher ação do goleiro e usar bônus correto (espalme)', () => {
      vi.spyOn(globalThis.Math, 'random')
        .mockReturnValueOnce(0.9)
        .mockReturnValueOnce(0.45)
        .mockReturnValueOnce(0.70);

      const resultado = executarConfrontoGoleiro(
        'chute',
        atributosAtacante,
        atributosGoleiro,
        10,
        10
      );

      expect(resultado.acaoGoleiro).toBe('espalme');
      expect(resultado.atributoDefensor).toBe(2);
      expect(resultado.totalAtacante).toBe(15);
      expect(resultado.totalDefensor).toBe(17);
      expect(resultado.vencedor).toBe('defensor');
    });
  });
});
