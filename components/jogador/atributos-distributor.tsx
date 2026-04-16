'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { PlayerAttributes } from '@/types/player';
import { Minus, Plus } from 'lucide-react';

interface AtributosDistributorProps {
  value: PlayerAttributes;
  onChange: (atributos: PlayerAttributes) => void;
}

const MIN_ATRIBUTO = 1;
const MAX_ATRIBUTO = 5;
const TOTAL_PONTOS = 9;

const ATRIBUTOS_INFO = [
  { 
    key: 'potencia' as const, 
    label: 'Potência', 
    descricao: 'Chute e Bloqueio',
    icon: '⚡'
  },
  { 
    key: 'rapidez' as const, 
    label: 'Rapidez', 
    descricao: 'Drible e Desarme',
    icon: '🏃'
  },
  { 
    key: 'tecnica' as const, 
    label: 'Técnica', 
    descricao: 'Passe e Interceptação',
    icon: '⚽'
  },
];

export function AtributosDistributor({ value, onChange }: AtributosDistributorProps) {
  const pontosUsados = value.potencia + value.rapidez + value.tecnica;
  const pontosLivres = TOTAL_PONTOS - pontosUsados;

  const incrementar = (key: keyof PlayerAttributes) => {
    if (value[key] >= MAX_ATRIBUTO || pontosLivres <= 0) return;
    onChange({ ...value, [key]: value[key] + 1 });
  };

  const decrementar = (key: keyof PlayerAttributes) => {
    if (value[key] <= MIN_ATRIBUTO) return;
    onChange({ ...value, [key]: value[key] - 1 });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Distribuir Atributos</Label>
        <span className="text-sm font-medium" aria-live="polite">
          <span className={`${pontosLivres === 0 ? 'text-muted-foreground' : 'text-primary'}`}>
            {pontosLivres}
          </span>
          {' '}pontos restantes
        </span>
      </div>

      <div className="space-y-3">
        {ATRIBUTOS_INFO.map(({ key, label, descricao, icon }) => (
          <div key={key} className="flex items-center gap-3 rounded-lg border p-3">
            <span className="text-2xl">{icon}</span>
            <div className="flex-1">
              <div className="font-medium">{label}</div>
              <div className="text-xs text-muted-foreground">{descricao}</div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => decrementar(key)}
                disabled={value[key] <= MIN_ATRIBUTO}
                aria-label={`Decrementar ${label}`}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-bold text-lg">
                {value[key]}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-11 w-11"
                onClick={() => incrementar(key)}
                disabled={value[key] >= MAX_ATRIBUTO || pontosLivres <= 0}
                aria-label={`Incrementar ${label}`}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-xs text-muted-foreground">
        Mínimo: {MIN_ATRIBUTO} • Máximo: {MAX_ATRIBUTO} • Total: {TOTAL_PONTOS} pontos
      </div>
    </div>
  );
}
