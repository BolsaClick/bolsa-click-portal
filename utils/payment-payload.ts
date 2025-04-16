/* eslint-disable @typescript-eslint/no-explicit-any */
export const generatePayload = (
  dataRegister: any,
  course: any,
  data: any,
  payToday: number,
  paymentType: 'credit_card' | 'pix',
) => {
  const [month, year] = data?.expDate ? data.expDate.split('/') : ['01', '2025']
  const expMonth = parseInt(month, 10)
  const expYear = parseInt(year, 10)

  const cepFormatado = dataRegister?.cep
    ? dataRegister.cep.replace(/\D/g, '')
    : '00000000'
  const cpfFormatado = dataRegister?.cpf
    ? dataRegister.cpf.replace(/\D/g, '')
    : '00000000000'

  const ddd = dataRegister?.phone ? dataRegister.phone.slice(0, 2) : '00'
  const numero = dataRegister?.phone ? dataRegister.phone.slice(2) : '000000000'

  const amountToSend = Math.max(1, Math.round(Number(payToday) * 100))

  const payments = []

  if (paymentType === 'credit_card') {
    payments.push({
      payment_method: 'credit_card',
      credit_card: {
        recurrence: false,
        installments: data?.installments || 1,
        statement_descriptor: 'AVENGERS',
        card: {
          number: data?.cardNumber || '0000000000000000',
          holder_name: data?.name || 'Titular não informado',
          exp_month: expMonth,
          exp_year: expYear,
          cvv: data?.cvv || '000',
          billing_address: {
            line_1: dataRegister?.address || 'Endereço não informado',
            zip_code: cepFormatado,
            city: dataRegister?.city || 'Cidade não informada',
            state: dataRegister?.state || 'Estado não informado',
            country: 'BR',
          },
        },
      },
    })
  } else if (paymentType === 'pix') {
    payments.push({
      payment_method: 'pix',
      pix: {
        expires_in: '3600',
        additional_information: [
          {
            name: 'information',
            value: 'number',
          },
        ],
      },
    })
  }

  return {
    customer: {
      name: dataRegister?.name || 'Nome não informado',
      email: dataRegister?.email || 'email@naoinformado.com',
      type: 'individual',
      document: cpfFormatado,
      phones: {
        mobile_phone: {
          country_code: '55',
          area_code: ddd,
          number: numero,
        },
      },
    },
    shipping: {
      address: {
        line_1: dataRegister?.address || 'Endereço não informado',
        city: dataRegister?.city || 'Cidade não informada',
        state: dataRegister?.state || 'Estado não informado',
        country: 'BR',
        zip_code: cepFormatado,
      },
      amount: 100,
      description: course?.courseName || 'Curso não informado',
      recipient_name: dataRegister?.name || 'Nome não informado',
      recipient_phone: dataRegister?.phone || '000000000',
    },
    items: [
      {
        amount: amountToSend,
        description: course?.courseName || 'Curso não informado',
        quantity: 1,
        code: course?.courseId || 'ID do curso não informado',
      },
    ],
    payments, // Adiciona o pagamento com base no tipo selecionado
  }
}
