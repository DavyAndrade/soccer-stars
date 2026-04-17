import {
  FORMACOES,
  type ConferenciaLiga,
  type FormacaoNome,
  type TeamSquadPlayer,
  type Time,
} from '@/types/team';
import type { PlayerAttributes, PlayerPosition } from '@/types/player';

type TeamSeed = {
  id: string;
  nome: string;
  conferencia: ConferenciaLiga;
  corPrimaria: string;
  corSecundaria: string;
};

const TEAM_SEEDS: TeamSeed[] = [
  { id: 'aomori-yamada-hs', nome: 'Aomori Yamada HS', conferencia: 'EAST', corPrimaria: '#006B3F', corSecundaria: '#FFFFFF' },
  { id: 'vegalta-sendai-u18', nome: 'Vegalta Sendai U18', conferencia: 'EAST', corPrimaria: '#D4AF37', corSecundaria: '#0057B8' },
  { id: 'kashima-antlers-u18', nome: 'Kashima Antlers U18', conferencia: 'EAST', corPrimaria: '#B5121B', corSecundaria: '#0A1E3C' },
  { id: 'maebashi-ikuei-hs', nome: 'Maebashi Ikuei HS', conferencia: 'EAST', corPrimaria: '#E10600', corSecundaria: '#FFFFFF' },
  { id: 'shohei-hs', nome: 'Shohei HS', conferencia: 'EAST', corPrimaria: '#5C2D91', corSecundaria: '#FFFFFF' },
  { id: 'kashiwa-reysol-u18', nome: 'Kashiwa Reysol U18', conferencia: 'EAST', corPrimaria: '#F2D13D', corSecundaria: '#111111' },
  { id: 'rku-kashiwa-hs', nome: 'RKU Kashiwa HS', conferencia: 'EAST', corPrimaria: '#0E8A44', corSecundaria: '#FFFFFF' },
  { id: 'tokyo-verdy-u18', nome: 'Tokyo Verdy U18', conferencia: 'EAST', corPrimaria: '#0B8A43', corSecundaria: '#FFFFFF' },
  { id: 'fc-tokyo-u18', nome: 'FC Tokyo U18', conferencia: 'EAST', corPrimaria: '#313A8A', corSecundaria: '#D81E34' },
  { id: 'yokohama-fc-u18', nome: 'Yokohama FC U18', conferencia: 'EAST', corPrimaria: '#5BA7E1', corSecundaria: '#FFFFFF' },
  { id: 'kawasaki-frontale-u18', nome: 'Kawasaki Frontale U18', conferencia: 'EAST', corPrimaria: '#4FA4DA', corSecundaria: '#111111' },
  { id: 'teikyo-nagaoka-hs', nome: 'Teikyo Nagaoka HS', conferencia: 'EAST', corPrimaria: '#003E92', corSecundaria: '#FFFFFF' },
  { id: 'vissel-kobe-u18', nome: 'Vissel Kobe U18', conferencia: 'WEST', corPrimaria: '#8E1537', corSecundaria: '#FFFFFF' },
  { id: 'avispa-fukuoka-u18', nome: 'Avispa Fukuoka U18', conferencia: 'WEST', corPrimaria: '#1A2E7A', corSecundaria: '#9EC3E6' },
  { id: 'jubilo-iwata-u18', nome: 'Júbilo Iwata U18', conferencia: 'WEST', corPrimaria: '#6BB7E6', corSecundaria: '#FFFFFF' },
  { id: 'nagoya-grampus-u18', nome: 'Nagoya Grampus U18', conferencia: 'WEST', corPrimaria: '#C3002F', corSecundaria: '#F59D00' },
  { id: 'higashiyama-hs', nome: 'Higashiyama HS', conferencia: 'WEST', corPrimaria: '#6A1B9A', corSecundaria: '#FFFFFF' },
  { id: 'gamba-osaka-u18', nome: 'Gamba Osaka U18', conferencia: 'WEST', corPrimaria: '#1D4FA3', corSecundaria: '#111111' },
  { id: 'yonago-kita-hs', nome: 'Yonago Kita HS', conferencia: 'WEST', corPrimaria: '#2E7D32', corSecundaria: '#FFFFFF' },
  { id: 'fagiano-okayama-u18', nome: 'Fagiano Okayama U18', conferencia: 'WEST', corPrimaria: '#C21D29', corSecundaria: '#FFFFFF' },
  { id: 'sanfrecce-hiroshima-u18', nome: 'Sanfrecce Hiroshima U18', conferencia: 'WEST', corPrimaria: '#5A2D81', corSecundaria: '#FFFFFF' },
  { id: 'sagan-tosu-u18', nome: 'Sagan Tosu U18', conferencia: 'WEST', corPrimaria: '#4DA1D9', corSecundaria: '#E28AC3' },
  { id: 'kumamoto-ozu-hs', nome: 'Kumamoto Ozu HS', conferencia: 'WEST', corPrimaria: '#1E88E5', corSecundaria: '#FFFFFF' },
  { id: 'kamimura-gakuen-hs', nome: 'Kamimura Gakuen HS', conferencia: 'WEST', corPrimaria: '#1B1B1B', corSecundaria: '#F6C200' },
];

