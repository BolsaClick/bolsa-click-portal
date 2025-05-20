"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function Stats() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2
  });

  const stats = [
    { number: '+25', label: 'Instituições Parceiras', delay: 0 },
    { number: '+85%', label: 'De Desconto Oferecido', delay: 0.2 },
    { number: '+2000', label: 'Cursos Disponíveis', delay: 0.4 },
    { number: '+10k', label: 'Alunos Beneficiados', delay: 0.6 }
  ];

  return (
    <section className="py-16 bg-[#f5f9f5]">
      <div className="container mx-auto px-4">
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.6, delay: stat.delay, ease: "easeOut" }}
            >
              <h3 className="text-3xl sm:text-4xl font-bold text-emerald-700 mb-2">
                {stat.number}
              </h3>
              <p className="text-sm sm:text-base text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}