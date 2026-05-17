'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react'
import { QUESTIONS, CHAPTERS, type LikertQuestion } from '@/app/lib/teste-vocacional/questions'
import type { LikertAnswers } from '@/app/lib/teste-vocacional/matching'

interface LikertQuizProps {
  onComplete: (answers: LikertAnswers) => void
}

const LABELS = [
  { value: 1, short: 'Discordo totalmente' },
  { value: 2, short: 'Discordo' },
  { value: 3, short: 'Neutro' },
  { value: 4, short: 'Concordo' },
  { value: 5, short: 'Concordo totalmente' },
]

export function LikertQuiz({ onComplete }: LikertQuizProps) {
  const [answers, setAnswers] = useState<LikertAnswers>({})
  const [index, setIndex] = useState(0)
  const current: LikertQuestion = QUESTIONS[index]
  const chapter = CHAPTERS.find(c => c.id === current.chapter)!
  const totalQuestions = QUESTIONS.length
  const progress = ((index + 1) / totalQuestions) * 100
  const isLast = index === totalQuestions - 1
  const currentAnswer = answers[current.id]

  const chapterProgress = useMemo(() => {
    return CHAPTERS.map(ch => {
      const qsInChapter = QUESTIONS.filter(q => q.chapter === ch.id)
      const firstIdx = QUESTIONS.findIndex(q => q.chapter === ch.id)
      const lastIdx = firstIdx + qsInChapter.length - 1
      const isActive = current.chapter === ch.id
      const isDone = index > lastIdx
      return { ...ch, isActive, isDone }
    })
  }, [current.chapter, index])

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [current.id]: value }
    setAnswers(newAnswers)
    // Auto-advance após pequeno delay pra dar sensação tátil
    setTimeout(() => {
      if (isLast) {
        onComplete(newAnswers)
      } else {
        setIndex(i => i + 1)
      }
    }, 280)
  }

  const handleBack = () => {
    if (index > 0) setIndex(i => i - 1)
  }

  const handleSkip = () => {
    // skip = neutro 3
    handleAnswer(3)
  }

  return (
    <div className="bg-white border border-hairline rounded-lg overflow-hidden">
      {/* Cabeçalho com capítulos */}
      <div className="px-5 md:px-8 py-4 border-b border-hairline bg-paper">
        <ul className="flex gap-1.5 mb-3">
          {chapterProgress.map(ch => (
            <li
              key={ch.id}
              className={`flex-1 h-1 rounded-full transition-colors ${
                ch.isDone ? 'bg-bolsa-secondary' : ch.isActive ? 'bg-bolsa-secondary/50' : 'bg-ink-300/40'
              }`}
              aria-label={`Capítulo ${ch.id}: ${ch.title}`}
            />
          ))}
        </ul>
        <div className="flex items-baseline justify-between">
          <p className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
            Capítulo {chapter.id} · {chapter.title}
          </p>
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-ink-500 num-tabular">
            {index + 1}/{totalQuestions}
          </p>
        </div>
      </div>

      {/* Barra de progresso fina */}
      <div className="w-full h-0.5 bg-paper">
        <div
          className="h-full bg-bolsa-secondary transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Pergunta */}
      <div className="px-5 md:px-8 py-8 md:py-12">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-bolsa-secondary mb-3 inline-flex items-center gap-1.5">
          <Sparkles size={11} /> Afirmação {index + 1}
        </p>
        <h3 className="font-display text-xl md:text-3xl font-semibold text-ink-900 leading-snug mb-8 md:mb-10">
          {current.text}
        </h3>

        {/* Escala 1-5 */}
        <div className="grid grid-cols-5 gap-1.5 md:gap-2 mb-2">
          {LABELS.map(opt => {
            const isSelected = currentAnswer === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt.value)}
                className={`group relative flex flex-col items-center justify-center py-4 md:py-5 border rounded-md transition-all ${
                  isSelected
                    ? 'bg-bolsa-secondary border-bolsa-secondary text-white shadow-md scale-105'
                    : 'bg-white border-hairline text-ink-700 hover:border-bolsa-secondary hover:bg-paper'
                }`}
                aria-label={opt.short}
                aria-pressed={isSelected}
              >
                <span className={`font-display text-xl md:text-2xl font-semibold ${isSelected ? '' : 'group-hover:text-ink-900'}`}>
                  {opt.value}
                </span>
              </button>
            )
          })}
        </div>
        <div className="grid grid-cols-2 text-[10px] md:text-xs text-ink-500 font-mono uppercase tracking-wider">
          <span className="text-left">Discordo</span>
          <span className="text-right">Concordo</span>
        </div>
      </div>

      {/* Rodapé com navegação */}
      <div className="px-5 md:px-8 py-4 border-t border-hairline bg-paper flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={index === 0}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={14} /> Voltar
        </button>
        <button
          onClick={handleSkip}
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-ink-500 hover:text-ink-900"
        >
          Pular (neutro)
        </button>
        <button
          onClick={() => isLast ? onComplete(answers) : setIndex(i => i + 1)}
          disabled={!currentAnswer && !isLast}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 disabled:opacity-30"
        >
          {isLast ? 'Finalizar' : 'Próxima'} <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
