'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Search, GraduationCap, TrendingUp, Award } from 'lucide-react'
import { FeaturedCourseListItem } from './_data/types'

interface CursosPageClientProps {
  courses: FeaturedCourseListItem[]
}

export default function CursosPageClient({ courses }: CursosPageClientProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('TODOS')

  // Filtrar cursos
  const filteredCursos = courses.filter((curso) => {
    const matchesSearch = curso.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === 'TODOS' || curso.type === selectedType
    return matchesSearch && matchesType
  })

  const courseTypes = [
    { id: 'TODOS', label: 'Todos os Cursos', count: courses.length },
    { id: 'BACHARELADO', label: 'Bacharelado', count: courses.filter(c => c.type === 'BACHARELADO').length },
    { id: 'LICENCIATURA', label: 'Licenciatura', count: courses.filter(c => c.type === 'LICENCIATURA').length },
    { id: 'TECNOLOGO', label: 'Tecnólogo', count: courses.filter(c => c.type === 'TECNOLOGO').length },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-emerald-950 to-emerald-700 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200')] bg-cover bg-center" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <GraduationCap className="w-16 h-16 mx-auto text-emerald-300" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Cursos com Bolsa de Estudo
            </h1>

            <p className="text-xl md:text-2xl text-emerald-100 mb-8 leading-relaxed">
              Descubra os cursos mais procurados com até 80% de desconto em mais de 30.000 faculdades parceiras
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                <p className="text-3xl font-bold text-white mb-2">{courses.length}+</p>
                <p className="text-sm text-emerald-100">Cursos em Destaque</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
                <p className="text-3xl font-bold text-white mb-2">80%</p>
                <p className="text-sm text-emerald-100">de Desconto</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 col-span-2 md:col-span-1">
                <p className="text-3xl font-bold text-white mb-2">30.000+</p>
                <p className="text-sm text-emerald-100">Faculdades Parceiras</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filtros e Busca */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Search Bar */}
            <div className="mb-8">
              <div className="relative max-w-2xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar curso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-gray-200 focus:border-emerald-500 focus:outline-none text-gray-900 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Filtros por Tipo */}
            <div className="flex flex-wrap gap-3 justify-center">
              {courseTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all ${
                    selectedType === type.id
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                  <span className="ml-2 text-sm opacity-75">({type.count})</span>
                </button>
              ))}
            </div>

            {/* Resultado da busca */}
            {searchTerm && (
              <div className="mt-6 text-center text-gray-600">
                {filteredCursos.length} {filteredCursos.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Grid de Cursos */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {filteredCursos.map((curso, index) => (
              <motion.div
                key={curso.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/cursos/${curso.slug}`}
                  className="group block bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 h-full"
                >
                  {/* Imagem */}
                  <div className="relative h-48 bg-gradient-to-br from-emerald-500 to-emerald-700 overflow-hidden">
                    <div className="absolute inset-0">
                      <Image
                        src={curso.imageUrl}
                        alt={`Curso de ${curso.name}`}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    {/* Badge de tipo */}
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-emerald-700">
                        <Award className="w-3 h-3" />
                        {curso.type}
                      </span>
                    </div>

                    {/* Badge de demanda */}
                    {curso.marketDemand === 'ALTA' && (
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold">
                          <TrendingUp className="w-3 h-3" />
                          Alta Demanda
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Conteúdo */}
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {curso.name}
                    </h3>

                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {curso.description}
                    </p>

                    {/* Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Duração</p>
                        <p className="text-sm font-semibold text-gray-900">{curso.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Salário médio</p>
                        <p className="text-sm font-semibold text-emerald-600">
                          {curso.averageSalary.split('a')[0].trim()}
                        </p>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-4">
                      <span className="text-sm font-semibold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-2">
                        Ver detalhes
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Mensagem quando não encontra resultados */}
          {filteredCursos.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <GraduationCap className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhum curso encontrado
              </h3>
              <p className="text-gray-500">
                Tente buscar por outro termo ou ajuste os filtros
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-emerald-950 to-emerald-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Não encontrou o curso ideal?
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Temos mais de 30.000 opções de cursos. Faça uma busca completa e encontre a bolsa perfeita para você!
            </p>
            <Link
              href="/curso/resultado"
              className="inline-block bg-white text-emerald-700 px-10 py-4 rounded-full font-bold text-lg hover:bg-emerald-50 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Buscar Todos os Cursos
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
