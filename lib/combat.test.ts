import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  executarConfronto,
  determinarAcaoDefensiva,
  calcularModificadorEnergia,
  rolarDado,
  MAPEAMENTO_DEFESA_TIPO,
} from './combat';
import type { 
  AcaoOfensiva, 
  AcaoDefensiva, 
  PlayerAttributes, 
  GoalkeeperAttributes 
} from '@/types/player';
import type { ResultadoConfronto } from '@/types/match';

describe('combat-system', () => {
  beforeEach(() => {
    // Garantir que cada teste tenha comportamento determinístico ao mockar
    vi.clearAllMocks();
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
      // Com 100 rolagens, esperamos pelo menos 10 valores únicos
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
      // Energia nunca deveria ser negativa, mas defensivamente retornamos 0
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

  describe('executarConfronto', () => {
    const atributosAtacante: PlayerAttributes = {
      chute: 5,
      drible: 4,
      passe: 3,
      bloqueio: 2,
      desarme: 2,
      interceptacao: 2,
    };

    const atributosDefensor: PlayerAttributes = {
      chute: 2,
      drible: 2,
      passe: 2,
      bloqueio: 5,
      desarme: 4,
      interceptacao: 3,
    };

    describe('com dados mockados (determinístico)', () => {
      it('atacante vence: d20(15) + chute(5) = 20 vs d20(10) + bloqueio(5) = 15', () => {
        const mockRolarDado = vi.fn()
          .mockReturnValueOnce(15) // Atacante
          .mockReturnValueOnce(10); // Defensor

        vi.spyOn(globalThis.Math, 'random')
          .mockReturnValueOnce(0.70) // (0.70 * 20) + 1 = 15
          .mockReturnValueOnce(0.45); // (0.45 * 20) + 1 = 10

        const resultado = executarConfronto(
          'chute',
          atributosAtacante,
          atributosDefensor,
          10, // energia atacante
          10  // energia defensor
        );

        expect(resultado.vencedor).toBe('atacante');
        expect(resultado.acaoOfensiva).toBe('chute');
        expect(resultado.acaoDefensiva).toBe('bloqueio');
        expect(resultado.rolagemAtacante).toBe(15);
        expect(resultado.rolagemDefensor).toBe(10);
        expect(resultado.totalAtacante).toBe(20); // 15 + 5
        expect(resultado.totalDefensor).toBe(15); // 10 + 5
      });

      it('defensor vence: d20(8) + drible(4) = 12 vs d20(12) + desarme(4) = 16', () => {
        vi.spyOn(globalThis.Math, 'random')
          .mockReturnValueOnce(0.35) // (0.35 * 20) + 1 = 8
          .mockReturnValueOnce(0.55); // (0.55 * 20) + 1 = 12

        const resultado = executarConfronto(
          'drible',
          atributosAtacante,
          atributosDefensor,
          10,
          10
        );

        expect(resultado.vencedor).toBe('defensor');
        expect(resultado.acaoOfensiva).toBe('drible');
        expect(resultado.acaoDefensiva).toBe('desarme');
        expect(resultado.totalAtacante).toBe(12); // 8 + 4
        expect(resultado.totalDefensor).toBe(16); // 12 + 4
      });

      it('empate: d20(10) + passe(3) = 13 vs d20(10) + interceptacao(3) = 13 → re-rolar', () => {
        // Primeiro confronto: empate 13 vs 13
        // Segundo confronto: atacante vence 18 vs 15
        vi.spyOn(globalThis.Math, 'random')
          .mockReturnValueOnce(0.45) // 10 (atacante)
          .mockReturnValueOnce(0.45) // 10 (defensor) → EMPATE
          .mockReturnValueOnce(0.85) // 18 (atacante re-roll)
          .mockReturnValueOnce(0.60); // 13 (defensor re-roll)

        const resultado = executarConfronto(
          'passe',
          atributosAtacante,
          atributosDefensor,
          10,
          10
        );

        expect(resultado.vencedor).toBe('atacante');
        expect(resultado.totalAtacante).toBe(21); // 18 + 3 (último confronto)
        expect(resultado.totalDefensor).toBe(16); // 13 + 3 (último confronto)
      });
    });

    describe('com penalidade de energia', () => {
      it('atacante com 0 energia: d20(10) - 2 + chute(5) = 13', () => {
        vi.spyOn(globalThis.Math, 'random')
          .mockReturnValueOnce(0.45) // 10 (atacante)
          .mockReturnValueOnce(0.25); // 6 (defensor)

        const resultado = executarConfronto(
          'chute',
          atributosAtacante,
          atributosDefensor,
          0,  // energia ZERO → penalidade -2
          10
        );

        expect(resultado.totalAtacante).toBe(13); // 10 - 2 + 5
        expect(resultado.totalDefensor).toBe(11); // 6 + 5
        expect(resultado.vencedor).toBe('atacante');
      });

      it('defensor com 0 energia: d20(15) + bloqueio(5) - 2 = 18', () => {
        vi.spyOn(globalThis.Math, 'random')
          .mockReturnValueOnce(0.45) // 10 (atacante)
          .mockReturnValueOnce(0.70); // 15 (defensor)

        const resultado = executarConfronto(
          'chute',
          atributosAtacante,
          atributosDefensor,
          10,
          0  // defensor sem energia → -2
        );

        expect(resultado.totalAtacante).toBe(15); // 10 + 5
        expect(resultado.totalDefensor).toBe(18); // 15 - 2 + 5
        expect(resultado.vencedor).toBe('defensor');
      });

      it('ambos com 0 energia: d20 - 2 + atributo', () => {
        vi.spyOn(globalThis.Math, 'random')
          .mockReturnValueOnce(0.90) // 19 (atacante)
          .mockReturnValueOnce(0.50); // 11 (defensor)

        const resultado = executarConfronto(
          'chute',
          atributosAtacante,
          atributosDefensor,
          0,  // atacante sem energia
          0   // defensor sem energia
        );

        expect(resultado.totalAtacante).toBe(22); // 19 - 2 + 5
        expect(resultado.totalDefensor).toBe(14); // 11 - 2 + 5
        expect(resultado.vencedor).toBe('atacante');
      });
    });

    describe('com atributos de goleiro', () => {
      const atributosGoleiro: GoalkeeperAttributes = {
        captura: 4,
        espalme: 2,
      };

      it('chute vs captura: goleiro tenta capturar', () => {
        vi.spyOn(globalThis.Math, 'random')
          .mockReturnValueOnce(0.50) // 11 (atacante)
          .mockReturnValueOnce(0.90); // 19 (goleiro)

        const resultado = executarConfronto(
          'chute',
          atributosAtacante,
          atributosGoleiro,
          10,
          10
        );

        expect(resultado.acaoOfensiva).toBe('chute');
        // Goleiro não tem "bloqueio", mas o combate usa "captura" implicitamente
        expect(resultado.totalAtacante).toBe(16); // 11 + 5
        // Nota: a implementação deve mapear corretamente goleiro.captura
      });
    });

    describe('validação de tipos', () => {
      it('deve aceitar todas as ações ofensivas válidas', () => {
        const acoesValidas: AcaoOfensiva[] = ['chute', 'drible', 'passe'];

        acoesValidas.forEach((acao) => {
          const resultado = executarConfronto(
            acao,
            atributosAtacante,
            atributosDefensor,
            10,
            10
          );

          expect(resultado.acaoOfensiva).toBe(acao);
          expect(['atacante', 'defensor']).toContain(resultado.vencedor);
        });
      });
    });

    describe('propriedades do resultado', () => {
      it('deve retornar objeto ResultadoConfronto completo', () => {
        const resultado = executarConfronto(
          'chute',
          atributosAtacante,
          atributosDefensor,
          10,
          10
        );

        expect(resultado).toHaveProperty('vencedor');
        expect(resultado).toHaveProperty('acaoOfensiva');
        expect(resultado).toHaveProperty('acaoDefensiva');
        expect(resultado).toHaveProperty('rolagemAtacante');
        expect(resultado).toHaveProperty('rolagemDefensor');
        expect(resultado).toHaveProperty('totalAtacante');
        expect(resultado).toHaveProperty('totalDefensor');
        expect(resultado).toHaveProperty('atributoAtacante');
        expect(resultado).toHaveProperty('atributoDefensor');
      });
    });
  });
});
