/**
 * Adaptadores de payload por parceiro.
 *
 * O formulário do candidato é um só (`candidate.ts`, 5 campos). O que muda
 * entre Cogna e Estácio fica AQUI, não no formulário: formato da data, nomes
 * dos campos e o que cada parceiro exige além da captação mínima.
 *
 * Funções puras — sem React, sem estado — para serem testadas e para que o
 * payload montado na tela seja exatamente o que o servidor guarda e envia.
 */
import { buildInscriptionPayload } from '@/app/lib/api/create-inscription'
import type { OfferDetails } from '@/app/lib/api/get-offer-details'
import type { CreateEnrollmentInput } from '@/app/lib/api/athena-offers'
import { DADOS_ADMIN_PADRAO } from './dados-admin-padrao'
import { birthDateToIso, type CandidateData } from './candidate'
import { CEP_ADDRESS_FIELDS, type CepAddressField, type CepLookupResult } from './viacep'

// ─── Cogna (Tartarus) ────────────────────────────────────────────────────────

type CognaPaymentMethod = { id: string; dueDay: string; voucher?: string; voucherId?: number }

/**
 * Payload de inscrição da Cogna. O MESMO nos dois caminhos — inscrição direta
 * (sem cobrança) e blob guardado na cobrança — porque uma divergência aqui só
 * apareceria como recusa da Cogna depois de o aluno já ter pago.
 *
 * Os campos administrativos vão com DADOS_ADMIN_PADRAO: acordo explícito com a
 * Cogna, que valida FORMATO e confirma os dados reais na matrícula efetiva.
 */
export function buildCognaInscriptionPayload(
  data: CandidateData,
  offer: OfferDetails,
  selectedIngressType: 'ENEM' | 'VESTIBULAR',
  paymentMethod: CognaPaymentMethod | undefined,
) {
  return buildInscriptionPayload(
    {
      // Capturados de verdade no formulário (captação mínima).
      name: data.name,
      cpf: data.cpf,
      birthDate: data.birthDate,
      email: data.email,
      phone: data.phone,
      // Administrativos NÃO capturados — valor padrão válido em formato;
      // a Cogna confirma os dados reais na matrícula efetiva.
      gender: DADOS_ADMIN_PADRAO.gender,
      schoolYear: DADOS_ADMIN_PADRAO.schoolYear,
      rg: DADOS_ADMIN_PADRAO.rg,
      address: DADOS_ADMIN_PADRAO.address,
      addressNumber: DADOS_ADMIN_PADRAO.addressNumber,
      neighborhood: DADOS_ADMIN_PADRAO.neighborhood,
      city: DADOS_ADMIN_PADRAO.city,
      state: DADOS_ADMIN_PADRAO.state,
      cep: DADOS_ADMIN_PADRAO.cep,
    },
    {
      dmhId: offer.dmhId,
      businessKey: offer.businessKey,
      dmhSource: offer.dmhSource,
      academicLevel: offer.academicLevel,
      // Graduação: usar tipo de ingresso selecionado (ENEM ou VESTIBULAR)
      // Pós-graduação: manter ingressType original da oferta
      ingressType: offer.academicLevel === 'GRADUACAO'
        ? [selectedIngressType]
        : offer.ingressType,
      schedules: offer.schedules,
      shift: offer.shift,
    },
    paymentMethod,
  )
}

/** Dados do candidato no formato do marketplace ATHENAS (Cogna). */
export function buildCognaMarketplaceData(
  data: CandidateData,
  selectedIngressType: 'ENEM' | 'VESTIBULAR',
) {
  return {
    // Capturados de verdade no formulário (captação mínima).
    name: data.name,
    cpf: data.cpf,
    email: data.email,
    phone: data.phone,
    birthDate: data.birthDate,
    // Administrativos NÃO capturados — valor padrão válido em formato; a Cogna
    // confirma os dados reais na matrícula efetiva.
    rg: DADOS_ADMIN_PADRAO.rg,
    gender: DADOS_ADMIN_PADRAO.gender,
    cep: DADOS_ADMIN_PADRAO.cep,
    address: DADOS_ADMIN_PADRAO.address,
    addressNumber: DADOS_ADMIN_PADRAO.addressNumber,
    neighborhood: DADOS_ADMIN_PADRAO.neighborhood,
    city: DADOS_ADMIN_PADRAO.city,
    state: DADOS_ADMIN_PADRAO.state,
    ingressType: selectedIngressType,
    schoolYear: DADOS_ADMIN_PADRAO.schoolYear,
    acceptTerms: true,
    acceptEmail: true,
    acceptSms: true,
    acceptWhatsapp: true,
  }
}

// ─── Estácio (Athena / YDUQS) ────────────────────────────────────────────────

