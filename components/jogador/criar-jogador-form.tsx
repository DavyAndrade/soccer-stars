'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreatePlayerSchema, type CreatePlayerInput } from '@/schemas/player-schema';
import { NomeInput } from '@/components/jogador/nome-input';
import { PosicaoSelector } from '@/components/jogador/posicao-selector';
import { AtributosDistributor } from '@/components/jogador/atributos-distributor';
import { PlayerPreview } from '@/components/jogador/player-preview';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getInitialTeams } from '@/data/teams';

interface CriarJogadorFormProps {
  onSubmit: (data: CreatePlayerInput) => void | Promise<void>;
  initialData?: CreatePlayerInput;
  submitLabel?: string;
  editOnlyProfile?: boolean;
}

export function CriarJogadorForm({
  onSubmit,
  initialData,
  submitLabel = 'Criar Jogador',
  editOnlyProfile = false,
}: CriarJogadorFormProps) {
  const teams = useMemo(() => getInitialTeams(), []);
  const defaultTeam = teams[0];
  const defaultNumeroCamisa = defaultTeam?.numerosDisponiveis[0] ?? 30;
  const initialTeam = initialData ? teams.find((team) => team.id === initialData.timeId) : undefined;

  const {
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<CreatePlayerInput>({
    resolver: zodResolver(CreatePlayerSchema),
    mode: 'onChange',
    defaultValues: {
      nome: initialData?.nome ?? '',
      posicao: initialData?.posicao ?? 'MF',
      timeId: initialData?.timeId ?? defaultTeam?.id ?? '',
      numeroCamisa: initialData?.numeroCamisa ?? initialTeam?.numerosDisponiveis[0] ?? defaultNumeroCamisa,
      nacionalidade: initialData?.nacionalidade ?? 'Japão',
      idade: initialData?.idade ?? 15,
      avatar: initialData?.avatar,
      atributos: initialData?.atributos ?? {
        potencia: 1,
        rapidez: 1,
        tecnica: 1,
      },
    },
  });

  const nome = watch('nome');
  const posicao = watch('posicao');
  const timeId = watch('timeId');
  const numeroCamisa = watch('numeroCamisa');
  const nacionalidade = watch('nacionalidade');
  const idade = watch('idade');
  const atributos = watch('atributos');
  const avatar = watch('avatar');

  const teamSelecionado = useMemo(
    () => teams.find((team) => team.id === timeId) ?? defaultTeam,
    [defaultTeam, teams, timeId]
  );

  const numerosDisponiveis = useMemo(() => {
    const base = teamSelecionado?.numerosDisponiveis ?? [];
    if (numeroCamisa && !base.includes(numeroCamisa)) {
      return [...base, numeroCamisa].sort((a, b) => a - b);
    }
    return base;
  }, [numeroCamisa, teamSelecionado]);

  const submitDisabled = useMemo(() => !isValid || isSubmitting, [isSubmitting, isValid]);

  const onAvatarChange = async (file: File | null) => {
    if (!file) {
      setValue('avatar', undefined, { shouldValidate: true, shouldDirty: true });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setValue('avatar', String(reader.result), { shouldValidate: true, shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle>Criar Jogador</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(async (data) => onSubmit(data))}>
          <NomeInput
            value={nome}
            onChange={(value) => setValue('nome', value, { shouldValidate: true, shouldDirty: true })}
            error={errors.nome?.message}
          />

          {editOnlyProfile ? (
            <div className="space-y-2">
              <Label>Posição</Label>
              <p className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">{posicao}</p>
            </div>
          ) : (
            <PosicaoSelector
              value={posicao}
              onChange={(value) => setValue('posicao', value, { shouldValidate: true, shouldDirty: true })}
            />
          )}

          {editOnlyProfile ? (
            <div className="space-y-2">
              <Label>Time</Label>
              <p className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">
                {teamSelecionado ? `[${teamSelecionado.conferencia}] ${teamSelecionado.nome}` : timeId}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <select
                id="time"
                className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                value={timeId}
                onChange={(e) => {
                  const nextTeamId = e.target.value;
                  const nextTeam = teams.find((team) => team.id === nextTeamId);
                  const nextNumero = nextTeam?.numerosDisponiveis[0] ?? 30;
                  setValue('timeId', nextTeamId, { shouldValidate: true, shouldDirty: true });
                  setValue('numeroCamisa', nextNumero, { shouldValidate: true, shouldDirty: true });
                }}
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    [{team.conferencia}] {team.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="nacionalidade">Nacionalidade</Label>
              {editOnlyProfile ? (
                <p className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">{nacionalidade}</p>
              ) : (
                <Input
                  id="nacionalidade"
                  value={nacionalidade}
                  onChange={(e) =>
                    setValue('nacionalidade', e.target.value, { shouldValidate: true, shouldDirty: true })
                  }
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="idade">Idade</Label>
              {editOnlyProfile ? (
                <p className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">{idade}</p>
              ) : (
                <Input
                  id="idade"
                  type="number"
                  min={15}
                  max={18}
                  value={idade}
                  onChange={(e) =>
                    setValue('idade', Number(e.target.value), { shouldValidate: true, shouldDirty: true })
                  }
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="numero-camisa">Número</Label>
              {editOnlyProfile ? (
                <p className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">{numeroCamisa}</p>
              ) : (
                <select
                  id="numero-camisa"
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  value={numeroCamisa}
                  onChange={(e) =>
                    setValue('numeroCamisa', Number(e.target.value), { shouldValidate: true, shouldDirty: true })
                  }
                >
                  {numerosDisponiveis.map((numero) => (
                    <option key={numero} value={numero}>
                      {numero}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatar">Imagem do jogador</Label>
            <Input
              id="avatar"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
              onChange={(e) => void onAvatarChange(e.target.files?.[0] ?? null)}
            />
            {errors.avatar?.message && <p className="text-sm text-destructive">{errors.avatar.message}</p>}
          </div>

          {editOnlyProfile ? (
            <div className="space-y-2">
              <Label>Atributos</Label>
              <p className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">
                Potência {atributos.potencia} • Rapidez {atributos.rapidez} • Técnica {atributos.tecnica}
              </p>
            </div>
          ) : (
            <AtributosDistributor
              value={atributos}
              onChange={(value) => setValue('atributos', value, { shouldValidate: true, shouldDirty: true })}
            />
          )}

          <PlayerPreview nome={nome} posicao={posicao} atributos={atributos} avatar={avatar} />

          <Button className="w-full min-h-11" type="submit" disabled={submitDisabled}>
            {submitLabel}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
