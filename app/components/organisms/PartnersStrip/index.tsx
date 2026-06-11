import Image from 'next/image'
import { getTrustData } from '@/app/lib/trust'

const partners = [
  { name: 'Anhanguera', src: '/assets/logo-anhanguera-bolsa-click.svg', width: 160, height: 36 },
  { name: 'Estácio', src: '/estacio-logo.png', width: 120, height: 36 },
  { name: 'Unopar', src: '/assets/logo-unopar.svg', width: 130, height: 36 },
  { name: 'Pitágoras', src: '/assets/logo-pitagoras.svg', width: 140, height: 36 },
  { name: 'Ampli', src: '/assets/ampli-logo.png', width: 110, height: 36 },
  { name: 'Unime', src: '/assets/logo-unime-p.png', width: 110, height: 36 },
]

const marqueeItems = [...partners, ...partners, ...partners]

/**
 * Formata contagem real de cadastrados pra rótulo curto (1.2k+, 12k+, 120k+).
 * Quando count < 100 ou indisponível, retorna fallback positivo sem número
 * inventado (CLAUDE.md).
 */
function formatStudentCountLabel(count: number | null): {
  value: string
  caption: string
} {
  if (count === null || count < 100) {
    return { value: 'Comunidade', caption: 'estudantes ativos no Brasil' }
  }
  if (count < 10_000) {
    const rounded = Math.floor(count / 100) * 100
    return { value: `${rounded.toLocaleString('pt-BR')}+`, caption: 'estudantes cadastrados' }
  }
  const k = Math.floor(count / 1_000)
  return { value: `${k}k+`, caption: 'estudantes cadastrados' }
}

export default async function PartnersStrip() {
  const { studentCount } = await getTrustData()
  const studentLabel = formatStudentCountLabel(studentCount)

  return (
    <section
      aria-labelledby="partners-title"
      className="bg-white border-y border-hairline py-10 md:py-12 overflow-hidden"
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center mb-8">
          <div className="md:col-span-4">
            <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-2">
              <span className="h-px w-8 bg-ink-300" />
              Parceiros
            </p>
            <h2 id="partners-title" className="font-display text-2xl md:text-3xl text-ink-900 leading-tight">
              <span className="font-semibold">As maiores redes de ensino do Brasil</span>{' '}
              <span className="italic text-ink-700">conectadas em uma plataforma só.</span>
            </h2>
          </div>
          <div className="md:col-span-7 md:col-start-6 grid grid-cols-3 gap-6 text-center md:text-left">
            <div>
              <div className="font-display num-tabular text-3xl md:text-4xl text-ink-900">280+</div>
              <div className="text-[12px] text-ink-500 mt-1">cidades com polos</div>
            </div>
            <div>
              <div className="font-display num-tabular text-3xl md:text-4xl text-ink-900">{studentLabel.value}</div>
              <div className="text-[12px] text-ink-500 mt-1">{studentLabel.caption}</div>
            </div>
            <div>
              <div className="font-display num-tabular text-3xl md:text-4xl text-bolsa-secondary">80%</div>
              <div className="text-[12px] text-ink-500 mt-1">desconto em bolsas</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 z-10 bg-gradient-to-l from-white to-transparent" />
        <div className="flex gap-14 animate-marquee">
          {marqueeItems.map((p, idx) => (
            <div
              key={`${p.name}-${idx}`}
              className="flex-shrink-0 grayscale opacity-70 hover:opacity-100 hover:grayscale-0 transition-all duration-300 flex items-center"
              style={{ height: 56 }}
            >
              <Image
                src={p.src}
                alt={`${p.name} — faculdade parceira Bolsa Click`}
                width={p.width}
                height={p.height}
                className="h-9 w-auto object-contain"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
