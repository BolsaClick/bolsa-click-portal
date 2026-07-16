/**
 * ReactiveCta — âncora/botão com a reação de hover do padrão v2:
 * lift + scale sutil + glow da marca, compress no clique e — na variante
 * primary — o mascote dando uma espiadinha por trás do PRÓPRIO botão
 * (a cabeça aparece acima da borda superior no hover; reduced-motion
 * remove movimento e espiadinha). Estilos em reactive.module.css.
 *
 * Server-safe (sem hooks): usável direto em server components.
 */

import Mascot, { type MascotPose } from '../mascot/Mascot'
import styles from './reactive.module.css'

const BASE_BY_VARIANT = {
  primary:
    'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-bolsa-primary px-6 text-[15px] font-bold text-white hover:bg-bolsa-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary focus-visible:ring-offset-2',
  soft:
    'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-ink-100 bg-white px-4 text-[14px] font-semibold text-ink-900 hover:border-bolsa-primary hover:text-bolsa-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bolsa-primary',
} as const

type Variant = keyof typeof BASE_BY_VARIANT

/** Só as classes de reação (sem base visual) — pra aplicar em elementos existentes. */
export const reactiveClasses = {
  cta: styles.cta,
  soft: styles.soft,
  discountTag: styles.discountTag,
  /** wrapper + peek pra montar o padrão manualmente (ver CourseCardV2) */
  ctaWrap: styles.ctaWrap,
  buttonPeek: styles.buttonPeek,
}

interface CommonProps {
  variant?: Variant
  /**
   * Pose do mascote que espia por trás do botão no hover.
   * Default: 'comemorando' na primary; false (sem mascote) na soft.
   */
  mascot?: MascotPose | false
  mascotSize?: number
  /** Estica wrapper e botão (CTAs full-width). */
  fullWidth?: boolean
  /** Classes de layout (margens, col-span…) — aplicadas no wrapper. */
  className?: string
}

type AnchorProps = CommonProps & { as?: 'a' } & Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    'className'
  >
type ButtonProps = CommonProps & { as: 'button' } & Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'className'
  >

export default function ReactiveCta(props: AnchorProps | ButtonProps) {
  const { variant = 'primary', mascot, mascotSize = 56, fullWidth = false, className = '' } = props

  const pose: MascotPose | false = mascot ?? (variant === 'primary' ? 'comemorando' : false)
  const widthClass = fullWidth ? 'w-full' : ''
  const wrapClass = `${styles.ctaWrap} ${widthClass} ${className}`.trim()
  const controlClass = `${BASE_BY_VARIANT[variant]} relative z-[1] ${
    variant === 'primary' ? styles.cta : styles.soft
  } ${widthClass}`.trim()

  const peek = pose ? (
    <span aria-hidden="true" className={styles.buttonPeek}>
      <Mascot pose={pose} size={mascotSize} />
    </span>
  ) : null

  if (props.as === 'button') {
    const { as, variant: v, mascot: m, mascotSize: ms, fullWidth: fw, className: c, ...rest } = props
    void as; void v; void m; void ms; void fw; void c
    return (
      <span className={wrapClass}>
        {peek}
        <button {...rest} className={controlClass} />
      </span>
    )
  }

  const { as, variant: v, mascot: m, mascotSize: ms, fullWidth: fw, className: c, ...rest } = props
  void as; void v; void m; void ms; void fw; void c
  return (
    <span className={wrapClass}>
      {peek}
      <a {...rest} className={controlClass} />
    </span>
  )
}
