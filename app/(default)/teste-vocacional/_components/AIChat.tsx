'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Loader2, RefreshCw } from 'lucide-react'
import { LeadGate } from './LeadGate'
import { ResultCards, type Recommendation } from './ResultCards'

type Message = { role: 'user' | 'assistant'; content: string }
type Stage = 'intro' | 'chat' | 'gate' | 'loading' | 'result' | 'error'

const MAX_TURNS = 12
// Trigger pra mudar do chat → gate. AI é instruída a usar essa frase exata.
const END_SIGNAL = 'já tenho o suficiente'

export function AIChat() {
  const [stage, setStage] = useState<Stage>('intro')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, streaming])

  const startQuiz = async () => {
    setStage('chat')
    setMessages([])
    setError(null)
    // Inicia conversa com mensagem trigger do usuário (não exibida)
    await sendMessage('Oi, quero descobrir qual curso combina comigo!', [])
  }

  const sendMessage = async (userText: string, prior: Message[]) => {
    const conversation = [...prior, { role: 'user' as const, content: userText }]
    // Só adiciona ao estado se não for a mensagem trigger inicial (escondida)
    const isFirstTrigger = prior.length === 0
    if (!isFirstTrigger) {
      setMessages(conversation)
    }
    setStreaming(true)

    try {
      const res = await fetch('/api/teste-vocacional/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation }),
      })

      if (!res.ok || !res.body) {
        throw new Error('Falha na conversa')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ''

      // Placeholder vazio que vai sendo preenchido
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

      // Detectar fim
      const assistantTurns = final.filter(m => m.role === 'assistant').length
      const ended =
        assistantText.toLowerCase().includes(END_SIGNAL) || assistantTurns >= MAX_TURNS
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
        body: JSON.stringify({ conversation: messages, ...data }),
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Erro ao enviar')
      }
      const json = (await res.json()) as { recommendations: Recommendation[] }
      setRecommendations(json.recommendations)
      setStage('result')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Erro inesperado')
      setStage('error')
    }
  }

  const restart = () => {
    setStage('intro')
    setMessages([])
    setInput('')
    setRecommendations([])
    setError(null)
  }

  if (stage === 'intro') {
    return (
      <div className="bg-white border border-hairline rounded-lg p-8 md:p-12 text-center">
        <Sparkles className="mx-auto text-bolsa-secondary mb-4" size={36} />
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink-900 mb-3">
          Pronto pra descobrir seu curso ideal?
        </h2>
        <p className="text-ink-700 mb-2">
          Vai ser uma conversa curta de uns 3 minutos. Sem certo ou errado.
        </p>
        <p className="text-ink-500 text-sm mb-6">
          Ao final você recebe os 3 cursos que mais combinam com seu perfil.
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

  if (stage === 'result') {
    return (
      <div className="space-y-6">
        <ResultCards recommendations={recommendations} />
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
      className="bg-white border border-hairline rounded-lg p-4 h-[400px] overflow-y-auto space-y-3"
    >
      {messages.length === 0 && streaming && (
        <div className="flex items-center gap-2 text-ink-500 text-sm">
          <Loader2 size={14} className="animate-spin" />
          Iniciando conversa...
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
