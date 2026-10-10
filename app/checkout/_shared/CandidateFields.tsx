'use client'

/**
 * Campos do candidato — os MESMOS nos dois checkouts (Cogna e Estácio).
 *
 * Um componente por campo, e não um bloco fechado: cada checkout arruma os
 * campos nas próprias seções (a Cogna tem "01 · Estudante" + "02 · Contato";
 * a Estácio põe os cinco em "01 · Estudante"). Assim a Cogna mantém o layout
 * que o funil dela já mede, e a Estácio passa a usar exatamente os mesmos
 * campos, máscaras, validação (zod de `candidate.ts`) e comportamento de CPF.
 *
 * A marcação é a do checkout da Cogna, movida sem alteração.
 */
import { useCallback, useState } from 'react'
import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form'
import { Calendar, Check, Loader2, Mail, Phone } from 'lucide-react'
import { validarCPF } from '@/utils/cpf-validate'
import { formatPhone } from '@/utils/formatters'
import { suggestEmailCorrection } from '@/app/lib/validation/email-typo'
import { maskBirthDate, maskCpf, type CandidateFormValues } from '@/app/lib/checkout/candidate'

const labelClass =
  'block font-mono text-[10px] tracking-[0.2em] uppercase text-ink-500 mb-1.5'
const inputClass =
  'w-full px-3 py-2 text-sm border border-hairline bg-white text-ink-900 placeholder:text-ink-300 rounded-xl focus:outline-none focus:border-ink-900 focus:ring-2 focus:ring-bolsa-secondary/15 transition-colors'

type FieldProps = {
  control: Control<CandidateFormValues>
  errors: FieldErrors<CandidateFormValues>
}

export function EmailField({
  register,
  errors,
  value,
  onSuggestionAccept,
}: {
  register: UseFormRegister<CandidateFormValues>
  errors: FieldErrors<CandidateFormValues>
  value: string
  onSuggestionAccept: (email: string) => void
}) {
  // Sugestão de digitação do e-mail — nunca bloqueia, só sugere (ver
  // app/lib/validation/email-typo.ts).
  const suggestion = value ? suggestEmailCorrection(value) : null
  return (
    <div>
      <label className={labelClass}>
        <Mail size={14} className="inline mr-1" /> E-mail
      </label>
      <input
        type="email"
        autoComplete="email"
        {...register('email')}
        placeholder="seuemail@exemplo.com"
        className={inputClass}
      />
      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      {!errors.email && suggestion && (
        <p className="text-amber-600 text-xs mt-1">
          Você quis dizer{' '}
          <button
            type="button"
            className="underline font-medium hover:text-amber-700"
            onClick={() => onSuggestionAccept(suggestion)}
          >
            {suggestion}
          </button>
          ?
        </p>
      )}
    </div>
  )
}

export function NameField({
  register,
  errors,
}: {
  register: UseFormRegister<CandidateFormValues>
  errors: FieldErrors<CandidateFormValues>
}) {
  return (
    <div>
      <label className={labelClass}>Nome Completo</label>
      <input
        type="text"
        autoComplete="name"
        {...register('name')}
        placeholder="Ex: Rodrigo Silva"
        className={inputClass}
      />
      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
    </div>
  )
}

export type CpfValidation = ReturnType<typeof useCpfValidation>

/**
 * Estado da checagem de CPF no blur.
 *
 * Regra do fix de 08/10: o que decide se o CPF é válido é o `validarCPF`
 * local. O `/api/auth/check-cpf` (só alimenta tracking) e os efeitos
 * colaterais de cada checkout (`onValidated`: pixels, identificação, trava de
 * CPF já inscrito na Cogna) rodam cada um em try próprio e NUNCA derrubam
 * `ok` nem acendem `error` — antes, rede instável numa chamada de analytics
 * barrava a inscrição.
 */
