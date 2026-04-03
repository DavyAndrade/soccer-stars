import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  decidirAcaoNPC,
  calcularPesoChute,
  calcularPesoDrible,
  calcularPesoPasse,
  selecionarAcaoPonderada,
  type ContextoPartida,
} from './ai';
import type { ZonaCampo, AcaoOfensiva } from '@/types/match';
import type { PlayerAttributes } from '@/types/player';

describe('ai-system', () => {
  const atributosBalanceados: PlayerAttributes = {
    chute: 3,
    drible: 3,
    passe: 3,
    bloqueio: 3,
    desarme: 3,
    interceptacao: 3,
  };

  const contextoBase: ContextoPartida = {
    zona: 'MC',
    energia: 5,
    placarNPC: 0,
    placarOponente: 0,
    minuto: 10,
    periodo: 'primeiro_tempo',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calcularPesoChute', () => {
    it('deve retornar 0 em zonas que não permitem chute (DF1, MI1, MC)', () => {
      expect(calcularPesoChute({ ...contextoBase, zona: 'DF1' }, atributosBalanceados)).toBe(0);
      expect(calcularPesoChute({ ...contextoBase, zona: 'MI1' }, atributosBalanceados)).toBe(0);
      expect(calcularPesoChute({ ...contextoBase, zona: 'MC' }, atributosBalanceados)).toBe(0);
    });

    it('deve permitir chute em MI2 (atributo conta)', () => {
      const peso = calcularPesoChute({ ...contextoBase, zona: 'MI2' }, atributosBalanceados);
      expect(peso).toBeGreaterThan(0);
      // Peso base = atributo * 2 = 3 * 2 = 6
      expect(peso).toBeGreaterThanOrEqual(atributosBalanceados.chute);
    });

    it('deve permitir chute em DF2 (atributo conta)', () => {
      const peso = calcularPesoChute({ ...contextoBase, zona: 'DF2' }, atributosBalanceados);
      expect(peso).toBeGreaterThan(0);
      expect(peso).toBeGreaterThanOrEqual(atributosBalanceados.chute);
    });

    it('deve aumentar peso quando NPC está perdendo', () => {
      const empate = calcularPesoChute(
        { ...contextoBase, zona: 'MI2', placarNPC: 1, placarOponente: 1 },
        atributosBalanceados
      );
      const perdendo = calcularPesoChute(
        { ...contextoBase, zona: 'MI2', placarNPC: 0, placarOponente: 2 },
        atributosBalanceados
      );
      
      expect(perdendo).toBeGreaterThan(empate);
    });

    it('deve aumentar peso drasticamente nos últimos minutos perdendo', () => {
      const minuto40 = calcularPesoChute(
        { ...contextoBase, zona: 'MI2', minuto: 40, placarNPC: 0, placarOponente: 1 },
        atributosBalanceados
      );
      const minuto88 = calcularPesoChute(
        { ...contextoBase, zona: 'MI2', minuto: 88, placarNPC: 0, placarOponente: 1, periodo: 'segundo_tempo' },
        atributosBalanceados
      );
      
      expect(minuto88).toBeGreaterThan(minuto40);
    });

    it('deve considerar atributo de chute alto', () => {
      const atributoBaixo: PlayerAttributes = { ...atributosBalanceados, chute: 1 };
      const atributoAlto: PlayerAttributes = { ...atributosBalanceados, chute: 5 };

      const pesoBaixo = calcularPesoChute({ ...contextoBase, zona: 'MI2' }, atributoBaixo);
      const pesoAlto = calcularPesoChute({ ...contextoBase, zona: 'MI2' }, atributoAlto);

      expect(pesoAlto).toBeGreaterThan(pesoBaixo);
    });
  });

  describe('calcularPesoDrible', () => {
    it('deve considerar atributo de drible', () => {
      const peso = calcularPesoDrible(contextoBase, atributosBalanceados);
      expect(peso).toBeGreaterThan(0);
      expect(peso).toBeGreaterThanOrEqual(atributosBalanceados.drible);
    });

    it('deve aumentar peso quando NPC tem energia alta', () => {
      const energiaBaixa = calcularPesoDrible({ ...contextoBase, energia: 2 }, atributosBalanceados);
      const energiaAlta = calcularPesoDrible({ ...contextoBase, energia: 9 }, atributosBalanceados);

      expect(energiaAlta).toBeGreaterThan(energiaBaixa);
    });

    it('deve reduzir peso quando energia está em 0', () => {
      const energia5 = calcularPesoDrible({ ...contextoBase, energia: 5 }, atributosBalanceados);
      const energia0 = calcularPesoDrible({ ...contextoBase, energia: 0 }, atributosBalanceados);

      expect(energia0).toBeLessThan(energia5);
    });

    it('deve considerar drible alto como preferência', () => {
      const atributoDribleAlto: PlayerAttributes = { ...atributosBalanceados, drible: 5 };
      const peso = calcularPesoDrible(contextoBase, atributoDribleAlto);

      expect(peso).toBeGreaterThan(calcularPesoDrible(contextoBase, atributosBalanceados));
    });
  });

  describe('calcularPesoPasse', () => {
    it('deve considerar atributo de passe', () => {
      const peso = calcularPesoPasse(contextoBase, atributosBalanceados);
      expect(peso).toBeGreaterThan(0);
      expect(peso).toBeGreaterThanOrEqual(atributosBalanceados.passe);
    });

    it('deve aumentar peso quando energia está baixa (conservar energia)', () => {
      const energia8 = calcularPesoPasse({ ...contextoBase, energia: 8 }, atributosBalanceados);
      const energia1 = calcularPesoPasse({ ...contextoBase, energia: 1 }, atributosBalanceados);

      expect(energia1).toBeGreaterThan(energia8);
    });

    it('deve aumentar peso quando NPC está ganhando (jogo seguro)', () => {
      const empate = calcularPesoPasse(
        { ...contextoBase, placarNPC: 1, placarOponente: 1 },
        atributosBalanceados
      );
      const ganhando = calcularPesoPasse(
        { ...contextoBase, placarNPC: 3, placarOponente: 0 },
        atributosBalanceados
      );

      expect(ganhando).toBeGreaterThan(empate);
    });

    it('deve considerar passe alto como preferência', () => {
      const atributoPasseAlto: PlayerAttributes = { ...atributosBalanceados, passe: 5 };
      const peso = calcularPesoPasse(contextoBase, atributoPasseAlto);

      expect(peso).toBeGreaterThan(calcularPesoPasse(contextoBase, atributosBalanceados));
    });
  });

  describe('selecionarAcaoPonderada', () => {
    it('deve selecionar a ação com maior peso', () => {
      const pesos = {
        chute: 10,
        drible: 5,
        passe: 3,
      };

      // Com seed determinístico, deve escolher chute
      vi.spyOn(Math, 'random').mockReturnValue(0.1); // 10% → chute (0-10)
      expect(selecionarAcaoPonderada(pesos)).toBe('chute');
    });

    it('deve distribuir probabilidade proporcionalmente', () => {
      const pesos = {
        chute: 20, // 20/40 = 50%
        drible: 10, // 10/40 = 25%
        passe: 10,  // 10/40 = 25%
      };

      // 30% → drible (20-30)
      vi.spyOn(Math, 'random').mockReturnValue(0.6); // 60% do total
      expect(selecionarAcaoPonderada(pesos)).toBe('drible');
    });

    it('deve escolher passe se peso de chute for 0', () => {
      const pesos = {
        chute: 0,
        drible: 5,
        passe: 10,
      };

      vi.spyOn(Math, 'random').mockReturnValue(0.8);
      const acao = selecionarAcaoPonderada(pesos);
      expect(acao).not.toBe('chute');
      expect(['drible', 'passe']).toContain(acao);
    });
  });

  describe('decidirAcaoNPC', () => {
    it('deve retornar uma ação válida', () => {
      const acao = decidirAcaoNPC(contextoBase, atributosBalanceados);
      expect(['chute', 'drible', 'passe']).toContain(acao);
    });

    it('nunca deve escolher chute em zonas inválidas', () => {
      const zonasInvalidas: ZonaCampo[] = ['DF1', 'MI1', 'MC'];

      zonasInvalidas.forEach((zona) => {
        for (let i = 0; i < 50; i++) {
          const acao = decidirAcaoNPC({ ...contextoBase, zona }, atributosBalanceados);
          expect(acao).not.toBe('chute');
        }
      });
    });

    it('deve poder escolher chute em MI2 ou DF2 quando peso é favorável', () => {
      // Contexto extremamente favorável a chute
      const contextoFavoravelChute: ContextoPartida = {
        zona: 'MI2',
        energia: 5, // média (não favorece drible)
        placarNPC: 0,
        placarOponente: 3, // perdendo muito
        minuto: 88,
        periodo: 'segundo_tempo', // minutos finais
      };

      const atributosChutador: PlayerAttributes = {
        chute: 5, // CHUTE MÁXIMO
        drible: 1, // drible fraco
        passe: 1, // passe fraco
        bloqueio: 5,
        desarme: 5,
        interceptacao: 1,
      };

      const acoesEncontradas = new Set<AcaoOfensiva>();
      for (let i = 0; i < 100; i++) {
        const acao = decidirAcaoNPC(contextoFavoravelChute, atributosChutador);
        acoesEncontradas.add(acao);
      }

      // Com esse contexto extremo, deve encontrar chute
      expect(acoesEncontradas.has('chute')).toBe(true);
    });

    it('deve preferir passe quando energia está em 0', () => {
      const resultados: Record<string, number> = { chute: 0, drible: 0, passe: 0 };

      for (let i = 0; i < 100; i++) {
        const acao = decidirAcaoNPC(
          { ...contextoBase, energia: 0, zona: 'MI1' },
          atributosBalanceados
        );
        resultados[acao]++;
      }

      // Passe deve ser majoritário quando energia é 0
      expect(resultados.passe).toBeGreaterThan(resultados.drible);
    });

    it('deve aumentar peso de chute quando perdendo nos minutos finais', () => {
      const atributosChutador: PlayerAttributes = {
        chute: 5,
        drible: 1,
        passe: 1,
        bloqueio: 5,
        desarme: 5,
        interceptacao: 1,
      };

      // Calcular pesos diretamente em vez de simular ações
      const pesoNormal = calcularPesoChute(
        { ...contextoBase, zona: 'MI2', minuto: 30, placarNPC: 0, placarOponente: 1, energia: 5 },
        atributosChutador
      );

      const pesoUrgente = calcularPesoChute(
        { ...contextoBase, zona: 'MI2', minuto: 88, periodo: 'segundo_tempo', placarNPC: 0, placarOponente: 1, energia: 5 },
        atributosChutador
      );

      // Peso deve aumentar no contexto urgente
      expect(pesoUrgente).toBeGreaterThan(pesoNormal);
    });
  });
});
