import { test, expect } from '@playwright/test';

/**
 * Testes E2E: Criação de Jogador
 */
test.describe('Criação de Jogador', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/criar-jogador');
  });

  test('deve exibir formulário de criação', async ({ page }) => {
    // Verificar elementos do formulário
    await expect(page.locator('input[name="nome"]')).toBeVisible();
    await expect(page.getByText('Posição')).toBeVisible();
    await expect(page.getByText('Atributos')).toBeVisible();
  });

  test('deve criar jogador de campo com sucesso', async ({ page }) => {
    // Preencher nome
    await page.fill('input[name="nome"]', 'Ashito Aoi');

    // Selecionar posição
    await page.click('button[data-position="FW"]');

    // Distribuir atributos (exemplo: 5-5-5-1-1-1 = 18 total)
    await page.click('button[data-attr="chute"][data-action="increment"]', { clickCount: 4 });
    await page.click('button[data-attr="drible"][data-action="increment"]', { clickCount: 4 });
    await page.click('button[data-attr="passe"][data-action="increment"]', { clickCount: 4 });

    // Escolher time
    await page.click('button[data-team="0"]');

    // Submeter
    await page.click('button[type="submit"]');

    // Verificar redirecionamento para liga
    await expect(page).toHaveURL('/liga');
  });

  test('deve validar nome mínimo de 2 caracteres', async ({ page }) => {
    await page.fill('input[name="nome"]', 'A');
    await page.click('button[data-position="FW"]');

    await expect(page.getByText(/pelo menos 2 caracteres/i)).toBeVisible();
  });

  test('deve validar distribuição de atributos (18 pontos total)', async ({ page }) => {
    await page.fill('input[name="nome"]', 'Ashito Aoi');
    await page.click('button[data-position="FW"]');

    // Distribuir apenas 10 pontos (inválido)
    await page.click('button[data-attr="chute"][data-action="increment"]', { clickCount: 4 });

    await page.click('button[type="submit"]');

    await expect(page.getByText(/18 pontos/i)).toBeVisible();
  });

  test('deve permitir upload de avatar', async ({ page }) => {
    await page.fill('input[name="nome"]', 'Ashito Aoi');
    await page.click('button[data-position="FW"]');

    // Simular upload de arquivo
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'avatar.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data'),
    });

    // Verificar preview
    await expect(page.locator('img[alt="Preview do avatar"]')).toBeVisible();
  });

  test('deve criar goleiro com 6 pontos', async ({ page }) => {
    await page.fill('input[name="nome"]', 'Anri Teieri');
    await page.click('button[data-position="GK"]');

    // Distribuir 6 pontos entre Captura e Espalme
    await page.click('button[data-attr="captura"][data-action="increment"]', { clickCount: 3 });
    await page.click('button[data-attr="espalme"][data-action="increment"]', { clickCount: 1 });

    await page.click('button[data-team="0"]');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/liga');
  });
});
