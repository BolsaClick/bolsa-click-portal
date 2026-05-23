import Link from 'next/link'
import { ArrowRight, GraduationCap, Clock, Monitor } from 'lucide-react'
import Container from '../../atoms/Container'

// Section direcionada à persona "adulto retornando aos estudos":
// parou a faculdade, sem ENEM, alto ceticismo, alta intenção de fechamento.
// Concorrência de keyword baixa, sem ponto de entrada explícito hoje na home.
const PersonaReturnBanner = () => {
  return (
    <section
      aria-labelledby="persona-return-title"
      className="bg-gradient-to-br from-bolsa-primary/95 to-blue-900 py-14 md:py-16"
    >
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          <div className="md:col-span-7 text-white">
            <span className="inline-block font-mono text-[11px] tracking-[0.22em] uppercase text-bolsa-secondary mb-4">
              Voltando a estudar
            </span>
            <h2
              id="persona-return-title"
              className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight mb-4"
            >
              Parou a faculdade?{' '}
              <span className="text-bolsa-secondary">Recomeça hoje</span>, sem ENEM.
            </h2>
            <p className="text-white/85 text-base md:text-lg leading-relaxed mb-6 max-w-2xl">
              Mais de 30 mil faculdades aceitam histórico parcial e dispensam ENEM. Estude 100%
              online, no seu ritmo, com diploma reconhecido pelo MEC e bolsa de até 80%.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-sm">
              <li className="flex items-center gap-2 text-white/90">
                <GraduationCap className="w-5 h-5 text-bolsa-secondary flex-shrink-0" aria-hidden="true" />
                <span>Diploma MEC</span>
              </li>
              <li className="flex items-center gap-2 text-white/90">
                <Clock className="w-5 h-5 text-bolsa-secondary flex-shrink-0" aria-hidden="true" />
                <span>Matrícula em 5 min</span>
              </li>
              <li className="flex items-center gap-2 text-white/90">
                <Monitor className="w-5 h-5 text-bolsa-secondary flex-shrink-0" aria-hidden="true" />
                <span>100% EAD disponível</span>
              </li>
            </ul>

            <Link
              href="/sem-enem"
              className="inline-flex items-center gap-2 bg-bolsa-secondary text-bolsa-primary font-semibold px-6 py-3 rounded-lg hover:bg-bolsa-secondary/90 transition-colors"
            >
              Ver bolsas sem ENEM
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="md:col-span-5">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 md:p-8">
              <p className="font-mono text-[11px] tracking-[0.22em] uppercase text-bolsa-secondary mb-4">
                Dispensa de ENEM
              </p>
              <p className="text-white/95 font-display text-xl md:text-2xl leading-snug mb-4">
                A maioria das ofertas EAD aceita ingresso via vestibular online — sem nota de
                corte, prova no mesmo dia do cadastro.
              </p>
              <Link
                href="/blog/como-conseguir-bolsa-estudo-50-faculdade"
                className="text-bolsa-secondary text-sm font-medium hover:underline inline-flex items-center gap-1"
              >
                Como funciona o ingresso sem ENEM
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}

export default PersonaReturnBanner
