'use client'

import { useCallback } from 'react'
import { toast } from 'sonner'
import { Course } from '@/app/interface/course'
import { postSearch } from '@/app/lib/api/post-search'
import { usePostHogTracking } from '@/app/lib/hooks/usePostHogTracking'
import { trackFbqDual } from '@/app/lib/analytics/fbq'
import { pushDataLayerEvent } from '@/app/lib/analytics/gtag'
import { trackTikTok } from '@/app/lib/analytics/ttq'
import {
  buildCourseCheckoutDestination,
  courseNeedsShiftSelection,
  resolveCourseModality,
} from '@/app/lib/checkout/course-destination'

/**
 * De onde partiu a seleção da oferta. Vai como `entry_point` nos TRÊS eventos
 * (PostHog, Meta, GA4) pra dar pra comparar os caminhos: a landing de SEO
 * levava a pessoa pra lista genérica e só o segundo clique era medido — por
 * isso o tráfego orgânico aparecia como abandono e ficava invisível pro Meta
 * e pro Google otimizarem.
 */
export type CourseEntryPoint = 'resultado' | 'landing_seo' | 'favoritos' | 'vitrine'

type TrackProps = Record<string, string | number | boolean | null | undefined>

interface SelectCourseOptions {
  /** Turno escolhido pela pessoa no card (quando há mais de um). */
  selectedShift?: string
  /** Propriedades extras da superfície (view_mode, page_type, design_version…). */
  extraProps?: TrackProps
}

/**
 * Leva a pessoa da oferta clicada direto ao checkout DAQUELA oferta, com o
 * tracking completo. Única fonte de verdade do comportamento do clique —
 * usada pelo card de resultados, pelo card das landings de SEO e pela página
 * de curso×cidade. Ver app/lib/checkout/course-destination.ts pro destino.
 *
 * Retorna `false` quando a navegação foi bloqueada (turno obrigatório não
 * escolhido) — a superfície decide o que fazer com isso.
 */
export function useCourseSelection(entryPoint: CourseEntryPoint) {
  const { trackEvent } = usePostHogTracking()

  const selectCourse = useCallback(
    async (course: Course, options: SelectCourseOptions = {}): Promise<boolean> => {
      const { selectedShift, extraProps } = options
      const modality = resolveCourseModality(course)

      // Guarda de turno: nunca mandar pro checkout sem turno quando ele é
      // obrigatório — isso troca um vazamento por um erro.
      if (courseNeedsShiftSelection(course) && !selectedShift) {
        toast.error('Por favor, selecione o turno')
        trackEvent('course_card_click_blocked', {
          reason: 'shift_not_selected',
          course_id: course.id,
          course_name: course.name,
          course_brand: course.brand,
          modality,
          entry_point: entryPoint,
          available_shifts: course.shiftOptions?.join(', ') || '',
          ...extraProps,
        })
        return false
      }

      const destination = buildCourseCheckoutDestination(course, selectedShift)

      // Ping no endpoint de search (só trilho Cogna, que é quem o consome).
      if (destination.rail === 'cogna' && course.id && course.unitId) {
        try {
          await postSearch(String(course.id), course.unitId, course)
        } catch (error) {
          // Erro já tratado dentro de postSearch — seguir o fluxo.
          console.error('Erro ao enviar dados para search:', error)
        }
      }

      trackEvent('course_selected', {
        course_id: course.id,
        course_name: course.name,
        course_brand: course.brand,
        academic_level: course.academicLevel,
        modality: destination.modality,
        shift: destination.shift,
        price: course.minPrice,
        city: course.city,
        state: course.uf || course.unitState,
        unit_id: course.unitId,
        source: course.source === 'YDUQS' ? 'YDUQS' : 'TARTARUS',
        checkout_rail: destination.rail,
        entry_point: entryPoint,
        ...extraProps,
      })

      // Meta Pixel + Conversions API — ViewContent (curso selecionado).
      void trackFbqDual('ViewContent', {
        content_name: course.name,
        content_type: 'product',
        content_ids: course.id ? [String(course.id)] : undefined,
        value: course.minPrice || 0,
        currency: 'BRL',
        entry_point: entryPoint,
      })

      // GA4 ecommerce (dataLayer/GTM) — select_item, paridade com o ViewContent.
      pushDataLayerEvent('select_item', {
        entry_point: entryPoint,
        ecommerce: {
          currency: 'BRL',
          value: course.minPrice || 0,
          items: [
            {
              item_id: course.id ? String(course.id) : undefined,
              item_name: course.name,
              item_brand: course.brand,
            },
          ],
        },
      })

      // TikTok Pixel — ViewContent.
      trackTikTok('ViewContent', {
        content_id: course.id,
        content_name: course.name,
        content_type: 'product',
        value: course.minPrice || 0,
        currency: 'BRL',
        entry_point: entryPoint,
      })

      if (typeof window !== 'undefined') {
        // Preview otimista do checkout (nome/marca/preço enquanto a oferta
        // carrega — ver /checkout/matricula).
        try {
          localStorage.setItem('selectedCourse', JSON.stringify(course))
        } catch {
          // Storage cheio ou bloqueado: não pode impedir a navegação.
        }

        // "Mochila" de oferta: alimenta a ResumeOfferBar se a pessoa sair do
        // checkout sem terminar. savedAt habilita a expiração de 7 dias.
        // Só trilho Cogna — o formato é o do /checkout/matricula.
        if (destination.rail === 'cogna') {
          try {
            localStorage.setItem(
              'pendingCheckoutParams',
              JSON.stringify({
                groupId: destination.params.get('groupId') || undefined,
                unitId: destination.params.get('unitId') || undefined,
                modality: destination.params.get('modality') || undefined,
                shift: destination.params.get('shift') || undefined,
                courseName: course.name,
                price: course.minPrice,
                // Nível e parcelamento: sem eles a barra não tem como saber se
                // `price` é mensalidade (graduação) ou o total do curso (pós e
                // profissionalizante) — e escrevia "/mês" nos três casos.
                academicLevel: course.academicLevel,
                totalInstallment: course.totalInstallment,
                minInstallmentValue: course.minInstallmentValue,
                savedAt: Date.now(),
              }),
            )
          } catch {
            // idem
          }
        }

        window.location.href = destination.href
      }

      return true
    },
    [entryPoint, trackEvent],
  )

  return { selectCourse, needsShiftSelection: courseNeedsShiftSelection }
}
