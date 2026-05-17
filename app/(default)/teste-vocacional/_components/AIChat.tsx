'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Loader2, RefreshCw } from 'lucide-react'
import { LikertQuiz } from './LikertQuiz'
import { LeadGate } from './LeadGate'
import { ResultCards, type ProfileResult } from './ResultCards'
import type { LikertAnswers } from '@/app/lib/teste-vocacional/matching'

type Message = { role: 'user' | 'assistant'; content: string }
type Stage = 'intro' | 'likert' | 'chat' | 'gate' | 'loading' | 'result' | 'error'

const MAX_REFINE_TURNS = 4
const END_SIGNAL = 'já tenho o suficiente'

export function AIChat() {
  const [stage, setStage] = useState<Stage>('intro')
  const [likertAnswers, setLikertAnswers] = useState<LikertAnswers>({})
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [profileResult, setProfileResult] = useState<ProfileResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streaming])

  const startQuiz = () => {
    setStage('likert')
    setLikertAnswers({})
    setMessages([])
    setError(null)
  }

  const handleLikertComplete = async (answers: LikertAnswers) => {
    setLikertAnswers(answers)
    setStage('chat')
    // Inicia conversa: AI faz primeira pergunta aberta personalizada baseada no perfil
    await sendMessage('Pronto! Agora me faça uma pergunta aberta pra refinar.', [], answers)
  }

  const sendMessage = async (
    userText: string,
    prior: Message[],
    answersOverride?: LikertAnswers
  ) => {
    const answers = answersOverride ?? likertAnswers
    const conversation = [...prior, { role: 'user' as const, content: userText }]
    const isFirstTrigger = prior.length === 0
    if (!isFirstTrigger) {
      setMessages(conversation)
    }
    setStreaming(true)

    try {
      const res = await fetch('/api/teste-vocacional/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ likertAnswers: answers, messages: conversation }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Falha na conversa')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      const baseMessages = isFirstTrigger ? [] : conversation
      setMessages([...baseMessages, { role: 'assistant', content: '' }])

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assistantText += chunk
        setMessages([...baseMessages, { role: 'assistant', content: assistantText }])
      }

      const final = [...baseMessages, { role: 'assistant' as const, content: assistantText }]
      setMessages(final)
      setStreaming(false)

      const assistantTurns = final.filter(m => m.role === 'assistant').length
      const ended =
        assistantText.toLowerCase().includes(END_SIGNAL) || assistantTurns >= MAX_REFINE_TURNS
      if (ended) {
        setStage('gate')
      }
    } catch (err) {
      console.error(err)
      setStreaming(false)
      setError('Estamos com instabilidade temporária. Tente novamente em alguns segundos.')
      setStage('error')
    }
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || streaming) return
    setInput('')
    await sendMessage(text, messages)
  }

  const handleGateSubmit = async (data: { name: string; email: string; phone: string }) => {
    setStage('loading')
    setError(null)
    try {
      const res = await fetch('/api/teste-vocacional/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          likertAnswers,
          conversation: messages,
          ...data,
        }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Erro ao enviar')
      }
      const json = (await res.json()) as ProfileResult
      setProfileResult(json)
      setStage('result')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setStage('error')
    }
  }

  const restart = () => {
    setStage('intro')
    setLikertAnswers({})
    setMessages([])
    setInput('')
    setProfileResult(null)
    setError(null)
  }

  if (stage === 'intro') {
    return (
      <div className="bg-white border border-hairline rounded-lg p-6 md:p-12 text-center">
        <Sparkles className="mx-auto text-bolsa-secondary mb-3 md:mb-4 w-7 h-7 md:w-9 md:h-9" />
        <h2 className="font-display text-xl md:text-3xl font-semibold text-ink-900 mb-2 md:mb-3 leading-tight">
          Pronto pra descobrir seu curso ideal?
        </h2>
        <p className="text-ink-700 text-sm md:text-base mb-2">
          São 20 perguntas rápidas + 2-3 perguntas abertas com nossa IA, em uns 5 minutos.
        </p>
        <p className="text-ink-500 text-xs md:text-sm mb-5 md:mb-6">
          Metodologia baseada em RIASEC (Holland) + Inteligências Múltiplas (Gardner).
        </p>
        <button
          onClick={startQuiz}
          className="inline-flex items-center gap-2 px-6 py-3 bg-bolsa-secondary text-white font-medium rounded-md hover:opacity-90"
        >
          <Sparkles size={16} />
          Começar agora
        </button>
      </div>
    )
  }

  if (stage === 'likert') {
    return <LikertQuiz onComplete={handleLikertComplete} />
  }

  if (stage === 'gate') {
    return (
      <div className="space-y-4">
        <ChatBubbles messages={messages} streaming={false} scrollRef={scrollRef} />
        <LeadGate onSubmit={handleGateSubmit} />
      </div>
    )
  }

  if (stage === 'loading') {
    return (
      <div className="bg-white border border-hairline rounded-lg p-12 text-center">
        <Loader2 className="mx-auto text-bolsa-secondary animate-spin mb-4" size={32} />
        <p className="text-ink-700">Montando sua trilha personalizada...</p>
        <p className="text-ink-500 text-sm mt-1">Isso leva uns 3-5 segundos.</p>
      </div>
    )
  }

  if (stage === 'result' && profileResult) {
    return (
      <div className="space-y-6">
        <ResultCards profile={profileResult} />
        <div className="text-center">
          <button
            onClick={restart}
            className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900"
          >
            <RefreshCw size={14} /> Refazer o teste
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 mb-4">{error ?? 'Erro inesperado.'}</p>
        <button
          onClick={restart}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-bolsa-secondary text-white text-sm font-medium rounded-md hover:opacity-90"
        >
          <RefreshCw size={14} /> Tentar de novo
        </button>
      </div>
    )
  }

  // stage === 'chat'
  return (
    <div className="space-y-4">
      <div className="bg-paper border border-hairline rounded-lg px-4 py-3 flex items-center gap-2">
        <Sparkles size={14} className="text-bolsa-secondary shrink-0" />
        <p className="text-xs text-ink-700">
          Suas respostas estão sendo refinadas. Mais 2-3 perguntas e você vê o resultado.
        </p>
      </div>
      <ChatBubbles messages={messages} streaming={streaming} scrollRef={scrollRef} />
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 bg-white border border-hairline rounded-lg p-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escreva sua resposta..."
          disabled={streaming}
          maxLength={1000}
          className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || streaming}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-bolsa-secondary text-white text-sm font-medium rounded-md hover:opacity-90 disabled:opacity-40"
        >
          {streaming ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          Enviar
        </button>
      </form>
    </div>
  )
}

function ChatBubbles({
  messages,
  streaming,
  scrollRef,
}: {
  messages: Message[]
  streaming: boolean
  scrollRef: React.RefObject<HTMLDivElement | null>
}) {
  return (
    <div
      ref={scrollRef}
      className="bg-white border border-hairline rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto space-y-3"
    >
      {messages.length === 0 && streaming && (
        <div className="flex items-center gap-2 text-ink-500 text-sm">
          <Loader2 size={14} className="animate-spin" />
          A IA está analisando suas respostas...
        </div>
      )}
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-bolsa-secondary text-white rounded-br-sm'
                : 'bg-paper text-ink-900 rounded-bl-sm'
            }`}
          >
            {m.content || (streaming && i === messages.length - 1 ? '…' : '')}
          </div>
        </div>
      ))}
    </div>
  )
}
