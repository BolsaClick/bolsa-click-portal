"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Award, Heart, Users, GraduationCap } from 'lucide-react';

export default function Values() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const values = [
    {
      icon: <GraduationCap className="h-8 w-8 text-emerald-700" />,
      title: 'Acesso à Educação',
      description: 'Defendemos que toda pessoa, independentemente da renda, deve ter acesso a uma formação superior de qualidade.',
      delay: 0
    },
    {
      icon: <Award className="h-8 w-8 text-emerald-700" />,
      title: 'Excelência',
      description: 'Nos empenhamos para oferecer a melhor experiência ao aluno, por meio de tecnologia, atendimento e parceiros confiáveis.',
      delay: 0.2
    },
    {
      icon: <Users className="h-8 w-8 text-emerald-700" />,
      title: 'Comunidade',
      description: 'Criamos pontes entre estudantes, instituições e educadores, formando uma rede que transforma vidas por meio da educação.',
      delay: 0.4
    },
    {
      icon: <Heart className="h-8 w-8 text-emerald-700" />,
      title: 'Impacto Social',
      description: 'Trabalhamos com propósito: gerar oportunidades reais, reduzir desigualdades e construir um Brasil mais justo.',
      delay: 0.6
    }
  ];

  return (
    <section className="py-20 bg-[#f5f9f5]" id="nossos-valores">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-4">
            Nossos Valores
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Os pilares que nos guiam todos os dias na missão de democratizar o ensino superior no Brasil.
          </p>
          <div className="w-24 h-1 bg-emerald-300 mx-auto mt-4" />
        </div>

        <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-xl shadow-md text-center h-full flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: value.delay, ease: "easeOut" }}
            >
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-300/30 flex items-center justify-center">
                  {value.icon}
                </div>
              </div>
              <h3 className="text-xl font-bold text-emerald-700 mb-4">{value.title}</h3>
              <p className="text-gray-600 flex-grow">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
