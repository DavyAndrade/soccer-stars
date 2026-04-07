import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { usePlayerStore, selectIsComplete } from '@/store/player-store';
import type { PlayerPosition, PlayerAttributes } from '@/types/player';

describe('player-store (novo sistema - 3 atributos)', () => {
  beforeEach(() => {
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

    it('deve aceitar todas as posições válidas (incluindo GK)', () => {
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

  describe('setAtributos (novo sistema)', () => {
    it('deve atualizar atributos com novo sistema (3 atributos)', () => {
      const { result } = renderHook(() => usePlayerStore());
      const atributos: PlayerAttributes = {
        potencia: 5,
        rapidez: 3,
        tecnica: 1,
      };

      act(() => {
        result.current.setAtributos(atributos);
      });

      expect(result.current.atributos).toEqual(atributos);
    });

    it('GK agora usa mesmos atributos (não tem schema separado)', () => {
      const { result } = renderHook(() => usePlayerStore());
      const atributosGK: PlayerAttributes = {
        potencia: 3,
        rapidez: 2,
        tecnica: 4,
      };

      act(() => {
        result.current.setPosicao('GK');
        result.current.setAtributos(atributosGK);
      });

      expect(result.current.atributos).toEqual(atributosGK);
      expect(result.current.posicao).toBe('GK');
    });
  });

  describe('setAvatar', () => {
    it('deve atualizar o avatar', () => {
      const { result } = renderHook(() => usePlayerStore());
      const avatarBase64 = 'data:image/png;base64,iVBORw0KGgo=';

      act(() => {
        result.current.setAvatar(avatarBase64);
      });

      expect(result.current.avatar).toBe(avatarBase64);
    });

    it('deve aceitar undefined para remover avatar', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setAvatar('data:image/png;base64,abc');
        result.current.setAvatar(undefined);
      });

      expect(result.current.avatar).toBeUndefined();
    });
  });

  describe('setTime', () => {
    it('deve atualizar o time do jogador', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setTime('Esperion Youth');
      });

      expect(result.current.time).toBe('Esperion Youth');
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

    it('deve aceitar números de 1 a 99', () => {
      const { result } = renderHook(() => usePlayerStore());

      [1, 10, 50, 99].forEach((num) => {
        act(() => {
          result.current.setNumeroCamisa(num);
        });
        expect(result.current.numeroCamisa).toBe(num);
      });
    });
  });

  describe('reset', () => {
    it('deve resetar todos os dados para estado inicial', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setNome('Ashito');
        result.current.setPosicao('FW');
        result.current.setAtributos({ potencia: 5, rapidez: 3, tecnica: 1 });
        result.current.setTime('Esperion');
        result.current.setNumeroCamisa(10);
        result.current.reset();
      });

      expect(result.current.nome).toBe('');
      expect(result.current.posicao).toBeNull();
      expect(result.current.atributos).toBeNull();
      expect(result.current.time).toBeNull();
      expect(result.current.numeroCamisa).toBeNull();
    });
  });

  describe('selectIsComplete', () => {
    it('deve retornar false quando faltam dados obrigatórios', () => {
      const { result } = renderHook(() => usePlayerStore());

      expect(selectIsComplete(result.current)).toBe(false);
    });

    it('deve retornar false quando nome tem menos de 2 caracteres', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setNome('A');
        result.current.setPosicao('FW');
        result.current.setAtributos({ potencia: 3, rapidez: 3, tecnica: 3 });
        result.current.setTime('Esperion');
        result.current.setNumeroCamisa(10);
      });

      expect(selectIsComplete(result.current)).toBe(false);
    });

    it('deve retornar true quando todos os dados obrigatórios estão preenchidos', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setNome('Ashito Aoi');
        result.current.setPosicao('FW');
        result.current.setAtributos({ potencia: 5, rapidez: 3, tecnica: 1 });
        result.current.setTime('Esperion Youth');
        result.current.setNumeroCamisa(10);
      });

      expect(selectIsComplete(result.current)).toBe(true);
    });

    it('deve retornar true mesmo sem avatar (avatar é opcional)', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setNome('Ashito Aoi');
        result.current.setPosicao('FW');
        result.current.setAtributos({ potencia: 5, rapidez: 3, tecnica: 1 });
        result.current.setTime('Esperion');
        result.current.setNumeroCamisa(10);
        // Sem setAvatar
      });

      expect(selectIsComplete(result.current)).toBe(true);
    });

    it('deve funcionar para GK também (atributos universais)', () => {
      const { result } = renderHook(() => usePlayerStore());

      act(() => {
        result.current.setNome('Kenji');
        result.current.setPosicao('GK');
        result.current.setAtributos({ potencia: 3, rapidez: 2, tecnica: 4 });
        result.current.setTime('Esperion');
        result.current.setNumeroCamisa(1);
      });

      expect(selectIsComplete(result.current)).toBe(true);
    });
  });
});
