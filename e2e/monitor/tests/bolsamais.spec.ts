import { test, expect } from '@playwright/test'

const BASE = 'https://www.bolsamais.com.br'
const BUSCA = `${BASE}/curso/resultado?c=administracao&cidade=S%C3%A3o%20Paulo&estado=SP&nivel=GRADUACAO`

test.describe('bolsamais.com.br', () => {
  test('home responde e renderiza', async ({ page }) => {
    const response = await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBeLessThan(400)
    await expect(page.locator('body')).toContainText(/bolsa/i)
  })

  test('busca de curso retorna ofertas com preço', async ({ page }) => {
    await page.goto(BUSCA, { waitUntil: 'domcontentloaded' })
    const cards = page.locator('article')
    await expect(cards.first()).toBeVisible({ timeout: 30_000 })
    await expect(page.locator('body')).toContainText(/R\$\s?\d/)
  })
})
