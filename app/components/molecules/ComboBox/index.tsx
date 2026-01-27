/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react'
import { Control, Controller, useWatch } from 'react-hook-form'
import { ReactNode } from 'react'

type CourseOption = {
  id: string
  name: string
  slug?: string
}

type CityOption = {
  city: string
  state: string
}

type ComboBoxProps<T> = {
  control: Control<any>
  name: string
  options: T[]
  placeholder?: string
  onInputChange?: (value: string) => void
  value?: T
  icon?: ReactNode
}

export const ComboBox = <T extends CourseOption | CityOption>({
  control,
  name,
  options,
  placeholder = 'Selecione uma opção',
  onInputChange,
  icon,
}: ComboBoxProps<T>) => {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLUListElement>(null)
  const isSelectingRef = useRef(false)
  const lastFieldValueRef = useRef<any>(null)
  
  // Observar mudanças no valor do campo para sincronizar o input apenas quando mudar externamente
  const fieldValue = useWatch({ control, name })
  
  useEffect(() => {
    // Só atualizar se o valor mudou externamente (não pela digitação)
    // Comparar com o último valor conhecido para evitar loops
    if (fieldValue !== lastFieldValueRef.current) {
      lastFieldValueRef.current = fieldValue
      
      // Só atualizar se for uma mudança externa (objeto selecionado ou valor limpo)
      if (fieldValue && typeof fieldValue === 'object' && 'name' in fieldValue) {
        // É uma seleção de opção, atualizar o input
        setInputValue(fieldValue.name || '')
      } else if (fieldValue === null || fieldValue === undefined || fieldValue === '') {
        // Valor foi limpo externamente
        setInputValue('')
      }
      // Se for string, não atualizar (pode ser da digitação)
    }
  }, [fieldValue])

  const removeAcentos = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  const filteredOptions = React.useMemo(() => 
    options.filter((option) =>
      'city' in option
        ? removeAcentos(option.city.toLowerCase()).includes(
          removeAcentos(inputValue.toLowerCase()),
        ) ||
        removeAcentos(option.state.toLowerCase()).includes(
          removeAcentos(inputValue.toLowerCase()),
        )
        : removeAcentos(option.name.toLowerCase()).includes(
          removeAcentos(inputValue.toLowerCase()),
        ),
    ),
    [options, inputValue]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)
    
    // Atualizar o último valor conhecido para evitar sincronização
    lastFieldValueRef.current = value

    if (onInputChange) {
      onInputChange(value)
    }
  }

  return (
    <div className="relative w-full">
      <Controller
        name={name}
        control={control}
        render={({ field }) => {
          return (
            <>
           
              {icon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  {icon}
                </div>
              )}

              <input
                ref={inputRef}
                autoComplete="off"
                value={inputValue}
                onChange={(e) => {
                  handleInputChange(e)
                  // Não atualizar o field enquanto está digitando, só o inputValue
                  // Manter o dropdown aberto quando há opções disponíveis
                  if (options.length > 0) {
                    setIsOpen(true)
                  } else {
                    setIsOpen(false)
                  }
                }}
                onFocus={() => {
                  // Abrir o dropdown quando focado, mostrando todos os cursos disponíveis
                  if (options.length > 0) {
                    setIsOpen(true)
                  }
                  isSelectingRef.current = false
                }}
                onBlur={() => {
                  // Aguardar um pouco para verificar se foi um clique em uma opção
                  setTimeout(() => {
                    if (!isSelectingRef.current) {
                      setIsOpen(false)
                    }
                  }, 200)
                }}
               className={`w-full ${icon ? 'pl-10' : 'pl-4'}  pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-secondary focus:border-bolsa-secondary outline-none transition-colors`}
                placeholder={placeholder}
              />
              {isOpen && filteredOptions.length > 0 && (
           <ul 
             ref={dropdownRef}
             className="absolute z-[9999] text-zinc-400 text-start mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[300px] overflow-auto"
             onMouseDown={() => {
               // Marcar que estamos selecionando para evitar fechar no blur
               isSelectingRef.current = true
             }}
           >

                  {filteredOptions.map((option, index) => (
                    <li
                      key={index}
                      className="px-5 py-3  hover:bg-emerald-500 hover:text-white cursor-pointer"
                      onMouseDown={(e) => {
                        // Prevenir que o onBlur feche o dropdown antes do onClick
                        e.preventDefault()
                        isSelectingRef.current = true
                      }}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        
                        let displayValue = ''
                        let selectedValue: any = null

                        if ('city' in option) {
                          displayValue = `${option.city} - ${option.state}`
                          selectedValue = {
                            city: option.city,
                            state: option.state,
                          }
                        } else {
                          displayValue = option.name
                          selectedValue = {
                            id: option.id,
                            name: option.name,
                            slug: (option as CourseOption).slug ?? '',
                          }
                        }

                        setInputValue(displayValue)
                        lastFieldValueRef.current = selectedValue
                        isSelectingRef.current = false
                        setIsOpen(false)
                        field.onChange(selectedValue)
                        // Manter o foco no input após selecionar
                        if (inputRef.current) {
                          inputRef.current.focus()
                        }
                      }}
                    >
                      {'city' in option
                        ? `${option.city} - ${option.state}`
                        : option.name}
                    </li>
                  ))}
                </ul>
              )}

              {isOpen && filteredOptions.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="px-5 py-3 text-gray-500">
                    Nenhuma opção encontrada
                  </div>
                </div>
              )}
            </>
          )
        }}
      />
          </div>
        )
}
