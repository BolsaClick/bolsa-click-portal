'use client'

import { useState } from 'react'
import Container from '../../atoms/Container'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'Como funcionam as bolsas de estudo do Bolsa Click?',
    answer:
      'O Bolsa Click conecta você a bolsas de estudo de até 95% de desconto. Basta buscar por curso, cidade e modalidade. Depois, compare os preços e se cadastre grátis para garantir sua bolsa em faculdade.',
  },
  {
    question: 'As bolsas de estudo são gratuitas?',
    answer:
      'Sim! O cadastro no Bolsa Click é 100% gratuito. Você não paga nada para buscar e comparar bolsas. Só paga a mensalidade com desconto quando se matricular na faculdade.',
  },
  {
    question: 'Quais tipos de bolsa de estudo posso encontrar?',
    answer:
      'Você encontra bolsas para graduação, pós-graduação e cursos técnicos. Todas as modalidades estão disponíveis: presencial, semipresencial e EAD. São mais de 100.000 cursos em 30.000 faculdades.',
  },
  {
    question: 'Preciso da nota do ENEM para conseguir bolsa?',
    answer:
      'Não! No Bolsa Click, você não precisa de nota do ENEM para conseguir sua bolsa de estudo. Basta se cadastrar, escolher o curso e garantir seu desconto.',
  },
  {
    question: 'A bolsa vale para todo o curso?',
    answer:
      'Sim. As bolsas de estudo do Bolsa Click valem do primeiro ao último semestre. Você paga a mensalidade com desconto durante toda a graduação ou pós-graduação.',
  },
  {
    question: 'Existem bolsas EAD disponíveis?',
    answer:
      'Sim! Temos milhares de bolsas EAD com descontos de até 80%. Os cursos a distância possuem diploma reconhecido pelo MEC, igual ao presencial. Estude de casa, no seu ritmo.',
  },
]

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="bg-white py-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-blue-950 mb-3 text-center">
            Perguntas Frequentes sobre Bolsas de Estudo
          </h2>
          <p className="text-neutral-600 text-center mb-8">
            Tire suas dúvidas sobre como conseguir bolsa de estudo em faculdade.
          </p>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-neutral-200 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-medium text-blue-950 pr-4">{faq.question}</span>
                  <ChevronDown
                    size={20}
                    className={`text-neutral-400 flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-4 pb-4">
                    <p className="text-neutral-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
