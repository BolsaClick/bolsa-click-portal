'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import {
  Star,
  MapPin,
  Building2,
  Users,
  Calendar,
  GraduationCap,
  ExternalLink,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import Container from '@/app/components/atoms/Container'
import Breadcrumb from '@/app/components/atoms/Breadcrumb'
import CourseCardNew from '@/app/components/CourseCardNew'
import { getShowFiltersCourses } from '@/app/lib/api/get-courses-filter'
import { Course } from '@/app/interface/course'
import type { InstitutionData } from '../_data/types'

type Props = {
  institution: InstitutionData
}

const modalityLabels: Record<string, string> = {
  EAD: 'EAD (Ensino a Distância)',
  PRESENCIAL: 'Presencial',
  SEMIPRESENCIAL: 'Semipresencial',
}

const levelLabels: Record<string, string> = {
  GRADUACAO: 'Graduação',
  POS_GRADUACAO: 'Pós-Graduação',
}

const typeLabels: Record<string, string> = {
  PRIVADA: 'Instituição Privada',
  PUBLICA_FEDERAL: 'Instituição Pública Federal',
  PUBLICA_ESTADUAL: 'Instituição Pública Estadual',
}

export default function FaculdadePageClient({ institution }: Props) {
  const [selectedModality, setSelectedModality] = useState<string>('')
  const [visibleCount, setVisibleCount] = useState(6)

  const { data: coursesData, isLoading: isLoadingCourses } = useQuery({
    queryFn: () => getShowFiltersCourses(
      undefined,
      undefined,
      undefined,
      selectedModality || undefined,
      'GRADUACAO',
      1,
      50
    ),
    queryKey: ['institution-courses', institution.name, selectedModality],
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  })

  const institutionCourses = useMemo(() => {
    if (!coursesData?.data) return []
    return (coursesData.data as Course[]).filter(
      (course) => course.brand?.toLowerCase() === institution.name.toLowerCase()
    )
  }, [coursesData, institution.name])

  const visibleCourses = institutionCourses.slice(0, visibleCount)

  return (
    <article className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-r from-bolsa-primary to-pink-600 text-white py-10 md:py-14">
        <Container>
          <Breadcrumb
            items={[
              { label: 'Início', href: '/' },
              { label: 'Faculdades', href: '/faculdades' },
              { label: institution.name },
            ]}
          />

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mt-6">
            {/* Logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-white overflow-hidden flex-shrink-0 shadow-lg">
              <Image
                src={institution.logoUrl}
                alt={institution.imageAlt || `Logo ${institution.name}`}
                width={96}
                height={96}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `<span class="text-3xl font-bold text-bolsa-primary flex items-center justify-center w-full h-full">${institution.shortName.charAt(0)}</span>`
                  }
                }}
              />
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-bold">Faculdade {institution.name}</h1>
              <p className="text-white/80 mt-1 text-sm">
                {institution.fullName} | {typeLabels[institution.type]} {institution.founded ? `| Fundada em ${institution.founded}` : ''}
              </p>
              <p className="text-white/90 mt-2 text-lg max-w-2xl">{institution.description}</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {institution.mecRating && (
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 text-center">
                <Star className="mx-auto mb-1" size={24} fill="currentColor" />
                <p className="text-2xl font-bold">{institution.mecRating}/5</p>
                <p className="text-white/80 text-sm">Nota MEC</p>
              </div>
            )}
            {institution.campusCount && (
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 text-center">
                <Building2 className="mx-auto mb-1" size={24} />
                <p className="text-2xl font-bold">{institution.campusCount}+</p>
                <p className="text-white/80 text-sm">Polos/Campus</p>
              </div>
            )}
            {institution.studentCount && (
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 text-center">
                <Users className="mx-auto mb-1" size={24} />
                <p className="text-2xl font-bold">{institution.studentCount}</p>
                <p className="text-white/80 text-sm">Alunos</p>
              </div>
            )}
            {institution.coursesOffered && (
              <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 text-center">
                <BookOpen className="mx-auto mb-1" size={24} />
                <p className="text-2xl font-bold">{institution.coursesOffered}+</p>
                <p className="text-white/80 text-sm">Cursos</p>
              </div>
            )}
          </div>
        </Container>
      </div>

      <Container>
        <div className="py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                Sobre a {institution.name}
              </h2>
              <div className="prose prose-neutral max-w-none">
                {institution.longDescription.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-neutral-600 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {/* Why Study Here */}
            <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                Por que estudar na Faculdade {institution.name}?
              </h2>
              <div className="prose prose-neutral max-w-none">
                <p className="text-neutral-600 leading-relaxed mb-4">
                  A Faculdade {institution.name} é uma das principais instituições de ensino superior do Brasil
                  {institution.founded ? `, com mais de ${new Date().getFullYear() - institution.founded} anos de tradição no mercado educacional` : ''}.
                  {institution.studentCount ? ` Com mais de ${institution.studentCount} alunos,` : ''} a {institution.name} se destaca pela qualidade de ensino
                  {institution.mecRating ? ` reconhecida pelo MEC com nota ${institution.mecRating}` : ''} e pela variedade de cursos oferecidos.
                </p>
                <p className="text-neutral-600 leading-relaxed mb-4">
                  Estudar na Faculdade {institution.name} significa ter acesso a uma formação de qualidade com
                  {' '}{institution.modalities.map(m => m === 'EAD' ? 'ensino a distância (EAD)' : m === 'PRESENCIAL' ? 'aulas presenciais' : 'formato semipresencial').join(', ')},
                  permitindo que você escolha a modalidade que melhor se adapta à sua rotina.
                  {institution.campusCount ? ` A instituição conta com ${institution.campusCount}+ polos e campus espalhados pelo Brasil, facilitando o acesso ao ensino superior de qualidade.` : ''}
                </p>
                <p className="text-neutral-600 leading-relaxed">
                  Pelo Bolsa Click, você pode garantir bolsas de estudo na Faculdade {institution.name} com descontos de até 80% nas mensalidades.
                  A inscrição é gratuita e você pode começar a estudar na próxima turma disponível.
                </p>
              </div>
            </section>

            {/* Highlights */}
            {institution.highlights.length > 0 && (
              <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                  Diferenciais da Faculdade {institution.name}
                </h2>
                <ul className="space-y-3">
                  {institution.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="text-green-500 mt-0.5 flex-shrink-0" size={20} />
                      <span className="text-neutral-600">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Modalities Detail */}
            <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                Modalidades de Ensino na Faculdade {institution.name}
              </h2>
              <div className="space-y-4">
                {institution.modalities.includes('EAD') && (
                  <div className="border border-neutral-100 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-800 mb-2 flex items-center gap-2">
                      <GraduationCap size={18} className="text-bolsa-primary" />
                      Cursos EAD na {institution.name}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      Os cursos EAD da Faculdade {institution.name} oferecem flexibilidade total para você estudar de qualquer lugar.
                      Com aulas online, material didático digital e suporte de tutores, você conquista seu diploma com a mesma qualidade do ensino presencial.
                    </p>
                  </div>
                )}
                {institution.modalities.includes('PRESENCIAL') && (
                  <div className="border border-neutral-100 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-800 mb-2 flex items-center gap-2">
                      <GraduationCap size={18} className="text-bolsa-primary" />
                      Cursos Presenciais na {institution.name}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      Os cursos presenciais da Faculdade {institution.name} proporcionam uma experiência completa de ensino,
                      com infraestrutura moderna, laboratórios equipados e contato direto com professores e colegas.
                    </p>
                  </div>
                )}
                {institution.modalities.includes('SEMIPRESENCIAL') && (
                  <div className="border border-neutral-100 rounded-lg p-4">
                    <h3 className="font-semibold text-neutral-800 mb-2 flex items-center gap-2">
                      <GraduationCap size={18} className="text-bolsa-primary" />
                      Cursos Semipresenciais na {institution.name}
                    </h3>
                    <p className="text-neutral-600 text-sm">
                      Os cursos semipresenciais da Faculdade {institution.name} combinam o melhor dos dois mundos:
                      a flexibilidade do EAD com encontros presenciais periódicos para atividades práticas e avaliações.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Offers Section */}
            <section id="ofertas">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                Bolsas de Estudo na {institution.name}
              </h2>
              <p className="text-neutral-600 mb-6">
                Confira os cursos disponíveis com bolsa de estudo na {institution.name}. Inscrição gratuita!
              </p>

              {/* Modality Filter */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => { setSelectedModality(''); setVisibleCount(6) }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedModality === ''
                      ? 'bg-bolsa-primary text-white'
                      : 'bg-white border border-neutral-200 text-neutral-600 hover:border-bolsa-primary/50'
                  }`}
                >
                  Todas
                </button>
                {institution.modalities.map((mod) => (
                  <button
                    key={mod}
                    onClick={() => { setSelectedModality(mod); setVisibleCount(6) }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedModality === mod
                        ? 'bg-bolsa-primary text-white'
                        : 'bg-white border border-neutral-200 text-neutral-600 hover:border-bolsa-primary/50'
                    }`}
                  >
                    {modalityLabels[mod]?.replace(' (Ensino a Distância)', '') || mod}
                  </button>
                ))}
              </div>

              {/* Course Cards */}
              {isLoadingCourses ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="animate-spin text-bolsa-primary" size={32} />
                  <span className="ml-3 text-neutral-500">Carregando ofertas...</span>
                </div>
              ) : institutionCourses.length === 0 ? (
                <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
                  <GraduationCap className="mx-auto text-neutral-300 mb-3" size={40} />
                  <p className="text-neutral-500 mb-4">
                    Nenhuma oferta encontrada{selectedModality ? ` na modalidade ${modalityLabels[selectedModality]?.replace(' (Ensino a Distância)', '') || selectedModality}` : ''}.
                  </p>
                  <Link
                    href={`/curso/resultado?nivel=GRADUACAO`}
                    className="text-bolsa-primary hover:underline font-medium text-sm"
                  >
                    Ver todas as bolsas disponíveis
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {visibleCourses.map((course, index) => (
                      <CourseCardNew
                        key={`${course.id}-${index}`}
                        courseName={course.name || ''}
                        course={course}
                        viewMode="grid"
                      />
                    ))}
                  </div>

                  {institutionCourses.length > visibleCount && (
                    <div className="text-center mt-6">
                      <button
                        onClick={() => setVisibleCount((prev) => prev + 6)}
                        className="px-6 py-3 rounded-lg border-2 border-bolsa-primary text-bolsa-primary hover:bg-bolsa-primary/5 font-semibold transition-colors"
                      >
                        Ver mais cursos ({institutionCourses.length - visibleCount} restantes)
                      </button>
                    </div>
                  )}

                  <p className="text-sm text-neutral-400 mt-4 text-center">
                    {institutionCourses.length} {institutionCourses.length === 1 ? 'curso encontrado' : 'cursos encontrados'} na {institution.name}
                  </p>
                </>
              )}
            </section>

            {/* FAQ Section */}
            <section className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">
                Perguntas Frequentes sobre a Faculdade {institution.name}
              </h2>
              <div className="space-y-4">
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="font-semibold text-neutral-800 mb-2">
                    Qual a nota da Faculdade {institution.name} no MEC?
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    {institution.mecRating
                      ? `A Faculdade ${institution.name} possui nota ${institution.mecRating} no MEC (em uma escala de 1 a 5), demonstrando a qualidade do ensino oferecido pela instituição.`
                      : `A nota da Faculdade ${institution.name} no MEC pode ser consultada diretamente no portal e-MEC.`}
                  </p>
                </div>
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="font-semibold text-neutral-800 mb-2">
                    Como conseguir bolsa de estudo na Faculdade {institution.name}?
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    Para conseguir bolsa de estudo na Faculdade {institution.name}, basta acessar o Bolsa Click,
                    buscar pelo curso desejado, escolher a melhor oferta e se inscrever gratuitamente.
                    As bolsas podem chegar a até 95% de desconto.
                  </p>
                </div>
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="font-semibold text-neutral-800 mb-2">
                    Quais cursos a Faculdade {institution.name} oferece?
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    A Faculdade {institution.name} oferece cursos de{' '}
                    {institution.academicLevels.map(l => l === 'GRADUACAO' ? 'graduação' : 'pós-graduação').join(' e ')}{' '}
                    nas modalidades{' '}
                    {institution.modalities.map(m => m === 'EAD' ? 'EAD' : m === 'PRESENCIAL' ? 'presencial' : 'semipresencial').join(', ')}.
                    {institution.coursesOffered ? ` São mais de ${institution.coursesOffered} cursos disponíveis.` : ''}
                  </p>
                </div>
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="font-semibold text-neutral-800 mb-2">
                    A Faculdade {institution.name} é reconhecida pelo MEC?
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    Sim, a Faculdade {institution.name} é uma instituição de ensino superior reconhecida pelo Ministério da Educação (MEC).
                    {institution.mecRating ? ` Sua nota institucional é ${institution.mecRating} em uma escala de 1 a 5.` : ''}
                    {institution.emecLink ? ' Você pode verificar a situação da instituição diretamente no portal e-MEC.' : ''}
                  </p>
                </div>
                <div className="border-b border-neutral-100 pb-4">
                  <h3 className="font-semibold text-neutral-800 mb-2">
                    Quanto custa estudar na Faculdade {institution.name}?
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    Os valores das mensalidades na Faculdade {institution.name} variam de acordo com o curso e a modalidade escolhida.
                    Pelo Bolsa Click, você encontra bolsas de estudo com descontos de até 80% nas mensalidades, tornando o ensino superior muito mais acessível.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-800 mb-2">
                    A Faculdade {institution.name} tem cursos EAD?
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    {institution.modalities.includes('EAD')
                      ? `Sim, a Faculdade ${institution.name} oferece cursos na modalidade EAD (Ensino a Distância), permitindo que você estude de qualquer lugar do Brasil com flexibilidade de horários.`
                      : `Atualmente, a Faculdade ${institution.name} oferece cursos nas modalidades ${institution.modalities.map(m => m === 'PRESENCIAL' ? 'presencial' : 'semipresencial').join(' e ')}.`}
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* CTA */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 sticky top-4">
              <h3 className="font-bold text-lg text-neutral-800 mb-3">
                Bolsas na {institution.name}
              </h3>
              <p className="text-neutral-600 text-sm mb-4">
                Encontre bolsas de estudo com até 95% de desconto na {institution.name}.
                Inscrição grátis!
              </p>
              <a
                href="#ofertas"
                className="flex items-center justify-center gap-2 w-full bg-bolsa-primary hover:bg-bolsa-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <GraduationCap size={18} />
                Ver bolsas disponíveis
              </a>
              <Link
                href={`/curso/resultado?nivel=GRADUACAO`}
                className="flex items-center justify-center gap-2 w-full mt-3 border-2 border-bolsa-primary text-bolsa-primary hover:bg-bolsa-primary/5 font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                <BookOpen size={18} />
                Ver todos os cursos
              </Link>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h3 className="font-bold text-lg text-neutral-800 mb-4">Informações</h3>
              <ul className="space-y-3">
                {institution.headquartersCity && institution.headquartersState && (
                  <li className="flex items-center gap-3 text-sm text-neutral-600">
                    <MapPin size={16} className="text-bolsa-primary flex-shrink-0" />
                    <span>Sede: {institution.headquartersCity}/{institution.headquartersState}</span>
                  </li>
                )}
                {institution.founded && (
                  <li className="flex items-center gap-3 text-sm text-neutral-600">
                    <Calendar size={16} className="text-bolsa-primary flex-shrink-0" />
                    <span>Fundada em {institution.founded}</span>
                  </li>
                )}
                {institution.mecRating && (
                  <li className="flex items-center gap-3 text-sm text-neutral-600">
                    <Star size={16} className="text-bolsa-primary flex-shrink-0" fill="currentColor" />
                    <span>Nota MEC: {institution.mecRating}/5</span>
                  </li>
                )}
                <li className="flex items-center gap-3 text-sm text-neutral-600">
                  <Building2 size={16} className="text-bolsa-primary flex-shrink-0" />
                  <span>{typeLabels[institution.type]}</span>
                </li>
              </ul>

              {institution.emecLink && (
                <a
                  href={institution.emecLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-bolsa-primary hover:underline mt-4"
                >
                  <ExternalLink size={14} />
                  Consultar no e-MEC
                </a>
              )}
            </div>

            {/* Modalities */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h3 className="font-bold text-lg text-neutral-800 mb-4">Modalidades</h3>
              <div className="space-y-2">
                {institution.modalities.map((mod) => (
                  <div
                    key={mod}
                    className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 rounded-lg px-3 py-2"
                  >
                    <GraduationCap size={14} className="text-bolsa-primary" />
                    {modalityLabels[mod] || mod}
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-lg text-neutral-800 mb-4 mt-6">Níveis de Ensino</h3>
              <div className="space-y-2">
                {institution.academicLevels.map((level) => (
                  <div
                    key={level}
                    className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 rounded-lg px-3 py-2"
                  >
                    <BookOpen size={14} className="text-bolsa-primary" />
                    {levelLabels[level] || level}
                  </div>
                ))}
              </div>
            </div>

            {/* Other Institutions */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
              <h3 className="font-bold text-lg text-neutral-800 mb-4">Outras Faculdades</h3>
              <Link
                href="/faculdades"
                className="flex items-center gap-2 text-sm text-bolsa-primary hover:underline font-medium"
              >
                Ver todas as faculdades parceiras
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </article>
  )
}
