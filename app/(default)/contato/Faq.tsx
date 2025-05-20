"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export default function Faq() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [openItem, setOpenItem] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenItem(openItem === index ? null : index);
  };

  const faqItems = [
    {
      question: "Como funcionam as bolsas de estudo do BolsaClick?",
      answer: "As bolsas de estudo do BolsaClick funcionam como descontos nas mensalidades de cursos em instituições parceiras. Após se cadastrar em nossa plataforma, você pode buscar bolsas disponíveis conforme seus interesses, verificar o percentual de desconto oferecido e as condições para obtenção. Ao selecionar uma bolsa, você recebe orientações para efetuar sua matrícula diretamente na instituição de ensino escolhida."
    },
    {
      question: "Preciso pagar algo para utilizar o BolsaClick?",
      answer: "Não, o BolsaClick é totalmente gratuito para os estudantes. Não cobramos nenhuma taxa para você se cadastrar, buscar ou solicitar bolsas de estudo. Nossa remuneração vem das parcerias com as instituições de ensino."
    },
    {
      question: "As bolsas são válidas para qualquer curso?",
      answer: "Oferecemos bolsas para uma ampla variedade de cursos de graduação, pós-graduação, cursos técnicos e de idiomas. A disponibilidade de bolsas varia conforme as parcerias com cada instituição de ensino. Na plataforma, você pode filtrar por tipo de curso, modalidade e área de interesse para encontrar as opções disponíveis."
    },
    {
      question: "Como faço para garantir minha bolsa de estudos?",
      answer: "Para garantir sua bolsa, você precisa atender aos requisitos específicos da instituição e do programa escolhido. Após selecionar a bolsa na plataforma BolsaClick, você receberá um comprovante de pré-matrícula que deverá ser apresentado à instituição de ensino dentro do prazo estabelecido. A confirmação final da bolsa ocorre após a análise da documentação e aprovação pela instituição."
    },
    {
      question: "Perco minha bolsa se reprovar em alguma disciplina?",
      answer: "As políticas de manutenção de bolsas variam conforme cada instituição de ensino. Em geral, a maioria das instituições exige aprovação em pelo menos 75% das disciplinas cursadas por semestre para manter a bolsa. Recomendamos verificar as condições específicas da instituição escolhida na seção de regras da bolsa."
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-300 mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Encontre respostas para as dúvidas mais comuns sobre o BolsaClick e nossos serviços.
          </p>
          <div className="w-24 h-1 bg-emerald-200 mx-auto mt-4"></div>
        </div>

        <motion.div
          ref={ref}
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {faqItems.map((item, index) => (
              <div key={index} className="border-b border-gray-100 last:border-b-0">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                >
                  <div className="flex items-center">
                    <HelpCircle className="h-5 w-5 text-emerald-200 mr-3 flex-shrink-0" />
                    <span className="font-medium text-emerald-300">{item.question}</span>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {openItem === index ? (
                      <ChevronUp className="h-5 w-5 text-emerald-300" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-emerald-300" />
                    )}
                  </div>
                </button>
                <div 
                  className={`px-6 py-0 overflow-hidden transition-all duration-300 ease-in-out ${
                    openItem === index ? 'max-h-96 pb-6' : 'max-h-0'
                  }`}
                >
                  <p className="text-gray-600">{item.answer}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <p className="text-gray-600 mb-4">Não encontrou o que procurava?</p>
            <a 
              href="#form-contato" 
              className="inline-flex items-center bg-emerald-300 hover:bg-emerald-600 text-white font-medium px-6 py-3 rounded-md transition-all duration-300"
            >
              Entre em contato
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}