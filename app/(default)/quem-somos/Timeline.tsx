"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Clock } from 'lucide-react';

export default function Timeline() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const timelineItems = [
    {
      year: 2024,
      title: 'O início da jornada',
      description: 'Fundação do BolsaClick com a missão de democratizar o acesso à educação superior no Brasil.',
      delay: 0
    },

    {
      year: 2024,
      title: 'Inovação tecnológica',
      description: 'Lançamento da plataforma digital com sistema inteligente de recomendação de bolsas.',
      delay: 0.4
    },
    {
      year: 2025,
      title: 'Marco de impacto',
      description: 'Celebração de mais de 1 mil estudantes beneficiados com bolsas através da plataforma.',
      delay: 0.8
    }
  ];

  return (
    <section className="py-20 bg-white" id="nossa-historia">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-4">
            Nossa História
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Conheça os principais marcos da nossa trajetória na transformação do acesso à educação no Brasil.
          </p>
          <div className="w-24 h-1 bg-emerald-300 mx-auto mt-4"></div>
        </div>

        <div ref={ref} className="relative max-w-4xl mx-auto">
          {/* Timeline center line */}
          <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-emerald-700/20 z-0"></div>

          {/* Timeline items */}
          {timelineItems.map((item, index) => (
            <motion.div
              key={index}
              className={`relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 mb-12 ${
                index % 2 === 0 ? 'md:flex-row-reverse' : ''
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: item.delay, ease: "easeOut" }}
            >
              {/* Year marker */}
              <div className="flex-none md:w-1/2"></div>
              
              {/* Center circle */}
              <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center z-20">
                <Clock className="h-5 w-5 text-white" />
              </div>
              
              {/* Content box */}
              <div className={`flex-none md:w-1/2 bg-white p-6 rounded-xl shadow-md ${
                index % 2 === 0 ? 'md:text-right md:pr-12' : 'md:pl-12'
              }`}>
                <div className="bg-emerald-700 text-white py-1 px-3 rounded-md inline-block mb-2">
                  {item.year}
                </div>
                <h3 className="text-xl font-bold text-emerald-700 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}