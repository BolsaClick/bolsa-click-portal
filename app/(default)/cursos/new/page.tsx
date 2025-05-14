/* eslint-disable @typescript-eslint/no-explicit-any */
 
'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MapPin, Star, ArrowUpDown,
  Building2, ArrowLeft, ChevronDown,
  ListFilter, LayoutGrid, LayoutList, X
} from 'lucide-react';
import { Menu } from '@headlessui/react';

import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useSearchParams, useRouter } from 'next/navigation'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'

import CourseCardNew from '@/app/components/CourseCardNew';

const SearchResults: React.FC = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [showFilters, setShowFilters] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  const searchParams = useSearchParams()
  const router = useRouter()
  const { handleSubmit, setValue } = useForm()

  const modalidade = searchParams.get('modalidade') || ''
  const courseId = searchParams.get('course') || ''
  const courseName = searchParams.get('courseName') || ''
  const city = searchParams.get('city') || ''
  const state = searchParams.get('state') || ''

  const { data: showCourses, isLoading } = useQuery({
    queryFn: () => getShowFiltersCourses(modalidade, courseId, city, state),
    queryKey: ['courses', modalidade, courseId, city, state],
  })

  const coursesHere = showCourses?.courses || []

  const filteredCourses = coursesHere.reduce((acc: any[], course: any) => {
    const pushUnique = (arr: any[], data: any, modality: string) => {
      if (!arr.some((item) => item.courseId === course.courseId && item.modality === modality)) {
        arr.push({ ...data, courseName: course.courseName })
      }
    }

    if (!courseName) {
      if (course.distancia) pushUnique(acc, course.distancia.data[0], 'A distância')
      if (course.presencial) pushUnique(acc, course.presencial.data[0], 'Presencial')
      if (course.semipresencial) pushUnique(acc, course.semipresencial.data[0], 'Semipresencial')
    } else {
      if (course.distancia) acc.push(...course.distancia.data.map((unit: any) => ({ ...unit, courseName: course.courseName })))
      if (course.presencial) acc.push(...course.presencial.data.map((unit: any) => ({ ...unit, courseName: course.courseName })))
      if (course.semipresencial) acc.push(...course.semipresencial.data.map((unit: any) => ({ ...unit, courseName: course.courseName })))
    }

    return acc
  }, [])

  const onSubmit = (data: any) => {
    localStorage.setItem('selectedCourse', JSON.stringify(data))
    router.push('/checkout/')
  }
  const sortOptions = [
    { value: 'price_asc', label: 'Menor preço' },
    { value: 'discount_desc', label: 'Maior desconto' },
    { value: 'rating_desc', label: 'Maior nota' },
    { value: 'distance_asc', label: 'Mais próximas' },
  ];

  const FiltersPanel = () => (
    <div className="bg-white rounded-xl shadow-card p-6 sticky top-32">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Filter size={18} className="text-emerald-500 mr-2" />
          <h2 className="font-bold text-lg">Filtros</h2>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-sm text-primary-500 hover:text-primary-600 font-medium">
            Limpar todos
          </button>
          <button
            onClick={() => setShowMobileFilters(false)}
            className="lg:hidden text-neutral-500 hover:text-neutral-700"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Filter Groups */}
      <div className="space-y-6">
        {/* City Filter */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center">
            <MapPin size={16} className="text-primary-500 mr-2" />
            Cidade
          </h3>
          <div className="relative">
            <input
              type="text"
              placeholder="Digite a cidade"
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          </div>
        </div>

        {/* Modality Filter */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center">
            <Building2 size={16} className="text-primary-500 mr-2" />
            Modalidade
          </h3>
          <div className="space-y-2">
            {['Presencial', 'EAD', 'Semipresencial'].map((mode) => (
              <label key={mode} className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-neutral-700">{mode}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center">
            <span className="text-primary-500 mr-2">R$</span>
            Faixa de Preço
          </h3>
          <div className="space-y-4">
            <input
              type="range"
              min="0"
              max="2000"
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <div className="flex justify-between text-sm text-neutral-600">
              <span>R$ 0</span>
              <span>R$ 2.000</span>
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div className="space-y-3">
          <h3 className="font-medium flex items-center">
            <Star size={16} className="text-primary-500 mr-2" />
            Nota Mínima
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[3, 3.5, 4, 4.5].map((rating) => (
              <button
                key={rating}
                className="flex items-center justify-center px-3 py-2 rounded-lg border border-neutral-200 hover:border-primary-500 hover:bg-primary-50 transition-colors"
              >
                <Star
                  size={16}
                  className="text-yellow-400 mr-1"
                  fill="#FACC15"
                />
                {rating}+
              </button>
            ))}
          </div>
        </div>

        <button className="w-full btn-primary mt-4">
          Aplicar Filtros
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full  min-h-screen bg-neutral-50">
      {/* Enhanced Header */}
      <header className="w-full bg-bolsa-primary shadow-sm z-50">
        <div className='pt-24 pb-6'>
          <div className="p-4 mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4">
              <button onClick={() => { }} className=" inline-flex items-center justify-center rounded-md py-2.5 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-bolsa-secondary text-neutral-50 hover:bg-slate-600 focus:ring-bolsa-secondary/20">
                <ArrowLeft size={20} className="mr-2" />
                <span className="hidden sm:inline">Voltar para Busca</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-2 bg-white rounded-lg border border-neutral-200 p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-emerald-50 text-bolsa-secondary' : 'text-neutral-500 hover:bg-neutral-50'}`}
                  >
                    <LayoutGrid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-emerald-50 text-bolsa-secondary' : 'text-neutral-500 hover:bg-neutral-50'}`}
                  >
                    <LayoutList size={20} />
                  </button>
                </div>
                <button
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden btn-secondary"
                >
                  <ListFilter size={18} className="mr-2" />
                  Filtros
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Search size={20} className="text-emerald-100" />
                  <h1 className="text-xl font-bold text-emerald-50">
                    Resultados para: <span className="text-emerald-200">Engenharia Civil</span>
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 text-sm text-emerald-50">
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1 text-bolsa-secondary" />
                    São Paulo - SP
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center">
                    <Building2 size={16} className="mr-1 text-bolsa-secondary" />
                    Presencial
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center">
                    <Star size={16} className="mr-1 text-bolsa-secondary" />
                    4.5+
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <span className="font-medium">235 bolsas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl pt-16 pb-16">
        <div className="flex gap-8">
          {/* Desktop Filters Sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="hidden lg:block w-80 flex-shrink-0"
              >
                <FiltersPanel />
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Mobile Filters Modal */}
          <AnimatePresence>
            {showMobileFilters && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
                onClick={() => setShowMobileFilters(false)}
              >
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  className="absolute right-0 top-0 h-full w-full max-w-sm bg-neutral-50 p-4"
                  onClick={e => e.stopPropagation()}
                >
                  <FiltersPanel />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Results Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <Menu as="div" className="relative">
                <Menu.Button className="inline-flex items-center justify-center rounded-md py-2.5 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-neutral-200 text-neutral-800 hover:bg-neutral-300 focus:ring-neutral-300">
                  <ArrowUpDown size={18} className="mr-2" />
                  <span className="hidden sm:inline">Ordenar por</span>
                  <ChevronDown size={16} className="ml-2" />
                </Menu.Button>
                <Menu.Items className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-100 py-1 z-10">
                  {sortOptions.map((option) => (
                    <Menu.Item key={option.value}>
                      {({ active }) => (
                        <button
                          className={`${active ? 'bg-primary-50 text-primary-600' : 'text-neutral-700'
                            } w-full text-left px-4 py-2 text-sm`}
                          onClick={() => setSortBy(option.value)}
                        >
                          {option.label}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </Menu.Items>
              </Menu>
            </div>

            <div className={`grid ${viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
              : 'grid-cols-1 gap-4'
              }`}>
              {filteredCourses.map((course: any, index: number) => (
                <CourseCardNew
                  key={index}
                  courseName={courseName}
                  course={course}
                  setFormData={setValue}
                  viewMode={viewMode}
                  triggerSubmit={handleSubmit(onSubmit)}
                />
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button className="btn-secondary hover:scale-105 transition-transform duration-300">
                Carregar mais resultados
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;