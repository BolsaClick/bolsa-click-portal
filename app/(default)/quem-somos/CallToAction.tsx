"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';

export default function CallToAction() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <section className="py-20 bg-emerald-700">
      <div className="container mx-auto px-4">
        <motion.div 
          ref={ref}
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Faça parte dessa transformação
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Milhares de estudantes já encontraram seu caminho para o ensino superior com o Bolsa Click. 
            Você pode ser o próximo a transformar seu futuro.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/cursos" 
              className="bg-emerald-300 hover:bg-emerald-400 text-emerald-700 font-medium px-6 py-4 rounded-md transition-all duration-300 flex items-center justify-center gap-2"
            >
              Buscar Bolsas
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link 
              href="/contato" 
              className="bg-transparent border-2 border-white hover:bg-white/10 text-white font-medium px-6 py-4 rounded-md transition-all duration-300"
            >
              Fale Conosco
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}