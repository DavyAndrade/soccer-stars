'use client';

import { Label } from '@/components/ui/label';
import type { PlayerPosition } from '@/types/player';

interface PosicaoSelectorProps {
  value: PlayerPosition;
  onChange: (posicao: PlayerPosition) => void;
}

const POSICOES = [
  { value: 'GK' as const, label: 'Goleiro (GK)', descricao: 'Última linha de defesa, protege o gol' },
  { value: 'DF' as const, label: 'Zagueiro (DF)', descricao: 'Defensor, marca e desarma adversários' },
  { value: 'MF' as const, label: 'Meio-Campo (MF)', descricao: 'Versátil, controla o jogo' },
  { value: 'FW' as const, label: 'Atacante (FW)', descricao: 'Finaliza jogadas e marca gols' },
];

export function PosicaoSelector({ value, onChange }: PosicaoSelectorProps) {
  const posicaoAtual = POSICOES.find(p => p.value === value);

  return (
    <div className="space-y-3">
      <Label>Posição</Label>
      <div className="grid grid-cols-2 gap-3">
        {POSICOES.map((posicao) => (
          <label
            key={posicao.value}
            className={`
              flex min-h-11 items-center space-x-2 rounded-lg border-2 p-3 cursor-pointer transition-colors
              ${value === posicao.value 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-primary/50'
              }
            `}
          >
            <input
              type="radio"
              name="posicao"
              value={posicao.value}
              checked={value === posicao.value}
              onChange={() => onChange(posicao.value)}
              className="sr-only"
              aria-label={posicao.label}
            />
            <div className="flex-1">
              <span className="font-medium block">{posicao.value}</span>
              <span className="text-xs text-muted-foreground">
                {posicao.label.replace(/\s*\(.*\)/, '')}
              </span>
            </div>
          </label>
        ))}
      </div>
      {posicaoAtual && (
        <p className="text-sm text-muted-foreground">
          {posicaoAtual.descricao}
        </p>
      )}
    </div>
  );
}
