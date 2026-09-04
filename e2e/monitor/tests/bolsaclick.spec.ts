import { test, expect } from '@playwright/test'

const BASE = 'https://www.bolsaclick.com.br'
const BUSCA = `${BASE}/curso/resultado?c=administracao&cidade=S%C3%A3o%20Paulo&estado=SP&nivel=GRADUACAO`

test.describe('bolsaclick.com.br', () => {
  test('home responde e renderiza', async ({ page }) => {
    const response = await page.goto(BASE, { waitUntil: 'domcontentloaded' })
    expect(response?.status()).toBeLessThan(400)
    await expect(page.locator('body')).toContainText(/bolsa/i)
  })

  test('busca de curso retorna ofertas com preço', async ({ page }) => {
    await page.goto(BUSCA, { waitUntil: 'domcontentloaded' })
    const cards = page.locator('article')
    await expect(cards.first()).toBeVisible({ timeout: 30_000 })
    expect(await cards.count()).toBeGreaterThan(0)
    // Preço visível em pelo menos um card — campo desatualizado/zerado é
    // exatamente o tipo de regressão silenciosa que este monitor caça.
    await expect(page.locator('body')).toContainText(/R\$\s?\d/)
  })

  test('card de oferta leva ao checkout e o formulário renderiza', async ({ page }) => {
    await page.goto(BUSCA, { waitUntil: 'domcontentloaded' })
    const firstCard = page.locator('article').first()
    await expect(firstCard).toBeVisible({ timeout: 30_000 })

    // Alguns cards exigem escolher turno antes do CTA liberar.
    const shiftSelect = firstCard.locator('select[aria-label="Selecione o turno"]')
    if (await shiftSelect.count()) {
      await shiftSelect.selectOption({ index: 1 }).catch(() => {})
    }

    const cta = firstCard.locator('[aria-label="Avançar para matrícula"], button:has-text("Inscreva-se")').first()
    await expect(cta).toBeVisible()
    await cta.click()

    await page.waitForURL(/\/checkout\/(matricula|estacio)/, { timeout: 30_000 })
    // O formulário de inscrição precisa estar de pé com o campo de CPF.
    await expect(page.locator('form').first()).toBeVisible({ timeout: 30_000 })
    await expect(page.locator('body')).toContainText(/CPF/i)
  })

  test('filtro de marca (?marcas=) mostra só ofertas da marca selecionada', async ({ page }) => {
    // O filtro de marca server-side (?marcas=) e as ofertas premium (fix do
    // teto do slider) não podem regredir silenciosamente — se o roteamento
    // por marca quebrar, a busca volta a misturar ofertas de outras
    // instituições e o usuário perde a curadoria que pediu.
    await page.goto(
      `${BASE}/curso/resultado?cidade=Rio%20de%20Janeiro&estado=RJ&nivel=GRADUACAO&marcas=IBMEC`,
      { waitUntil: 'domcontentloaded' },
    )
    const cards = page.locator('article')
    await expect(cards.first()).toBeVisible({ timeout: 30_000 })

    const cardsText = await cards.allInnerTexts()
    expect(cardsText.length).toBeGreaterThan(0)
    for (const text of cardsText) {
      expect(text).toMatch(/ibmec/i)
    }
  })
})
