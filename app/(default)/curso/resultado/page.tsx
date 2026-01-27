import { Metadata } from 'next'
import { Suspense } from 'react'
import SearchResultClient from './SearchResultClient'

export const dynamic = 'force-dynamic'

function capitalizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/(^\w{1})|(\s+\w{1})/g, (match) => match.toUpperCase())
}

function removeCourseSuffix(name: string) {
  return name
    .replace(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i, '')
    .trim()
}

function extractCourseSuffix(name: string): string | null {
  const match = name.match(/ - (Bacharelado|Licenciatura|Tecn[oó]logo)$/i)
  return match ? match[1] : null
}

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams
  const curso = typeof params.c === 'string' ? params.c : ''
  const cursoNomeCompleto = typeof params.cn === 'string' ? params.cn : ''
  const cidade = typeof params.cidade === 'string' ? params.cidade : ''
  const estado = typeof params.estado === 'string' ? params.estado : ''
  const modalidade = typeof params.modalidade === 'string' ? params.modalidade : 'EAD'
  const nivel = typeof params.nivel === 'string' ? params.nivel : 'GRADUACAO'

  // Normalizar parâmetros: se 'c' contém sufixo mas 'cn' não existe, extrair o sufixo
  const courseNameClean = curso ? removeCourseSuffix(curso) : ''
  let finalCn = cursoNomeCompleto || ''
  
  // Se o curso tem sufixo no parâmetro 'c' mas não temos 'cn', extrair o sufixo
  if (curso && !finalCn && nivel === 'GRADUACAO') {
    const suffix = extractCourseSuffix(curso)
    if (suffix) {
      finalCn = suffix
    }
  }

  const courseName = courseNameClean ? capitalizeText(courseNameClean) : ''
  const modalidadeFormatted = capitalizeText(modalidade === 'EAD' ? 'A Distância' : modalidade)
  const locationText = cidade && estado ? ` em ${cidade} - ${estado}` : ''
  
  // Determinar o tipo de curso baseado no nível
  const courseType = nivel === 'POS_GRADUACAO' ? 'Pós-graduação' : 
                     nivel === 'TECNICO' ? 'Técnico' : 
                     'Graduação'

  // Verificar se há curso selecionado (cidade/estado sozinhos não contam como filtro para o título)
  // Quando não há curso, sempre mostrar "Buscar cursos" mesmo que tenha cidade/estado (geolocalização automática)
  const hasCourseSelected = courseName && courseName.trim().length > 0
  
  // Se não houver curso selecionado, usar título genérico "Buscar cursos"
  // Nota: O layout principal adiciona " - Bolsa Click" automaticamente via template
  const title = hasCourseSelected
    ? `${courseType} em ${courseName} - ${modalidadeFormatted}${locationText} com até 80% de desconto`
    : 'Buscar cursos'

  const description = hasCourseSelected
    ? `Compare bolsas para ${courseType.toLowerCase()} em ${courseName} (${modalidadeFormatted})${locationText}. Encontre as melhores ofertas com até 80% de desconto nas principais faculdades do Brasil. Cadastre-se grátis e economize!`
    : 'Busque e compare bolsas de estudo para graduação, pós-graduação e cursos técnicos. Encontre as melhores ofertas com até 80% de desconto nas principais faculdades do Brasil. Cadastre-se grátis!'

  // Construir URL canônica auto-referencial e normalizada
  // Normalização: sempre usar 'c' limpo e 'cn' separado (se aplicável)
  // Isso garante consistência e evita duplicação de conteúdo
  const canonicalParams = new URLSearchParams()
  
  // Ordem alfabética para consistência: c, cn, cidade, estado, modalidade, nivel
  if (courseNameClean && courseNameClean.trim()) {
    canonicalParams.set('c', courseNameClean.trim())
  }
  
  // Incluir 'cn' apenas se existir e for graduação (pós-graduação não usa sufixo)
  if (finalCn && finalCn.trim() && nivel === 'GRADUACAO') {
    canonicalParams.set('cn', finalCn.trim())
  }
  
  if (cidade && cidade.trim()) {
    canonicalParams.set('cidade', cidade.trim())
  }
  if (estado && estado.trim()) {
    canonicalParams.set('estado', estado.trim())
  }
  
  // Sempre incluir modalidade e nivel (valores padrão se não especificados)
  canonicalParams.set('modalidade', modalidade)
  canonicalParams.set('nivel', nivel)
  
  // URL canônica auto-referencial: sempre aponta para a própria página com www
  // Normalizada para evitar múltiplas URLs apontando para o mesmo conteúdo
  const canonicalUrl = `https://www.bolsaclick.com.br/curso/resultado?${canonicalParams.toString()}`

  const keywords = [
    courseName && `${courseName} com bolsa`,
    courseName && `bolsa de estudo ${courseName}`,
    modalidadeFormatted && `graduação ${modalidadeFormatted.toLowerCase()}`,
    cidade && `faculdade em ${cidade}`,
    estado && `cursos em ${estado}`,
    'bolsas de estudo',
    'educação superior',
    'Bolsa Click',
  ].filter(Boolean) as string[]

  return {
    title,
    description,
    robots: 'index, follow',
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Bolsa Click',
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@bolsaclick',
      title,
      description,
    },
  }
}

export default function CursosPage() {
  return (
    <Suspense fallback={<div className="p-4 text-gray-500">Carregando cursos...</div>}>
      <SearchResultClient />
    </Suspense>
  )
}