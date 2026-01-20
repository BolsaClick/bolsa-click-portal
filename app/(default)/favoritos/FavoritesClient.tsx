'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, LayoutGrid, LayoutList, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useFavorites } from '@/app/lib/hooks/useFavorites'
import CourseCardNew from '@/app/components/CourseCardNew'
import { useForm } from 'react-hook-form'

export default function FavoritesClient() {
  const router = useRouter()
  const { favorites, clearFavorites } = useFavorites()
  const { handleSubmit, setValue } = useForm()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const onSubmit = (data: Record<string, unknown>) => {
    localStorage.setItem('selectedCourse', JSON.stringify(data))
    router.push('/checkout/')
  }

  return (
    <div className="w-full bg-neutral-50 min-h-screen">
      {/* Header */}
      <header className="w-full bg-bolsa-primary shadow-sm z-50">
        <div className="pt-24 pb-6">
          <div className="p-4 mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-center justify-between mb-4">
              <button 
                onClick={() => router.back()} 
                className="hidden sm:inline-flex items-center justify-center rounded-md py-2.5 px-4 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-bolsa-secondary text-neutral-50 hover:bg-slate-600 focus:ring-bolsa-secondary/20 mb-4 sm:mb-0"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span className="hidden sm:inline">Voltar</span>
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
                  <Heart size={20} className="text-emerald-100 fill-emerald-100" />
                  <h1 className="text-xl font-bold text-emerald-50">
                    Meus Favoritos
                  </h1>
                </div>
                <p className="text-sm text-emerald-100">
                  {favorites.length} {favorites.length === 1 ? 'curso favoritado' : 'cursos favoritados'}
                </p>
              </div>
              
              {favorites.length > 0 && (
                <button
                  onClick={clearFavorites}
                  className="mt-4 sm:mt-0 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Limpar todos os favoritos
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="mx-auto max-w-7xl pt-16 pb-16 px-4">
        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="mx-auto text-neutral-300 mb-4" />
            <h2 className="text-2xl font-bold text-neutral-700 mb-2">
              Nenhum curso favoritado
            </h2>
            <p className="text-neutral-500 mb-6">
              Você ainda não favoritou nenhum curso. Explore nossos cursos e adicione aos favoritos!
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-3 bg-bolsa-secondary text-white rounded-lg hover:bg-slate-600 transition-colors font-medium"
            >
              Explorar Cursos
            </button>
          </div>
        ) : (
          <>
            {/* Grid/List View */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {favorites.map((course, index) => (
                <motion.div
                  key={`${course.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCardNew
                    course={course}
                    courseName={course.name}
                    viewMode={viewMode}
                    setFormData={setValue}
                    triggerSubmit={handleSubmit(onSubmit)}
                    isPos={course.academicLevel === 'POS_GRADUACAO'}
                  />
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

