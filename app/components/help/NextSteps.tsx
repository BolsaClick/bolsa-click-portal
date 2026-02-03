import Link from 'next/link'

interface NextStep {
  title: string
  description: string
  href: string
}

interface NextStepsProps {
  steps: NextStep[]
}

export function NextSteps({ steps }: NextStepsProps) {
  return (
    <div className="mb-8 rounded-xl bg-gradient-to-br from-[var(--bolsa-primary)] to-blue-900 p-6 text-white">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
        Próximos Passos
      </h2>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <Link
            key={index}
            href={step.href}
            className="group block rounded-lg bg-white/10 p-4 backdrop-blur-sm transition-all hover:bg-white/20"
          >
            <h3 className="mb-1 font-semibold group-hover:underline">
              {step.title}
            </h3>
            <p className="text-sm text-white/90">{step.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
