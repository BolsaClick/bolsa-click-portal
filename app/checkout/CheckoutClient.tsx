/* eslint-disable react-hooks/exhaustive-deps */

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import PaymentForm from '@/app/components/organisms/PaymentForm'
import { OfferData } from '@/app/interface/interfaces'
import { getPaymentStatus } from '@/app/lib/api/get-payment-paid'
import { UpdateTransaction, updateTransactionStatus } from '@/app/lib/api/patch-payment'
import { postMarketing } from '@/app/lib/api/post-marketing'
import { createPayment } from '@/app/lib/api/post-payment'
import { createStudent } from '@/app/lib/api/post-student'
import { getCourseOffer } from '@/app/lib/api/show-offers'
import { formatCurrency } from '@/utils/fomartCurrency'
import { generatePayload } from '@/utils/payment-payload'
import { studentData } from '@/utils/student-payload'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Bank,
  ChalkboardTeacher,
  GraduationCap,
  Notebook,
} from '@phosphor-icons/react'
import { useQuery } from '@tanstack/react-query'
import { CircleCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import FormCheckout from '../components/organisms/FormCheckout'
import { createStudentCogna } from '../lib/api/post-student-cogna'





const formSchema = z.object({
  email: z
    .string()
    .email('Por favor, informe um email válido.')
    .min(1, 'Email é obrigatório'),
  password: z.string(),
})

type FormSchema = z.infer<typeof formSchema>
const CheckoutClient = () => {
  const navigate = useRouter()

  const { getValues } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [dataRegister, setDataRegister] = useState<any>({})
  const [transactionId, setTransactionId] = useState<any>({})
  const [handleData, setHandleData] = useState<any>({})

  const [paymentConfirmedId, setPaymentConfirmedId] = useState<any>('')

  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'pix'>(
    'credit_card',
  )

  const [transactionDenied, setTransactionDenied] = useState(false)
  const [transactionError, setTransactionError] = useState(false)
  const [transactionDeniedByIssuer, setTransactionDeniedByIssuer] =
    useState(false)

  const [paymentGenerated, setPaymentGenerated] = useState(false)
  const [getQrCodeImage, setGetQrCodeImage] = useState('')
  const [getQrCode, setGetQrCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [course, setCourse] = useState<any>(null)

  useEffect(() => {
    const storedCourse = localStorage.getItem('selectedCourse')
    if (storedCourse) {
      const parsed = JSON.parse(storedCourse)
      const selected = parsed?.selectedCourse || parsed
      setCourse(selected)
    }
  }, [])

  const { data: response } = useQuery({
    queryKey: ['offers', course?.courseId],
    queryFn: () =>
      course
        ? getCourseOffer(
          course.unitCity,
          course.unitState,
          course.courseId,
          course.courseName,
          course.unitId,
          course.modality,
          course.brand,
        )
        : Promise.resolve(null),
    enabled: !!course,
  })

  const turno = course?.classShift || ''
  const modalityFunction = () => {
    let offerData

    switch (course?.modality) {
      case 'Presencial':
        offerData =
          response?.data.shifts?.[turno]?.['Seg à Sex}'] ||
          response?.data.shifts['*']?.['*'] ||
          ({} as OfferData)
        break
      case 'Semipresencial':
        offerData =
          response?.data.shifts?.[turno]?.Sex ||
          response?.data.shifts?.[turno]?.Seg ||
          response?.data.shifts?.[turno]?.Ter ||
          response?.data.shifts?.[turno]?.Qua ||
          response?.data.shifts?.[turno]?.Qui ||
          response?.data.shifts?.[turno]?.Sáb ||
          response?.data.shifts['*']?.['*'] ||
          ({} as OfferData)
        break
      default:
        offerData = response?.data.shifts['*']?.['*'] || ({} as OfferData)
        break
    }

    return offerData
  }
  const handleStudentCogna = async (data: any) => {
    const offerData = modalityFunction()
    studentData(data, offerData)

    try {
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms))
      await delay(2000)
      const studentPayload = studentData(data, offerData)
      await createStudentCogna(studentPayload)
    } catch (error) {
      console.error('Erro ao criar aluno:', error)
      toast.error(
        'Tivemos um problema para realizar sua matricula, tente novamente ou entre em contato com nosso time via WhatsApp!',
      )
    }
  }
  const handleRegisterStudentApi = async (data: any) => {
    const payload: any = {
      name: data.name,
      email: data.email,
      cpf: data.cpf,
      phone: data.phone,
      birthday: data.birthDate,
      rg: data.rg,
      courseId: data.courseId,
      whatsapp_optin: true,
      password: data.password,
      address: data.address,
      address_number: data.addressNumber,
      neighborhood: data.neighbordhood,
      city: data.city,
      state: data.state,
      postal_code: data.cep,
      amount: payToday,
      universitySlugs: [course.brand.toLowerCase()],
    }

    try {
      const response = await createStudent(payload)
      setTransactionId(response.transaction.id)
    } catch (error) {
      console.error('Erro ao criar aluno:', error)
      toast.error(
        'Tivemos um problema para realizar sua matricula, tente novamente ou entre em contato com nosso time via WhatsApp!',
      )
    }
  }

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)

    const combinedData = { ...dataRegister, ...data }
    setPaymentMethod('credit_card')
    const paymentPayload = generatePayload(
      dataRegister,
      course,
      data,
      payToday,
      'credit_card',
    )
    setTransactionDenied(false)
    setTransactionDeniedByIssuer(false)
    setTransactionError(false)

    try {
      const responsePayment = await createPayment(paymentPayload)

      const paymentStatus = responsePayment.data.status

      if (paymentStatus === 'paid') {
        await handleStudentCogna(combinedData)
        const transactionData: UpdateTransaction = {
          transactionId,
          status: paymentStatus,
        }
        await updateTransactionStatus(transactionData)

        navigate.push(
          `/checkout/success?course=${course}&paymentMethod=${paymentMethod}&price=${payToday}&dataRegister${dataRegister}`
        )
        toast.success('Matricula realizado com sucesso!')
      }

      if (paymentStatus === 'failed') {
        setIsSubmitting(false)
        setTransactionDenied(true)
        const transactionData: UpdateTransaction = {
          transactionId,
          status: paymentStatus,
        }
        await updateTransactionStatus(transactionData)
      }
      if (paymentStatus === 'denied_by_issuer') {
        setIsSubmitting(false)
        setTransactionDeniedByIssuer(true)
        const transactionData: UpdateTransaction = {
          transactionId,
          status: paymentStatus,
        }
        await updateTransactionStatus(transactionData)
      }
    } catch (error) {
      setIsSubmitting(false)
      setTransactionError(true)
      console.error('Erro ao processar pagamento:', error)
      toast.error('Ocorreu um erro ao processar o pagamento. Tente novamente.')
    }
  }

  const generatPix = async (data: any) => {
    setIsSubmitting(true)
    if (paymentGenerated) {
      toast.error('Pagamento já realizado. Não é possível gerar outro.')
      return
    }
    setPaymentMethod('pix')
    const paymentPayload = generatePayload(
      dataRegister,
      course,
      data,
      payToday,
      'pix',
    )

    try {
      const responsePaymentPix = await createPayment(paymentPayload)

      const generateQrCode = responsePaymentPix.data.charges[0].last_transaction
      if (generateQrCode) {
        setIsSubmitting(false)
      }
      const showPayment = responsePaymentPix.data.charges[0].id
      setPaymentConfirmedId(showPayment)
      setGetQrCode(generateQrCode.qr_code)
      setGetQrCodeImage(generateQrCode.qr_code_url)

      setPaymentGenerated(true)
    } catch (error) {
      setIsSubmitting(false)

      console.error('Erro ao processar pagamento:', error)
      toast.error('Ocorreu um erro ao processar o pagamento. Tente novamente.')
    } finally {
      if (paymentConfirmedId) {
        fetchUpdates()
      }
    }
  }

  const renderPageData = modalityFunction()

  const handleMarketing = async (data: any) => {
    const payload = {
      email: data.email,
      cpf: data.cpf,
      city: course.unitCity,
      state: course.unitState,
      courseId: course.courseId,
      courseName: course.courseName,
      brand: course.brand,
      modality: course.modality,
      unitId: course.unitId,
      phone: data.phone,
      name: data.name,
      firstName: data.name,
      typeCourse: 'graduacao',
      paid: 'true',
      offerId: course.offerId,
      cep: data.cep,
      channel: 'Portal Bolsa Click'
    }
    try {
      await postMarketing(payload)
    } catch (error) {
      console.error('Erro ao enviar payload:', error)
    }
  }

  const handleNextStep = async (data: any) => {
    setCurrentStep(2)
    setDataRegister((prev: any) => ({ ...prev, ...data }))
    handleMarketing(data)
    setHandleData(data)
    await handleRegisterStudentApi(data)
  }

  const montlyFeeFrom = renderPageData.montlyFeeFrom
  const montlyFeeTo = renderPageData.montlyFeeTo

  const discountPercentage =
    ((montlyFeeFrom - montlyFeeTo) / montlyFeeFrom) * 100

  const economy = montlyFeeFrom * 48

  const fetchUpdates = async () => {
    if (!paymentConfirmedId) {
      return false
    }
    const combinedData = { ...dataRegister, ...handleData }
    let attempts = 0
    const maxAttempts = 2

    try {
      const response = await getPaymentStatus(paymentConfirmedId)
      const hasPaidStatus = response.some((item) => item.status === 'paid')

      if (hasPaidStatus) {
        // Tenta cadastrar até 2 vezes
        while (attempts < maxAttempts) {
          try {
            // Tenta registrar o aluno na API e no Cogna
            await handleStudentCogna(combinedData)

            toast.success('Pagamento realizado com sucesso!')
            navigate.push(
              `/checkout/success?course=${course}&paymentMethod=${paymentMethod}&price=${payToday}&dataRegister${dataRegister}`
            )
            break
          } catch (error) {
            console.error('Erro ao cadastrar aluno:', error)
            attempts++

            if (attempts < maxAttempts) {
              await new Promise((resolve) => setTimeout(resolve, 5000))
            }
          }
        }

        // Após as tentativas de cadastro, navega para a página de sucesso

        return true // Retorna verdadeiro se o pagamento foi confirmado e o cadastro foi realizado
      }
    } catch (error) {
      console.error('Erro ao buscar status do pagamento:', error)
    }

    return false // Se não encontrou "paid" ou não conseguiu cadastrar, retorna falso
  }

  const pollPaymentStatus = () => {
    const interval = setInterval(async () => {
      const isPaid = await fetchUpdates()
      if (isPaid) {
        clearInterval(interval)
      }
    }, 3000)

    return () => clearInterval(interval)
  }

  useEffect(() => {
    if (paymentConfirmedId) {
      const stopPolling = pollPaymentStatus()
      return stopPolling
    }
  }, [paymentConfirmedId])

  
  const payToday = 5
  // const payToday = 19.99 + (renderPageData.montlyFeeTo || 0)

  // 🔁 Limpa localStorage ao sair da página
  useEffect(() => {
    const clearStorage = () => {
      localStorage.removeItem('selectedCourse')
      localStorage.removeItem('selectedPosOffer')
    }

    window.addEventListener('pagehide', clearStorage)
    window.addEventListener('beforeunload', clearStorage)

    return () => {
      window.removeEventListener('pagehide', clearStorage)
      window.removeEventListener('beforeunload', clearStorage)
    }
  }, [])



  return (
    <>

      <div className="md:p-8 p-6 max-w-6xl gap-8 flex flex-col mx-auto">
        <div className="flex flex-col md:flex-row mt-20 gap-8">
          {currentStep === 2 && (
            <>
              <div className="flex  flex-col  md:flex-row w-full bg-white p-6 rounded-lg shadow-md">
                <div className="p-6 pt-4 md:pl-0 md:border-r  flex md:items-start items-center justify-center  flex-col border-gray-200 ">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Conheça seus benefícios
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Com a Bolsa Click você aproveita os melhores descontos e
                    benefícios para realizar o seu sonho de estudar.
                  </p>
                </div>
                <div className="p-6 pt-4 flex w-full justify-center items-start flex-col gap-4">
                  <p className="text-sm text-gray-500 flex items-center gap-2 whitespace-nowrap">
                    <CircleCheck size={18} color="#6b7280" />
                    Economia total de {formatCurrency(economy)}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2 whitespace-nowrap">
                    <CircleCheck size={18} color="#6b7280" />
                    Isenção de 1 mensalidade de{' '}
                    {formatCurrency(renderPageData.montlyFeeFrom)}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2 whitespace-nowrap">
                    <CircleCheck size={18} color="#6b7280" />
                    Mensalidade de
                    <span className="line-through">
                      {formatCurrency(renderPageData.montlyFeeFrom)}
                    </span>
                    por{' '}
                    <span className="font-bold">
                      {formatCurrency(renderPageData.montlyFeeTo)}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex  flex-col md:w-1/2  bg-white p-6 rounded-lg shadow-md">
                <div className="p-6 pt-4 pl-0 flex  justify-center  flex-col border-gray-200 ">
                  <h2 className="text-xl font-semibold text-gray-900">
                    O que você precisa fazer para garantir a bolsa?
                  </h2>
                  <p className="text-sm font-bold text-gray-500 flex justify-between mt-3">
                    Pagar a 1ª mensalidade{' '}
                    <span>{formatCurrency(renderPageData.montlyFeeTo)}</span>
                  </p>
                  <p className="text-sm text-gray-500 flex justify-between mt-3">
                    Taxa de serviço Bolsa Click
                    <span> {formatCurrency('19')}</span>
                  </p>
                  <div className="w-full px-2 mt-3 flex text-gray-900 font-semibold rounded-md py-2 justify-between bg-bolsa-secondary">
                    <p>Valor a pagar hoje</p>
                    <p> {formatCurrency(payToday)}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="bg-white  p-4 md:p-8 rounded-lg shadow-md w-full">
            {currentStep === 1 && (
              <div className="p-6 pt-2 pl-0 border-b border-gray-200 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Dados do Aluno
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Coloque os dados do aluno para realizar a matrícula
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="p-6 pt-2 pl-0 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Pagamento
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Escolha o método de pagamento para finalizar a matrícula
                </p>
              </div>
            )}

            {currentStep === 1 && (
              <FormCheckout
                onSubmit={handleNextStep}
                setEmail={getValues('email')}
                disabled={false}
              />
            )}

            {currentStep === 2 && (
              <PaymentForm
                amount={payToday}
                onSubmit={onSubmit}
                transactionDenied={transactionDenied}
                transactionError={transactionError}
                paymentMethod={paymentMethod}
                generatePix={generatPix}
                codePix={getQrCode}
                imagePix={getQrCodeImage}
                isSubmitting={isSubmitting}
                transactionDeniedByIssuer={transactionDeniedByIssuer}
              />
            )}
          </div>
          <div className="flex  flex-col md:w-1/2 h-1/2 bg-white  p-6 rounded-lg shadow-md">
            <h3 className="text-xl pt-2 font-semibold mb-4 text-gray-900">
              Detalhes do Curso
            </h3>
            <p className="text-gray-700 mb-2">
              Curso: <strong>{renderPageData.course}</strong>
            </p>

            <div className="w-full md:flex-row gap-2 flex-col flex justify-between md:items-center">
              <div className="md:w-1/2">
                <span>Valor da mensalidade:</span>
              </div>
              <div className="flex flex-col md:items-end justify-end md:text-end ">
                <div className="bg-green-100 text-green-700 px-2 items-start text-sm w-full rounded-md border-1 border-green-500 md:text-end whitespace-nowrap">
                  <span className="font-bold">
                    {discountPercentage.toFixed(1)}% de desconto
                  </span>
                </div>
                <span className="font-bold text-xl">
                  {formatCurrency(renderPageData.montlyFeeTo)}
                </span>
              </div>
            </div>
            <div className="flex mt-10  text-zinc-500 w-full flex-col">
              <div className="w-full flex-row flex items-center gap-2">
                <GraduationCap size={24} />
                <span className="capitalize">
                  {renderPageData?.brand?.toLocaleLowerCase()}
                </span>
              </div>
              <div className="w-full flex-row flex items-center gap-2">
                <ChalkboardTeacher size={24} />
                <span>
                  {renderPageData.modality === 'Presencial'
                    ? 'Presencial'
                    : renderPageData.modality === 'Semipresencial'
                      ? 'Semipresencial'
                      : 'EAD/Online'}
                </span>
              </div>
              {/* // colocar o turno aqui com (em breve)
                    {renderPageData.shift} -{' '} */}

              <div className="w-full flex-row flex items-center gap-2">
                <Notebook size={24} />
                <span>
                  {renderPageData.weekday === 'Seg à Sex}'
                    ? 'Segunda-Feira à Sexta-Feira'
                    : renderPageData.weekday === 'Sex'
                      ? 'Sexta-Feira'
                      : renderPageData.weekday === 'Sáb'
                        ? 'Sábado'
                        : renderPageData.weekday === 'Seg'
                          ? 'Segunda-Feira'
                          : renderPageData.weekday === 'Ter'
                            ? 'Terça-Feira'
                            : renderPageData.weekday === 'Qua'
                              ? 'Quarta-Feira'
                              : renderPageData.weekday === 'Qui'
                                ? 'Quinta-Feira'
                                : 'Faça o seu horário de estudo'}
                </span>
              </div>
              <div className="w-full flex-row flex items-center gap-2">
                <Bank size={24} />
                <span className="capitalize">
                  {renderPageData.unit
                    ?.replace('/', ', ')
                    ?.toLowerCase()
                    ?.replace(/^./, (match) => match.toUpperCase())
                    ?.replace(
                      /,\s*(\w{2})/,
                      (p1) => `, ${p1.toUpperCase()}`,
                    )}{' '}
                </span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              * Este desconto é válido para todas as mensalidades, exceto
              rematrículas e dependências.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default CheckoutClient
