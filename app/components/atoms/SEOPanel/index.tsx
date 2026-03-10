'use client'

import { useMemo } from 'react'
import {
  Search,
  Share2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  BarChart3,
  FileText,
  Clock,
  Type,
  Hash,
  Link as LinkIcon,
  ImageIcon,
  Heading2,
  List,
} from 'lucide-react'

interface SEOPanelProps {
  title: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  content: string
  slug: string
  featuredImage: string
  imageAlt: string
}

type CheckStatus = 'green' | 'yellow' | 'red'

interface CheckItem {
  label: string
  status: CheckStatus
  detail: string
  icon: React.ReactNode
}

function StatusIcon({ status }: { status: CheckStatus }) {
  if (status === 'green') return <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
  if (status === 'yellow') return <AlertCircle size={14} className="text-yellow-500 flex-shrink-0" />
  return <XCircle size={14} className="text-red-500 flex-shrink-0" />
}

function extractTextFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function extractHeadings(html: string): { level: number; text: string }[] {
  const regex = /<h([2-3])[^>]*>(.*?)<\/h\1>/gi
  const headings: { level: number; text: string }[] = []
  let match
  while ((match = regex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1]),
      text: match[2].replace(/<[^>]*>/g, ''),
    })
  }
  return headings
}

export default function SEOPanel({
  title,
  metaTitle,
  metaDescription,
  excerpt,
  content,
  slug,
  featuredImage,
  imageAlt,
}: SEOPanelProps) {
  const analysis = useMemo(() => {
    const plainText = extractTextFromHtml(content)
    const words = plainText.split(/\s+/).filter(Boolean)
    const wordCount = words.length
    const charCount = plainText.length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))
    const headings = extractHeadings(content)

    const displayTitle = metaTitle || title
    const displayDescription = metaDescription || excerpt
    const titleLen = displayTitle.length
    const descLen = displayDescription.length

    const hasH2 = /<h2[\s>]/i.test(content)
    const hasImages = /<img[\s>]/i.test(content)
    const hasImageAlt = imageAlt.trim().length > 0
    const hasInternalLinks = /href=["']\/((?!\/)[^"']*)["']/i.test(content)

    const checks: CheckItem[] = [
      {
        label: 'Título SEO',
        icon: <Type size={12} />,
        status: titleLen >= 50 && titleLen <= 60 ? 'green' : titleLen >= 30 && titleLen <= 70 ? 'yellow' : 'red',
        detail: `${titleLen} caracteres${titleLen === 0 ? '' : titleLen < 30 ? ' (muito curto)' : titleLen > 70 ? ' (muito longo)' : titleLen < 50 ? ' (poderia ser mais longo)' : titleLen > 60 ? ' (um pouco longo)' : ' (ideal)'}`,
      },
      {
        label: 'Meta description',
        icon: <FileText size={12} />,
        status: descLen >= 120 && descLen <= 160 ? 'green' : descLen >= 80 && descLen <= 200 ? 'yellow' : 'red',
        detail: `${descLen} caracteres${descLen === 0 ? '' : descLen < 80 ? ' (muito curta)' : descLen > 200 ? ' (muito longa)' : descLen < 120 ? ' (poderia ser maior)' : descLen > 160 ? ' (um pouco longa)' : ' (ideal)'}`,
      },
      {
        label: 'Título H2',
        icon: <Heading2 size={12} />,
        status: hasH2 ? 'green' : 'red',
        detail: hasH2 ? `${headings.filter(h => h.level === 2).length} encontrado(s)` : 'Nenhum H2 no conteúdo',
      },
      {
        label: 'Alt da imagem',
        icon: <ImageIcon size={12} />,
        status: !featuredImage ? 'yellow' : hasImageAlt ? 'green' : 'red',
        detail: !featuredImage ? 'Sem imagem de destaque' : hasImageAlt ? 'Preenchido' : 'Imagem sem alt text',
      },
      {
        label: 'Contagem de palavras',
        icon: <Hash size={12} />,
        status: wordCount >= 300 ? 'green' : wordCount >= 150 ? 'yellow' : 'red',
        detail: `${wordCount} palavras${wordCount < 150 ? ' (muito pouco)' : wordCount < 300 ? ' (abaixo do ideal)' : ' (bom)'}`,
      },
      {
        label: 'Links internos',
        icon: <LinkIcon size={12} />,
        status: hasInternalLinks ? 'green' : 'red',
        detail: hasInternalLinks ? 'Encontrado(s)' : 'Nenhum link interno',
      },
    ]

    const score = checks.filter(c => c.status === 'green').length
    const total = checks.length

    return {
      plainText,
      wordCount,
      charCount,
      readingTime,
      headings,
      checks,
      score,
      total,
      displayTitle,
      displayDescription,
      hasImages,
    }
  }, [title, metaTitle, metaDescription, excerpt, content, featuredImage, imageAlt])

  const scoreColor =
    analysis.score >= 5 ? 'text-green-600' : analysis.score >= 3 ? 'text-yellow-600' : 'text-red-600'

  return (
    <div className="space-y-4">
      {/* Score Badge */}
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 size={16} className="text-bolsa-primary" />
            SEO Score
          </h3>
          <span className={`text-lg font-bold ${scoreColor}`}>
            {analysis.score}/{analysis.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              analysis.score >= 5 ? 'bg-green-500' : analysis.score >= 3 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${(analysis.score / analysis.total) * 100}%` }}
          />
        </div>
      </div>

      {/* Google Preview */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <Search size={16} className="text-bolsa-primary" />
          Preview Google
        </h3>
        <div className="bg-white rounded-lg p-3 border border-gray-100">
          <p className="text-[13px] text-green-700 truncate mb-0.5">
            bolsaclick.com.br/blog/{slug || 'seu-artigo'}
          </p>
          <p className="text-[18px] text-blue-800 font-medium leading-snug line-clamp-1 hover:underline cursor-default mb-0.5">
            {analysis.displayTitle || 'Título do artigo'}
          </p>
          <p className="text-[13px] text-gray-600 leading-snug line-clamp-2">
            {analysis.displayDescription || 'Descrição do artigo aparecerá aqui...'}
          </p>
        </div>
      </div>

      {/* Social Preview */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <Share2 size={16} className="text-bolsa-primary" />
          Preview Social
        </h3>
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          {featuredImage ? (
            <div className="relative w-full h-32 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={featuredImage} alt="OG Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
              <ImageIcon size={24} className="text-gray-300" />
            </div>
          )}
          <div className="p-3 bg-gray-50">
            <p className="text-[11px] text-gray-500 uppercase mb-0.5">bolsaclick.com.br</p>
            <p className="text-sm font-semibold text-gray-900 line-clamp-1">
              {analysis.displayTitle || 'Título do artigo'}
            </p>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
              {analysis.displayDescription || 'Descrição do artigo'}
            </p>
          </div>
        </div>
      </div>

      {/* SEO Checklist */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <CheckCircle2 size={16} className="text-bolsa-primary" />
          Checklist SEO
        </h3>
        <div className="space-y-2">
          {analysis.checks.map((check) => (
            <div key={check.label} className="flex items-start gap-2">
              <StatusIcon status={check.status} />
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-700">{check.label}</p>
                <p className="text-[11px] text-gray-500">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl border p-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
          <BarChart3 size={16} className="text-bolsa-primary" />
          Estatísticas
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-gray-900">{analysis.wordCount}</p>
            <p className="text-[11px] text-gray-500">Palavras</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-gray-900">{analysis.charCount}</p>
            <p className="text-[11px] text-gray-500">Caracteres</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-gray-900 flex items-center justify-center gap-1">
              <Clock size={14} />
              {analysis.readingTime}
            </p>
            <p className="text-[11px] text-gray-500">Min. leitura</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5 text-center">
            <p className="text-lg font-bold text-gray-900">{analysis.headings.length}</p>
            <p className="text-[11px] text-gray-500">Subtítulos</p>
          </div>
        </div>
      </div>

      {/* TOC Preview */}
      {analysis.headings.length > 0 && (
        <div className="bg-white rounded-xl border p-4">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
            <List size={16} className="text-bolsa-primary" />
            Sumário (TOC)
          </h3>
          <ul className="space-y-1">
            {analysis.headings.map((h, i) => (
              <li
                key={i}
                className={`text-xs text-gray-600 ${h.level === 3 ? 'ml-4' : ''}`}
              >
                <span className="text-gray-400 mr-1">
                  {h.level === 2 ? '●' : '○'}
                </span>
                {h.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
