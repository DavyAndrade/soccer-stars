'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface NomeInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function NomeInput({ value, onChange, error }: NomeInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="nome">Nome do Jogador</Label>
      <Input
        id="nome"
        name="nome"
        type="text"
        placeholder="Digite seu nome"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="name"
        aria-invalid={!!error}
        aria-describedby={error ? 'nome-error' : undefined}
      />
      {error && (
        <p id="nome-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
