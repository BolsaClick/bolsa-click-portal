export const business = {
  legalName: process.env.NEXT_PUBLIC_LEGAL_NAME ?? '',
  // CNPJ é dado público de registro — fallback hardcoded garante exibição no
  // footer + taxID no Organization schema sem depender de env na infra.
  cnpj: process.env.NEXT_PUBLIC_CNPJ ?? '57.554.723/0001-50',
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? '',
  supportEmail: 'contato@bolsaclick.com.br',
  address: {
    street: 'Av. Paulista, 1106',
    locality: 'São Paulo',
    region: 'SP',
    postalCode: '01310-914',
    country: 'BR',
  },
} as const

export const hasLegalIdentity = Boolean(business.legalName && business.cnpj)
