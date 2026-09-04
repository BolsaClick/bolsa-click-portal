import { test, expect } from '@playwright/test'

const BASE = 'https://www.anhangueracursos.com.br'

test.describe('anhangueracursos.com.br', () => {
  test('home responde e renderiza a marca', async ({ page }) => {
    const response = await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBeLessThan(400)
    await expect(page.locator('body')).toContainText(/anhanguera/i)
  })

  test('formulário de lead está de pé', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    // O site é uma landing de conversão: sem form de lead visível, o dia
    // inteiro de mídia vai pro lixo. Heurística: pelo menos um input de
    // contato (nome/telefone/email) + um botão de envio na página.
    const inputs = page.locator('input:visible')
    await expect(inputs.first()).toBeVisible({ timeout: 30_000 })
    expect(await inputs.count()).toBeGreaterThanOrEqual(2)
    await expect(
      page.locator('button[type="submit"]:visible, form button:visible').first()
    ).toBeVisible()
  })
})
