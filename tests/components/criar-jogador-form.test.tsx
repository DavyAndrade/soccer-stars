import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CriarJogadorForm } from '@/components/jogador/criar-jogador-form';

describe('CriarJogadorForm', () => {
  it('deve renderizar campos principais', () => {
    render(<CriarJogadorForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/nome do jogador/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^nacionalidade$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^idade$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^número$/i)).toBeInTheDocument();
    expect(screen.getByText('Posição')).toBeInTheDocument();
    expect(screen.getByText('Distribuir Atributos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar jogador/i })).toBeInTheDocument();
  });

  it('deve manter botão desabilitado com nome inválido', () => {
    render(<CriarJogadorForm onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: /criar jogador/i })).toBeDisabled();
  });

  it('deve continuar desabilitado com nome válido se faltarem pontos', async () => {
    const user = userEvent.setup();
    render(<CriarJogadorForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/nome do jogador/i), 'Davy');

    expect(screen.getByRole('button', { name: /criar jogador/i })).toBeDisabled();
  });

  it('deve habilitar envio quando formulário for totalmente válido', async () => {
    const user = userEvent.setup();
    render(<CriarJogadorForm onSubmit={vi.fn()} />);

    await user.type(screen.getByLabelText(/nome do jogador/i), 'Davy');
    await user.click(screen.getByRole('button', { name: /incrementar potência/i }));
    await user.click(screen.getByRole('button', { name: /incrementar potência/i }));
    await user.click(screen.getByRole('button', { name: /incrementar rapidez/i }));
    await user.click(screen.getByRole('button', { name: /incrementar rapidez/i }));
    await user.click(screen.getByRole('button', { name: /incrementar técnica/i }));
    await user.click(screen.getByRole('button', { name: /incrementar técnica/i }));

    expect(screen.getByRole('button', { name: /criar jogador/i })).toBeEnabled();
  });

  it('deve enviar dados válidos do formulário', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<CriarJogadorForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/nome do jogador/i), 'Davy');
    await user.click(screen.getByLabelText(/goleiro/i));
    await user.click(screen.getByRole('button', { name: /incrementar potência/i }));
    await user.click(screen.getByRole('button', { name: /incrementar potência/i }));
    await user.click(screen.getByRole('button', { name: /incrementar rapidez/i }));
    await user.click(screen.getByRole('button', { name: /incrementar rapidez/i }));
    await user.click(screen.getByRole('button', { name: /incrementar técnica/i }));
    await user.click(screen.getByRole('button', { name: /incrementar técnica/i }));

    await user.click(screen.getByRole('button', { name: /criar jogador/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: 'Davy',
        posicao: 'GK',
        idade: 15,
        nacionalidade: 'Japão',
        numeroCamisa: expect.any(Number),
        timeId: expect.any(String),
        atributos: {
          potencia: 3,
          rapidez: 3,
          tecnica: 3,
        },
      })
    );
  });
});
