'use client'

import { Course } from '@/app/interface/course'
import { BrazilianCity } from '@/app/lib/constants/brazilian-cities'
import { motion } from 'framer-motion'
import {
  Briefcase,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  GraduationCap,
  MapPin,
  School,
  Star,
  TrendingUp,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'
import { FeaturedCourseData } from '../../_data/types'

interface CursoCidadeClientProps {
  cursoMetadata: FeaturedCourseData
  courseOffers: Course[]
  cityName: string
  cityState: string
  courseSlug: string
  otherCities: BrazilianCity[]
}

export default function CursoCidadeClient({
  cursoMetadata,
  courseOffers,
  cityName,
  cityState,
  courseSlug,
  otherCities,
}: CursoCidadeClientProps) {
  const [activeTab, setActiveTab] = useState('areas')
  const [selectedModality, setSelectedModality] = useState<string>('TODAS')
  const router = useRouter()
  const offersRef = useRef<HTMLElement>(null)
  const infoSectionRef = useRef<HTMLElement>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const scrollCarousel = useCallback((direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    const scrollAmount = 340
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }, [])

  const filteredOffers = selectedModality === 'TODAS'
    ? courseOffers
    : courseOffers.filter(offer => offer.modality === selectedModality)

  const minPrice = filteredOffers.length > 0
    ? Math.min(...filteredOffers.map(o => o.minPrice || 0).filter(p => p > 0))
    : 0

  const handleQueroEssaBolsa = () => {
    if (courseOffers.length > 0 && offersRef.current) {
      offersRef.current.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(`/curso/resultado?c=${cursoMetadata.apiCourseName}&nivel=${cursoMetadata.nivel}&cidade=${cityName}&estado=${cityState}`)
    }
  }

  const handleSaibaMais = () => {
    infoSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleVerOferta = (offer: Course) => {
    router.push(`/curso/resultado?c=${cursoMetadata.apiCourseName}&nivel=${cursoMetadata.nivel}&modalidade=${offer.modality}&cidade=${cityName}&estado=${cityState}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-r from-emerald-950 to-emerald-700 text-white py-32 overflow-hidden">
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
              <GraduationCap className="w-20 h-20 mx-auto text-emerald-300" />
            </motion.div>

            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {cursoMetadata.fullName}
            </h1>
            <p className="text-2xl md:text-3xl font-semibold text-emerald-200 mb-6">
              em {cityName} - {cityState}
            </p>

            <p className="text-xl text-emerald-100 mb-8 leading-relaxed max-w-3xl mx-auto">
              Bolsas de estudo com até 80% de desconto para {cursoMetadata.name} em {cityName}.
              {minPrice > 0 ? ` A partir de R$ ${minPrice.toFixed(2)}/mês.` : ''} Compare ofertas e encontre a melhor faculdade.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                onClick={handleQueroEssaBolsa}
                className="bg-white text-emerald-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-emerald-50 transition-all shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {courseOffers.length > 0 ? `Ver ${courseOffers.length} Ofertas em ${cityName}` : 'Buscar Bolsas'}
              </motion.button>

              <motion.button
                onClick={handleSaibaMais}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-emerald-700 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sobre o curso
              </motion.button>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Floating Stats Cards */}
      <section className="py-12 -mt-24 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: MapPin,
                label: 'Cidade',
                value: `${cityName}`,
                color: 'from-blue-500 to-blue-600',
              },
              {
                icon: Clock,
                label: 'Duração',
                value: cursoMetadata.duration,
                color: 'from-emerald-500 to-emerald-600',
              },
              {
                icon: DollarSign,
                label: minPrice > 0 ? 'A partir de' : 'Salário Médio',
                value: minPrice > 0 ? `R$ ${minPrice.toFixed(2)}` : cursoMetadata.averageSalary.split('a')[0].trim(),
                color: 'from-purple-500 to-purple-600',
              },
              {
                icon: TrendingUp,
                label: courseOffers.length > 0 ? 'Ofertas' : 'Demanda',
                value: courseOffers.length > 0 ? `${courseOffers.length}` : cursoMetadata.marketDemand === 'ALTA' ? 'Alta' : cursoMetadata.marketDemand === 'MEDIA' ? 'Média' : 'Baixa',
                color: 'from-orange-500 to-orange-600',
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className={`bg-gradient-to-br ${stat.color} text-white p-6 rounded-2xl shadow-xl`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <stat.icon className="w-8 h-8 mb-3" />
                <p className="text-sm opacity-90 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ofertas da cidade */}
      {courseOffers.length > 0 && (
        <section ref={offersRef} className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-emerald-900">
                Ofertas de {cursoMetadata.name} em {cityName}
              </h2>
              <p className="text-xl text-gray-600">
                {filteredOffers.length} {filteredOffers.length === 1 ? 'opção encontrada' : 'opções encontradas'} em {cityName}-{cityState}
              </p>
            </motion.div>

            {/* Filtro de Modalidade */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {['TODAS', 'EAD', 'PRESENCIAL', 'SEMIPRESENCIAL'].map((modality) => (
                <button
                  key={modality}
                  onClick={() => setSelectedModality(modality)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${selectedModality === modality
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white text-emerald-600 hover:bg-emerald-50'
                    }`}
                >
                  {modality === 'TODAS' ? 'Todas' : modality.charAt(0) + modality.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* Carousel de Ofertas */}
            <div className="relative max-w-7xl mx-auto">
              {/* Botões de navegação */}
              {filteredOffers.length > 3 && (
                <>
                  <button
                    onClick={() => scrollCarousel('left')}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-emerald-50 transition-colors hidden md:flex items-center justify-center"
                    aria-label="Anterior"
                  >
                    <ChevronLeft className="w-6 h-6 text-emerald-700" />
                  </button>
                  <button
                    onClick={() => scrollCarousel('right')}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-emerald-50 transition-colors hidden md:flex items-center justify-center"
                    aria-label="Próximo"
                  >
                    <ChevronRight className="w-6 h-6 text-emerald-700" />
                  </button>
                </>
              )}

              <div
                ref={carouselRef}
                className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-4 px-4 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredOffers.map((offer, index) => (
                  <motion.div
                    key={`${offer.id}-${index}`}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all flex-shrink-0 w-[300px] md:w-[320px] snap-start"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <School className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                        <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                          {offer.brand || 'Faculdade Parceira'}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">
                          {offer.unitCity && offer.unitState
                            ? `${offer.unitCity} - ${offer.unitState}`
                            : `${cityName} - ${cityState}`}
                        </span>
                      </div>

                      <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-4">
                        {offer.modality}
                      </div>

                      <div className="mb-4">
                        {offer.minPrice && offer.minPrice > 0 ? (
                          <div>
                            <p className="text-sm text-gray-500 mb-1">A partir de:</p>
                            <p className="text-3xl font-bold text-emerald-600">
                              R$ {offer.minPrice.toFixed(2)}
                            </p>
                            {offer.maxPrice && offer.maxPrice !== offer.minPrice && (
                              <p className="text-sm text-gray-500">
                                até R$ {offer.maxPrice.toFixed(2)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Consulte valores</p>
                        )}
                      </div>

                      <button
                        onClick={() => handleVerOferta(offer)}
                        className="w-full bg-emerald-600 text-white py-3 rounded-full font-semibold hover:bg-emerald-700 transition-all"
                      >
                        Ver Detalhes
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA para buscar mais */}
            <div className="text-center mt-10">
              <Link
                href={`/curso/resultado?c=${encodeURIComponent(cursoMetadata.apiCourseName)}&nivel=${cursoMetadata.nivel}&cidade=${encodeURIComponent(cityName)}&estado=${cityState}`}
                className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-emerald-700 transition-all shadow-lg"
              >
                Ver todas as ofertas em {cityName}
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Sem ofertas - CTA */}
      {courseOffers.length === 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Buscando ofertas de {cursoMetadata.name} em {cityName}
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              No momento estamos atualizando as ofertas para esta cidade. Busque diretamente ou confira em outras cidades.
            </p>
            <Link
              href={`/curso/resultado?c=${encodeURIComponent(cursoMetadata.apiCourseName)}&nivel=${cursoMetadata.nivel}&cidade=${encodeURIComponent(cityName)}&estado=${cityState}`}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-emerald-700 transition-all shadow-lg"
            >
              Buscar {cursoMetadata.name} em {cityName}
            </Link>
          </div>
        </section>
      )}

      {/* Sobre o curso */}
      <section ref={infoSectionRef} className="py-20 container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-emerald-900">
                Sobre {cursoMetadata.name} em {cityName}
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {cursoMetadata.longDescription}
              </p>
            </motion.div>

            <motion.div
              className="relative h-80 rounded-2xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Image
                src={cursoMetadata.imageUrl}
                alt={`Estudantes de ${cursoMetadata.name} em ${cityName}`}
                fill
                className="object-cover"
              />
            </motion.div>
          </div>

          {/* Tabs Section */}
          <div className="mt-16">
            <div className="flex flex-wrap gap-4 mb-8 justify-center">
              {[
                { id: 'areas', label: 'Áreas de Atuação', icon: Briefcase },
                { id: 'skills', label: 'Habilidades', icon: Star },
                { id: 'careers', label: 'Carreiras', icon: TrendingUp },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${activeTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-white text-emerald-600 hover:bg-emerald-50'
                    }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-xl p-8"
            >
              {activeTab === 'areas' && (
                <div>
                  <h3 className="text-2xl font-bold text-emerald-900 mb-6">
                    Áreas de Atuação
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {cursoMetadata.areas.map((area, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700 font-medium">{area}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div>
                  <h3 className="text-2xl font-bold text-emerald-900 mb-6">
                    Habilidades Desenvolvidas
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {cursoMetadata.skills.map((skill, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Star className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700 font-medium">{skill}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'careers' && (
                <div>
                  <h3 className="text-2xl font-bold text-emerald-900 mb-6">
                    Possibilidades de Carreira
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {cursoMetadata.careerPaths.map((career, index) => (
                      <motion.div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Briefcase className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <span className="text-gray-700 font-medium">{career}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Outras cidades - Internal Linking */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-emerald-900 mb-8 text-center">
            {cursoMetadata.name} em outras cidades
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {otherCities.map((city) => (
              <Link
                key={city.slug}
                href={`/cursos/${courseSlug}/${city.slug}`}
                className="flex items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md hover:bg-emerald-50 transition-all text-gray-700 hover:text-emerald-700"
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium">
                  {city.name} - {city.state}
                </span>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href={`/cursos/${courseSlug}`}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Ver todas as informações de {cursoMetadata.name} &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-gradient-to-r from-emerald-950 to-emerald-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Garanta sua bolsa de {cursoMetadata.name} em {cityName}
            </h2>
            <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
              Encontre bolsas de estudo com até 80% de desconto em faculdades de {cityName}-{cityState}. Inscrição gratuita!
            </p>
            <motion.button
              onClick={handleQueroEssaBolsa}
              className="bg-white text-emerald-700 px-10 py-5 rounded-full font-bold text-xl hover:bg-emerald-50 transition-all shadow-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Buscar Bolsas em {cityName}
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
