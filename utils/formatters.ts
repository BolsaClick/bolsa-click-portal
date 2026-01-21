export const formatCPF = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1')

export const formatPhone = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{4,5})(\d{4})$/, '$1-$2')

export const formatCEP = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1')

export const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, '')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})(\d)/, '$1 $2')
    .replace(/(\d{4})\d+?$/, '$1')

export const formatExpiry = (value: string) =>
  value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').replace(/(\/\d{2})\d+?$/, '$1')

 export const formatCurrency = (value: any) => {
    const valueWith99 = Math.floor(value) + 0.99
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valueWith99)
  }


  export function generateYears(yearsBack = 25): string[] {
  const current = new Date().getFullYear()
  const arr: string[] = []
  for (let i = 0; i < yearsBack; i++) {
    arr.push(String(current - i))
  }
  return arr
}


export const toCents = (valueInReais: number | undefined | null) => {
  const v = Number(valueInReais) || 0
  return Math.round(v * 100)
}