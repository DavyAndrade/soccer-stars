import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlayerPreview } from '@/components/jogador/player-preview';

describe('PlayerPreview', () => {
  it('deve exibir dados principais do jogador', () => {
    render(
      <PlayerPreview
        nome="Davy"
        posicao="MF"
        atributos={{ potencia: 3, rapidez: 4, tecnica: 2 }}
      />
    );

    expect(screen.getByText(/preview do jogador/i)).toBeInTheDocument();
    expect(screen.getByText(/davy/i)).toBeInTheDocument();
    expect(screen.getByText(/meio-campo/i)).toBeInTheDocument();
  });

  it('deve exibir placeholders quando não houver nome', () => {
    render(
      <PlayerPreview
        nome=""
        posicao="FW"
        atributos={{ potencia: 1, rapidez: 1, tecnica: 1 }}
      />
    );

    expect(screen.getByText(/seu nome aqui/i)).toBeInTheDocument();
    expect(screen.getByText(/sem imagem/i)).toBeInTheDocument();
  });

  it('deve exibir atributos e total corretamente', () => {
    render(
      <PlayerPreview
        nome="Kai"
        posicao="GK"
        atributos={{ potencia: 5, rapidez: 2, tecnica: 2 }}
      />
    );

    expect(screen.getByText((_, el) => el?.textContent === 'Potência: 5')).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.textContent === 'Rapidez: 2')).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.textContent === 'Técnica: 2')).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.textContent === 'Total: 9/9')).toBeInTheDocument();
  });

  it('deve renderizar preview de imagem quando avatar for informado', () => {
    render(
      <PlayerPreview
        nome="Aoi"
        posicao="FW"
        atributos={{ potencia: 3, rapidez: 3, tecnica: 3 }}
        avatar="data:image/png;base64,ZmFrZS1pbWFnZQ=="
      />
    );

    expect(screen.getByAltText(/preview da aparência do jogador/i)).toBeInTheDocument();
  });
});
