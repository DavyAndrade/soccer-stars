'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PlayerAttributes, PlayerPosition } from '@/types/player';

interface PlayerPreviewProps {
  nome: string;
  posicao: PlayerPosition;
  atributos: PlayerAttributes;
  avatar?: string;
}

const POSICAO_LABEL: Record<PlayerPosition, string> = {
  GK: 'Goleiro',
  DF: 'Zagueiro',
  MF: 'Meio-Campo',
  FW: 'Atacante',
};

export function PlayerPreview({ nome, posicao, atributos, avatar }: PlayerPreviewProps) {
  const total = atributos.potencia + atributos.rapidez + atributos.tecnica;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview do Jogador</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="pb-2">
          {avatar ? (
            <img
              src={avatar}
              alt="Preview da aparência do jogador"
              className="h-20 w-20 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-dashed border-border text-xs text-muted-foreground">
              Sem imagem
            </div>
          )}
        </div>
        <p>
          <strong>Nome:</strong> {nome.trim() || 'Seu nome aqui'}
        </p>
        <p>
          <strong>Posição:</strong> {POSICAO_LABEL[posicao]}
        </p>
        <p>
          <strong>Potência:</strong> {atributos.potencia}
        </p>
        <p>
          <strong>Rapidez:</strong> {atributos.rapidez}
        </p>
        <p>
          <strong>Técnica:</strong> {atributos.tecnica}
        </p>
        <p>
          <strong>Total:</strong> {total}/9
        </p>
      </CardContent>
    </Card>
  );
}
