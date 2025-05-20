/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MapPin, Star,
  Building2, ArrowLeft,
  ListFilter, LayoutGrid, LayoutList, X,
  ArrowRight
} from 'lucide-react';

import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'

import CourseCardNew from '@/app/components/CourseCardNew';
import PriceRangeSlider from '@/app/components/atoms/PriceRange';



export default function SearchResultClient() {

const params = useParams();

const modalidade = params?.modalidade as string;
const searchParams = useSearchParams();
const courseName = searchParams.get('courseName') ?? '';
const courseId = searchParams.get('courseId') ?? '';
const city = searchParams.get('city') ?? '';
const state = searchParams.get('state') ?? '';



  const router = useRouter()
  const { handleSubmit, setValue } = useForm()
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isReady, setIsReady] = useState(false);
  

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState<{
    city: string;
    modalidades: string[];
    montlyFeeToMin: [number, number];
    rating: number | null;
  }>({
    city: '',
    modalidades: [],
    montlyFeeToMin: [0, 2000],
    rating: null,
  });

useEffect(() => {
  if (modalidade && courseId && city && state) {
    setFilters((prev) => ({
      ...prev,
      city,
      modalidades: [formatModalidade(modalidade)],
    }));
    setIsReady(true);
  }
}, [modalidade, courseId, city, state]);

  function formatModalidade(value: string): string {
    switch (value.toLowerCase()) {
      case 'distancia':
        return 'EAD';
      case 'presencial':
        return 'Presencial';
      case 'semipresencial':
        return 'Semipresencial';
      default:
        return value;
    }
  }


  const { data: showCourses, isLoading } = useQuery({
    queryFn: () => getShowFiltersCourses(modalidade, courseId, city, state),
    queryKey: ['courses', modalidade, courseId, city, state],
    enabled: isReady
  });


  const coursesHere = showCourses?.courses || []

  const filteredCourses = coursesHere.reduce((acc: any[], course: any) => {
    const pushUnique = (arr: any[], data: any, modality: string) => {
      if (!arr.some((item) => item.courseId === course.courseId && item.modality === modality)) {
        arr.push({ ...data, courseName: course.courseName });
      }
    };

    if (!courseName) {
      if (course.distancia) pushUnique(acc, course.distancia.data[0], 'A distância');
      if (course.presencial) pushUnique(acc, course.presencial.data[0], 'Presencial');
      if (course.semipresencial) pushUnique(acc, course.semipresencial.data[0], 'Semipresencial');
    } else {
      if (course.distancia) acc.push(...course.distancia.data.map((unit: any) => ({ ...unit, courseName: course.courseName })));
      if (course.presencial) acc.push(...course.presencial.data.map((unit: any) => ({ ...unit, courseName: course.courseName })));
      if (course.semipresencial) acc.push(...course.semipresencial.data.map((unit: any) => ({ ...unit, courseName: course.courseName })));
    }

    return acc;
  }, []);

  const filteredByPrice = filteredCourses.filter((course: any) => {
    return course.montlyFeeToMin >= filters.montlyFeeToMin[0] &&
      course.montlyFeeToMin <= filters.montlyFeeToMin[1];
  });

  const paginatedCourses = filteredByPrice.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredByPrice.length / itemsPerPage);





  const onSubmit = (data: any) => {
    localStorage.setItem('selectedCourse', JSON.stringify(data))
    router.push('/checkout/')
  }


  const FiltersPanel = () => (
    <div className="bg-white  rounded-xl shadow-card p-6 sticky top-32">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Filter size={18} className="text-emerald-500 mr-2" />
          <h2 className="font-bold text-lg">Filtros</h2>
        </div>
        <div className="flex items-center gap-2">

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
              value={filters.city}
              readOnly
              disabled
              className={`w-full pl-10 pr-3 py-3 bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-300 rounded-lg focus:ring-2 focus:ring-bolsa-secondary focus:border-bolsa-secondary outline-none transition-colors`}
              placeholder="Cidade"
            />
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
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
                  checked={filters.modalidades.includes(mode)}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    const newModalidades = isChecked
                      ? [...filters.modalidades, mode]
                      : filters.modalidades.filter((m) => m !== mode);

                    setFilters((prev) => ({ ...prev, modalidades: newModalidades }));

                    const formatted = mode.toLowerCase() === 'ead' ? 'distancia' :
                      mode.toLowerCase() === 'presencial' ? 'presencial' :
                        'semipresencial';

                    router.push(`?modalidade=${formatted}`);
                  }}
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
            <PriceRangeSlider
              value={filters.montlyFeeToMin}
              onChange={(val) => setFilters((prev) => ({ ...prev, montlyFeeToMin: val }))}
            />


          </div>
        </div>


      </div>
    </div>
  );

  return (
    <div className="w-full  bg-neutral-50">
      {/* Enhanced Header */}
      <header className="w-full bg-bolsa-primary shadow-sm z-50">
        <div className='pt-24 pb-6'>
          <div className="p-4 mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4">
              <button onClick={router.back} className="hidden sm:inline-flex items-center justify-center rounded-md py-2.5 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-bolsa-secondary text-neutral-50 hover:bg-slate-600 focus:ring-bolsa-secondary/20">
                <ArrowLeft size={20} className="mr-2" />
                <span className="hidden sm:inline">Voltar para Busca</span>
              </button>
              <div className="flex items-center space-x-2 flex-shrink-0">
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

              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Search size={20} className="text-emerald-100" />
                  <h1 className="text-xl font-bold text-emerald-50">
                    Resultados para: <span className="text-emerald-200">{courseName}</span>
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 text-sm text-emerald-50">
                  <div className="flex items-center">
                    <MapPin size={16} className="mr-1 text-bolsa-secondary" />
                    {filters.city} - {state}
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center">
                    <Building2 size={16} className="mr-1 text-bolsa-secondary" />
                    {filters.modalidades}
                  </div>
                  <span className="hidden sm:inline">•</span>
                  <div className="flex items-center">
                    <Star size={16} className="mr-1 text-bolsa-secondary" />
                    4.5+
                  </div>

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
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="hidden lg:block w-80 flex-shrink-0"
            >
              <FiltersPanel />
            </motion.aside>
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
            <div className="flex justify-between items-center mb-6 px-6">



              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden bg-bolsa-secondary px-3 py-2 items-center flex rounded-md text-zinc-100"
              >
                <ListFilter size={18} className="mr-2" />
                Filtros
              </button>
            </div>

            {isLoading ? (
              <div
                className={`grid ${viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
                  : 'grid-cols-1 gap-4'
                  }`}
              >
                {Array.from({ length: 6 }).map((_, i) => (


                  <div key={i} className="bg-white rounded-xl shadow-card p-6 animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mt-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-full mt-6"></div>
                  </div>

                ))}
              </div>
            ) : (
              <div className={`grid ${viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6'
                : 'grid-cols-1 gap-4'
                }`}>
                {paginatedCourses.map((course: any, index: number) => (
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
            )}

            {!isLoading && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:text-bolsa-secondary disabled:hover:text-neutral-800"
                >
                  <ArrowLeft size={20} />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-4 py-2 rounded ${currentPage === i + 1 ? 'bg-bolsa-secondary text-white' : 'bg-white border text-neutral-800'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:text-bolsa-secondary disabled:hover:text-neutral-800"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

