export type Modalidade = 'EAD' | 'PRESENCIAL' | 'SEMIPRESENCIAL'

export const MODALIDADES: { value: Modalidade; label: string }[] = [
  { value: 'EAD', label: 'EAD (a distância)' },
  { value: 'PRESENCIAL', label: 'Presencial' },
  { value: 'SEMIPRESENCIAL', label: 'Semipresencial' },
]

export const UFS: string[] = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO',
]
