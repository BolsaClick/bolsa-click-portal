/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MapPin,
  ArrowLeft,
  ListFilter, LayoutGrid, LayoutList, X,
  ArrowRight
} from 'lucide-react';

import { useQuery } from '@tanstack/react-query'

import { useRouter, useSearchParams } from 'next/navigation';

import { getShowFiltersCoursesPos } from '@/app/lib/api/get-courses-filter-pos';

export default function SearchResultPos() {



const searchParams = useSearchParams();
const courseName = searchParams.get('courseName') ?? '';
const courseId = searchParams.get('courseId') ?? '';
const city = searchParams.get('city') ?? '';
const state = searchParams.get('state') ?? '';
const courseIdExternal = searchParams.get('courseIdExternal') ?? '';


  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;
  const [isReady, setIsReady] = useState(false);
  const [durationFilter, setDurationFilter] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [filters, setFilters] = useState({
    city: '',
    montlyFeeToMin: [0, 2000],
    rating: null,
  });

useEffect(() => {
  if (courseId && city && state) {
    setFilters((prev) => ({
      ...prev,
      city,
    }));
    setIsReady(true);
  }
}, [ courseId, city, state]);
  const { data: showCourses, isLoading } = useQuery({
    queryFn: () => getShowFiltersCoursesPos(courseIdExternal),
    queryKey: ['courses', courseIdExternal],
    enabled: isReady
  });

  const offers = showCourses?.data || []

  const filteredOffers =
    durationFilter === null
      ? offers
      : offers.filter((offer: any) => offer.courseDuration === durationFilter)



  const paginatedCourses = filteredOffers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredOffers.length / itemsPerPage);

  const handleSelect = (offer: any) => {
    const offerWithCourseName = {
      ...offer,
      courseName,
      courseIdExternal,
    }
    localStorage.removeItem('selectedPosOffer')
    localStorage.setItem(
      'selectedPosOffer',
      JSON.stringify(offerWithCourseName),
    )
        router.push('/checkout/pos')

  }

  const FiltersPanel = () => (
    <div className="bg-white rounded-xl shadow-card p-6 sticky top-32">
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

      <div className="space-y-6">
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
              className="w-full pl-10 pr-3 py-3 bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-300 rounded-lg"
              placeholder="Cidade"
            />
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            />
          </div>
        </div>


      </div>

      <div className="flex flex-col gap-4 mt-6">
        {['4 meses', '6 meses', '10 meses'].map((duration) => (
          <button
            key={duration}
            type="button"
            onClick={() =>
              setDurationFilter(
                durationFilter === duration ? null : duration,
              )
            }
            className={`px-4 py-2 rounded-md text-sm font-semibold border ${durationFilter === duration
                ? 'bg-bolsa-secondary text-white'
                : 'bg-white text-bolsa-secondary border-bolsa-secondary'
              } transition-all duration-200`}
          >
            {duration}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full bg-neutral-50">
      <header className="w-full bg-bolsa-primary shadow-sm z-50">
        <div className='pt-24 pb-6'>
          <div className="p-4 mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4">
              <button onClick={router.back} className="hidden sm:inline-flex items-center rounded-md py-2.5 px-4 text-sm font-medium bg-bolsa-secondary text-neutral-50">
                <ArrowLeft size={20} className="mr-2" />
                <span className="hidden sm:inline">Voltar para Busca</span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="hidden sm:flex items-center space-x-2 bg-white rounded-lg border p-1">
                  <button onClick={() => setViewMode('grid')} className={`p-2 rounded ${viewMode === 'grid' ? 'bg-emerald-50 text-bolsa-secondary' : 'text-neutral-500'}`}>
                    <LayoutGrid size={20} />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-2 rounded ${viewMode === 'list' ? 'bg-emerald-50 text-bolsa-secondary' : 'text-neutral-500'}`}>
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

                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl pt-16 pb-16">
        <div className="flex gap-8">
          <AnimatePresence>
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="hidden lg:block w-80"
            >
              <FiltersPanel />
            </motion.aside>
          </AnimatePresence>

          <AnimatePresence>
            {showMobileFilters && (
              <motion.div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setShowMobileFilters(false)}>
                <motion.div className="absolute right-0 top-0 h-full w-full max-w-sm bg-neutral-50 p-4" onClick={(e) => e.stopPropagation()}>
                  <FiltersPanel />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 px-6">
              <button onClick={() => setShowMobileFilters(true)} className="lg:hidden bg-bolsa-secondary px-3 py-2 items-center flex rounded-md text-zinc-100">
                <ListFilter size={18} className="mr-2" />
                Filtros
              </button>
            </div>

            {isLoading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6' : 'grid-cols-1 gap-4'}`}>
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
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6' : 'grid-cols-1 gap-4'}`}>
                {paginatedCourses.map((offer: any) => (
                  <div
                    key={offer.id}
                    className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-between"
                  >
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-gray-800 mb-1">
                        {courseName}
                      </h2>
                      <p className="text-sm text-gray-600 font-semibold mb-1">
                        {offer.unitName}
                      </p>
                      <p className="text-sm text-gray-500 mb-1">
                        Modalidade: <strong>{offer.modality}</strong>
                      </p>
                      <p className="text-sm text-gray-500 mb-1">
                        Duração: <strong>{offer.courseDuration}</strong>
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Parcela mínima:{' '}
                        <strong>
                          {offer.minimumInstallmentValue.toLocaleString(
                            'pt-BR',
                            {
                              style: 'currency',
                              currency: 'BRL',
                            },
                          )}
                        </strong>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSelect(offer)}
                      className="bg-bolsa-secondary text-white py-2 px-4 rounded-md text-sm hover:bg-bolsa-secondary/80 transition-all duration-200"
                    >
                      Quero essa bolsa!
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && (
              <div className="mt-8 flex justify-center items-center space-x-2">
                <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded disabled:opacity-50">
                  <ArrowLeft size={20} />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-4 py-2 rounded ${currentPage === i + 1 ? 'bg-bolsa-secondary text-white' : 'bg-white border text-neutral-800'}`}>
                    {i + 1}
                  </button>
                ))}

                <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded disabled:opacity-50">
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
