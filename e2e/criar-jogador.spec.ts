import { test, expect } from '@playwright/test';

test.describe('Criação de Jogador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/criar-jogador?slot=1');
  });

  test('deve exibir os elementos principais do formulário', async ({ page }) => {
    await expect(page.getByText('Criar Jogador').first()).toBeVisible();
    await expect(page.getByLabel('Nome do Jogador')).toBeVisible();
    await expect(page.getByText('Posição').first()).toBeVisible();
    await expect(page.getByText('Distribuir Atributos').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Criar Jogador' })).toBeDisabled();
  });

  test('deve criar jogador válido e navegar para /partida', async ({ page }) => {
    await page.getByLabel('Nome do Jogador').fill('Ashito Aoi');
    await page.getByText('Atacante').first().click();

    await page.getByRole('button', { name: 'Incrementar Potência' }).click();
    await page.getByRole('button', { name: 'Incrementar Potência' }).click();
    await page.getByRole('button', { name: 'Incrementar Rapidez' }).click();
    await page.getByRole('button', { name: 'Incrementar Rapidez' }).click();
    await page.getByRole('button', { name: 'Incrementar Técnica' }).click();
    await page.getByRole('button', { name: 'Incrementar Técnica' }).click();

    await expect(page.getByRole('button', { name: 'Criar Jogador' })).toBeEnabled();
    await page.getByRole('button', { name: 'Criar Jogador' }).click();

    await expect(page).toHaveURL(/\/partida\?slot=1$/);
    await expect(page.getByRole('heading', { name: 'Partida' })).toBeVisible();
  });
});