export function useCpfValidation(opts: {
  onValidated?: (info: {
    cpf: string
    existsInDb: boolean | undefined
    /** Trava o envio com uma mensagem (ex.: CPF já inscrito na Cogna). */
    setBlocked: (message: string | null) => void
  }) => void | Promise<void>
  /** check-cpf caiu (não-fatal, só tracking). */
  onCheckError?: (error: unknown) => void
  /** Algum efeito colateral de `onValidated` caiu (não-fatal). */
  onSideEffectError?: (error: unknown) => void
}) {
  const [isValidating, setIsValidating] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [blocked, setBlocked] = useState<string | null>(null)
  const { onValidated, onCheckError, onSideEffectError } = opts

  const reset = useCallback(() => {
    setOk(false)
    setError(null)
    setBlocked(null)
  }, [])

  const validate = useCallback(
    async (rawCpf: string) => {
      const cleanCpf = rawCpf.replace(/\D/g, '')
      if (cleanCpf.length !== 11 || !validarCPF(cleanCpf)) return
      setIsValidating(true)
      setError(null)
      setOk(false)
      setBlocked(null)
      try {
        let existsInDb: boolean | undefined
        try {
          const res = await fetch('/api/auth/check-cpf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cpf: cleanCpf }),
          })
          const body = await res.json()
          existsInDb = body?.exists
        } catch (checkError: unknown) {
          console.error('check-cpf falhou (não-fatal, só tracking):', checkError)
          onCheckError?.(checkError)
        }

        setError(null)
        setOk(true)

        try {
          await onValidated?.({ cpf: cleanCpf, existsInDb, setBlocked })
        } catch (sideEffectError: unknown) {
          console.error('Falha não-fatal após validar CPF (telemetria):', sideEffectError)
          onSideEffectError?.(sideEffectError)
        }
      } finally {
        setIsValidating(false)
      }
    },
    [onValidated, onCheckError, onSideEffectError],
  )

  return { isValidating, ok, error, blocked, setBlocked, reset, validate }
}

export function CpfField({ control, errors, validation }: FieldProps & { validation: CpfValidation }) {
  const { isValidating, ok, error, blocked } = validation
  return (
    <div>
      <label className={labelClass}>CPF</label>
      <Controller
        control={control}
        name="cpf"
        render={({ field }) => (
          <div>
            <div className="relative">
              <input
                ref={field.ref}
                value={field.value}
                onChange={(e) => {
                  field.onChange(maskCpf(e.target.value))
                  if (ok || error || blocked) validation.reset()
                }}
                onBlur={(e) => {
                  field.onBlur()
                  void validation.validate(e.target.value)
                }}
                placeholder="000.000.000-00"
                maxLength={14}
                inputMode="numeric"
                className={`w-full px-3 py-2 pr-9 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-bolsa-primary ${
                  error || blocked
                    ? 'border-red-500'
                    : ok
                      ? 'border-green-500'
                      : 'border-gray-300'
                }`}
              />
              <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center">
                {isValidating && (
                  <Loader2 size={16} className="text-bolsa-primary animate-spin" aria-label="Validando CPF" />
                )}
                {!isValidating && ok && !blocked && (
                  <Check size={16} className="text-green-600" aria-label="CPF validado" />
                )}
              </div>
            </div>
            {isValidating && <p className="text-blue-500 text-xs mt-1">Validando CPF...</p>}
            {!isValidating && ok && !blocked && (
              <p className="text-green-600 text-xs mt-1">CPF validado — você pode continuar.</p>
            )}
          </div>
        )}
      />
      {errors.cpf && <p className="text-red-500 text-xs mt-1">{errors.cpf.message}</p>}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {blocked && <p className="text-red-500 text-xs mt-1">{blocked}</p>}
    </div>
  )
}

export function BirthDateField({ control, errors }: FieldProps) {
  return (
    <div>
      <label className={labelClass}>
        <Calendar size={14} className="inline mr-1" /> Data de Nascimento
      </label>
      <Controller
        name="birthDate"
        control={control}
        render={({ field }) => (
          <input
            // `field.ref` ligado: sem ele o react-hook-form NAO consegue
            // focar este campo quando a validacao falha — medido no browser
            // (fix de 08/10), o foco ficava no proprio botao e a mensagem
            // podia estar fora da tela.
            ref={field.ref}
            value={field.value}
            onChange={(e) => field.onChange(maskBirthDate(e.target.value))}
            onBlur={field.onBlur}
            placeholder="DD-MM-AAAA"
            maxLength={10}
            inputMode="numeric"
            autoComplete="bday"
            className={inputClass}
          />
        )}
      />
      {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate.message}</p>}
    </div>
  )
}

export function PhoneField({
  control,
  errors,
  label = 'Telefone',
  onFocus,
  onBlur,
}: FieldProps & { label?: string; onFocus?: () => void; onBlur?: () => void }) {
  return (
    <div>
      <label className={labelClass}>
        <Phone size={14} className="inline mr-1" /> {label}
      </label>
      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <input
            ref={field.ref}
            value={field.value}
            onChange={(e) => field.onChange(formatPhone(e.target.value))}
            onFocus={onFocus}
            onBlur={() => {
              field.onBlur()
              onBlur?.()
            }}
            placeholder="(00) 00000-0000"
            maxLength={15}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            className={inputClass}
          />
        )}
      />
      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
    </div>
  )
}
