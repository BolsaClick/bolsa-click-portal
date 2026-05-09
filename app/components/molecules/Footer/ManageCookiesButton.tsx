'use client'

import { CONSENT_OPEN_EVENT } from '@/app/lib/consent/storage'

type Props = {
  className?: string
}

export function ManageCookiesButton({
  className = 'text-neutral-400 text-xs hover:text-neutral-300 transition-colors',
}: Props) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))}
      className={className}
    >
      Gerenciar cookies
    </button>
  )
}
