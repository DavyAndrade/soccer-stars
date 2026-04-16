import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AtributosDistributor } from '@/components/jogador/atributos-distributor';
import type { PlayerAttributes } from '@/types/player';

describe('AtributosDistributor', () => {
  const atributosIniciais: PlayerAttributes = {
    potencia: 1,
    rapidez: 1,
    tecnica: 1,
  };

  it('deve renderizar os 3 atributos com controles', () => {
    const onChange = vi.fn();
    render(<AtributosDistributor value={atributosIniciais} onChange={onChange} />);

    expect(screen.getByText(/potência/i)).toBeInTheDocument();
    expect(screen.getByText(/rapidez/i)).toBeInTheDocument();
    expect(screen.getByText(/técnica/i)).toBeInTheDocument();

    // Deve ter 6 botões (2 por atributo: + e -)
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6);
  });

  it('deve mostrar pontos livres restantes', () => {
    const onChange = vi.fn();
    render(<AtributosDistributor value={atributosIniciais} onChange={onChange} />);

    // 3 pontos obrigatórios já usados, 6 livres restantes
    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText(/pontos restantes/i)).toBeInTheDocument();
  });

  it('deve incrementar atributo ao clicar em +', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AtributosDistributor value={atributosIniciais} onChange={onChange} />);

    const potenciaPlus = screen.getAllByRole('button', { name: /incrementar/i })[0];
    await user.click(potenciaPlus);

    expect(onChange).toHaveBeenCalledWith({
      potencia: 2,
      rapidez: 1,
      tecnica: 1,
    });
  });

  it('deve decrementar atributo ao clicar em -', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const atributos: PlayerAttributes = { potencia: 3, rapidez: 1, tecnica: 1 };
    render(<AtributosDistributor value={atributos} onChange={onChange} />);

    const potenciaMinus = screen.getAllByRole('button', { name: /decrementar/i })[0];
    await user.click(potenciaMinus);

    expect(onChange).toHaveBeenCalledWith({
      potencia: 2,
      rapidez: 1,
      tecnica: 1,
    });
  });

  it('não deve decrementar abaixo de 1', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<AtributosDistributor value={atributosIniciais} onChange={onChange} />);

    const potenciaMinus = screen.getAllByRole('button', { name: /decrementar/i })[0];
    await user.click(potenciaMinus);

    // Não deve chamar onChange
    expect(onChange).not.toHaveBeenCalled();
  });

  it('não deve incrementar acima de 5', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const atributos: PlayerAttributes = { potencia: 5, rapidez: 2, tecnica: 2 };
    render(<AtributosDistributor value={atributos} onChange={onChange} />);

    const potenciaPlus = screen.getAllByRole('button', { name: /incrementar/i })[0];
    await user.click(potenciaPlus);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('não deve incrementar se pontos livres esgotados', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    // 5 + 2 + 2 = 9 pontos (todos usados)
    const atributos: PlayerAttributes = { potencia: 5, rapidez: 2, tecnica: 2 };
    render(<AtributosDistributor value={atributos} onChange={onChange} />);

    const rapidezPlus = screen.getAllByRole('button', { name: /incrementar/i })[1];
    await user.click(rapidezPlus);

    expect(onChange).not.toHaveBeenCalled();
  });

  it('deve mostrar zero pontos quando todos distribuídos', () => {
    const onChange = vi.fn();
    const atributos: PlayerAttributes = { potencia: 5, rapidez: 2, tecnica: 2 };
    render(<AtributosDistributor value={atributos} onChange={onChange} />);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(/pontos restantes/i)).toBeInTheDocument();
  });

  it('deve desabilitar botão - quando no mínimo (1)', () => {
    const onChange = vi.fn();
    render(<AtributosDistributor value={atributosIniciais} onChange={onChange} />);

    const minusButtons = screen.getAllByRole('button', { name: /decrementar/i });
    minusButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('deve desabilitar botão + quando no máximo (5) ou sem pontos', () => {
    const onChange = vi.fn();
    const atributos: PlayerAttributes = { potencia: 5, rapidez: 2, tecnica: 2 };
    render(<AtributosDistributor value={atributos} onChange={onChange} />);

    const potenciaPlus = screen.getAllByRole('button', { name: /incrementar/i })[0];
    expect(potenciaPlus).toBeDisabled();
  });
});
