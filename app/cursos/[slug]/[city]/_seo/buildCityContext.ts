/**
 * Gera bloco de texto único por combinação curso × cidade.
 *
 * Objetivo: combater thin content nas city pages. Antes, a única diferença
 * entre /cursos/direito/sao-paulo e /cursos/direito/recife era o nome da
 * cidade. Aqui montamos 2-3 parágrafos com:
 *  - Cenário do curso (areas, demanda) localizado no estado da cidade
 *  - Faixa salarial e empregabilidade
 *  - Skills + faculdades parceiras
 *  - CTA contextual
 *
 * Tudo derivado de campos que já estão no FeaturedCourse, sem precisar
 * popular novas tabelas. Determinístico: mesma entrada → mesma saída
 * (evita oscilação do cache do Google entre crawls).
 */

import type { FeaturedCourseData } from '../../../_data/types'

interface CityContext {
  courseFullName: string
  courseName: string
  apiCourseName: string
  cityName: string
  cityState: string
  paragraphs: string[]
  whyHere: string[]
  averageSalary: string
}

const STATE_HIGHLIGHTS: Record<string, string> = {
  SP: 'maior mercado de trabalho do país',
  RJ: 'segundo maior polo econômico do Brasil',
  MG: 'um dos estados com mais vagas formais do Sudeste',
  RS: 'principal economia do Sul',
  PR: 'forte indústria e agronegócio',
  SC: 'PIB per capita entre os maiores do país',
  BA: 'maior economia do Nordeste',
  PE: 'hub regional do Nordeste com presença industrial',
  CE: 'centro de tecnologia em expansão no Nordeste',
  DF: 'capital federal com forte presença do setor público',
  GO: 'centro logístico e do agronegócio',
  ES: 'porto, petróleo e indústria capixaba',
  PA: 'maior estado da região Norte em PIB',
  AM: 'Zona Franca de Manaus e polo industrial',
  MT: 'liderança em agronegócio brasileiro',
  MS: 'agroindústria e fronteira com o Mercosul',
}

function pickAreaHighlights(areas: string[], n = 3): string[] {
  return areas.slice(0, n)
}

function pickCareerHighlights(careers: string[], n = 3): string[] {
  return careers.slice(0, n)
}

function buildOpeningParagraph(curso: FeaturedCourseData, cityName: string, cityState: string): string {
  const stateLine = STATE_HIGHLIGHTS[cityState] ?? `região com demanda crescente por profissionais qualificados`
  const areaList = pickAreaHighlights(curso.areas).join(', ')
  return (
    `Cursar ${curso.name} em ${cityName}, ${cityState}, é uma decisão estratégica para quem quer atuar em ${areaList}. ` +
    `${cityName} faz parte do ${cityState}, ${stateLine}, e concentra faculdades parceiras com bolsa que reduzem em até 80% a mensalidade. ` +
    `O curso de ${curso.fullName.toLowerCase()} tem duração média de ${curso.duration} e prepara o estudante para um mercado que paga, segundo o CAGED, entre ${curso.averageSalary} no Brasil.`
  )
}

function buildSecondParagraph(curso: FeaturedCourseData, cityName: string): string {
  const careers = pickCareerHighlights(curso.careerPaths)
  const careersList =
    careers.length >= 2
      ? `${careers.slice(0, -1).join(', ')} e ${careers[careers.length - 1]}`
      : careers[0] ?? curso.name
  return (
    `Em ${cityName}, recém-formados em ${curso.name} encontram vagas como ${careersList}, ` +
    `com possibilidade de ascensão para cargos especializados após 3 a 5 anos de experiência. ` +
    `A demanda regional é classificada como ${curso.marketDemand.toLowerCase()}, refletindo o cenário ` +
    `do Brasil para a profissão.`
  )
}

function buildSkillsParagraph(curso: FeaturedCourseData, cityName: string): string {
  const skills = curso.skills.slice(0, 4)
  if (skills.length === 0) return ''
  return (
    `Durante o curso, você desenvolve competências práticas como ${skills.join(', ')}. ` +
    `As faculdades parceiras do Bolsa Click em ${cityName} oferecem grade alinhada ao Catálogo Nacional do MEC ` +
    `e estágio supervisionado, com modalidades presencial, semipresencial e EAD para escolher conforme sua rotina.`
  )
}

export function buildCityContext(curso: FeaturedCourseData, cityName: string, cityState: string): CityContext {
  const paragraphs = [
    buildOpeningParagraph(curso, cityName, cityState),
    buildSecondParagraph(curso, cityName),
    buildSkillsParagraph(curso, cityName),
  ].filter((p) => p.length > 0)

  const whyHere = [
    `${cityName} é uma das ${cityState === 'DF' ? 'principais cidades' : `maiores cidades do ${cityState}`}, com presença consolidada de faculdades parceiras.`,
    `Bolsas de até 80% para ${curso.name} reduzem a mensalidade significativamente em relação ao valor cheio.`,
    `Cadastro 100% gratuito — você compara ${curso.fullName.toLowerCase()} em ${cityName} sem compromisso.`,
    `Suporte humano via WhatsApp tira dúvidas sobre matrícula, documentação e início das aulas.`,
  ]

  return {
    courseFullName: curso.fullName,
    courseName: curso.name,
    apiCourseName: curso.apiCourseName,
    cityName,
    cityState,
    paragraphs,
    whyHere,
    averageSalary: curso.averageSalary,
  }
}
