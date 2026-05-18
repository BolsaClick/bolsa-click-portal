import Link from 'next/link'
import { ArrowRight, Stethoscope, GraduationCap, ScrollText } from 'lucide-react'

// Cursos da área de saúde (linkam pro pillar /bolsas/saude)
const CURSOS_SAUDE = [
  'psicologia',
  'enfermagem',
  'fisioterapia',
  'nutricao',
  'biomedicina',
  'farmacia',
  'odontologia',
  'educacao-fisica',
]

// Cursos com forte oferta EAD (linkam pro pillar /faculdade-ead)
const CURSOS_EAD_FORTE = [
  'administracao',
  'pedagogia',
  'analise-e-desenvolvimento-de-sistemas',
  'gestao-de-recursos-humanos',
  'marketing',
  'gestao-comercial',
  'ciencias-contabeis',
  'engenharia-de-producao',
  'engenharia-civil',
]

interface Props {
  courseSlug: string
  courseName: string
}

interface PillarLink {
  href: string
  category: string
  title: string
  description: string
  icon: typeof Stethoscope
}

function getPillarsForCourse(slug: string, name: string): PillarLink[] {
  const pillars: PillarLink[] = []

  // Saúde
  if (CURSOS_SAUDE.includes(slug)) {
    pillars.push({
      href: '/bolsas/saude',
      category: 'Pillar — Área da Saúde',
      title: 'Bolsas em faculdades de saúde',
      description: `Veja todos os cursos de saúde com bolsa de até 80% — Psicologia, Enfermagem, Fisioterapia, Nutrição e mais.`,
      icon: Stethoscope,
    })
  }

  // EAD
  if (CURSOS_EAD_FORTE.includes(slug)) {
    pillars.push({
      href: '/faculdade-ead',
      category: 'Pillar — Modalidade EAD',
      title: 'Faculdade EAD com bolsa',
      description: `Graduação EAD reconhecida pelo MEC. ${name} é um dos cursos disponíveis em modalidade a distância com mensalidades a partir de R$ 99/mês.`,
      icon: GraduationCap,
    })
  }

  // Topo de funil — pra todo curso (informacional)
  pillars.push({
    href: '/como-conseguir-bolsa-de-estudo',
    category: 'Guia editorial',
    title: 'Como conseguir bolsa de estudo',
    description:
      'ProUni, FIES, Bolsa Click ou bolsa filantrópica? Comparativo de todos os caminhos pra reduzir a mensalidade da sua faculdade.',
    icon: ScrollText,
  })

  return pillars
}

export default function RelatedPillarsBlock({ courseSlug, courseName }: Props) {
  const pillars = getPillarsForCourse(courseSlug, courseName)
  if (pillars.length === 0) return null

  return (
    <section className="bg-white py-12 md:py-16 border-t border-hairline">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="hairline-b pb-3 mb-6">
          <h2 className="font-mono text-[11px] tracking-[0.22em] uppercase text-ink-700">
            Continue explorando
          </h2>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline">
          {pillars.map((p) => {
            const Icon = p.icon
            return (
              <li key={p.href} className="bg-white">
                <Link
                  href={p.href}
                  className="group flex flex-col h-full px-5 py-6 hover:bg-paper transition-colors"
                >
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-3 inline-flex items-center gap-1.5">
                    <Icon size={11} className="text-bolsa-secondary" />
                    {p.category}
                  </p>
                  <h3 className="font-display text-lg text-ink-900 group-hover:italic transition-all mb-2 leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-ink-700 text-sm leading-relaxed mb-3">{p.description}</p>
                  <span className="mt-auto inline-flex items-center gap-1 text-bolsa-secondary text-sm font-medium">
                    Ler agora <ArrowRight size={12} />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