const FORMACOES_NOMES = Object.keys(FORMACOES) as FormacaoNome[];
const NACIONALIDADES = ['Japão', 'Coreia do Sul', 'Brasil', 'Argentina', 'Espanha', 'Portugal'];
const FIRST_NAMES = [
  'Haruto', 'Yuki', 'Ren', 'Sora', 'Riku', 'Aoi', 'Daichi', 'Takumi', 'Kaito', 'Shun',
  'Keita', 'Hiro', 'Ryo', 'Tatsuya', 'Akira', 'Hayato', 'Yuma', 'Koji', 'Naoki', 'Issei',
  'Yuta', 'Kazuki', 'Masato', 'Ryota', 'Shota', 'Tomoya', 'Kenta', 'Koki', 'Ryusei', 'Yuji',
  'Renta', 'Minato', 'Hinata', 'Souta', 'Itsuki', 'Raul', 'Thiago', 'Mateo', 'Iker', 'Luca',
];
const LAST_NAMES = [
  'Sato', 'Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato',
  'Yoshida', 'Yamada', 'Sasaki', 'Yamaguchi', 'Matsumoto', 'Inoue', 'Kimura', 'Shimizu', 'Hayashi', 'Ogawa',
  'Mori', 'Abe', 'Sakamoto', 'Fujita', 'Okada', 'Miyazaki', 'Nishimura', 'Andrade', 'Silva', 'Santos',
  'Garcia', 'Fernandez', 'Pereira', 'Costa', 'Matsuda', 'Kishimoto', 'Noguchi', 'Fukuda', 'Yokoyama', 'Nakajima',
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function createRng(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function pick<T>(rng: () => number, values: readonly T[]): T {
  return values[Math.floor(rng() * values.length)];
}

function randomAtributos(rng: () => number): PlayerAttributes {
  const attrs: PlayerAttributes = { potencia: 1, rapidez: 1, tecnica: 1 };
  let remaining = 6;
  const keys: (keyof PlayerAttributes)[] = ['potencia', 'rapidez', 'tecnica'];

  while (remaining > 0) {
    const key = pick(rng, keys);
    if (attrs[key] < 5) {
      attrs[key] += 1;
      remaining -= 1;
    }
  }

  return attrs;
}

function formationRoleTargets(formacaoNome: FormacaoNome): Record<PlayerPosition, number> {
  if (formacaoNome === '4-2-3-1') {
    return { GK: 1, DF: 4, MF: 5, FW: 1 };
  }

  const [df, mf, fw] = formacaoNome.split('-').map(Number);
  return { GK: 1, DF: df, MF: mf, FW: fw };
}

export function applyFormationToSquad(jogadores: TeamSquadPlayer[], formacaoNome: FormacaoNome): TeamSquadPlayer[] {
  const targets = formationRoleTargets(formacaoNome);
  const sorted = [...jogadores].sort((a, b) => a.numero - b.numero);

  const grouped: Record<PlayerPosition, TeamSquadPlayer[]> = {
    GK: [],
    DF: [],
    MF: [],
    FW: [],
  };

  sorted.forEach((jogador) => grouped[jogador.posicao].push(jogador));

  const titulares = new Set<string>();
  (['GK', 'DF', 'MF', 'FW'] as PlayerPosition[]).forEach((posicao) => {
    grouped[posicao].slice(0, targets[posicao]).forEach((jogador) => titulares.add(jogador.id));
  });

  // Garante 11 titulares completos caso um elenco legado esteja inconsistente.
  if (titulares.size < 11) {
    const reservas = sorted.filter((jogador) => !titulares.has(jogador.id));
    reservas.slice(0, 11 - titulares.size).forEach((jogador) => titulares.add(jogador.id));
  }

  return jogadores.map((jogador) => ({ ...jogador, titular: titulares.has(jogador.id) }));
}

function generateSquad(teamId: string): TeamSquadPlayer[] {
  const rng = createRng(hashString(teamId));
  const positions: PlayerPosition[] = [
    'GK', 'GK', 'GK',
    'DF', 'DF', 'DF', 'DF', 'DF', 'DF', 'DF', 'DF',
    'MF', 'MF', 'MF', 'MF', 'MF', 'MF', 'MF', 'MF',
    'FW', 'FW', 'FW', 'FW', 'FW', 'FW', 'FW', 'FW',
  ];
  const used = new Set<number>();

  const preferredNumbersByPosition: Record<PlayerPosition, number[]> = {
    GK: [1, 12, 21],
    DF: [2, 3, 4, 5, 6, 13, 14, 15],
    MF: [7, 8, 10, 16, 18, 23, 24, 26],
    FW: [9, 11, 17, 19, 20, 22, 25, 30],
  };

  return positions.map((posicao, index) => {
    const preferredPool = preferredNumbersByPosition[posicao].filter((numero) => !used.has(numero));
    const fallbackPool = Array.from({ length: 99 }, (_, i) => i + 1).filter((numero) => {
      if (used.has(numero)) return false;
      if (posicao === 'GK' && numero === 10) return false;
      return true;
    });
    const sourcePool = preferredPool.length > 0 ? preferredPool : fallbackPool;
    let numero = sourcePool[Math.floor(rng() * sourcePool.length)] ?? 99;

    while (used.has(numero) || (posicao === 'GK' && numero === 10)) {
      numero = sourcePool[Math.floor(rng() * sourcePool.length)] ?? 99;
    }
    used.add(numero);

    const nome = `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`;
    const idade = 15 + Math.floor(rng() * 4);

    return {
      id: `${teamId}-p${index + 1}`,
      nome,
      numero,
      posicao,
      atributos: randomAtributos(rng),
      energia: 10,
      energiaMaxima: 10,
      isProtagonista: false,
      timeId: teamId,
      nacionalidade: pick(rng, NACIONALIDADES),
      idade,
      titular: false,
    };
  });
}

function pickInitialFormation(teamId: string): FormacaoNome {
  const rng = createRng(hashString(`formation:${teamId}`));
  return pick(rng, FORMACOES_NOMES);
}

function calculateAvailableNumbers(squad: TeamSquadPlayer[]): number[] {
  const used = new Set(squad.map((p) => p.numero));
  return Array.from({ length: 99 }, (_, i) => i + 1).filter((n) => !used.has(n));
}

const ELENCO_ALVO_POR_POSICAO: Record<PlayerPosition, number> = {
  GK: 3,
  DF: 8,
  MF: 8,
  FW: 8,
};

function rebalanceSquadByPosition(teamId: string, jogadores: TeamSquadPlayer[]): TeamSquadPlayer[] {
  const rng = createRng(hashString(`rebalance:${teamId}:${jogadores.length}`));
  const usedIds = new Set(jogadores.map((player) => player.id));
  const usedNumbers = new Set(jogadores.map((player) => player.numero));
  const grouped: Record<PlayerPosition, TeamSquadPlayer[]> = {
    GK: [],
    DF: [],
    MF: [],
    FW: [],
  };

  jogadores.forEach((player) => {
    grouped[player.posicao].push(player);
  });

  const selected: TeamSquadPlayer[] = [];
  (['GK', 'DF', 'MF', 'FW'] as PlayerPosition[]).forEach((posicao) => {
    const target = ELENCO_ALVO_POR_POSICAO[posicao];
    const players = grouped[posicao];
    const protagonistas = players.filter((player) => player.isProtagonista);
    const nonProtagonistas = players
      .filter((player) => !player.isProtagonista)
      .sort((a, b) => a.idade - b.idade);

    const kept = [...protagonistas, ...nonProtagonistas.slice(0, Math.max(0, target - protagonistas.length))];
    selected.push(...kept);
  });

  const byPositionCount = {
    GK: selected.filter((player) => player.posicao === 'GK').length,
    DF: selected.filter((player) => player.posicao === 'DF').length,
    MF: selected.filter((player) => player.posicao === 'MF').length,
    FW: selected.filter((player) => player.posicao === 'FW').length,
  };

  const createYouthPlayer = (posicao: PlayerPosition): TeamSquadPlayer => {
    const suffix = `${posicao.toLowerCase()}-${Math.floor(rng() * 1_000_000)}`;
    let id = `${teamId}-${suffix}`;
    while (usedIds.has(id)) {
      id = `${teamId}-${posicao.toLowerCase()}-${Math.floor(rng() * 1_000_000)}`;
    }
    usedIds.add(id);

    const numberPool = Array.from({ length: 99 }, (_, i) => i + 1).filter((num) => !usedNumbers.has(num));
    const numero = pick(rng, numberPool.length > 0 ? numberPool : [99]);
    usedNumbers.add(numero);

    return {
      id,
      nome: `${pick(rng, FIRST_NAMES)} ${pick(rng, LAST_NAMES)}`,
      numero,
      posicao,
      atributos: randomAtributos(rng),
      energia: 10,
      energiaMaxima: 10,
      isProtagonista: false,
      timeId: teamId,
      nacionalidade: pick(rng, NACIONALIDADES),
      idade: 15 + Math.floor(rng() * 3),
      titular: false,
    };
  };

  (['GK', 'DF', 'MF', 'FW'] as PlayerPosition[]).forEach((posicao) => {
    const target = ELENCO_ALVO_POR_POSICAO[posicao];
    while (byPositionCount[posicao] < target) {
      selected.push(createYouthPlayer(posicao));
      byPositionCount[posicao] += 1;
    }
  });

  return selected;
}

export function getInitialTeams(): Time[] {
  return TEAM_SEEDS.map((seed) => {
    const formacaoNome = pickInitialFormation(seed.id);
    const jogadores = applyFormationToSquad(generateSquad(seed.id), formacaoNome);
    return {
      ...seed,
      jogadores,
      formacao: {
        nome: formacaoNome,
        distribuicao: FORMACOES[formacaoNome],
      },
      numerosDisponiveis: calculateAvailableNumbers(jogadores),
    };
  });
}

export function advanceSeasonAges(times: Time[]): Time[] {
  return times.map((team) => {
    const agedPlayers = team.jogadores.map((player) => ({ ...player, idade: player.idade + 1 }));
    const retained = agedPlayers.filter((player) => player.isProtagonista || player.idade <= 18);
    const rebalanced = rebalanceSquadByPosition(team.id, retained);
    const jogadoresAtualizados = applyFormationToSquad(rebalanced, team.formacao.nome);

    return {
      ...team,
      jogadores: jogadoresAtualizados,
      numerosDisponiveis: calculateAvailableNumbers(jogadoresAtualizados),
    };
  });
}
