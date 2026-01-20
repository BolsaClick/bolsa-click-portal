"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';

export default function Team() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const teamMembers = [
    {
      name: 'Ana Silva',
      role: 'CEO & Fundadora',
      image: 'https://images.pexels.com/photos/5393594/pexels-photo-5393594.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Especialista em educação com mais de 15 anos de experiência, Ana fundou o Bolsa Click com a missão de democratizar o acesso ao ensino superior.',
      delay: 0
    },
    {
      name: 'Carlos Mendes',
      role: 'CTO',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Engenheiro de software com passagem por grandes empresas de tecnologia, Carlos lidera a equipe tecnológica que desenvolve a plataforma.',
      delay: 0.2
    },
    {
      name: 'Mariana Costa',
      role: 'Diretora de Parcerias',
      image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Responsável pelo relacionamento com instituições de ensino, Mariana já estabeleceu mais de 5.000 parcerias estratégicas para o Bolsa Click.',
      delay: 0.4
    },
    {
      name: 'Roberto Santos',
      role: 'Diretor de Marketing',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Com vasta experiência em marketing digital, Roberto é responsável pelas estratégias que conectam estudantes às oportunidades educacionais.',
      delay: 0.6
    }
  ];

  return (
    <section className="py-20 bg-white" id="nossa-equipe">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-700 mb-4">
            Nossa Equipe
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Conheça as pessoas dedicadas a transformar o acesso à educação no Brasil.
          </p>
          <div className="w-24 h-1 bg-[#8ee48a] mx-auto mt-4"></div>
        </div>

        <div ref={ref} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden h-full flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: member.delay, ease: "easeOut" }}
            >
              <div className="relative pt-[100%]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-700/70">
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover"
                    width={50}
                    height={50}
                  />
                </div>
              </div>
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-bold text-emerald-700 mb-1">{member.name}</h3>
                <p className="text-emerald-300 font-medium mb-4">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}