// Função para aplicar máscara de CPF
export const maskCPF = (value: string) => {
  const cleanValue = value.replace(/\D/g, '')
  if (cleanValue.length > 11) return cleanValue.slice(0, 11)
  return cleanValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

export const maskTelefone = (value: string) => {
  const cleanValue = value.replace(/\D/g, '')
  if (cleanValue.length > 11) return cleanValue.slice(0, 11)
  return cleanValue
    .replace(/^(\d{2})(\d)/, '($1)$2')
    .replace(/(\d)(\d{4})$/, '$1 $2')
    .replace(/(\d{5})(\d{4})$/, '$1-$2')
}
