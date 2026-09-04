/**
 * Wrappers CLIENT-SIDE (`'use client'`-safe) para as 5 chamadas do checkout
 * de matrícula que antes iam direto do navegador pro Tartarus BFF, sem
 * autenticação nenhuma (achado 3.1.6 do SECURITY_AUDIT.md — CRITICAL).
 *
 * Cada função aqui tem a MESMA assinatura e o MESMO tipo de retorno da
 * função equivalente em `app/lib/api/*` (que continua existindo e agora só
 * roda no servidor, dentro de `app/api/checkout/matricula/*`). O componente
 * client (`app/checkout/matricula/page.tsx`) troca só o import — nenhuma
 * lógica de negócio muda de lugar.
 *
 * As rotas de servidor são proxies transparentes: repassam o status HTTP e o
 * corpo EXATOS que o Tartarus devolve (ver `tartarusErrorResponse`). Por
 * isso `createInscription`/`validateVoucher` aqui continuam lançando
 * AxiosError com `.response.status`/`.response.data` idênticos ao que
 * lançavam chamando o Tartarus direto — `getCognaErrorMessage`/
 * `getCognaErrorDetails` (importadas de `app/lib/api/create-inscription`,
 * inalteradas) continuam funcionando sem nenhuma mudança.
 */
import axios from 'axios'
import type { OfferDetails } from './get-offer-details'
import type {
  CreateInscriptionRequest,
  CreateInscriptionResponse,
  CanCreateInscriptionResponse,
} from './create-inscription'
import type { MarketplaceInscriptionData } from './create-inscription-marketplace'
import type { ValidateVoucherResult } from './validate-voucher'

const checkoutProxy = axios.create({
  baseURL: '/api/checkout/matricula',
  headers: { 'Content-Type': 'application/json' },
})

/** Proxy de `getOfferDetails` (cogna/courses/details). */
export async function getOfferDetails(
  groupId: string,
  shift: string,
  modality: string,
  unitId: string,
): Promise<OfferDetails> {
  const { data } = await checkoutProxy.get<OfferDetails>('/offer-details', {
    params: { groupId, shift, modality, unitId },
  })
  return data
}

/** Proxy de `canCreateInscription` (cogna/courses/can-create-inscription). */
export async function canCreateInscription(
  cpf: string,
  idDMH: string,
  system: string = 'DC',
): Promise<CanCreateInscriptionResponse> {
  const { data } = await checkoutProxy.get<CanCreateInscriptionResponse>('/can-create-inscription', {
    params: { cpf, idDMH, system },
  })
  return data
}

/** Proxy de `createInscription` (cogna/courses/create-inscription). */
export async function createInscription(
  inscriptionData: CreateInscriptionRequest,
  promoterId: string,
  system: string = 'DC',
): Promise<CreateInscriptionResponse> {
  const { data } = await checkoutProxy.post<CreateInscriptionResponse>('/create-inscription', {
    inscriptionData,
    promoterId,
    system,
  })
  return data
}

/** Proxy de `createMarketplaceInscription` (cogna/courses/create-inscription-marketplace). */
export async function createMarketplaceInscription(
  formData: MarketplaceInscriptionData,
  offerDetails: OfferDetails,
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  const { data } = await checkoutProxy.post('/create-inscription-marketplace', {
    formData,
    offerDetails,
  })
  return data
}

/** Proxy de `validateVoucher` (cogna/courses/validate-voucher). */
export async function validateVoucher(
  voucher: string,
  cpf: string,
  paymentPlanId: string,
): Promise<ValidateVoucherResult> {
  const { data } = await checkoutProxy.post<ValidateVoucherResult>('/validate-voucher', {
    voucher,
    cpf,
    paymentPlanId,
  })
  return data
}
