export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center bg-paper">
      <div className="h-10 w-10 rounded-full border-2 border-hairline border-t-bolsa-secondary animate-spin" />
      <p className="mt-4 font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
        Carregando…
      </p>
    </div>
  )
}
