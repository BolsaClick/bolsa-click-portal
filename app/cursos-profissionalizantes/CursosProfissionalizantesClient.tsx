'use client'

import { useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle, GraduationCap, Briefcase, Clock, Target, ChevronDown } from 'lucide-react'

export default function CursosProfissionalizantesClient() {
  const router = useRouter()
  const infoSectionRef = useRef<HTMLElement>(null)

  const handleComecarAgora = () => {
    router.push('/curso/resultado?nivel=CURSO_PROFISSIONALIZANTE')
  }

  const handleSaibaMais = () => {
    infoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      <header className="relative bg-gradient-to-r from-emerald-950 to-emerald-700 text-white py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 to-emerald-700/60" />
        <motion.div
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Briefcase className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Cursos Profissionalizantes
          </h1>
          <p className="text-lg md:text-xl text-emerald-100 max-w-3xl mx-auto">
            Formação prática para entrar no mercado mais rápido, com foco em empregabilidade e habilidades do dia a dia profissional.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleComecarAgora}
              className="bg-white text-emerald-700 px-8 py-4 rounded-full font-semibold hover:bg-emerald-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Target className="w-5 h-5" />
              Começar Agora
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleSaibaMais}
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Saiba Mais
            </button>
          </div>
        </motion.div>
      </header>

      <section ref={infoSectionRef} className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-emerald-900 mb-10">
          Por que escolher um profissionalizante?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Clock, title: 'Duração menor', text: 'Cursos objetivos para você se qualificar em menos tempo.' },
            { icon: Briefcase, title: 'Foco no mercado', text: 'Conteúdos práticos voltados para demandas reais das empresas.' },
            { icon: GraduationCap, title: 'Entrada rápida', text: 'Ideal para conquistar sua primeira vaga ou mudar de área.' },
          ].map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 shadow-md border border-emerald-100">
              <item.icon className="w-8 h-8 text-emerald-600 mb-3" />
              <h3 className="text-xl font-semibold mb-2 text-emerald-900">{item.title}</h3>
              <p className="text-gray-600">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 bg-emerald-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-emerald-900 mb-10">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {[
              {
                question: 'O que é um curso profissionalizante?',
                answer: 'E um curso com foco em competências tecnicas e praticas para atuar em funcoes especificas do mercado de trabalho.',
              },
              {
                question: 'Tem bolsa para cursos profissionalizantes?',
                answer: 'Sim. No Bolsa Click voce encontra opcoes com descontos para comparar e escolher a melhor condicao.',
              },
              {
                question: 'Preciso de faculdade para fazer?',
                answer: 'Nao. Em geral, os cursos profissionalizantes sao independentes e focam em qualificacao profissional.',
              },
            ].map((faq) => (
              <details key={faq.question} className="group bg-white rounded-xl shadow-sm border border-emerald-100">
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <h3 className="text-lg font-semibold text-emerald-900 pr-4">{faq.question}</h3>
                  <ChevronDown className="w-5 h-5 text-emerald-600 transition-transform group-open:rotate-180" />
                </summary>
                <div className="px-5 pb-5 text-gray-600">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mt-1 flex-shrink-0" />
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
