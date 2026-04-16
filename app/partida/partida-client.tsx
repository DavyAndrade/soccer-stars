'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { decidirAcaoNPC } from '@/lib/ai';
import { executarConfronto, executarConfrontoGoleiro } from '@/lib/combat';
import { rollD10, rollD5 } from '@/lib/dice';
import { finalizeCareerRound, getNextCareerMatch, loadCareerSlot } from '@/lib/storage';
import type { ZonaCampo } from '@/types/match';
import { POSICOES_POR_ZONA, type PlayerAttributes, type PlayerPosition } from '@/types/player';
import type { TeamSquadPlayer, Time } from '@/types/team';

interface PartidaClientProps {
  slot: 1 | 2 | 3;
}

type MatchTeam = 'protagonista' | 'adversario';
type MatchAction = 'chute' | 'drible' | 'passe';
type EnergyMap = Record<string, number>;
type UniformeEscolha = 'primario' | 'secundario';
type LogPart = { text: string; side?: MatchTeam };
type LogEntry = { id: number; parts: LogPart[] };

const ZONAS: ZonaCampo[] = ['DF1', 'MI1', 'MC', 'MI2', 'DF2'];
const POSICAO_ORDEM: Record<PlayerPosition, number> = { GK: 0, DF: 1, MF: 2, FW: 3 };
const ACTION_DELAY_MS = 2000;
const SKIP_DELAY_MS = 30;
const AUTO_SUB_THRESHOLD = 2;
const AUTO_SUB_MIN_ENERGY = 5;
const MAX_AUTO_SUBS_PER_TEAM = 5;

function clampEnergy(value: number): number {
  return Math.max(0, Math.min(10, value));
}

function mirrorZone(zone: ZonaCampo): ZonaCampo {
  if (zone === 'DF1') return 'DF2';
  if (zone === 'MI1') return 'MI2';
  if (zone === 'MI2') return 'MI1';
  if (zone === 'DF2') return 'DF1';
  return 'MC';
}

function canShoot(side: MatchTeam, zone: ZonaCampo): boolean {
  if (side === 'protagonista') {
    return zone === 'MI2' || zone === 'DF2';
  }
  return zone === 'MI1' || zone === 'DF1';
}

function advanceZone(side: MatchTeam, zone: ZonaCampo): ZonaCampo {
  const index = ZONAS.indexOf(zone);
  if (index < 0) return zone;
  if (side === 'protagonista') {
    return ZONAS[Math.min(index + 1, ZONAS.length - 1)] ?? zone;
  }
  return ZONAS[Math.max(index - 1, 0)] ?? zone;
}

function pickRandom<T>(values: T[]): T | null {
  if (values.length === 0) return null;
  return values[Math.floor(Math.random() * values.length)] ?? null;
}

function fallbackAttributes(): PlayerAttributes {
  return { potencia: 3, rapidez: 3, tecnica: 3 };
}

function createEnergyMap(players: TeamSquadPlayer[]): EnergyMap {
  return Object.fromEntries(players.map((player) => [player.id, 10]));
}

function getEnergy(energyMap: EnergyMap, playerId?: string | null): number {
  if (!playerId) return 10;
  return energyMap[playerId] ?? 10;
}

function spendEnergy(energyMap: EnergyMap, playerIds: Array<string | null | undefined>): EnergyMap {
  const next = { ...energyMap };
  new Set(playerIds.filter(Boolean)).forEach((playerId) => {
    const id = playerId as string;
    next[id] = clampEnergy((next[id] ?? 10) - 1);
  });
  return next;
}

function recoverAllEnergy(energyMap: EnergyMap): EnergyMap {
  const next: EnergyMap = {};
  Object.entries(energyMap).forEach(([playerId, value]) => {
    next[playerId] = clampEnergy(value + 5);
  });
  return next;
}

function getPlayersOnField(roster: TeamSquadPlayer[], ids: string[]): TeamSquadPlayer[] {
  if (ids.length === 0) return roster.filter((player) => player.titular);
  const idSet = new Set(ids);
  return roster.filter((player) => idSet.has(player.id));
}