/**
 * Endereço da Estácio: SEMPRE o real do candidato. Nunca DADOS_ADMIN_PADRAO.
 *
 * Parece a mesma situação da Cogna — e quem chegar aqui vai ter a mesma ideia
 * de mandar a Av. Paulista fixa para cortar campo. Não é a mesma situação:
 *
 *  1. O DADOS_ADMIN_PADRAO da Cogna é um ACORDO com a Cogna (o parceiro
 *     autorizou explicitamente) e foi validado com uma inscrição real (HTTP
 *     201). Não existe acordo nem teste equivalente com a YDUQS.
 *  2. A Athena consome o CONTEÚDO do endereço, não só o formato: ela resolve
 *     `codigoMunicipio` e `codigoBairro` A PARTIR DO CEP (ver AthenaAddress em
 *     athena-offers.ts). Endereço fixo mandaria o candidato de Recife como
 *     morador da Paulista, com município e bairro errados.
 *  3. A inscrição da Estácio gera na hora a cobrança da matrícula (boleto/PIX),
 *     e boleto registrado usa o endereço do pagador.
 *  4. A YDUQS recusa por conteúdo: MS002 = "não aceitou alguns dos dados
 *     informados".
 *
 * Endereço fixo aqui não é atrito a menos, é inscrição quebrada. Regra (CEO,
 * 2026-10-10): nunca estender DADOS_ADMIN_PADRAO para campo cujo CONTEÚDO o
 * parceiro consome.
 *
 * O que dá para fazer — e é o que o checkout faz — é pedir só CEP + número e
 * deixar o ViaCEP preencher o resto (ver viacep.ts e `estacioVisibleAddressFields`).
 */
export interface EstacioAddress {
  zipCode: string
  number: string
  street: string
  neighborhood: string
  city: string
  state: string
}

export interface EstacioIngresso {
  codFormaIngresso: number
  graduationYear?: string
  acceptTerms: boolean
}

/** codFormaIngresso do Vestibular (ENEM) — o único que exige `useEnem`. */
export const CODIGO_VESTIBULAR_ENEM = 7
/** Pós-graduação/técnico: forma de ingresso fixa, sem escolha do candidato. */
export const CODIGO_INSCRICAO_POS_TECNICO = 15

/**
 * Body de POST /api/enrollments da Athena a partir do formulário único.
 *
 * `gender` e `rg` NÃO vão: são opcionais no CreateEnrollmentDto (AthenaStudent)
 * e o checkout já os mandava vazios quando o candidato não preenchia (7 de 30
 * leads sem RG, 3 sem gênero, ago–out/2026). Não inventamos valor para eles.
 */
export function buildAthenaEnrollment(input: {
  offerId: string
  academicLevel?: string
  candidate: CandidateData
  address: EstacioAddress
  ingresso: EstacioIngresso
}): CreateEnrollmentInput {
  const { candidate, address, ingresso } = input
  return {
    offerId: input.offerId,
    student: {
      name: candidate.name.trim(),
      cpf: candidate.cpf.replace(/\D/g, ''),
      email: candidate.email.trim(),
      mobile: candidate.phone.replace(/\D/g, ''),
      birthDate: birthDateToIso(candidate.birthDate),
    },
    address: {
      street: address.street.trim(),
      number: address.number.trim(),
      neighborhood: address.neighborhood.trim(),
      zipCode: address.zipCode.replace(/\D/g, ''),
      state: address.state.trim().toUpperCase(),
      city: address.city.trim(),
    },
    options: {
      useEnem: ingresso.codFormaIngresso === CODIGO_VESTIBULAR_ENEM,
      graduationYear: ingresso.graduationYear ? Number(ingresso.graduationYear) : undefined,
      acceptTerms: ingresso.acceptTerms,
      codFormaIngresso:
        input.academicLevel === 'POS_GRADUACAO'
          ? CODIGO_INSCRICAO_POS_TECNICO
          : ingresso.codFormaIngresso,
      // Sem checkbox individual pro candidato (decisão do Rodrigo,
      // 2026-07-23) — coberto pelo aceite geral dos termos.
      acceptReceiveEmail: true,
      acceptReceiveSMS: true,
      acceptReceiveWhatsApp: true,
    },
  }
}

export type EstacioAddressField = 'zipCode' | 'number' | CepAddressField

/**
 * Campos de endereço que o candidato da Estácio VÊ e precisa digitar.
 *
 * CEP e número sempre. Logradouro, bairro, cidade e UF só aparecem quando o
 * ViaCEP não os entregou: falhou (timeout, rede, CEP inexistente) → os quatro;
 * CEP geral de cidade pequena (logradouro/bairro vazios) → só os vazios.
 * Antes da consulta terminar (`lookup` null) nada além de CEP + número.
 */
export function estacioVisibleAddressFields(
  lookup: CepLookupResult | null,
): EstacioAddressField[] {
  const base: EstacioAddressField[] = ['zipCode', 'number']
  if (!lookup) return base
  if (!lookup.ok) {
    return lookup.reason === 'invalid' ? base : [...base, ...CEP_ADDRESS_FIELDS]
  }
  return [...base, ...lookup.missing]
}

/** Primeiro problema do endereço, em frase para a tela — ou null se completo. */
export function estacioAddressError(address: EstacioAddress): string | null {
  if (address.zipCode.replace(/\D/g, '').length !== 8) return 'CEP inválido.'
  if (!address.number.trim()) return 'Informe o número.'
  if (!address.street.trim()) return 'Informe o logradouro.'
  if (!address.neighborhood.trim()) return 'Informe o bairro.'
  if (!address.city.trim()) return 'Informe a cidade.'
  if (!/^[A-Za-z]{2}$/.test(address.state.trim())) return 'Informe o estado (UF).'
  return null
}
