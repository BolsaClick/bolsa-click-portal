/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { z } from 'zod'
import Link from 'next/link'
import {
  Bank,
  ChalkboardTeacher,
  GraduationCap,
  Notebook,
} from '@phosphor-icons/react'

import { createStudentCognaPos } from '@/app/lib/api/post-student-cogna-pos'
import { getPosOffer } from '@/app/lib/api/show-pos'
import FormCheckout from '@/app/components/organisms/FormCheckout'

const formSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string(),
})

type FormSchema = z.infer<typeof formSchema>

const PosCheckout = () => {
  const { getValues } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  })

  const [step, setStep] = useState<'form' | 'success'>('form')
  const [course, setCourse] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCourse = localStorage.getItem('selectedPosOffer')
      if (storedCourse) {
        setCourse(JSON.parse(storedCourse))
      }
    }
  }, [])

  const { data: response, isLoading } = useQuery({
    queryKey: ['offers', course?.id],
    queryFn: () => (course ? getPosOffer(course.id) : Promise.resolve(null)),
    enabled: !!course?.id,
  })

  const plans = response || []

  const onSubmit = async (formData: any) => {
    const selectedPlan = plans.find((p: any) => String(p.id) === formData.plan)
    if (!selectedPlan) {
      toast.error('Plano de pagamento não selecionado.')
      return
    }

    const cleanCpf = formData.cpf.replace(/\D/g, '')
    const cleanBirthDate = formData.birthDate.replace(/-/g, '/')

    const studentData = {
      dadosPessoais: {
        nome: formData.name,
        rg: '40000000',
        sexo: formData.gender === 'masculino' ? 'M' : 'F',
        cpf: cleanCpf,
        celular: formData.phone,
        dataNascimento: cleanBirthDate,
        email: formData.email,
        necessidadesEspeciais: [],
        endereco: {
          bairro: formData.neighbordhood,
          cep: formData.cep,
          complemento: '',
          logradouro: formData.address,
          municipio: formData.city,
          numero: parseInt(formData.addressNumber, 10),
          uf: formData.state,
        },
      },
      inscricao: {
        aceiteTermo: true,
        voucher: '',
        courseOffer: {
          id: course.id,
          brand: course.brand?.toLowerCase() || 'platos',
          offerBrand: course.offerBrand,
          unit: course.unitName,
          unitAddress: course.unitAddress || '',
          modality: course.modality,
          course: course.courseName,
          courseId: course.courseId,
          type: 'graduate',
        },
        paymentPlan: {
          id: String(selectedPlan.id),
          installmentPrice: selectedPlan.installmentValue,
          label: `${selectedPlan.numberOfInstallments}X de R$ ${Number(
            selectedPlan.installmentValue,
          )
            .toFixed(2)
            .replace('.', ',')}`,
        },
        receberEmail: false,
        receberSMS: false,
        receberWhatsApp: formData.whatsapp,
      },
      promoterId: '6716698cb4d33b0008a18001',
      idSalesChannel: 88,
      canal: 'web',
      trackId: '',
    }

    try {
      await createStudentCognaPos(studentData)
      toast.success('Matrícula realizada com sucesso!')
      setStep('success')
    } catch (error) {
      console.error('Erro ao criar aluno:', error)
      toast.error(
        'Tivemos um problema para realizar sua matrícula. Tente novamente ou fale com a gente no WhatsApp.',
      )
    }
  }

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
    <div className="md:p-8 p-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row mt-10 gap-8">
        <div className="bg-white p-4 md:p-8 rounded-lg shadow-md w-full">
          {step === 'form' ? (
            <>
              <h3 className="text-lg font-semibold mb-4">Dados do Aluno</h3>
              {isLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                  <div className="h-12 bg-gray-200 rounded w-full mt-2" />
                </div>
              ) : (
                <FormCheckout
                  onSubmit={onSubmit}
                  setEmail={getValues('email')}
                  isPostGraduation={true}
                  plans={plans}
                />
              )}
            </>
          ) : (
            <div className="text-center px-4 sm:px-6 lg:px-8 py-16">
              <h2 className="text-2xl font-bold text-green-600">
                Matrícula realizada com sucesso!
              </h2>
              <div className="mt-8 p-4 sm:p-6 border rounded-lg shadow-lg bg-gray-50 max-w-2xl mx-auto">
                <h2 className="text-lg font-semibold text-bolsa-secondary">
                  Atenção para os próximos passos!
                </h2>
                <p className="mt-3 text-gray-700">
                  Acompanhe sua inscrição diretamente no site da Anhanguera.
                </p>
                <Link
                  href="https://www.anhanguera.com/area-do-candidato/login"
                  target="_blank"
                  className="mt-6 inline-block bg-bolsa-secondary text-white px-5 py-3 rounded-full hover:bg-bolsa-secondary transition-colors"
                >
                  Acompanhar minha inscrição
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Detalhes do Curso */}
        <div className="flex flex-col md:w-1/2 bg-white p-6 rounded-lg shadow-md">
          {isLoading || !course ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-20 bg-gray-200 rounded mt-4" />
            </div>
          ) : (
            <>
              <h3 className="text-xl font-semibold mb-4">Detalhes do Curso</h3>
              <p className="text-gray-700 mb-2">
                Curso: <strong>{course.courseName}</strong>
              </p>

              <div className="flex text-zinc-500 flex-col gap-2 mt-4">
                <div className="flex items-center gap-2">
                  <GraduationCap size={24} />
                  <span className="capitalize">{course.offerBrand?.toLowerCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChalkboardTeacher size={24} />
                  <span>{course.modality}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Notebook size={24} />
                  <span>{course.courseDuration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bank size={24} />
                  <span className="capitalize">{course.unitName?.replace('/', ', ')}</span>
                </div>
              </div>

              {plans?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-bold mb-1 text-sm">Parcelas a partir de:</h4>
                  <span className="text-xl font-semibold text-green-600">
                    R$ {Number(plans[0].installmentValue).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              )}

              <p className="text-gray-600 text-sm mt-4">
                * Este desconto é válido para todas as mensalidades, exceto rematrículas e dependências.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PosCheckout
