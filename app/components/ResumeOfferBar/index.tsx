'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { X } from 'lucide-react'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'
import { formatCurrency } from '@/utils/fomartCurrency'
import { hasInstallmentPlan } from '@/app/components/v2/course-offer'

const STORAGE_KEY = 'pendingCheckoutParams'
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 dias

interface PendingCheckoutParams {
  groupId?: string
  unitId?: string
  modality?: string
  shift?: string
  courseName?: string
  price?: number
  /**
   * Nível e parcelamento, gravados junto pelo card. Ausentes nos registros
   * salvos antes de 2026-08-20 — a barra então cai no formato antigo, o que é
   * aceitável porque a mochila expira em 7 dias e se renova sozinha.
   */
  academicLevel?: string
  totalInstallment?: number
  minInstallmentValue?: number
  savedAt?: number
}

/** Lê e valida o registro salvo pelo card no momento em que o usuário parte
 * pro checkout (ver handleClick em CourseCardNew/index.tsx e Redesign.tsx).
 * Descarta (e limpa) registros sem nome do curso ou com mais de 7 dias. */
function readPending(): PendingCheckoutParams | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PendingCheckoutParams
    if (!parsed || typeof parsed !== 'object' || !parsed.courseName) return null
    if (typeof parsed.savedAt === 'number' && Date.now() - parsed.savedAt > MAX_AGE_MS) {
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/**
 * "Mochila" de oferta — barra fixa e discreta lembrando a última oferta
 * escolhida, em qualquer página pública (nunca em /checkout/*, onde a
 * pessoa já está retomando ou preenchendo o formulário).
 *
 * Escopo v1: só o fluxo Cogna (/checkout/matricula) escreve
 * `pendingCheckoutParams` hoje — YDUQS/Estácio usa `selectedCourse` +
 * /checkout/estacio, que não carrega esse formato. Ver relato da tarefa.
 */
export default function ResumeOfferBar() {
  const pathname = usePathname() || '/'
  const { trackEvent } = usePostHogTracking()
  const [pending, setPending] = useState<PendingCheckoutParams | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [shownTracked, setShownTracked] = useState(false)

  // Lê uma vez no mount (client-only; localStorage não existe no SSR).
  useEffect(() => {
    setPending(readPending())
  }, [])

  const isCheckoutRoute = pathname.startsWith('/checkout')
  const visible = Boolean(pending) && !dismissed && !isCheckoutRoute

  // Tracking "shown": uma vez por mount, só quando de fato aparece.
  useEffect(() => {
    if (visible && !shownTracked) {
      trackEvent('resume_offer_shown', {
        course_name: pending?.courseName,
        price: pending?.price,
      })
      setShownTracked(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, shownTracked])

  if (!visible || !pending) return null

  const resumeParams = new URLSearchParams()
  if (pending.groupId) resumeParams.set('groupId', pending.groupId)
  if (pending.unitId) resumeParams.set('unitId', pending.unitId)
  if (pending.modality) resumeParams.set('modality', pending.modality)
  if (pending.shift) resumeParams.set('shift', pending.shift)
  const resumeHref = `/checkout/matricula?${resumeParams.toString()}`

  const handleDismiss = () => {
    localStorage.removeItem(STORAGE_KEY)
    setDismissed(true)
    trackEvent('resume_offer_dismissed', {
      course_name: pending.courseName,
      price: pending.price,
    })
  }

  const handleContinue = () => {
    trackEvent('resume_offer_clicked', {
      course_name: pending.courseName,
      price: pending.price,
    })
  }

  return (
    <div
      className="animate-slide-up fixed inset-x-0 z-30 px-3 pointer-events-none bottom-[calc(64px+env(safe-area-inset-bottom)+12px)] md:bottom-4 md:px-4"
      role="region"
      aria-label="Continuar matrícula"
    >
      <div className="pointer-events-auto mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-hairline bg-white/95 backdrop-blur px-4 py-3 shadow-[0_16px_40px_-12px_rgba(11,31,60,0.3)] md:mx-0 md:ml-auto">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] font-medium text-ink-500">Continue de onde parou</p>
          <p className="truncate text-[13px] font-bold text-ink-900">{pending.courseName}</p>
          {hasInstallmentPlan(pending) ? (
            <p className="text-[12px] text-bolsa-secondary font-semibold">
              {pending.totalInstallment}x de {formatCurrency(pending.minInstallmentValue)}
            </p>
          ) : (
            typeof pending.price === 'number' &&
            pending.price > 0 && (
              <p className="text-[12px] text-bolsa-secondary font-semibold">
                {formatCurrency(pending.price)}
                <span className="text-[11px] font-normal text-ink-500">/mês</span>
              </p>
            )
          )}
        </div>
        <Link
          href={resumeHref}
          onClick={handleContinue}
          className="flex-shrink-0 whitespace-nowrap rounded-full bg-bolsa-secondary px-4 py-2.5 text-[12px] font-semibold text-white transition-colors hover:bg-bolsa-secondary/90"
        >
          Continuar matrícula
        </Link>
        <button
          type="button"
          aria-label="Dispensar"
          onClick={handleDismiss}
          className="flex-shrink-0 rounded-full p-1.5 text-ink-400 transition-colors hover:bg-ink-100/60 hover:text-ink-700"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
