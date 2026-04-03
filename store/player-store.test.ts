import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePlayerStore, selectIsComplete } from './player-store';
import type { PlayerPosition } from '@/types/player';

describe('player-store', () => {
  beforeEach(() => {
    // Limpar store antes de cada teste
    const { reset } = usePlayerStore.getState();
    act(() => {
      reset();
    });
  });

  describe('Estado Inicial', () => {
    it('deve inicializar com valores padrão', () => {
      const { result } = renderHook(() => usePlayerStore());

      expect(result.current.nome).toBe('');
      expect(result.current.posicao).toBeNull();
      expect(result.current.atributos).toBeNull();
      expect(result.current.avatar).toBeUndefined();
      expect(result.current.time).toBeNull();
      expect(result.current.numeroCamisa).toBeNull();
    });
  });

  describe('setNome', () => {
    it('deve atualizar o nome do jogador', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setNome('Ashito Aoi');
      });

      expect(result.current.nome).toBe('Ashito Aoi');
    });

    it('deve fazer trim do nome', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setNome('  Ashito Aoi  ');
      });

      expect(result.current.nome).toBe('Ashito Aoi');
    });
  });

  describe('setPosicao', () => {
    it('deve atualizar a posição do jogador', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setPosicao('FW');
      });

      expect(result.current.posicao).toBe('FW');
    });

    it('deve aceitar todas as posições válidas', () => {
      const { result } = renderHook(() => usePlayerStore());
      const posicoes: PlayerPosition[] = ['GK', 'DF', 'MF', 'FW'];

      posicoes.forEach((pos) => {
        act(() => {
          result.current.setPosicao(pos);
        });
        expect(result.current.posicao).toBe(pos);
      });
    });
  });

  describe('setAtributos', () => {
    it('deve atualizar atributos de jogador de campo', () => {
      const { result } = renderHook(() => usePlayerStore());
      const atributos = {
        chute: 5,
        drible: 4,
        passe: 3,
        bloqueio: 2,
        desarme: 2,
        interceptacao: 2,
      };

      act(() => {
        result.current.setAtributos(atributos);
      });

      expect(result.current.atributos).toEqual(atributos);
    });

    it('deve atualizar atributos de goleiro', () => {
      const { result } = renderHook(() => usePlayerStore());
      const atributos = {
        captura: 4,
        espalme: 2,
      };

      act(() => {
        result.current.setAtributos(atributos);
      });

      expect(result.current.atributos).toEqual(atributos);
    });
  });

  describe('setAvatar', () => {
    it('deve atualizar o avatar', () => {
      const { result } = renderHook(() => usePlayerStore());
      const avatarBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANS';

      act(() => {
        result.current.setAvatar(avatarBase64);
      });

      expect(result.current.avatar).toBe(avatarBase64);
    });

    it('deve permitir avatar undefined', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setAvatar('data:image/png;base64,test');
        result.current.setAvatar(undefined);
      });

      expect(result.current.avatar).toBeUndefined();
    });
  });

  describe('setTime', () => {
    it('deve atualizar o time do jogador', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setTime('Tokyo Esperion');
      });

      expect(result.current.time).toBe('Tokyo Esperion');
    });
  });

  describe('setNumeroCamisa', () => {
    it('deve atualizar o número da camisa', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setNumeroCamisa(10);
      });

      expect(result.current.numeroCamisa).toBe(10);
    });

    it('deve aceitar números válidos de camisa (1-99)', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setNumeroCamisa(1);
      });
      expect(result.current.numeroCamisa).toBe(1);

      act(() => {
        result.current.setNumeroCamisa(99);
      });
      expect(result.current.numeroCamisa).toBe(99);
    });
  });

  describe('reset', () => {
    it('deve resetar todos os valores para o estado inicial', () => {
      const { result } = renderHook(() => usePlayerStore());

      // Configurar valores
      act(() => {
        result.current.setNome('Ashito Aoi');
        result.current.setPosicao('FW');
        result.current.setAtributos({ chute: 5, drible: 5, passe: 5, bloqueio: 1, desarme: 1, interceptacao: 1 });
        result.current.setAvatar('data:image/png;base64,test');
        result.current.setTime('Tokyo Esperion');
        result.current.setNumeroCamisa(10);
      });

      // Resetar
      act(() => {
        result.current.reset();
      });

      // Verificar estado inicial
      expect(result.current.nome).toBe('');
      expect(result.current.posicao).toBeNull();
      expect(result.current.atributos).toBeNull();
      expect(result.current.avatar).toBeUndefined();
      expect(result.current.time).toBeNull();
      expect(result.current.numeroCamisa).toBeNull();
    });
  });

  describe('Computed: isComplete', () => {
    it('deve retornar false quando faltam dados obrigatórios', () => {
      const { result } = renderHook(() => usePlayerStore());

      expect(selectIsComplete(result.current)).toBe(false);
    });

    it('deve retornar true quando todos os dados obrigatórios estão preenchidos', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setNome('Ashito Aoi');
        result.current.setPosicao('FW');
        result.current.setAtributos({ chute: 5, drible: 5, passe: 5, bloqueio: 1, desarme: 1, interceptacao: 1 });
        result.current.setTime('Tokyo Esperion');
        result.current.setNumeroCamisa(10);
      });

      expect(selectIsComplete(result.current)).toBe(true);
    });

    it('deve retornar false se faltar nome', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setPosicao('FW');
        result.current.setAtributos({ chute: 5, drible: 5, passe: 5, bloqueio: 1, desarme: 1, interceptacao: 1 });
        result.current.setTime('Tokyo Esperion');
        result.current.setNumeroCamisa(10);
      });

      expect(selectIsComplete(result.current)).toBe(false);
    });

    it('deve retornar false se faltar posição', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setNome('Ashito Aoi');
        result.current.setAtributos({ chute: 5, drible: 5, passe: 5, bloqueio: 1, desarme: 1, interceptacao: 1 });
        result.current.setTime('Tokyo Esperion');
        result.current.setNumeroCamisa(10);
      });

      expect(selectIsComplete(result.current)).toBe(false);
    });
  });
});
