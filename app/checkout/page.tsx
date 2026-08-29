import { redirect } from 'next/navigation'

/**
 * Bare `/checkout` 404'd (no page) while cards and old links still pointed
 * here. That error surface sits outside the checkout layout, so the cookie
 * banner came back. Forward to the Cogna inscription rail with the same query.
 */
export default async function CheckoutIndex({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string' && value) qs.set(key, value)
  }
  const suffix = qs.toString()
  redirect(suffix ? `/checkout/matricula?${suffix}` : '/curso/resultado')
}
