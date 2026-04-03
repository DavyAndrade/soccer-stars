import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  savePlayerData, 
  loadPlayerData, 
  saveLeagueData, 
  loadLeagueData,
  clearAllData,
  STORAGE_KEYS 
} from './storage';

// Mock do localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

describe('storage-layer', () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('savePlayerData', () => {
    it('deve salvar dados do jogador no localStorage', () => {
      const playerData = {
        nome: 'Ashito Aoi',
        posicao: 'FW' as const,
        atributos: {
          chute: 5,
          drible: 5,
          passe: 5,
          bloqueio: 1,
          desarme: 1,
          interceptacao: 1,
        },
        time: 'Tokyo Esperion',
        numeroCamisa: 10,
      };

      savePlayerData(playerData);

      const saved = localStorage.getItem(STORAGE_KEYS.PLAYER);
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(playerData);
    });

    it('deve sobrescrever dados anteriores', () => {
      const firstData = {
        nome: 'Player 1',
        posicao: 'DF' as const,
        atributos: {
          chute: 1,
          drible: 1,
          passe: 1,
          bloqueio: 5,
          desarme: 5,
          interceptacao: 5,
        },
        time: 'Time A',
        numeroCamisa: 4,
      };

      const secondData = {
        nome: 'Player 2',
        posicao: 'GK' as const,
        atributos: {
          captura: 4,
          espalme: 2,
        },
        time: 'Time B',
        numeroCamisa: 1,
      };

      savePlayerData(firstData);
      savePlayerData(secondData);

      const saved = localStorage.getItem(STORAGE_KEYS.PLAYER);
      expect(JSON.parse(saved!).nome).toBe('Player 2');
    });
  });

  describe('loadPlayerData', () => {
    it('deve carregar dados do jogador do localStorage', () => {
      const playerData = {
        nome: 'Ashito Aoi',
        posicao: 'FW' as const,
        atributos: {
          chute: 5,
          drible: 5,
          passe: 5,
          bloqueio: 1,
          desarme: 1,
          interceptacao: 1,
        },
      };

      localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(playerData));

      const loaded = loadPlayerData();
      expect(loaded).toEqual(playerData);
    });

    it('deve retornar null se não houver dados salvos', () => {
      const loaded = loadPlayerData();
      expect(loaded).toBeNull();
    });

    it('deve retornar null se dados estiverem corrompidos', () => {
      localStorage.setItem(STORAGE_KEYS.PLAYER, 'invalid json {]');

      const loaded = loadPlayerData();
      expect(loaded).toBeNull();
    });

    it('deve retornar null se validação Zod falhar', () => {
      const invalidData = {
        nome: 'A', // Muito curto (min 2)
        posicao: 'INVALID',
      };

      localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(invalidData));

      const loaded = loadPlayerData();
      expect(loaded).toBeNull();
    });
  });

  describe('saveLeagueData', () => {
    it('deve salvar dados da liga no localStorage', () => {
      const leagueData = {
        times: [
          {
            id: 1,
            nome: 'Time A',
            formacao: '4-3-3',
            pontos: 3,
            vitorias: 1,
            empates: 0,
            derrotas: 0,
            golsMarcados: 2,
            golsSofridos: 1,
            saldoGols: 1,
          },
        ],
        resultados: [
          {
            rodada: 1,
            timeCasaId: 1,
            timeVisitanteId: 2,
            golsCasa: 2,
            golsVisitante: 1,
          },
        ],
        rodadaAtual: 2,
        timeProtagonista: 1,
      };

      saveLeagueData(leagueData);

      const saved = localStorage.getItem(STORAGE_KEYS.LEAGUE);
      expect(saved).toBeTruthy();
      expect(JSON.parse(saved!)).toEqual(leagueData);
    });
  });

  describe('loadLeagueData', () => {
    it('deve carregar dados da liga do localStorage', () => {
      const leagueData = {
        times: [],
        resultados: [],
        rodadaAtual: 1,
        timeProtagonista: null,
      };

      localStorage.setItem(STORAGE_KEYS.LEAGUE, JSON.stringify(leagueData));

      const loaded = loadLeagueData();
      expect(loaded).toEqual(leagueData);
    });

    it('deve retornar null se não houver dados salvos', () => {
      const loaded = loadLeagueData();
      expect(loaded).toBeNull();
    });

    it('deve retornar null se dados estiverem corrompidos', () => {
      localStorage.setItem(STORAGE_KEYS.LEAGUE, 'corrupted data');

      const loaded = loadLeagueData();
      expect(loaded).toBeNull();
    });
  });

  describe('clearAllData', () => {
    it('deve limpar todos os dados do localStorage', () => {
      localStorage.setItem(STORAGE_KEYS.PLAYER, '{}');
      localStorage.setItem(STORAGE_KEYS.LEAGUE, '{}');
      localStorage.setItem('other-key', 'other-value');

      clearAllData();

      expect(localStorage.getItem(STORAGE_KEYS.PLAYER)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.LEAGUE)).toBeNull();
      // Outras keys não relacionadas devem permanecer
      expect(localStorage.getItem('other-key')).toBe('other-value');
    });
  });

  describe('STORAGE_KEYS', () => {
    it('deve ter keys únicas e prefixadas', () => {
      expect(STORAGE_KEYS.PLAYER).toContain('soccer-stars');
      expect(STORAGE_KEYS.LEAGUE).toContain('soccer-stars');
      expect(STORAGE_KEYS.PLAYER).not.toBe(STORAGE_KEYS.LEAGUE);
    });
  });
});
