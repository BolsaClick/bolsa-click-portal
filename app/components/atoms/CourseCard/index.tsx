/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { ChevronDown, ChevronUp, MapPin, Star } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { Course } from '../../../interface/course'
import Image from 'next/image'

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
  const [rating, setRating] = useState<number>(0)
  const [showAddress, setShowAddress] = useState(false)
  useEffect(() => {
    const randomRating = (Math.random() * (5 - 4) + 4).toFixed(1)
    setRating(Number(randomRating))
  }, [])

  const getRatingColor = () => {
    if (rating === 5) {
      return 'text-green-500'
    }
    if (rating > 3) {
      return 'text-yellow-500'
    }
    return 'text-red-500'
  }

  const renderUniversityImage = (universityName: string) => {
    switch (universityName.toLowerCase()) {
      case 'anhanguera':
        return '/assets/logo-anhanguera-bolsa-click.svg'
      case 'unopar':
        return '/assets/logo-unopar.svg'
      case 'ampli':
        return '/assets/ampli-logo.png'
      case 'pitagoras':
        return '/assets/logo-pitagoras.svg'

      default:
        return '/assets/logo-bolsa-click-green-dark.svg'
    }
  }
  const handleClick = () => {
    localStorage.setItem('selectedCourse', JSON.stringify(course))
    window.location.href = '/checkout'
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
          <div className="flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-amber-600">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            <div className={`${getRatingColor()} text-lg font-semibold`}>
              {rating}
            </div>
          </div>
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
          Quero essa bolsa!
        </button>
      </div>
    </div>
  )
}

export default CourseCard
