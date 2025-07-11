'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { GraduationCap, Target } from 'lucide-react';

export default function Mission() {
  const [missionRef, missionInView] = useInView({ triggerOnce: true, threshold: 0.2 });
  const [visionRef, visionInView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section id="nossa-missao" className="py-20 bg-white" aria-labelledby="titulo-missao">
      <div className="container mx-auto px-4">
        <header className="text-center mb-16">
          <h2
            id="titulo-missao"
            className="text-3xl md:text-4xl font-bold text-emerald-600 mb-4"
          >
            Nossa Missão e Visão
          </h2>
          <div className="w-24 h-1 bg-emerald-300 mx-auto" />
        </header>

        <div className="grid md:grid-cols-2 gap-10">
          <motion.article
            ref={missionRef}
            initial={{ opacity: 0, y: 30 }}
            animate={missionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="bg-white p-8 rounded-xl shadow-lg"
            aria-label="Missão do Bolsa Click"
          >
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-emerald-500" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-emerald-500 mb-4 text-center">
              Nossa Missão
            </h3>
            <p className="text-gray-700 mb-4 text-center">
              Democratizar o acesso à educação superior no Brasil, conectando estudantes com
              instituições de ensino de qualidade através de bolsas e descontos exclusivos,
              tornando a formação profissional mais acessível para todos.
            </p>
            <p className="text-gray-700 text-center">
              Acreditamos que a educação é um direito fundamental e trabalhamos para remover
              barreiras financeiras que impedem muitos brasileiros de alcançar seus sonhos
              educacionais.
            </p>
          </motion.article>

          <motion.article
            ref={visionRef}
            initial={{ opacity: 0, y: 30 }}
            animate={visionInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="bg-white p-8 rounded-xl shadow-lg"
            aria-label="Visão do Bolsa Click"
          >
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Target className="h-8 w-8 text-emerald-500" aria-hidden="true" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-emerald-500 mb-4 text-center">
              Nossa Visão
            </h3>
            <p className="text-gray-700 mb-4 text-center">
              Ser a principal plataforma de acesso à educação superior no Brasil, reconhecida pela
              excelência em conectar estudantes com oportunidades educacionais, contribuindo para a
              formação de milhões de profissionais.
            </p>
            <p className="text-gray-700 text-center">
              Buscamos um Brasil onde as limitações financeiras não sejam obstáculos para quem
              deseja seguir uma carreira através da formação superior, criando um futuro com mais
              oportunidades para todos.
            </p>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
