import { NextRequest, NextResponse } from 'next/server'

// Recebe relatórios de violação de Content-Security-Policy enviados pelo
// browser via report-uri / Report-To. Em modo Report-Only, o browser envia
// um POST aqui sempre que algum recurso seria bloqueado pela policy — sem
// efetivamente bloquear. Loga violações pra ajustar a whitelist antes de
// passar pra enforce.
//
// Formato do payload (browsers maiores ainda mandam o legado "csp-report"):
//   { "csp-report": {
//       "document-uri": "https://...",
//       "violated-directive": "script-src",
//       "blocked-uri": "https://...",
//       "source-file": "...",
//       "line-number": 42,
//       ...
//   } }
//
// Newer browsers usam o formato Reporting API (array de objetos com "body").

export const runtime = 'edge' // ultra-leve; só loga

interface LegacyCspReport {
  'document-uri'?: string
  referrer?: string
  'violated-directive'?: string
  'effective-directive'?: string
  'original-policy'?: string
  'blocked-uri'?: string
  'source-file'?: string
  'line-number'?: number
  'column-number'?: number
  disposition?: string
  'status-code'?: number
}

interface ReportingApiEntry {
  type?: string
  url?: string
  body?: LegacyCspReport & { documentURL?: string }
}

function logViolation(report: LegacyCspReport): void {
  // Filtros defensivos pra reduzir ruído:
  // - extensões do browser injetam scripts (chrome-extension://, moz-extension://)
  // - "inline" reports são esperados durante development
  const blocked = report['blocked-uri'] || ''
  if (
    blocked.startsWith('chrome-extension://') ||
    blocked.startsWith('moz-extension://') ||
    blocked.startsWith('safari-extension://')
  ) {
    return
  }

  console.warn('[csp-violation]', {
    documentUri: report['document-uri'],
    directive: report['effective-directive'] || report['violated-directive'],
    blockedUri: blocked || '(inline)',
    sourceFile: report['source-file'],
    lineNumber: report['line-number'],
  })
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || ''
    const raw = await request.text()
    if (!raw) return new NextResponse(null, { status: 204 })

    const parsed = JSON.parse(raw)

    // Reporting API moderna manda um array de relatórios.
    if (Array.isArray(parsed)) {
      for (const entry of parsed as ReportingApiEntry[]) {
        if (entry.type === 'csp-violation' && entry.body) {
          logViolation(entry.body)
        }
      }
    } else if (parsed['csp-report']) {
      // Formato legacy (single object).
      logViolation(parsed['csp-report'] as LegacyCspReport)
    } else if (contentType.includes('application/reports+json')) {
      // Edge case: alguns browsers usam Reporting API format mas com objeto único
      logViolation(parsed as LegacyCspReport)
    }

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[csp-report] erro ao processar report:', error)
    return new NextResponse(null, { status: 204 })
  }
}
