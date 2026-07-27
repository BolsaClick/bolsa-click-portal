import { defineConfig, devices } from '@playwright/test'

// Monitor sintético de PRODUÇÃO — roda contra os sites no ar, não contra
// build local. Falhou = algo quebrou pro usuário real (ou o seletor
// envelheceu; ajustar aqui é barato, descobrir por queda de conversão é caro).
export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: 2,
  workers: 3,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    // Mobile é 72% do tráfego de checkout, mas o smoke roda em desktop pela
    // estabilidade; cobertura mobile entra depois se o desktop se provar.
  },
})
