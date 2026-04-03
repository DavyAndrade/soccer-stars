import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração Playwright para Soccer Stars
 * Testes E2E mobile-first
 */
export default defineConfig({
  testDir: './e2e',
  
  // Timeout global
  timeout: 30 * 1000,
  
  // Expect timeout
  expect: {
    timeout: 5000,
  },
  
  // Executar testes em paralelo
  fullyParallel: true,
  
  // Falhar build no CI se houver testes esquecidos (.only)
  forbidOnly: !!process.env.CI,
  
  // Retry on CI
  retries: process.env.CI ? 2 : 0,
  
  // Workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: 'html',
  
  // Configuração compartilhada
  use: {
    // Base URL
    baseURL: 'http://localhost:3000',
    
    // Trace on first retry
    trace: 'on-first-retry',
    
    // Screenshots apenas em falhas
    screenshot: 'only-on-failure',
    
    // Vídeos em falhas
    video: 'retain-on-failure',
  },

  // Projetos para diferentes devices
  projects: [
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
      },
    },
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // Dev server
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
