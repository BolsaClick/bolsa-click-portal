export const formatCurrency = (value: number | string): string => {
  const numericValue = Number(value)

  if (isNaN(numericValue)) {
    return 'R$ 0,00'
  }

  const valueWith99 = Math.floor(numericValue) + 0.99

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueWith99)
}
