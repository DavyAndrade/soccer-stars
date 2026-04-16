import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PosicaoSelector } from '@/components/jogador/posicao-selector';

describe('PosicaoSelector', () => {
  it('deve renderizar label e opções de posição', () => {
    const onChange = vi.fn();
    render(<PosicaoSelector value="MF" onChange={onChange} />);

    expect(screen.getByText(/posição/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/goleiro/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/zagueiro/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/meio-campo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/atacante/i)).toBeInTheDocument();
  });

  it('deve marcar posição selecionada', () => {
    const onChange = vi.fn();
    render(<PosicaoSelector value="FW" onChange={onChange} />);

    const atacante = screen.getByLabelText(/atacante/i);
    expect(atacante).toBeChecked();
  });

  it('deve chamar onChange ao selecionar nova posição', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<PosicaoSelector value="MF" onChange={onChange} />);

    const goleiro = screen.getByLabelText(/goleiro/i);
    await user.click(goleiro);

    expect(onChange).toHaveBeenCalledWith('GK');
  });

  it('deve exibir descrição da posição selecionada', () => {
    const onChange = vi.fn();
    render(<PosicaoSelector value="GK" onChange={onChange} />);

    // Goleiro tem descrição específica
    expect(screen.getByText(/última linha de defesa/i)).toBeInTheDocument();
  });

  it('deve permitir navegação por teclado entre opções', () => {
    const onChange = vi.fn();
    render(<PosicaoSelector value="MF" onChange={onChange} />);

    const radioButtons = screen.getAllByRole('radio');
    expect(radioButtons).toHaveLength(4);
    radioButtons.forEach(radio => {
      expect(radio).toHaveAttribute('name', 'posicao');
    });
  });
});
