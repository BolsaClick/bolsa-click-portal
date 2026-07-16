import CourseCardV2 from '@/app/components/v2/CourseCardV2'
import CourseCardV2Skeleton from '@/app/components/v2/CourseCardV2Skeleton'
import type { CourseOffer } from '@/app/components/v2/course-offer'
import MascotPopDemo from '@/app/components/v2/mascot/MascotPopDemo'
import ReactiveCta from '@/app/components/v2/ui/ReactiveCta'

export const metadata = { robots: { index: false, follow: false } }

/**
 * Preview local do CourseCard v2 — protótipo pra avaliação do fundador.
 * Rota de dev: não linkada, noindex, não integrada ao funil.
 *
 * Dados: payload real de cogna/courses/search (Administração Pública -
 * Bacharelado, Anhanguera EAD) + variações derivadas dele pra exercitar
 * cada estado do card.
 */

// Payload real (exemplo literal da API)
const realOffer: CourseOffer = {
  name: 'Administração Pública - Bacharelado',
  brand: 'ANHANGUERA',
  academicLevel: 'GRADUACAO',
  academicDegree: 'BACHARELADO',
  modality: 'EAD',
  commercialModality: 'EAD',
  durationInMonths: 48,
  minPrice: 108.38,
  maxPrice: 206.59,
  unit: 'SAO PAULO/SP - PIRITUBA',
  unitName: 'PIRITUBA',
  city: 'SAO PAULO',
  uf: 'SP',
  shiftOptions: ['VIRTUAL'],
  source: 'ATHENAS',
}

// Sem maxPrice -> card não pode inventar desconto
const noDiscountOffer: CourseOffer = {
  ...realOffer,
  name: 'Ciências Contábeis - Bacharelado',
  minPrice: 149.9,
  maxPrice: undefined,
}

// Nome longo -> clamp em 2 linhas sem quebrar o alinhamento do grid
const longNameOffer: CourseOffer = {
  ...realOffer,
  name: 'Tecnologia em Análise e Desenvolvimento de Sistemas - Tecnólogo',
  academicDegree: 'TECNOLOGO',
  durationInMonths: 30,
  minPrice: 119.9,
  maxPrice: 219.9,
}

// Presencial com mais de um turno -> seletor aparece antes do CTA
const multiShiftOffer: CourseOffer = {
  ...realOffer,
  name: 'Enfermagem - Bacharelado',
  modality: 'PRESENCIAL',
  commercialModality: 'PRESENCIAL',
  durationInMonths: 60,
  minPrice: 389.9,
  maxPrice: 689.9,
  shiftOptions: ['MATUTINO', 'NOTURNO'],
}

// Pós-graduação -> parcelamento "até Nx de R$ Y"
const posOffer: CourseOffer = {
  ...realOffer,
  name: 'Gestão de Pessoas e Liderança',
  academicLevel: 'POS_GRADUACAO',
  academicDegree: 'ESPECIALISTA',
  durationInMonths: 12,
  minPrice: 154.9,
  maxPrice: undefined,
  totalInstallment: 18,
  minInstallmentValue: 154.9,
}

// Variante FUTURA: notaMec ainda não existe no payload de produção.
// Aqui é demonstração de layout com um valor de exemplo — não usar como default.
const futureNotaMecOffer: CourseOffer = {
  ...realOffer,
  notaMec: 4,
}

const DEMO_HREF = '/checkout/matricula?preview=card-v2'

