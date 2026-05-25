/**
 * Calendário sazonal de programas de estudo 2026.
 *
 * REGRAS:
 * - Datas vindas de editais oficiais (MEC, INEP, FNDE). Nunca inventar.
 * - Quando edital ainda não foi publicado, marcar `status: 'PREVISTO'`.
 * - Revisar trimestralmente (mar, jun, set, dez) ou quando MEC publicar
 *   edital novo. Última revisão: 2026-05-25.
 *
 * Fonte 2026.1 (já encerrado): https://acessounico.mec.gov.br
 * Fonte ENEM 2026: https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem
 */

export type CalendarFase =
  | 'INSCRICAO'
  | 'PROVA'
  | 'RESULTADO_1A_CHAMADA'
  | 'RESULTADO_2A_CHAMADA'
  | 'LISTA_ESPERA'
  | 'MATRICULA'

export type CalendarStatus = 'PREVISTO' | 'CONFIRMADO'

export interface CalendarEvent {
  id: string
  programa: string
  programaSlug: string
  fase: CalendarFase
  faseLabel: string
  startDate: string // ISO YYYY-MM-DD
  endDate: string // ISO YYYY-MM-DD
  status: CalendarStatus
  sourceUrl: string
  organizer: 'MEC' | 'INEP' | 'FNDE' | 'Faculdade parceira'
  notes?: string
}

// Datas oficiais MEC/INEP/FNDE. Edital 2026.2 oficial sai entre jun-jul/2026
// — atualizar status: 'CONFIRMADO' e ajustar dias exatos quando publicado.
export const CALENDARIO_2026: CalendarEvent[] = [
  {
    id: 'prouni-2026-2-inscricao',
    programa: 'ProUni',
    programaSlug: 'prouni',
    fase: 'INSCRICAO',
    faseLabel: 'Inscrições 2ª edição',
    startDate: '2026-07-13',
    endDate: '2026-07-16',
    status: 'PREVISTO',
    sourceUrl: 'https://acessounico.mec.gov.br/prouni',
    organizer: 'MEC',
    notes: 'Janela típica do edital 2ª edição (jul). Datas exatas dependem da publicação do edital pelo MEC.',
  },
  {
    id: 'prouni-2026-2-1a-chamada',
    programa: 'ProUni',
    programaSlug: 'prouni',
    fase: 'RESULTADO_1A_CHAMADA',
    faseLabel: 'Resultado 1ª chamada',
    startDate: '2026-07-21',
    endDate: '2026-07-21',
    status: 'PREVISTO',
    sourceUrl: 'https://acessounico.mec.gov.br/prouni',
    organizer: 'MEC',
  },
  {
    id: 'prouni-2026-2-2a-chamada',
    programa: 'ProUni',
    programaSlug: 'prouni',
    fase: 'RESULTADO_2A_CHAMADA',
    faseLabel: 'Resultado 2ª chamada',
    startDate: '2026-08-18',
    endDate: '2026-08-18',
    status: 'PREVISTO',
    sourceUrl: 'https://acessounico.mec.gov.br/prouni',
    organizer: 'MEC',
  },
  {
    id: 'prouni-2026-2-lista-espera',
    programa: 'ProUni',
    programaSlug: 'prouni',
    fase: 'LISTA_ESPERA',
    faseLabel: 'Lista de espera — manifestação de interesse',
    startDate: '2026-09-08',
    endDate: '2026-09-09',
    status: 'PREVISTO',
    sourceUrl: 'https://acessounico.mec.gov.br/prouni',
    organizer: 'MEC',
    notes: 'Janela curta — apenas 2 dias úteis pra manifestar interesse na lista de espera.',
  },
  {
    id: 'fies-2026-2-inscricao',
    programa: 'FIES',
    programaSlug: 'fies',
    fase: 'INSCRICAO',
    faseLabel: 'Inscrições 2ª edição',
    startDate: '2026-08-04',
    endDate: '2026-08-07',
    status: 'PREVISTO',
    sourceUrl: 'https://acessounico.mec.gov.br/fies',
    organizer: 'FNDE',
  },
  {
    id: 'enem-2026-inscricao',
    programa: 'ENEM',
    programaSlug: 'enem',
    fase: 'INSCRICAO',
    faseLabel: 'Inscrições ENEM 2026',
    startDate: '2026-05-26',
    endDate: '2026-06-06',
    status: 'PREVISTO',
    sourceUrl: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem',
    organizer: 'INEP',
    notes: 'Janela típica de inscrição ENEM (final de mai/início de jun). Confirmar edital INEP.',
  },
  {
    id: 'enem-2026-prova-1',
    programa: 'ENEM',
    programaSlug: 'enem',
    fase: 'PROVA',
    faseLabel: '1º dia de prova',
    startDate: '2026-11-08',
    endDate: '2026-11-08',
    status: 'PREVISTO',
    sourceUrl: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem',
    organizer: 'INEP',
  },
  {
    id: 'enem-2026-prova-2',
    programa: 'ENEM',
    programaSlug: 'enem',
    fase: 'PROVA',
    faseLabel: '2º dia de prova',
    startDate: '2026-11-15',
    endDate: '2026-11-15',
    status: 'PREVISTO',
    sourceUrl: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem',
    organizer: 'INEP',
  },
  {
    id: 'vestibular-agendado-2026-continuo',
    programa: 'Vestibular agendado',
    programaSlug: 'sem-enem',
    fase: 'MATRICULA',
    faseLabel: 'Matrícula aberta o ano inteiro',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    status: 'CONFIRMADO',
    sourceUrl: 'https://www.bolsaclick.com.br/sem-enem',
    organizer: 'Faculdade parceira',
    notes: 'Faculdades parceiras (Anhanguera, Unopar, Pitágoras, Ampli, Unime) mantêm vestibular online sem ENEM aberto continuamente.',
  },
]

export type CalendarBucket = 'ABERTAS' | 'PROXIMAS_90_DIAS' | 'FUTURAS'

export interface ClassifiedEvent extends CalendarEvent {
  bucket: CalendarBucket
  daysUntilStart: number
}

/**
 * Classifica eventos em buckets baseado em uma data de referência.
 * - ABERTAS: hoje está entre startDate e endDate
 * - PROXIMAS_90_DIAS: startDate é entre 1 e 90 dias no futuro
 * - FUTURAS: startDate é > 90 dias no futuro
 * Eventos já encerrados são filtrados.
 */
export function classifyEvents(
  events: CalendarEvent[],
  referenceDate: Date = new Date(),
): ClassifiedEvent[] {
  const refMs = referenceDate.getTime()
  const day = 24 * 60 * 60 * 1000

  return events
    .map(ev => {
      const start = new Date(ev.startDate + 'T00:00:00Z').getTime()
      const end = new Date(ev.endDate + 'T23:59:59Z').getTime()
      const daysUntilStart = Math.ceil((start - refMs) / day)

      let bucket: CalendarBucket | null = null
      if (refMs >= start && refMs <= end) bucket = 'ABERTAS'
      else if (refMs < start && daysUntilStart <= 90) bucket = 'PROXIMAS_90_DIAS'
      else if (refMs < start) bucket = 'FUTURAS'

      return bucket ? { ...ev, bucket, daysUntilStart } : null
    })
    .filter((e): e is ClassifiedEvent => e !== null)
    .sort((a, b) => a.daysUntilStart - b.daysUntilStart)
}
