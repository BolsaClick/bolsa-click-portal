/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react'
import React, { useState } from 'react'

import Image from 'next/image'
import { Course } from '../../../interface/course'

interface CourseCardProps {
  course: Course
  courseName: string
  setFormData?: (name: string, value: any) => void
  triggerSubmit?: () => void
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  courseName,

}) => {
  const [showAddress, setShowAddress] = useState(false)

  const renderUniversityImage = (universityName: string) => {
    switch (universityName.toLowerCase()) {
      case 'anhanguera':
        return '/assets/logo-anhanguera-bolsa-click.svg'
      case 'unopar':
        return '/assets/logo-unopar.svg'
      case 'pitagoras':
        return '/assets/logo-pitagoras.svg'

      default:
        return '/assets/logo-bolsa-click-rosa.png'
    }
  }
  const handleClick = () => {
    // Construir URL com parâmetros essenciais para compartilhamento
    const params = new URLSearchParams()

    // Se tiver os dados necessários, usar params
    if (course.businessKey && course.unitId) {
      params.set('groupId', course.businessKey)
      params.set('unitId', course.unitId)
      if (course.modality) params.set('modality', course.modality)
      if (course.classShift) params.set('shift', course.classShift)
      if (course.id) params.set('courseId', String(course.id))
      if (courseName || course.name) {
        params.set('courseName', encodeURIComponent(courseName || course.name))
      }
      if (course.unitCity) params.set('city', course.unitCity)
      if (course.unitState) params.set('state', course.unitState)
      if (course.brand) params.set('brand', course.brand)

      window.location.href = `/checkout?${params.toString()}`
    } else {
      // Fallback para localStorage se não tiver dados completos
      localStorage.setItem('selectedCourse', JSON.stringify(course))
      window.location.href = '/checkout'
    }
  }
  const handleAddressClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setShowAddress(!showAddress)
  }

  const capitalizeFirstLetter = (text: string | undefined) => {
    if (!text) return ''
    return text
      .split(' ') // Divide a string em palavras
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitaliza a primeira letra de cada palavra
      .join(' ') // Junta as palavras de volta em uma string
  }

  const universityLogo = renderUniversityImage(course.brand)
  const hasDiscount = Boolean(
    course.minPrice > 0 &&
    typeof course.maxPrice === 'number' &&
    course.maxPrice > course.minPrice
  )
  // floor: o % exibido nunca é maior que o desconto real (transparência)
  const discountPercentage = hasDiscount
    ? Math.floor((1 - course.minPrice / course.maxPrice!) * 100)
    : 0
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <Image
            src={universityLogo}
            alt="Logo Anhanguera"
            width={96}
            height={96}
            className="object-contain"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3 -mt-5 pt-0">
        <h3 className="mb-1 font-bold"> {courseName || course.name}</h3>
        <div className="mb-2 text-sm uppercase text-gray-500">
          {capitalizeFirstLetter(course.unitDistrict)}
        </div>
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            {course.unitCity} - {course.unitState}
          </div>

          <span className="inline-flex items-center rounded-full border border-gray-200 px-2 py-0.5 text-xs">
            {course.modality} / {course.classShift}
          </span>
        </div>

        <div className="mt-3">
          <button
            onClick={handleAddressClick}
            className="flex w-full items-center justify-between text-sm text-bolsa-primary"
          >
            <span className="flex items-center gap-1">
              <MapPin className="h-6 w-6" />
              Ver endereço
            </span>
            {showAddress ? (
              <ChevronUp className="h-6 w-6" />
            ) : (
              <ChevronDown className="h-6 w-6" />
            )}
          </button>

          {showAddress && (
            <div className="mt-2 rounded-md bg-gray-100 p-3 text-sm">
              {(course.modality === 'Presencial' ||
                course.modality === 'Semipresencial') && (
                  <p>
                    {capitalizeFirstLetter(course.unitAddress)} - CEP:{' '}
                    {course.unitPostalCode}
                  </p>
                )}

              {course.modality === 'A distância' && (
                <>
                  <p>
                    {capitalizeFirstLetter(course.unitAddress)},{' '}
                    {course.unitNumber}, {course.unitCity} - {course.unitState}
                  </p>
                  <p>
                    {capitalizeFirstLetter(course.unitDistrict)} - CEP:{' '}
                    {course.unitPostalCode}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-4 py-3">
        {/* Âncora riscada + badge de desconto ACIMA do preço herói (decisão CEO:
            1 preço só, grande; nunca repetir o preço final na linha de cima) */}
        {hasDiscount && (
          <p className="mb-1 flex items-center gap-2 text-xs text-gray-500">
            <span>
              De{' '}
              <span className="line-through decoration-gray-400">
                {course.maxPrice!.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </span>
            <span className="rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-bolsa-secondary">
              -{discountPercentage}%
            </span>
          </p>
        )}
        <div className="mb-2 flex items-baseline gap-1">
          <span className="text-lg font-bold">
            {(course.minPrice / 1).toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
          <span className="text-xs text-gray-500">/ mês</span>
        </div>
        <button
          onClick={handleClick}
          className="w-full rounded-md bg-bolsa-secondary px-4 py-2 text-white font-medium hover:bg-bolsa-primary transition-colors"
        >
          Inscreva-se!
        </button>
      </div>
    </div>
  )
}

export default CourseCard
