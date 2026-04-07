import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useMatchStore, selectTempoRestante, selectPeriodoAtual } from '@/store/match-store';
import type { ZonaCampo } from '@/types/match';

describe('match-store', () => {
  beforeEach(() => {
    // Limpar store antes de cada teste
    const { reset } = useMatchStore.getState();
    act(() => {
      reset();
    });
  });

  describe('Estado Inicial', () => {
    it('deve inicializar com valores padrão de uma partida', () => {
      const { result } = renderHook(() => useMatchStore());

      // Placar
      expect(result.current.placarCasa).toBe(0);
      expect(result.current.placarVisitante).toBe(0);

      // Posse
      expect(result.current.posseTime).toBe('casa');

      // Zona
      expect(result.current.zonaAtual).toBe('MC');

      // Tempo
      expect(result.current.minutoAtual).toBe(0);
      expect(result.current.acrescimos1Tempo).toBe(0);
      expect(result.current.acrescimos2Tempo).toBe(0);

      // Energia
      expect(result.current.energiaProtagonista).toBe(10);
      expect(result.current.energiaAdversario).toBe(10);

      // Histórico
      expect(result.current.historicoAcoes).toEqual([]);
    });
  });

  describe('marcarGol', () => {
    it('deve incrementar placar do time da casa', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.marcarGol('casa');
      });

      expect(result.current.placarCasa).toBe(1);
      expect(result.current.placarVisitante).toBe(0);
    });

    it('deve incrementar placar do time visitante', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.marcarGol('visitante');
      });

      expect(result.current.placarCasa).toBe(0);
      expect(result.current.placarVisitante).toBe(1);
    });

    it('deve resetar para MC após gol', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.setZona('DF2');
        result.current.marcarGol('casa');
      });

      expect(result.current.zonaAtual).toBe('MC');
    });
  });

  describe('setPosse', () => {
    it('deve alternar posse para visitante', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.setPosse('visitante');
      });

      expect(result.current.posseTime).toBe('visitante');
    });

    it('deve alternar posse para casa', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.setPosse('visitante');
        result.current.setPosse('casa');
      });

      expect(result.current.posseTime).toBe('casa');
    });
  });

  describe('setZona', () => {
    it('deve atualizar zona atual', () => {
      const { result } = renderHook(() => useMatchStore());
      const zonas: ZonaCampo[] = ['DF1', 'MI1', 'MC', 'MI2', 'DF2'];

      zonas.forEach((zona) => {
        act(() => {
          result.current.setZona(zona);
        });
        expect(result.current.zonaAtual).toBe(zona);
      });
    });
  });

  describe('avancarMinuto', () => {
    it('deve incrementar minuto atual', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.avancarMinuto();
      });

      expect(result.current.minutoAtual).toBe(1);
    });

    it('deve acumular múltiplos minutos', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.avancarMinuto();
        result.current.avancarMinuto();
        result.current.avancarMinuto();
      });

      expect(result.current.minutoAtual).toBe(3);
    });
  });

  describe('setAcrescimos', () => {
    it('deve definir acréscimos do 1º tempo', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.setAcrescimos(1, 3);
      });

      expect(result.current.acrescimos1Tempo).toBe(3);
    });

    it('deve definir acréscimos do 2º tempo', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.setAcrescimos(2, 7);
      });

      expect(result.current.acrescimos2Tempo).toBe(7);
    });
  });

  describe('consumirEnergia', () => {
    it('deve consumir 1 energia do protagonista', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.consumirEnergia('protagonista');
      });

      expect(result.current.energiaProtagonista).toBe(9);
    });

    it('deve consumir 1 energia do adversário', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.consumirEnergia('adversario');
      });

      expect(result.current.energiaAdversario).toBe(9);
    });

    it('não deve permitir energia negativa', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        // Consumir 11 vezes (mais que o máximo de 10)
        for (let i = 0; i < 11; i++) {
          result.current.consumirEnergia('protagonista');
        }
      });

      expect(result.current.energiaProtagonista).toBe(0);
    });
  });

  describe('regenerarEnergia', () => {
    it('deve regenerar +5 energia no intervalo', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.consumirEnergia('protagonista');
        result.current.consumirEnergia('protagonista');
        result.current.consumirEnergia('protagonista');
        // Energia: 7
        result.current.regenerarEnergia();
      });

      expect(result.current.energiaProtagonista).toBe(10); // 7 + 5 = 12, mas máx 10
      expect(result.current.energiaAdversario).toBe(10);
    });

    it('não deve ultrapassar máximo de 10', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.consumirEnergia('protagonista');
        // Energia: 9
        result.current.regenerarEnergia();
      });

      expect(result.current.energiaProtagonista).toBe(10); // 9 + 5 = 14, limitado a 10
    });
  });

  describe('adicionarAcao', () => {
    it('deve adicionar ação ao histórico', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.adicionarAcao({
          tipo: 'drible',
          jogadorId: 1,
          zona: 'MC',
        });
      });

      expect(result.current.historicoAcoes).toHaveLength(1);
      expect(result.current.historicoAcoes[0]).toEqual({
        tipo: 'drible',
        jogadorId: 1,
        zona: 'MC',
      });
    });

    it('deve acumular múltiplas ações', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.adicionarAcao({ tipo: 'drible', jogadorId: 1, zona: 'MC' });
        result.current.adicionarAcao({ tipo: 'passe', jogadorId: 1, destinatarioId: 2, zona: 'MI2' });
        result.current.adicionarAcao({ tipo: 'chute', jogadorId: 2, zona: 'DF2' });
      });

      expect(result.current.historicoAcoes).toHaveLength(3);
    });
  });

  describe('reset', () => {
    it('deve resetar todos os valores para o estado inicial', () => {
      const { result } = renderHook(() => useMatchStore());

      // Modificar estado
      act(() => {
        result.current.marcarGol('casa');
        result.current.marcarGol('visitante');
        result.current.setPosse('visitante');
        result.current.setZona('DF2');
        result.current.avancarMinuto();
        result.current.consumirEnergia('protagonista');
        result.current.adicionarAcao({ tipo: 'drible', jogadorId: 1, zona: 'MC' });
      });

      // Resetar
      act(() => {
        result.current.reset();
      });

      // Verificar estado inicial
      expect(result.current.placarCasa).toBe(0);
      expect(result.current.placarVisitante).toBe(0);
      expect(result.current.posseTime).toBe('casa');
      expect(result.current.zonaAtual).toBe('MC');
      expect(result.current.minutoAtual).toBe(0);
      expect(result.current.energiaProtagonista).toBe(10);
      expect(result.current.energiaAdversario).toBe(10);
      expect(result.current.historicoAcoes).toEqual([]);
    });
  });

  describe('Computed: selectTempoRestante', () => {
    it('deve calcular tempo restante no 1º tempo', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.avancarMinuto(); // minuto 1
        result.current.setAcrescimos(1, 3); // +3 acréscimos
      });

      const state = result.current;
      // 45 + 3 - 1 = 47 minutos restantes
      expect(selectTempoRestante(state)).toBe(47);
    });

    it('deve calcular tempo restante no 2º tempo', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        // Simular 1º tempo completo
        for (let i = 0; i < 48; i++) {
          result.current.avancarMinuto();
        }
        result.current.setAcrescimos(1, 3);
        result.current.setAcrescimos(2, 5);
      });

      const state = result.current;
      // Total: 90 + 3 + 5 = 98
      // Atual: 48
      // Restante: 98 - 48 = 50
      expect(selectTempoRestante(state)).toBe(50);
    });
  });

  describe('Computed: selectPeriodoAtual', () => {
    it('deve retornar primeiro_tempo até minuto 45 + acréscimos', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.setAcrescimos(1, 3);
        for (let i = 0; i < 47; i++) {
          result.current.avancarMinuto();
        }
      });

      const state = result.current;
      expect(selectPeriodoAtual(state)).toBe('primeiro_tempo');
    });

    it('deve retornar segundo_tempo após intervalo', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.setAcrescimos(1, 3);
        for (let i = 0; i < 49; i++) {
          result.current.avancarMinuto();
        }
      });

      const state = result.current;
      expect(selectPeriodoAtual(state)).toBe('segundo_tempo');
    });

    it('deve retornar finalizado após 90 + acréscimos', () => {
      const { result } = renderHook(() => useMatchStore());

      act(() => {
        result.current.setAcrescimos(1, 3);
        result.current.setAcrescimos(2, 5);
        for (let i = 0; i < 99; i++) {
          result.current.avancarMinuto();
        }
      });

      const state = result.current;
      expect(selectPeriodoAtual(state)).toBe('finalizado');
    });
  });
});
