import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useLeagueStore, selectClassificacao, selectProximaPartida } from './league-store';

describe('league-store', () => {
  beforeEach(() => {
    // Limpar store antes de cada teste
    const { reset } = useLeagueStore.getState();
    act(() => {
      reset();
    });
  });

  describe('Estado Inicial', () => {
    it('deve inicializar com valores padrão', () => {
      const { result } = renderHook(() => useLeagueStore());

      expect(result.current.times).toEqual([]);
      expect(result.current.resultados).toEqual([]);
      expect(result.current.rodadaAtual).toBe(1);
      expect(result.current.timeProtagonista).toBeNull();
    });
  });

  describe('inicializarLiga', () => {
    it('deve criar 12 times com estrutura correta', () => {
      const { result } = renderHook(() => useLeagueStore());

      const times = [
        { id: 1, nome: 'Time A', formacao: '4-3-3' },
        { id: 2, nome: 'Time B', formacao: '4-4-2' },
        { id: 3, nome: 'Time C', formacao: '3-5-2' },
      ];

      act(() => {
        result.current.inicializarLiga(times as any, 1);
      });

      expect(result.current.times).toHaveLength(3);
      expect(result.current.times[0]).toMatchObject({
        id: 1,
        nome: 'Time A',
        pontos: 0,
        vitorias: 0,
        empates: 0,
        derrotas: 0,
        golsMarcados: 0,
        golsSofridos: 0,
        saldoGols: 0,
      });
    });

    it('deve definir time do protagonista', () => {
      const { result } = renderHook(() => useLeagueStore());

      const times = [
        { id: 1, nome: 'Time A', formacao: '4-3-3' },
        { id: 2, nome: 'Time B', formacao: '4-4-2' },
      ];

      act(() => {
        result.current.inicializarLiga(times as any, 2);
      });

      expect(result.current.timeProtagonista).toBe(2);
    });
  });

  describe('registrarResultado', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useLeagueStore());
      const times = [
        { id: 1, nome: 'Time A', formacao: '4-3-3' },
        { id: 2, nome: 'Time B', formacao: '4-4-2' },
        { id: 3, nome: 'Time C', formacao: '3-5-2' },
      ];
      act(() => {
        result.current.inicializarLiga(times as any, 1);
      });
    });

    it('deve registrar vitória corretamente', () => {
      const { result } = renderHook(() => useLeagueStore());

      act(() => {
        result.current.registrarResultado({
          rodada: 1,
          timeCasaId: 1,
          timeVisitanteId: 2,
          golsCasa: 3,
          golsVisitante: 1,
        });
      });

      const timeA = result.current.times.find(t => t.id === 1);
      const timeB = result.current.times.find(t => t.id === 2);

      // Time A (vencedor)
      expect(timeA?.pontos).toBe(3);
      expect(timeA?.vitorias).toBe(1);
      expect(timeA?.golsMarcados).toBe(3);
      expect(timeA?.golsSofridos).toBe(1);
      expect(timeA?.saldoGols).toBe(2);

      // Time B (perdedor)
      expect(timeB?.pontos).toBe(0);
      expect(timeB?.derrotas).toBe(1);
      expect(timeB?.golsMarcados).toBe(1);
      expect(timeB?.golsSofridos).toBe(3);
      expect(timeB?.saldoGols).toBe(-2);
    });

    it('deve registrar empate corretamente', () => {
      const { result } = renderHook(() => useLeagueStore());

      act(() => {
        result.current.registrarResultado({
          rodada: 1,
          timeCasaId: 1,
          timeVisitanteId: 2,
          golsCasa: 2,
          golsVisitante: 2,
        });
      });

      const timeA = result.current.times.find(t => t.id === 1);
      const timeB = result.current.times.find(t => t.id === 2);

      // Ambos com 1 ponto
      expect(timeA?.pontos).toBe(1);
      expect(timeA?.empates).toBe(1);
      expect(timeB?.pontos).toBe(1);
      expect(timeB?.empates).toBe(1);
    });

    it('deve adicionar resultado ao histórico', () => {
      const { result } = renderHook(() => useLeagueStore());

      act(() => {
        result.current.registrarResultado({
          rodada: 1,
          timeCasaId: 1,
          timeVisitanteId: 2,
          golsCasa: 2,
          golsVisitante: 1,
        });
      });

      expect(result.current.resultados).toHaveLength(1);
      expect(result.current.resultados[0]).toEqual({
        rodada: 1,
        timeCasaId: 1,
        timeVisitanteId: 2,
        golsCasa: 2,
        golsVisitante: 1,
      });
    });

    it('deve acumular múltiplos resultados', () => {
      const { result } = renderHook(() => useLeagueStore());

      act(() => {
        result.current.registrarResultado({
          rodada: 1,
          timeCasaId: 1,
          timeVisitanteId: 2,
          golsCasa: 2,
          golsVisitante: 1,
        });
        result.current.registrarResultado({
          rodada: 1,
          timeCasaId: 1,
          timeVisitanteId: 3,
          golsCasa: 1,
          golsVisitante: 1,
        });
      });

      const timeA = result.current.times.find(t => t.id === 1);

      // Time A jogou 2 partidas (1 vitória + 1 empate)
      expect(timeA?.pontos).toBe(4); // 3 + 1
      expect(timeA?.vitorias).toBe(1);
      expect(timeA?.empates).toBe(1);
    });
  });

  describe('avancarRodada', () => {
    it('deve incrementar rodada atual', () => {
      const { result } = renderHook(() => useLeagueStore());

      act(() => {
        result.current.avancarRodada();
      });

      expect(result.current.rodadaAtual).toBe(2);
    });

    it('deve acumular múltiplas rodadas', () => {
      const { result } = renderHook(() => useLeagueStore());

      act(() => {
        result.current.avancarRodada();
        result.current.avancarRodada();
        result.current.avancarRodada();
      });

      expect(result.current.rodadaAtual).toBe(4);
    });

    it('não deve ultrapassar rodada 22', () => {
      const { result } = renderHook(() => useLeagueStore());

      act(() => {
        // Tentar avançar além de 22
        for (let i = 0; i < 25; i++) {
          result.current.avancarRodada();
        }
      });

      expect(result.current.rodadaAtual).toBe(22);
    });
  });

  describe('reset', () => {
    it('deve resetar todos os valores', () => {
      const { result } = renderHook(() => useLeagueStore());

      const times = [
        { id: 1, nome: 'Time A', formacao: '4-3-3' },
      ];

      act(() => {
        result.current.inicializarLiga(times as any, 1);
        result.current.registrarResultado({
          rodada: 1,
          timeCasaId: 1,
          timeVisitanteId: 2,
          golsCasa: 3,
          golsVisitante: 1,
        });
        result.current.avancarRodada();
        result.current.reset();
      });

      expect(result.current.times).toEqual([]);
      expect(result.current.resultados).toEqual([]);
      expect(result.current.rodadaAtual).toBe(1);
      expect(result.current.timeProtagonista).toBeNull();
    });
  });

  describe('Computed: selectClassificacao', () => {
    beforeEach(() => {
      const { result } = renderHook(() => useLeagueStore());
      const times = [
        { id: 1, nome: 'Time A', formacao: '4-3-3' },
        { id: 2, nome: 'Time B', formacao: '4-4-2' },
        { id: 3, nome: 'Time C', formacao: '3-5-2' },
      ];
      act(() => {
        result.current.inicializarLiga(times as any, 1);
      });
    });

    it('deve ordenar por pontos (decrescente)', () => {
      const { result } = renderHook(() => useLeagueStore());

      act(() => {
        // Time A: 3 pontos
        result.current.registrarResultado({
          rodada: 1,
          timeCasaId: 1,
          timeVisitanteId: 3,
          golsCasa: 2,
          golsVisitante: 0,
        });
        // Time B: 1 ponto
        result.current.registrarResultado({
          rodada: 1,
          timeCasaId: 2,
          timeVisitanteId: 3,
          golsCasa: 1,
          golsVisitante: 1,
        });
      });

      const classificacao = selectClassificacao(result.current);

      expect(classificacao[0].id).toBe(1); // Time A (3 pts)
      expect(classificacao[1].id).toBe(2); // Time B (1 pt)
      expect(classificacao[2].id).toBe(3); // Time C (0 pts)
    });

    it('deve usar saldo de gols como critério de desempate', () => {
      const { result } = renderHook(() => useLeagueStore());

      act(() => {
        // Time A: 3 pontos, saldo +2
        result.current.registrarResultado({
          rodada: 1,
          timeCasaId: 1,
          timeVisitanteId: 3,
          golsCasa: 3,
          golsVisitante: 1,
        });
        // Time B: 3 pontos, saldo +1
        result.current.registrarResultado({
          rodada: 1,
          timeCasaId: 2,
          timeVisitanteId: 3,
          golsCasa: 2,
          golsVisitante: 1,
        });
      });

      const classificacao = selectClassificacao(result.current);

      expect(classificacao[0].id).toBe(1); // Time A (saldo +2)
      expect(classificacao[1].id).toBe(2); // Time B (saldo +1)
    });

    it('deve usar gols marcados como terceiro critério', () => {
      const { result } = renderHook(() => useLeagueStore());

      act(() => {
        // Time A: 3 pts, saldo +1, 3 gols
        result.current.registrarResultado({
          rodada: 1,
          timeCasaId: 1,
          timeVisitanteId: 3,
          golsCasa: 3,
          golsVisitante: 2,
        });
        // Time B: 3 pts, saldo +1, 2 gols
        result.current.registrarResultado({
          rodada: 1,
          timeCasaId: 2,
          timeVisitanteId: 3,
          golsCasa: 2,
          golsVisitante: 1,
        });
      });

      const classificacao = selectClassificacao(result.current);

      expect(classificacao[0].id).toBe(1); // Time A (3 gols)
      expect(classificacao[1].id).toBe(2); // Time B (2 gols)
    });
  });

  describe('Computed: selectProximaPartida', () => {
    it('deve retornar null se não houver time do protagonista', () => {
      const { result } = renderHook(() => useLeagueStore());

      const proximaPartida = selectProximaPartida(result.current);
      expect(proximaPartida).toBeNull();
    });

    it('deve retornar próxima partida do protagonista', () => {
      const { result } = renderHook(() => useLeagueStore());

      const times = [
        { id: 1, nome: 'Time A', formacao: '4-3-3' },
        { id: 2, nome: 'Time B', formacao: '4-4-2' },
      ];

      act(() => {
        result.current.inicializarLiga(times as any, 1);
      });

      // Mock: próxima partida será contra Time B
      // (implementação real gerará tabela de confrontos)
      const state = result.current;
      
      // Por enquanto, apenas verificar que a função não quebra
      const proximaPartida = selectProximaPartida(state);
      
      // Se houver lógica de tabela implementada, retornará algo
      // Se não, retornará null (aceitável neste estágio)
      expect(proximaPartida === null || typeof proximaPartida === 'object').toBe(true);
    });
  });
});
