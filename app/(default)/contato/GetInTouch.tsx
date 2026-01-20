"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MessageSquare, Phone, ArrowRight, Headset } from 'lucide-react';

export default function GetInTouch() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const supportOptions = [
    {
      icon: <MessageSquare className="h-12 w-12 text-bolsa-secondary mb-4" />,
      title: "Chat Online",
      description: "Converse em tempo real com nossa equipe de suporte das 8h às 20h em dias úteis.",
      cta: "Iniciar Chat",
      link: "#chat",
      delay: 0
    },
    {
      icon: <Phone className="h-12 w-12 text-bolsa-secondary mb-4" />,
      title: "Telefone",
      description: "Prefere conversar por telefone? Nossa central está pronta para te atender.",
      cta: "Ligar Agora",
      link: "tel:+551140028922",
      delay: 0.2
    },
    {
      icon: <Headset className="h-12 w-12 text-bolsa-secondary mb-4" />,
      title: "Agendamento",
      description: "Agende um horário para conversar com um de nossos consultores educacionais.",
      cta: "Agendar Horário",
      link: "#agendar",
      delay: 0.4
    }
  ];

  return (
    <section className="py-20 bg-bolsa-primary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Estamos prontos para te atender
          </h2>
          <p className="text-lg text-white/80 max-w-3xl mx-auto">
            Escolha a melhor forma de contato para suas necessidades e entre em contato conosco.
          </p>
          <div className="w-24 h-1 bg-bolsa-secondary mx-auto mt-4"></div>
        </div>

        <div ref={ref} className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {supportOptions.map((option, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl p-8 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              transition={{ duration: 0.7, delay: option.delay, ease: "easeOut" }}
            >
              <div className="flex justify-center">
                {option.icon}
              </div>
              <h3 className="text-xl font-bold text-bolsa-primbg-bolsa-primary mb-3">{option.title}</h3>
              <p className="text-gray-600 mb-6">{option.description}</p>
              <Link
                href={option.link}
                className="inline-flex items-center bg-emerald-50 hover:bg-emerald-100 text-bolsa-primbg-bolsa-primary font-medium px-5 py-3 rounded-md transition-all duration-300"
              >
                {option.cta}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
        >
          <p className="text-xl text-white/90 mb-8">
            Seu sucesso acadêmico é nossa prioridade. Estamos aqui para ajudar você a encontrar as melhores oportunidades educacionais!
          </p>
          <Link
            href="/curso"
            className="inline-flex items-center bg-bolsa-secondary hover:bg-bolsa-secondary/75 text-white font-medium px-8 py-4 rounded-md transition-all duration-300 text-lg"
          >
            Explorar Bolsas Disponíveis
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}