/**
 * CourseCard v2 — estado de loading.
 * Espelha a geometria do card real pra evitar layout shift na troca.
 */
export default function CourseCardV2Skeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando oferta"
      className="flex h-full animate-pulse flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-[0_1px_2px_rgba(11,31,60,0.06)]"
    >
      <span className="sr-only">Carregando oferta…</span>

      {/* logo + chip modalidade */}
      <div className="flex items-center justify-between gap-3 px-5 pt-5">
        <div className="h-7 w-24 rounded-md bg-ink-100/70" />
        <div className="h-6 w-16 rounded-md bg-ink-100/70" />
      </div>

      {/* título (2 linhas) + grau */}
      <div className="px-5 pt-3.5">
        <div className="h-[17px] w-11/12 rounded bg-ink-100/70" />
        <div className="mt-1.5 h-[17px] w-7/12 rounded bg-ink-100/70" />
        <div className="mt-2 h-3 w-5/12 rounded bg-ink-100/50" />
      </div>

      {/* meta */}
      <div className="mt-3 flex gap-4 px-5">
        <div className="h-3.5 w-16 rounded bg-ink-100/50" />
        <div className="h-3.5 w-28 rounded bg-ink-100/50" />
      </div>

      {/* faixa cupom */}
      <div className="mt-auto border-t border-dashed border-ink-300/40 bg-paper-warm px-5 pb-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="h-3 w-32 rounded bg-ink-100" />
          <div className="h-5 w-12 rounded bg-ink-100" />
        </div>
        <div className="mt-2 h-8 w-36 rounded bg-ink-100" />
        <div className="mt-2 h-3 w-40 rounded bg-ink-100/70" />
      </div>

      {/* CTA */}
      <div className="px-5 pb-5 pt-3.5">
        <div className="h-12 w-full rounded-xl bg-ink-100/70" />
        <div className="mx-auto mt-2 h-3 w-40 rounded bg-ink-100/50" />
      </div>
    </div>
  )
}
