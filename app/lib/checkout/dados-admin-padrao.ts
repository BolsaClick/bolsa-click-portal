/**
 * Dados administrativos padrão exigidos pelo payload de inscrição da Cogna,
 * mas fora da captação mínima (nome, CPF, nascimento, telefone, e-mail). São
 * válidos em FORMATO — a Cogna valida formato, não conteúdo, e confirma os
 * dados reais do candidato na matrícula efetiva (mesmo acordo usado no
 * checkout principal, ver app/checkout/matricula/page.tsx).
 *
 * NUNCA enviar estes valores ao CRM (Attio) — só ao payload de inscrição da
 * Cogna/Tartarus.
 */
export const DADOS_ADMIN_PADRAO = {
  rg: '000000000',
  gender: 'masculino' as const,
  schoolYear: '2020',
  address: 'Avenida Paulista',
  addressNumber: '1000',
  neighborhood: 'Bela Vista',
  cep: '01310100',
  state: 'SP',
  city: 'São Paulo',
}