export function PartidaClient({ slot }: PartidaClientProps) {
  const router = useRouter();
  const [save, setSave] = useState<ReturnType<typeof loadCareerSlot>>(null);
  const [placarProtagonista, setPlacarProtagonista] = useState(0);
  const [placarAdversario, setPlacarAdversario] = useState(0);
  const [energiaPorJogador, setEnergiaPorJogador] = useState<EnergyMap>({});
  const [zonaAtual, setZonaAtual] = useState<ZonaCampo>('MC');
  const [timeComPosse, setTimeComPosse] = useState<MatchTeam>('protagonista');
  const [portadorId, setPortadorId] = useState<string | null>(null);
  const [minutoAtual, setMinutoAtual] = useState(0);
  const [acrescimos1Tempo, setAcrescimos1Tempo] = useState(0);
  const [acrescimos2Tempo, setAcrescimos2Tempo] = useState(0);
  const [partidaIniciada, setPartidaIniciada] = useState(false);
  const [partidaFinalizada, setPartidaFinalizada] = useState(false);
  const [concluindoRodada, setConcluindoRodada] = useState(false);
  const [pulandoParaResultado, setPulandoParaResultado] = useState(false);
  const [aguardandoPasse, setAguardandoPasse] = useState(false);
  const [chuteLivrePara, setChuteLivrePara] = useState<MatchTeam | null>(null);
  const [emCampoProtagonistaIds, setEmCampoProtagonistaIds] = useState<string[]>([]);
  const [emCampoAdversarioIds, setEmCampoAdversarioIds] = useState<string[]>([]);
  const [substituicoesAutomaticas, setSubstituicoesAutomaticas] = useState<{ protagonista: number; adversario: number }>({
    protagonista: 0,
    adversario: 0,
  });
  const [uniformeProtagonista, setUniformeProtagonista] = useState<UniformeEscolha>('primario');
  const [uniformeAdversario, setUniformeAdversario] = useState<UniformeEscolha>('primario');
  const [log, setLog] = useState<LogEntry[]>([]);
  const logCounter = useRef(0);
  const minutoRef = useRef(0);

  useEffect(() => {
    setSave(loadCareerSlot(slot));
  }, [slot]);

  useEffect(() => {
    minutoRef.current = minutoAtual;
  }, [minutoAtual]);

  useEffect(() => {
    if (!save) return;
    setPlacarProtagonista(0);
    setPlacarAdversario(0);
    setEnergiaPorJogador({});
    setZonaAtual('MC');
    setTimeComPosse('protagonista');
    setPortadorId(null);
    setMinutoAtual(0);
    minutoRef.current = 0;
    setAcrescimos1Tempo(rollD5());
    setAcrescimos2Tempo(rollD5());
    setPartidaIniciada(false);
    setPartidaFinalizada(false);
    setPulandoParaResultado(false);
    setAguardandoPasse(false);
    setChuteLivrePara(null);
    setEmCampoProtagonistaIds([]);
    setEmCampoAdversarioIds([]);
    setSubstituicoesAutomaticas({ protagonista: 0, adversario: 0 });
    setUniformeProtagonista('primario');
    setUniformeAdversario('primario');
    setLog([]);
  }, [save]);

  const team = useMemo<Time | null>(() => {
    if (!save) return null;
    return (save.liga.times as Time[]).find((time) => time.id === save.protagonista.timeId) ?? null;
  }, [save]);
  const nextMatch = save && team ? getNextCareerMatch(save, team.id) : null;
  const opponentTeam = nextMatch?.opponent ?? null;

  const protagonistas = useMemo(() => (team ? team.jogadores : []), [team]);
  const adversarios = useMemo(() => (opponentTeam ? opponentTeam.jogadores : []), [opponentTeam]);
  const protagonistasTitulares = useMemo(
    () => getPlayersOnField(protagonistas, emCampoProtagonistaIds),
    [protagonistas, emCampoProtagonistaIds],
  );
  const adversariosTitulares = useMemo(
    () => getPlayersOnField(adversarios, emCampoAdversarioIds),
    [adversarios, emCampoAdversarioIds],
  );
  const protagonista = useMemo(
    () => protagonistasTitulares.find((player) => player.isProtagonista) ?? null,
    [protagonistasTitulares],
  );

  const tempoTotal = 90 + acrescimos1Tempo + acrescimos2Tempo;
  const fimPrimeiroTempo = 45 + acrescimos1Tempo;
  const protagonistaParticipando = Boolean(protagonista);
  const protagonistaTemBola = Boolean(
    partidaIniciada && protagonista && timeComPosse === 'protagonista' && portadorId === protagonista.id,
  );

  const corDoTime = (side: MatchTeam): string => {
    if (side === 'protagonista') {
      if (!team) return '#e4e4e7';
      return uniformeProtagonista === 'primario' ? team.corPrimaria : team.corSecundaria;
    }
    if (!opponentTeam) return '#e4e4e7';
    return uniformeAdversario === 'primario' ? opponentTeam.corPrimaria : opponentTeam.corSecundaria;
  };

  const appendLog = (parts: LogPart[]) => {
    setLog((history) => {
      const text = parts.map((part) => part.text).join('');
      if (history[0] && history[0].parts.map((part) => part.text).join('') === text) {
        return history;
      }
      logCounter.current += 1;
      return [{ id: logCounter.current, parts }, ...history].slice(0, 12);
    });
  };

  const getTitulares = (side: MatchTeam): TeamSquadPlayer[] =>
    side === 'protagonista' ? protagonistasTitulares : adversariosTitulares;

  const zoneForSide = (side: MatchTeam, zone: ZonaCampo): ZonaCampo =>
    side === 'protagonista' ? zone : mirrorZone(zone);

  const getCurrentCarrier = (side: MatchTeam): TeamSquadPlayer | null => {
    if (!portadorId) return null;
    return getTitulares(side).find((player) => player.id === portadorId) ?? null;
  };

  const chooseBallCarrier = (
    side: MatchTeam,
    zone: ZonaCampo,
    options?: { excludeProtagonist?: boolean; preferredPositions?: PlayerPosition[] },
  ): TeamSquadPlayer | null => {
    const pool = getTitulares(side);
    if (pool.length === 0) return null;

    const filteredPool = options?.excludeProtagonist
      ? pool.filter((player) => !player.isProtagonista)
      : pool;
    const sourcePool = filteredPool.length > 0 ? filteredPool : pool;

    if (options?.preferredPositions && options.preferredPositions.length > 0) {
      const preferred = sourcePool.filter((player) => options.preferredPositions?.includes(player.posicao));
      if (preferred.length > 0) return pickRandom(preferred);
    }

    const allowed = POSICOES_POR_ZONA[zoneForSide(side, zone)] ?? ['DF', 'MF', 'FW'];
    const candidates = sourcePool.filter((player) => allowed.includes(player.posicao) && player.posicao !== 'GK');
    return pickRandom(candidates.length > 0 ? candidates : sourcePool);
  };

  const chooseKickoffCarrier = (side: MatchTeam) =>
    chooseBallCarrier(side, 'MC', { preferredPositions: ['MF', 'FW'] });

  const escolherDefensor = (defendingSide: MatchTeam, zone: ZonaCampo, action: MatchAction): TeamSquadPlayer | null => {
    const pool = getTitulares(defendingSide);
    if (pool.length === 0) return null;
    const allowed = POSICOES_POR_ZONA[zoneForSide(defendingSide, zone)] ?? ['DF', 'MF', 'FW'];
    const candidates = pool.filter((player) => allowed.includes(player.posicao) && player.posicao !== 'GK');
    const source = candidates.length > 0 ? candidates : pool.filter((player) => player.posicao !== 'GK');
    if (source.length === 0) return pickRandom(pool);

    let bestScore = Number.NEGATIVE_INFINITY;
    let best: TeamSquadPlayer | null = null;
    for (const player of source) {
      const attrs = player.atributos ?? fallbackAttributes();
      const energia = getEnergy(energiaPorJogador, player.id);
      const atributoDefensivo =
        action === 'chute'
          ? attrs.potencia
          : action === 'drible'
            ? attrs.rapidez
            : attrs.tecnica;
      const bonusPosicao = player.posicao === 'DF' ? 1.2 : player.posicao === 'MF' ? 0.5 : 0;
      const score = atributoDefensivo * 2.2 + energia * 0.4 + bonusPosicao + Math.random() * 0.3;
      if (score > bestScore) {
        bestScore = score;
        best = player;
      }
    }

    return best;
  };

  const choosePassReceiver = (
    side: MatchTeam,
    zone: ZonaCampo,
    attackerId: string,
    forcedReceiverId?: string,
  ): TeamSquadPlayer | null => {
    const pool = getTitulares(side).filter((player) => player.id !== attackerId && player.posicao !== 'GK');
    if (pool.length === 0) return null;

    if (forcedReceiverId) {
      return pool.find((player) => player.id === forcedReceiverId) ?? null;
    }

    const contexto = zoneForSide(side, zone);
    let best: TeamSquadPlayer | null = null;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (const candidate of pool) {
      const attrs = candidate.atributos ?? fallbackAttributes();
      const energia = getEnergy(energiaPorJogador, candidate.id);
      const bonusPosicao =
        contexto === 'DF1'
          ? candidate.posicao === 'MF'
            ? 2.8
            : candidate.posicao === 'DF'
              ? 1.5
              : 0.8
          : contexto === 'MI1'
            ? candidate.posicao === 'MF'
              ? 2.6
              : candidate.posicao === 'FW'
                ? 1.8
                : 0.9
            : contexto === 'MC'
              ? candidate.posicao === 'FW'
                ? 2.5
                : candidate.posicao === 'MF'
                  ? 2.2
                  : 0.8
              : candidate.posicao === 'FW'
                ? 3
                : candidate.posicao === 'MF'
                  ? 1.6
                  : 0.4;
      const score = attrs.tecnica * 1.8 + energia * 0.35 + bonusPosicao + Math.random() * 0.25;
      if (score > bestScore) {
        bestScore = score;
        best = candidate;
      }
    }

    return best;
  };

  const executarSubstituicaoAutomatica = (side: MatchTeam) => {
    const roster = side === 'protagonista' ? protagonistas : adversarios;
    const onFieldIds = side === 'protagonista' ? emCampoProtagonistaIds : emCampoAdversarioIds;
    const restantes = MAX_AUTO_SUBS_PER_TEAM - substituicoesAutomaticas[side];
    if (restantes <= 0 || roster.length === 0 || onFieldIds.length === 0) return;

    let nextOnFieldIds = [...onFieldIds];
    let realizadas = 0;

    for (const titularId of onFieldIds) {
      if (realizadas >= restantes) break;
      const titular = roster.find((player) => player.id === titularId);
      if (!titular) continue;

      const energiaTitular = getEnergy(energiaPorJogador, titular.id);
      if (energiaTitular > AUTO_SUB_THRESHOLD) continue;

      const reservasMesmoCargo = roster
        .filter((player) => !nextOnFieldIds.includes(player.id) && player.posicao === titular.posicao)
        .map((player) => ({ player, energia: getEnergy(energiaPorJogador, player.id) }))
        .filter(({ energia }) => energia >= AUTO_SUB_MIN_ENERGY)
        .sort((a, b) => b.energia - a.energia);

      const melhorReserva = reservasMesmoCargo[0]?.player;
      if (!melhorReserva) continue;

      nextOnFieldIds = nextOnFieldIds.map((id) => (id === titular.id ? melhorReserva.id : id));
      realizadas += 1;
      appendLog([
        { text: side === 'protagonista' ? team?.nome ?? 'Seu time' : opponentTeam?.nome ?? 'Adversário', side },
        { text: ': substituição automática por estamina — sai ' },
        { text: titular.nome, side },
        { text: ', entra ' },
        { text: melhorReserva.nome, side },
        { text: '.' },
      ]);
    }

    if (realizadas === 0) return;

    if (side === 'protagonista') {
      setEmCampoProtagonistaIds(nextOnFieldIds);
    } else {
      setEmCampoAdversarioIds(nextOnFieldIds);
    }
    setSubstituicoesAutomaticas((current) => ({ ...current, [side]: current[side] + realizadas }));
  };

  const chooseRecoveredCarrier = (defendingSide: MatchTeam, defender: TeamSquadPlayer | null): TeamSquadPlayer | null => {
    if (defendingSide !== 'protagonista') {
      return chooseBallCarrier(defendingSide, zonaAtual);
    }
    if (defender?.isProtagonista) {
      return defender;
    }
    return chooseBallCarrier('protagonista', zonaAtual, { excludeProtagonist: true });
  };

  const avancarMinuto = (parts: LogPart[]) => {
    const nextMinute = minutoRef.current + 1;
    minutoRef.current = nextMinute;
    setMinutoAtual(nextMinute);

    if (nextMinute === fimPrimeiroTempo) {
      setEnergiaPorJogador((currentEnergy) => recoverAllEnergy(currentEnergy));
      appendLog([...parts, { text: ' Intervalo: estamina recuperada em +5.' }]);
    } else {
      appendLog(parts);
    }

    if (nextMinute >= tempoTotal) {
      setPartidaFinalizada(true);
    }
  };

  useEffect(() => {
    if (!partidaIniciada || partidaFinalizada || minutoAtual <= fimPrimeiroTempo) return;
    executarSubstituicaoAutomatica('protagonista');
    executarSubstituicaoAutomatica('adversario');
  }, [
    adversarios,
    emCampoAdversarioIds,
    emCampoProtagonistaIds,
    energiaPorJogador,
    fimPrimeiroTempo,
    minutoAtual,
    opponentTeam?.nome,
    partidaFinalizada,
    partidaIniciada,
    protagonistas,
    substituicoesAutomaticas,
    team?.nome,
  ]);

  const resolveGoal = (attackingSide: MatchTeam, atacanteNome: string, goleiroNome: string) => {
    const concedingSide: MatchTeam = attackingSide === 'protagonista' ? 'adversario' : 'protagonista';
    if (attackingSide === 'protagonista') {
      setPlacarProtagonista((current) => current + 1);
    } else {
      setPlacarAdversario((current) => current + 1);
    }
    const kickoff = chooseKickoffCarrier(concedingSide);
    setTimeComPosse(concedingSide);
    setPortadorId(kickoff?.id ?? null);
    setZonaAtual('MC');
    avancarMinuto([
      { text: 'GOOOOL! ' },
      { text: atacanteNome, side: attackingSide },
      { text: ' venceu ' },
      { text: goleiroNome, side: concedingSide },
      { text: ' e marcou.' },
    ]);
  };

  const resolverAcao = (side: MatchTeam, action: MatchAction, passeDestinoId?: string) => {
    if (!team || !opponentTeam || !partidaIniciada || partidaFinalizada) return;

    const attacker = getCurrentCarrier(side) ?? chooseBallCarrier(side, zonaAtual);
    if (!attacker) return;

    const defendingSide: MatchTeam = side === 'protagonista' ? 'adversario' : 'protagonista';
    const finalZone = zoneForSide(side, zonaAtual) === 'DF2';
    const chuteSemBloqueio = action === 'chute' && chuteLivrePara === side && finalZone;
    const defender = chuteSemBloqueio ? null : escolherDefensor(defendingSide, zonaAtual, action);
    const attackerAttrs = attacker.atributos ?? fallbackAttributes();
    const defenderAttrs = defender?.atributos ?? fallbackAttributes();
    const energiaAtacante = getEnergy(energiaPorJogador, attacker.id);
    const energiaDefensor = getEnergy(energiaPorJogador, defender?.id);

    if (action === 'chute' && !canShoot(side, zonaAtual)) {
      avancarMinuto([
        { text: 'O chute de ' },
        { text: attacker.nome, side },
        { text: ' não saiu por estar fora da zona de finalização.' },
      ]);
      return;
    }

    const isLongShot =
      action === 'chute' &&
      ((side === 'protagonista' && zonaAtual === 'MI2') || (side === 'adversario' && zonaAtual === 'MI1'));
    const adjustedAttackerAttrs: PlayerAttributes = isLongShot
      ? { ...attackerAttrs, potencia: 0 }
      : attackerAttrs;

    const confronto = chuteSemBloqueio
      ? { vencedor: 'atacante' as const }
      : executarConfronto(action, adjustedAttackerAttrs, defenderAttrs, energiaAtacante, energiaDefensor);
    setEnergiaPorJogador((current) => spendEnergy(current, [attacker.id, chuteSemBloqueio ? null : defender?.id]));

    if (confronto.vencedor === 'defensor') {
      const newCarrier = chooseRecoveredCarrier(defendingSide, defender);
      setTimeComPosse(defendingSide);
      setPortadorId(newCarrier?.id ?? defender?.id ?? null);
      setChuteLivrePara(null);

      if (action === 'chute') {
        avancarMinuto([
          { text: defender?.nome ?? 'defensor', side: defendingSide },
          { text: ' bloqueou o chute de ' },
          { text: attacker.nome, side },
          { text: '.' },
        ]);
      } else if (action === 'drible') {
        avancarMinuto([
          { text: 'O drible de ' },
          { text: attacker.nome, side },
          { text: ' foi desarmado por ' },
          { text: defender?.nome ?? 'defensor', side: defendingSide },
          { text: '!' },
        ]);
      } else {
        avancarMinuto([
          { text: 'O passe de ' },
          { text: attacker.nome, side },
          { text: ' foi interceptado por ' },
          { text: defender?.nome ?? 'defensor', side: defendingSide },
          { text: '!' },
        ]);
      }
      return;
    }

    if (action === 'drible') {
      setZonaAtual((current) => advanceZone(side, current));
      setTimeComPosse(side);
      setPortadorId(attacker.id);
      setChuteLivrePara(finalZone ? side : null);
      avancarMinuto([
        { text: attacker.nome, side },
        { text: ' driblou ' },
        { text: defender?.nome ?? 'o marcador', side: defendingSide },
        { text: '!' },
      ]);
      return;
    }

    if (action === 'passe') {
      const receiver = choosePassReceiver(
        side,
        zonaAtual,
        attacker.id,
        side === 'protagonista' ? passeDestinoId : undefined,
      );

      setZonaAtual((current) => advanceZone(side, current));
      setTimeComPosse(side);
      setPortadorId(receiver?.id ?? attacker.id);
      setChuteLivrePara(finalZone ? side : null);
      avancarMinuto([
        { text: attacker.nome, side },
        { text: ' passou a bola para ' },
        { text: receiver?.nome ?? 'companheiro', side },
        { text: ' com sucesso!' },
      ]);
      return;
    }

    const goalkeeper =
      (defendingSide === 'protagonista' ? protagonistasTitulares : adversariosTitulares).find(
        (player) => player.posicao === 'GK',
      ) ?? null;
    const goleiroNome = goalkeeper?.nome ?? 'goleiro';

    const dueloGoleiro = executarConfrontoGoleiro(
      'chute',
      adjustedAttackerAttrs,
      goalkeeper?.atributos ?? fallbackAttributes(),
      energiaAtacante,
      getEnergy(energiaPorJogador, goalkeeper?.id),
    );
    setEnergiaPorJogador((current) => spendEnergy(current, [goalkeeper?.id]));

    if (dueloGoleiro.vencedor === 'atacante') {
      setChuteLivrePara(null);
      resolveGoal(side, attacker.nome, goleiroNome);
      return;
    }

    if (dueloGoleiro.acaoGoleiro === 'espalme') {
      const reboundWinner: MatchTeam = Math.random() < 0.5 ? 'protagonista' : 'adversario';
      const reboundZone: ZonaCampo = defendingSide === 'protagonista' ? 'DF1' : 'DF2';
      const newCarrier = chooseBallCarrier(reboundWinner, reboundZone);
      setTimeComPosse(reboundWinner);
      setPortadorId(newCarrier?.id ?? null);
      setZonaAtual(reboundZone);
      setChuteLivrePara(null);
      avancarMinuto([
        { text: 'Defesa de espalme de ' },
        { text: goleiroNome, side: defendingSide },
        { text: '! A sobra ficou na área.' },
      ]);
      return;
    }

    const newCarrier = chooseBallCarrier(defendingSide, 'MC', { preferredPositions: ['MF', 'FW', 'DF'] });
    setTimeComPosse(defendingSide);
    setPortadorId(newCarrier?.id ?? null);
    setZonaAtual('MC');
    setChuteLivrePara(null);
    avancarMinuto([
      { text: 'Captura segura de ' },
      { text: goleiroNome, side: defendingSide },
      { text: '. Reposição para o meio-campo.' },
    ]);
  };

  useEffect(() => {
    if (!team || !opponentTeam || !partidaIniciada || partidaFinalizada || aguardandoPasse) return;
    if (!pulandoParaResultado && protagonistaTemBola) return;

    const timeout = window.setTimeout(() => {
      const side = timeComPosse;
      const atacante = getCurrentCarrier(side) ?? chooseBallCarrier(side, zonaAtual);
      if (!atacante) return;

      const contextZone = zoneForSide(side, zonaAtual);
      const [placarNPC, placarOponente] =
        side === 'protagonista'
          ? [placarProtagonista, placarAdversario]
          : [placarAdversario, placarProtagonista];

      const acaoIA = decidirAcaoNPC(
        {
          zona: contextZone,
          energia: getEnergy(energiaPorJogador, atacante.id),
          placarNPC,
          placarOponente,
          minuto: minutoAtual,
          periodo: minutoAtual < fimPrimeiroTempo ? 'primeiro_tempo' : 'segundo_tempo',
        },
        atacante.atributos ?? fallbackAttributes(),
      );

      setPortadorId(atacante.id);
      resolverAcao(side, acaoIA);
    }, pulandoParaResultado ? SKIP_DELAY_MS : ACTION_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [
    aguardandoPasse,
    energiaPorJogador,
    fimPrimeiroTempo,
    minutoAtual,
    opponentTeam,
    partidaFinalizada,
    partidaIniciada,
    placarAdversario,
    placarProtagonista,
    protagonistaTemBola,
    pulandoParaResultado,
    team,
    timeComPosse,
    zonaAtual,
  ]);

  useEffect(() => {
    if (!partidaIniciada && aguardandoPasse) {
      setAguardandoPasse(false);
      return;
    }
    if (!protagonistaTemBola && aguardandoPasse) {
      setAguardandoPasse(false);
    }
  }, [aguardandoPasse, partidaIniciada, protagonistaTemBola]);

  useEffect(() => {
    if (partidaFinalizada) {
      setPulandoParaResultado(false);
    }
  }, [partidaFinalizada]);

  const iniciarPartida = () => {
    if (!team || !opponentTeam || !nextMatch) return;
    const kickoffSide: MatchTeam = nextMatch.isHome ? 'protagonista' : 'adversario';
    const kickoff = chooseKickoffCarrier(kickoffSide);
    setEmCampoProtagonistaIds(protagonistas.filter((player) => player.titular).map((player) => player.id));
    setEmCampoAdversarioIds(adversarios.filter((player) => player.titular).map((player) => player.id));
    setSubstituicoesAutomaticas({ protagonista: 0, adversario: 0 });
    setChuteLivrePara(null);
    setEnergiaPorJogador(createEnergyMap([...protagonistas, ...adversarios]));
    setTimeComPosse(kickoffSide);
    setPortadorId(kickoff?.id ?? null);
    setPartidaIniciada(true);
    appendLog([
      { text: 'Pontapé inicial com ' },
      { text: kickoff?.nome ?? (kickoffSide === 'protagonista' ? team.nome : opponentTeam.nome), side: kickoffSide },
      { text: '.' },
    ]);
  };

  const confirmarPasse = (targetId: string) => {
    setAguardandoPasse(false);
    resolverAcao('protagonista', 'passe', targetId);
  };

  const handleConcluirRodada = () => {
    setConcluindoRodada(true);
    const updated = finalizeCareerRound(slot, placarProtagonista, placarAdversario);
    if (!updated) return;
    setSave(updated);
    router.push(`/carreira?slot=${slot}`);
  };

  const handlePularParaResultado = () => {
    if (!partidaIniciada || partidaFinalizada) return;
    setAguardandoPasse(false);
    setPulandoParaResultado(true);
    appendLog([{ text: 'Simulação acelerada ativada. Indo para o resultado...' }]);
  };

  const nomeTimePosse = timeComPosse === 'protagonista' ? team?.nome : opponentTeam?.nome;
  const jogadorComBola =
    (timeComPosse === 'protagonista' ? protagonistasTitulares : adversariosTitulares).find(
      (player) => player.id === portadorId,
    ) ?? null;
  const estaminaProtagonista = getEnergy(energiaPorJogador, protagonista?.id);
  const estaminaPortador = getEnergy(energiaPorJogador, jogadorComBola?.id);

  const renderEscalacaoCard = (side: MatchTeam, title: string, players: TeamSquadPlayer[]) => (
    <article className="rounded-xl border border-border p-4">
      <h3 className="text-base font-semibold" style={{ color: corDoTime(side) }}>{title}</h3>
      <div className="mt-3 space-y-2 text-sm">
        {[...players]
          .sort((a, b) => {
            const byPosition = POSICAO_ORDEM[a.posicao] - POSICAO_ORDEM[b.posicao];
            if (byPosition !== 0) return byPosition;
            return a.numero - b.numero;
          })
          .map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-md border border-border px-2 py-1"
            >
              <div className="min-w-0">
                <p className="truncate font-medium" style={{ color: corDoTime(side) }}>
                  #{player.numero} {player.nome}
                </p>
                <p className="text-xs text-muted-foreground">{player.posicao}</p>
              </div>
              <p className="text-xs text-muted-foreground">STA {getEnergy(energiaPorJogador, player.id)}/10</p>
            </div>
          ))}
      </div>
    </article>
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-semibold">Partida</h1>
      {save && (
        <p className="text-sm text-muted-foreground">
          Slot {slot} • {save.protagonista.nome} • Temporada {save.temporadaAtual}
        </p>
      )}

      {team && nextMatch && opponentTeam ? (
        <>
          {!partidaIniciada ? (
            <section className="rounded-xl border border-border p-4">
              <h2 className="text-lg font-semibold">Preparação da Partida</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Rodada {nextMatch.rodada}: {nextMatch.isHome ? `${team.nome} vs ${opponentTeam.nome}` : `${opponentTeam.nome} vs ${team.nome}`}
              </p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span>Uniforme {team.nome}</span>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-2"
                    value={uniformeProtagonista}
                    onChange={(event) => setUniformeProtagonista(event.target.value as UniformeEscolha)}
                  >
                    <option value="primario">Primário ({team.corPrimaria})</option>
                    <option value="secundario">Secundário ({team.corSecundaria})</option>
                  </select>
                </label>
                <label className="space-y-1 text-sm">
                  <span>Uniforme {opponentTeam.nome}</span>
                  <select
                    className="h-9 w-full rounded-md border border-input bg-background px-2"
                    value={uniformeAdversario}
                    onChange={(event) => setUniformeAdversario(event.target.value as UniformeEscolha)}
                  >
                    <option value="primario">Primário ({opponentTeam.corPrimaria})</option>
                    <option value="secundario">Secundário ({opponentTeam.corSecundaria})</option>
                  </select>
                </label>
              </div>
              <Button className="mt-4" onClick={iniciarPartida}>
                Iniciar Partida
              </Button>
            </section>
          ) : (
            <section className="rounded-xl border border-border p-4">
              <h2 className="text-lg font-semibold">Rodada {nextMatch.rodada}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {nextMatch.isHome ? `${team.nome} vs ${opponentTeam.nome}` : `${opponentTeam.nome} vs ${team.nome}`}
              </p>
              <p className="mt-3 text-base font-semibold">
                {team.nome} {placarProtagonista} x {placarAdversario} {opponentTeam.nome}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Min {Math.min(minutoAtual, tempoTotal)}/{tempoTotal} • Zona {zonaAtual} • Posse {nomeTimePosse}
                {jogadorComBola ? ` (${jogadorComBola.nome})` : ''}
              </p>
              {!protagonistaParticipando ? (
                <p className="mt-1 text-xs text-amber-300">
                  Protagonista está fora desta partida. O jogo está sendo simulado pelo log.
                </p>
              ) : null}
              <p className="mt-1 text-sm text-muted-foreground">
                Estamina: {protagonista?.nome ?? 'Protagonista'} {estaminaProtagonista}/10
                {jogadorComBola ? ` • ${jogadorComBola.nome} ${estaminaPortador}/10` : ''}
              </p>

              <div className="mt-4 grid grid-cols-5 gap-2 text-center text-xs">
                {ZONAS.map((zona) => (
                  <div
                    key={zona}
                    className={`rounded-md border px-2 py-3 ${zona === zonaAtual ? 'border-emerald-400 bg-emerald-500/20' : 'border-border'}`}
                  >
                    {zona}
                  </div>
                ))}
              </div>

              {!partidaFinalizada && protagonistaTemBola && !aguardandoPasse ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={() => resolverAcao('protagonista', 'chute')} disabled={!canShoot('protagonista', zonaAtual)}>
                    Chute
                  </Button>
                  <Button onClick={() => resolverAcao('protagonista', 'drible')} variant="outline">
                    Drible
                  </Button>
                  <Button onClick={() => setAguardandoPasse(true)} variant="outline">
                    Passe
                  </Button>
                </div>
              ) : null}

              {!partidaFinalizada ? (
                <div className="mt-4">
                  <Button variant="secondary" onClick={handlePularParaResultado} disabled={pulandoParaResultado}>
                    {pulandoParaResultado ? 'Pulando para resultado...' : 'Pular para resultado'}
                  </Button>
                </div>
              ) : null}

              {!partidaFinalizada && aguardandoPasse ? (
                <div className="mt-4 rounded-lg border border-border p-3">
                  <p className="mb-2 text-sm font-medium">Escolha um companheiro para o passe</p>
                  <div className="flex flex-wrap gap-2">
                    {protagonistasTitulares
                      .filter((player) => !player.isProtagonista)
                      .map((player) => (
                        <Button key={player.id} size="sm" variant="outline" onClick={() => confirmarPasse(player.id)}>
                          #{player.numero} {player.nome}
                        </Button>
                      ))}
                    <Button size="sm" variant="secondary" onClick={() => setAguardandoPasse(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : null}

              {partidaFinalizada ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <p className="text-sm font-medium">Fim de jogo.</p>
                  <Button onClick={handleConcluirRodada} disabled={concluindoRodada}>
                    Concluir rodada e simular os demais jogos
                  </Button>
                </div>
              ) : null}

              <div className="mt-4 space-y-1 text-xs">
                {log.map((entry) => (
                  <p key={entry.id} className="text-muted-foreground">
                    {entry.parts.map((part, index) => (
                      <span
                        key={`${entry.id}-${index}`}
                        style={part.side ? { color: corDoTime(part.side), fontWeight: 600 } : undefined}
                      >
                        {part.text}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            </section>
          )}

          <section className="grid gap-4 md:grid-cols-2">
            {renderEscalacaoCard('protagonista', `Escalação ${team.nome}`, protagonistasTitulares)}
            {renderEscalacaoCard('adversario', `Escalação ${opponentTeam.nome}`, adversariosTitulares)}
          </section>
        </>
      ) : (
        <section className="rounded-xl border border-border p-4 text-sm text-muted-foreground">
          Temporada encerrada ou sem partida disponível no momento.
        </section>
      )}
    </main>
  );
}
