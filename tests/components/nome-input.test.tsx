import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NomeInput } from '@/components/jogador/nome-input';

describe('NomeInput', () => {
  it('deve renderizar input com label', () => {
    const onChange = vi.fn();
    render(<NomeInput value="" onChange={onChange} />);

    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('deve mostrar valor atual', () => {
    const onChange = vi.fn();
    render(<NomeInput value="João Silva" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('João Silva');
  });

  it('deve chamar onChange ao digitar', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<NomeInput value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'A');

    expect(onChange).toHaveBeenCalledWith('A');
  });

  it('deve mostrar erro quando nome for muito curto', () => {
    const onChange = vi.fn();
    render(<NomeInput value="A" onChange={onChange} error="Nome deve ter pelo menos 2 caracteres" />);

    expect(screen.getByText(/nome deve ter pelo menos 2 caracteres/i)).toBeInTheDocument();
  });

  it('não deve mostrar erro quando válido', () => {
    const onChange = vi.fn();
    render(<NomeInput value="João" onChange={onChange} />);

    expect(screen.queryByText(/erro/i)).not.toBeInTheDocument();
  });

  it('deve ter placeholder adequado', () => {
    const onChange = vi.fn();
    render(<NomeInput value="" onChange={onChange} />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder');
  });
});
