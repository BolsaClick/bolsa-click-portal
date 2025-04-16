/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { getCep } from '@/app/lib/api/get-cep'
import { validarCPF } from '@/utils/cpf-validate'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronRight } from 'lucide-react'
import { useEffect } from 'react'
import {  useForm } from 'react-hook-form'
import { useHookFormMask   } from 'use-mask-input'

import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  phone: z.string().max(15, 'Telefone deve ter no máximo 15 caracteres'),
  email: z.string(),
  cpf: z
    .string()
    .length(14, 'CPF deve ter 11 dígitos')
    .refine((val) => validarCPF(val), { message: 'CPF inválido' }),
  birthDate: z.string(),
  schoolYear: z.string().max(4, 'Ano deve ter no máximo 4 dígitos'),
  cep: z.string().length(9, 'CEP deve ter 8 dígitos'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  addressNumber: z.string().min(1, 'Número é obrigatório'),
  state: z.string(),
  city: z.string(),
  neighbordhood: z.string(),
  whatsapp: z.boolean(),
  gender: z.enum(['masculino', 'feminino'], {
    errorMap: () => ({ message: 'Gênero é obrigatório' }),
  }),
})

type FormSchema = z.infer<typeof formSchema>
const FormCheckout = ({ onSubmit, disabled, setEmail }: any) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  })

  const registerWithMask = useHookFormMask(register)

  const removeMask = (value: string) => {
    return value.replace(/\D/g, '')
  }

  const handleCepChange = async (cep: any) => {
    try {
      const response = await getCep(cep)
      const data = response.data
      setValue('state', data.state)
      setValue('city', data.city)
      setValue('neighbordhood', data.neighborhood || '')
      setValue('address', data.street)
    } catch (error) {
      console.error('Erro ao buscar o CEP:', error)
    }
  }

  useEffect(() => {
    if (setEmail) {
      setValue('email', setEmail)
    }
  }, [setEmail, setValue])

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-4 flex-col ">
        <div className="flex flex-col w-full ">
          <label className="block text-sm font-medium text-gray-700">E-mail</label>
          <input
            type="email"
            {...register('email')}
            defaultValue={setEmail}
            className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
            <input
              type="text"
              {...register('name')}
              placeholder="Ex: Rodrigo Silva"
              className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700">CPF</label>
            <input
              {...register('cpf')}
              {...registerWithMask("cpf", ['999.999.999-99'], {
                required: true
              })}
              placeholder="000.000.000-00"
              className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent ${errors.cpf ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.cpf && <p className="text-red-500 text-sm">{errors.cpf.message}</p>}
          </div>
        </div>

        <div className="w-full gap-4 pr-2 flex flex-col md:flex-row">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700">Data de nascimento</label>
            <input
              {...register('birthDate')}
              {...registerWithMask("birthDate", "datetime", {
                inputFormat: "dd-mm-yyyy",
              })}
              placeholder="DD-MM-AAAA"
              className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent ${errors.birthDate ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate.message}</p>}
          </div>

          <div className="w-full md:w-8/12">
            <label className="block text-sm font-medium text-gray-700">Ano de conclusão da escola</label>
            <input
              {...register('schoolYear')}
              {...registerWithMask("schoolYear", ['9999'], {
                required: true
              })}
              placeholder="2024"
              className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent ${errors.schoolYear ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.schoolYear && <p className="text-red-500 text-sm">{errors.schoolYear.message}</p>}
          </div>
        </div>

        <div className="w-full mb-4">
          <label className="block text-sm font-medium text-gray-700">Gênero</label>
          <select
            {...register('gender')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
          >
            <option value="">Selecione</option>
            <option value="feminino">Feminino</option>
            <option value="masculino">Masculino</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm">{errors.gender.message as string}</p>}
        </div>

        <h3 className="text-lg font-semibold ">Contato</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700">Telefone</label>
            <input
              {...register('phone')}
              {...registerWithMask("phone", ['99 9999-9999', '99999-9999'], {
                required: true
              })}
              placeholder="(00) 00000-0000"
              onBlur={(e) => setValue('phone', removeMask(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
            />
          </div>

          <div className="flex flex-col w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700">CEP</label>
            <input
              {...register('cep')}
              {...registerWithMask("cep", ['99999-999'], {
                required: true
              })}
              placeholder="00000-000"
              onBlur={(e) => handleCepChange(e.target.value)}
              className={`w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent ${errors.cep ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.cep && <p className="text-red-500 text-sm">{errors.cep.message}</p>}
          </div>
        </div>

        <div className="w-full flex flex-col md:flex-row gap-2">
          <div className="flex flex-col w-full">
            <label className="block text-sm font-medium text-gray-700">Endereço</label>
            <input
              type="text"
              {...register('address')}
              placeholder="Ex: Avenida Paulista"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
            />
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700">Numero</label>
            <input
              type="text"
              {...register('addressNumber')}
              placeholder="1106"
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-bolsa-primary focus:border-transparent"
            />
          </div>
        </div>

        <label className="flex items-center w-full text-sm md:flex-row mt-2 font-medium text-gray-700">
          <input type="checkbox" {...register('whatsapp')} className="mr-2" />
          Quero receber mensagens pelo WhatsApp
        </label>

        <button
          type="submit"
          disabled={disabled}
          className="bg-bolsa-primary hover:bg-bolsa-primary/95 text-white py-2 px-6 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-bolsa-secondary focus:ring-offset-2"
        >
          <div className="w-full items-center flex justify-center">
            Avançar <ChevronRight />
          </div>
        </button>
      </form>
    </>
  )
}

export default FormCheckout
