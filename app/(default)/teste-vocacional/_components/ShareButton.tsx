'use client'

import { useState } from 'react'
import { Share2, Loader2, X, Check, Copy, MessageCircle, Twitter, Linkedin } from 'lucide-react'
import type { ProfileResult } from './ResultCards'

interface ShareButtonProps {
  profile: ProfileResult
}

type Stage = 'idle' | 'generating' | 'sharing' | 'fallback' | 'error'

export function ShareButton({ profile }: ShareButtonProps) {
  const [stage, setStage] = useState<Stage>('idle')
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateShare = async (): Promise<string | null> => {
    setStage('generating')
    setError(null)
    try {
      const res = await fetch('/api/teste-vocacional/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Falha ao gerar link')
      }
      const data = (await res.json()) as { shareUrl: string }
      setShareUrl(data.shareUrl)

      // Track no PostHog (se disponível) — fire and forget
      type PostHogClient = { capture?: (event: string, props?: Record<string, unknown>) => void }
      const w = window as unknown as { posthog?: PostHogClient }
      try {
        w.posthog?.capture?.('vocational_test_shared', {
          hollandCode: profile.hollandCode,
        })
      } catch {
        // ignora
      }

      return data.shareUrl
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Erro')
      setStage('error')
      return null
    }
  }

  const handleClick = async () => {
    const url = shareUrl ?? (await generateShare())
    if (!url) return

    const text = `Meu perfil vocacional é ${profile.hollandCode} (${profile.primary.name}). Descubra o seu também!`
    const shareData = {
      title: 'Meu perfil vocacional — Bolsa Click',
      text,
      url,
    }

    // Tenta Web Share API (mobile-first)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        setStage('sharing')
        await navigator.share(shareData)
        setStage('idle')
        return
      } catch (err) {
        // User cancelou ou erro — cai pro fallback
        if ((err as { name?: string })?.name === 'AbortError') {
          setStage('idle')
          return
        }
      }
    }

    setStage('fallback')
  }

  const copyToClipboard = async () => {
    if (!shareUrl) return
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2400)
    } catch {
      // ignora
    }
  }

  const text = shareUrl
    ? encodeURIComponent(`Meu perfil vocacional é ${profile.hollandCode} (${profile.primary.name}). Descubra o seu também: ${shareUrl}`)
    : ''
  const urlEncoded = shareUrl ? encodeURIComponent(shareUrl) : ''

  return (
    <>
      <button
        onClick={handleClick}
        disabled={stage === 'generating' || stage === 'sharing'}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-bolsa-secondary text-white text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-50"
      >
        {stage === 'generating' ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Share2 size={14} />
        )}
        {stage === 'generating' ? 'Gerando link...' : 'Compartilhar meu resultado'}
      </button>

      {stage === 'fallback' && shareUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setStage('idle')
          }}
        >
          <div className="bg-paper border border-hairline rounded-lg shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xl text-ink-900">
                Compartilhar resultado
              </h3>
              <button
                onClick={() => setStage('idle')}
                aria-label="Fechar"
                className="w-9 h-9 flex items-center justify-center text-ink-700 hover:text-ink-900 hover:bg-white rounded-md transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm text-ink-700 mb-4">
              Seu perfil <strong>{profile.hollandCode}</strong> ({profile.primary.name})
              está pronto pra compartilhar. Escolha onde:
            </p>

            <ul className="grid grid-cols-2 gap-2 mb-4">
              <li>
                <a
                  href={`https://wa.me/?text=${text}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-hairline rounded-md hover:bg-paper text-sm text-ink-900"
                >
                  <MessageCircle size={16} className="text-green-600" /> WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`https://twitter.com/intent/tweet?text=${text}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-hairline rounded-md hover:bg-paper text-sm text-ink-900"
                >
                  <Twitter size={16} className="text-sky-500" /> Twitter
                </a>
              </li>
              <li>
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${urlEncoded}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-hairline rounded-md hover:bg-paper text-sm text-ink-900"
                >
                  <Linkedin size={16} className="text-blue-700" /> LinkedIn
                </a>
              </li>
              <li>
                <button
                  onClick={copyToClipboard}
                  className="w-full flex items-center gap-2 px-4 py-2.5 bg-white border border-hairline rounded-md hover:bg-paper text-sm text-ink-900"
                >
                  {copied ? (
                    <Check size={16} className="text-green-600" />
                  ) : (
                    <Copy size={16} className="text-ink-500" />
                  )}
                  {copied ? 'Copiado!' : 'Copiar link'}
                </button>
              </li>
            </ul>

            <p className="font-mono text-[11px] text-ink-500 break-all">
              {shareUrl}
            </p>
          </div>
        </div>
      )}

      {stage === 'error' && (
        <p className="text-xs text-red-700 mt-2">
          {error ?? 'Erro ao gerar link.'}{' '}
          <button onClick={handleClick} className="underline">
            tentar de novo
          </button>
        </p>
      )}
    </>
  )
}
