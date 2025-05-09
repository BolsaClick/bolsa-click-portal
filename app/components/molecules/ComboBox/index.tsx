/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react'
import { Controller } from 'react-hook-form'
import { ReactNode } from 'react'

type ComboBoxProps = {
  control: any
  name: string
  options: { id: string; name: string }[] | { state: string; city: string }[]
  placeholder?: string
  onInputChange?: (value: string) => void
  value?: any
  icon?: ReactNode // <- novo
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  control,
  name,
  options,
  placeholder = 'Selecione uma opção',
  onInputChange,
  icon,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const removeAcentos = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  }

  const filteredOptions = options.filter((option) =>
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
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (onInputChange) {
      onInputChange(value)
    }
  }

  return (
    <div className="relative w-full">
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <>
           
              {icon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  {icon}
                </div>
              )}

              <input
                {...field}
                autoComplete="off"
                value={inputValue}
                onChange={(e) => {
                  handleInputChange(e)
                  field.onChange(e.target.value)
                }}
                onFocus={() => setIsOpen(true)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
               className={`w-full ${icon ? 'pl-10' : 'pl-4'}  pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors`}
                placeholder={placeholder}
              />
              {isOpen && filteredOptions.length > 0 && (
           <ul className="absolute z-[9999] text-zinc-400 text-start mt-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[300px] overflow-auto">

                  {filteredOptions.map((option, index) => (
                    <li
                      key={index}
                      className="px-5 py-3  hover:bg-emerald-500 hover:text-white cursor-pointer"
                      onClick={() => {
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
                          }
                        }

                        setInputValue(displayValue)
                        setIsOpen(false)
                        field.onChange(selectedValue)
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
        )}
      />
          </div>
        )
}
