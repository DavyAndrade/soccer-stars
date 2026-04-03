import { test, expect } from '@playwright/test';

/**
 * Testes E2E: Partida (exemplo básico)
 * Nota: Esses testes serão expandidos quando a partida estiver implementada
 */
test.describe('Partida', () => {
  test.beforeEach(async ({ page }) => {
    // Criar jogador primeiro (ou usar mock)
    await page.goto('/');
  });

  test.skip('deve iniciar partida no meio-campo', async ({ page }) => {
    await page.goto('/partida');

    // Verificar que iniciou no MC
    await expect(page.getByText('MC')).toBeVisible();
    await expect(page.getByText('Energia: 10')).toBeVisible();
  });

  test.skip('deve exibir ações quando jogador tem posse', async ({ page }) => {
    await page.goto('/partida');

    // Verificar botões de ação
    await expect(page.getByRole('button', { name: 'Chute' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Drible' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Passe' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Esperar' })).toBeVisible();
  });

  test.skip('deve consumir energia ao realizar ação', async ({ page }) => {
    await page.goto('/partida');

    await page.click('button:has-text("Drible")');

    // Energia deve diminuir de 10 para 9
    await expect(page.getByText('Energia: 9')).toBeVisible();
  });
});
