'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PlayerAttributes, PlayerPosition } from '@/types/player';

interface PlayerPreviewProps {
  nome: string;
  posicao: PlayerPosition;
  atributos: PlayerAttributes;
}

const POSICAO_LABEL: Record<PlayerPosition, string> = {
  GK: 'Goleiro',
  DF: 'Zagueiro',
  MF: 'Meio-Campo',
  FW: 'Atacante',
};

export function PlayerPreview({ nome, posicao, atributos }: PlayerPreviewProps) {
  const total = atributos.potencia + atributos.rapidez + atributos.tecnica;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview do Jogador</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
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