function Variant({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-500">
          {label}
        </p>
        {note && <p className="mt-0.5 text-[12px] leading-snug text-ink-500">{note}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  )
}

export default function DesignPreviewPage() {
  return (
    <div className="min-h-screen bg-paper">
      <div className="mx-auto w-full max-w-screen-lg px-4 py-10 sm:px-6 lg:px-8">
        {/* Cabeçalho do preview */}
        <header className="border-b border-ink-100 pb-6">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-bolsa-secondary">
            Protótipo local · não integrado ao funil
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900">
            CourseCard v2
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-700">
            Redesign do card de curso com dados do payload real de{' '}
            <code className="rounded bg-ink-100/60 px-1 py-0.5 font-mono text-[12px]">
              cogna/courses/search
            </code>
            . Desconto sempre calculado de minPrice/maxPrice — nunca hardcoded. Sem nota,
            avaliação ou escassez inventada.
          </p>
        </header>

        {/* Estados */}
        <section className="mt-8" aria-labelledby="estados">
          <h2 id="estados" className="text-lg font-bold text-ink-900">
            Card v2 — estados
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-10 md:grid-cols-2 xl:grid-cols-3">
            <Variant label="01 · Completo (payload real)" note="Desconto -47% calculado de 108,38 / 206,59.">
              <CourseCardV2 offer={realOffer} href={DEMO_HREF} />
            </Variant>

            <Variant label="02 · Sem desconto" note="maxPrice ausente: sem riscado, sem badge, sem economia.">
              <CourseCardV2 offer={noDiscountOffer} href={DEMO_HREF} />
            </Variant>

            <Variant label="03 · Nome longo" note="Clamp em 2 linhas; altura reservada mantém o grid alinhado.">
              <CourseCardV2 offer={longNameOffer} href={DEMO_HREF} />
            </Variant>

            <Variant
              label="04 · Presencial com turnos"
              note="Seletor de turno (alvos ≥44px) antes do CTA; CTA bloqueado até escolher."
            >
              <CourseCardV2 offer={multiShiftOffer} href={DEMO_HREF} />
            </Variant>

            <Variant label="05 · Pós-graduação" note="Parcelamento 'até 18x de R$ 154,90' no lugar da mensalidade.">
              <CourseCardV2 offer={posOffer} href={DEMO_HREF} />
            </Variant>

            <Variant label="06 · Skeleton (loading)" note="Mesma geometria do card real — sem layout shift na troca.">
              <CourseCardV2Skeleton />
            </Variant>

            <Variant
              label="07 · Futuro: com nota MEC real"
              note="Slot só renderiza quando o campo existir no payload. Valor 4 aqui é exemplo de layout, não default."
            >
              <CourseCardV2 offer={futureNotaMecOffer} href={DEMO_HREF} />
            </Variant>
          </div>
        </section>

        {/* MascotPop — clique para testar */}
        <section className="mt-12" aria-labelledby="mascote">
          <h2 id="mascote" className="text-lg font-bold text-ink-900">
            MascotPop — clique para testar
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] text-ink-500">
            Feedback pós-clique de CTA com o mascote oficial (docs/MASCOTES.md, pose joinha =
            sucesso). Na home v3, ele pipoca no canto da tela ao clicar em &ldquo;Garantir
            bolsa&rdquo;, em paralelo à navegação.
          </p>
          <div className="mt-4 max-w-2xl">
            <MascotPopDemo />
          </div>
        </section>

        {/* CTA reativo — passe o mouse */}
        <section className="mt-12" aria-labelledby="cta-reativo">
          <h2 id="cta-reativo" className="text-lg font-bold text-ink-900">
            CTA reativo — passe o mouse
          </h2>
          <p className="mt-1 max-w-2xl text-[13px] text-ink-500">
            Hover/focus: lift + scale sutil + glow da marca; clique: compress tátil. Todo botão
            primary ganha de fábrica o mascote-comemorando subindo por trás do PRÓPRIO botão —
            a cabecinha aparece acima da borda superior no hover e desce quando o mouse sai.
            No card, a etiqueta de desconto ainda dá um wiggle no hover. Tudo CSS-only
            (transform/box-shadow, 150–260ms); com prefers-reduced-motion nada se move (nem a
            espiadinha) — fica só a sombra.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-500">
                Botões (primary com peek automático · soft sem mascote)
              </p>
              <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-ink-100 bg-white p-6 pt-16">
                <ReactiveCta href={DEMO_HREF}>Garantir bolsa</ReactiveCta>
                <ReactiveCta as="button" type="button" variant="soft">
                  Ver cursos
                </ReactiveCta>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-500">
                Card completo (wiggle da etiqueta + peek no botão do card)
              </p>
              <CourseCardV2 offer={realOffer} href={DEMO_HREF} />
            </div>
          </div>
        </section>

        {/* Decisões */}
        <section className="mt-12 max-w-2xl" aria-labelledby="decisoes">
          <h2 id="decisoes" className="text-lg font-bold text-ink-900">
            Decisões de design
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-ink-700">
            <li>
              <strong className="text-ink-900">Faixa cupom como assinatura.</strong> O preço vive
              numa faixa em papel quente separada por borda perfurada, com etiqueta rosa de
              desconto em forma de tag — o card comunica &ldquo;bolsa&rdquo; visualmente, não só em texto.
              Desconto e economia mensal são sempre calculados do payload.
            </li>
            <li>
              <strong className="text-ink-900">Um único ponto quente.</strong> O rosa
              (bolsa-secondary) é reservado exclusivamente pro sinal de economia; o CTA fica em
              bolsa-primary. Preço final em Fraunces é o maior elemento do card — hierarquia
              honesta: a mensalidade com bolsa é a decisão.
            </li>
            <li>
              <strong className="text-ink-900">Turno como segmented control.</strong> Botões de
              44px de altura antes do CTA substituem o select nativo — a escolha fica visível e o
              CTA só habilita depois dela (aria-disabled enquanto bloqueado).
            </li>
            <li>
              <strong className="text-ink-900">Acessibilidade de base.</strong> CTA é âncora real
              (&lt;a href&gt;), focus-visible ring em tudo que é interativo, alvos de toque ≥44px,
              radiogroup no turno.
            </li>
            <li>
              <strong className="text-ink-900">Denso, mas alinhado.</strong> Título com altura
              reservada (2 linhas) e faixa de preço ancorada na base — num grid de resultados, os
              preços de todos os cards ficam na mesma linha de leitura.
            </li>
          </ul>

          <p className="mt-6 border-t border-ink-100 pt-4 text-[12px] leading-relaxed text-ink-500">
            * A microcopy do CTA (&ldquo;Garantir bolsa&rdquo;) e a linha &ldquo;sem cobrança
            agora&rdquo; são ilustrativas do design. O texto final depende do fluxo de cada
            fornecedor (matrícula ATHENAS × inscrição YDUQS) e deve ser definido na integração.
          </p>
        </section>
      </div>
    </div>
  )
}
