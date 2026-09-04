// Verificador diário de preços — card vs checkout (Cogna/Tartarus).
//
// O preço que o usuário VÊ no card vem da busca (`cogna/courses/search`,
// campo minPrice); o preço que o checkout COBRA vem do detalhe da oferta
// (`cogna/courses/details`, basePricing.default.priceWithDiscount). Quando as
// duas pontas divergem ("campo atolado"), o usuário vê X e paga Y — veneno
// puro pra conversão e pra confiança. Este script amostra combos populares
// de curso×cidade e falha (exit 1) se achar divergência.
//
// Ofertas YDUQS ficam fora do v1: card e checkout leem a MESMA API Athena ao
// vivo, então não há duas fontes pra divergir.

const TARTARUS = process.env.TARTARUS_API || 'https://tartarus-api.inovitdigital.com.br/api'

const SAMPLES = [
  { curso: 'administracao', cidade: 'São Paulo', estado: 'SP' },
  { curso: 'direito', cidade: 'Rio de Janeiro', estado: 'RJ' },
  { curso: 'enfermagem', cidade: 'Belo Horizonte', estado: 'MG' },
  { curso: 'psicologia', cidade: 'Curitiba', estado: 'PR' },
  { curso: 'pedagogia', cidade: 'Salvador', estado: 'BA' },
]
const PER_SAMPLE = 4
const TOLERANCIA = 0.01 // divergência de centavos é arredondamento, não staleness

async function getJSON(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(20_000) })
  if (!res.ok) throw new Error(`${res.status} em ${url}`)
  return res.json()
}

function searchURL({ curso, cidade, estado }) {
  const qs = new URLSearchParams({
    page: '1',
    size: String(PER_SAMPLE),
    courseName: curso,
    city: cidade,
    state: estado,
  })
  qs.append('academicLevel', 'GRADUACAO')
  return `${TARTARUS}/cogna/courses/search?${qs}`
}

const mismatches = []
const errors = []
let checked = 0

for (const sample of SAMPLES) {
  let cards
  try {
    const body = await getJSON(searchURL(sample))
    cards = Array.isArray(body?.data) ? body.data : []
  } catch (e) {
    errors.push(`busca ${sample.curso}/${sample.cidade}: ${e.message}`)
    continue
  }

  for (const card of cards) {
    // Mesmos pré-requisitos do card real: sem businessKey/unitId não há checkout.
    if (!card.businessKey || !card.unitId || card.source === 'YDUQS') continue
    const shift = card.shiftOptions?.[0] || 'VIRTUAL'
    const modality = card.modality || card.commercialModality || 'EAD'
    const qs = new URLSearchParams({
      groupId: String(card.id),
      shift,
      modality,
      unitId: String(card.unitId),
    })
    try {
      const details = await getJSON(`${TARTARUS}/cogna/courses/details?${qs}`)
      const checkoutPrice =
        details?.basePricing?.default?.priceWithDiscount ?? details?.prices?.withDiscount
      const cardPrice = card.minPrice
      checked++
      if (
        typeof cardPrice === 'number' &&
        typeof checkoutPrice === 'number' &&
        Math.abs(cardPrice - checkoutPrice) > TOLERANCIA
      ) {
        mismatches.push({
          curso: card.name || card.courseName,
          marca: card.brand,
          cidade: sample.cidade,
          card: cardPrice,
          checkout: checkoutPrice,
        })
      }
    } catch (e) {
      errors.push(`details ${card.name} (${sample.cidade}): ${e.message}`)
    }
  }
}

console.log(`ofertas verificadas: ${checked}`)
if (errors.length) console.log(`avisos (${errors.length}):\n  ` + errors.join('\n  '))

// Direção importa: checkout MAIS CARO que o card = usuário se sente enganado
// (falha o workflow); checkout mais barato = drift benigno de cache (só loga,
// pra não viciar o alarme em vermelho por causa de R$10 a favor do aluno).
const nocivas = mismatches.filter((m) => m.checkout > m.card)
const benignas = mismatches.filter((m) => m.checkout <= m.card)

if (benignas.length) {
  console.log(`\n⚠️ drift benigno (checkout mais barato que o card) em ${benignas.length} oferta(s):`)
  for (const m of benignas) {
    console.log(`  ${m.curso} · ${m.marca} · ${m.cidade}: card R$${m.card} → checkout R$${m.checkout}`)
  }
}
if (nocivas.length) {
  console.error(`\n💸 DIVERGÊNCIA NOCIVA (checkout mais caro que o card) em ${nocivas.length} oferta(s):`)
  for (const m of nocivas) {
    console.error(`  ${m.curso} · ${m.marca} · ${m.cidade}: card R$${m.card} ≠ checkout R$${m.checkout}`)
  }
  process.exit(1)
}
if (checked === 0) {
  console.error('Nenhuma oferta verificável — busca vazia ou contrato mudou. Investigar.')
  process.exit(1)
}
console.log('✅ nenhum preço nocivo na amostra')
