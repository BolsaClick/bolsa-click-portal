/**
 * Inscription / checkout routes where a fixed cookie banner must not cover
 * the 3-step form CTAs. Cover every rail — not only `/checkout/estacio`.
 */
const INSCRIPTION_PREFIXES = ['/checkout', '/matricula']

export function isInscriptionRoute(pathname: string | null | undefined): boolean {
  const candidates = [pathname]
  if (typeof window !== 'undefined') {
    candidates.push(window.location.pathname)
  }

  return candidates.some((raw) => {
    if (!raw) return false
    const path = raw.split('?')[0].toLowerCase()
    return INSCRIPTION_PREFIXES.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    )
  })
}
