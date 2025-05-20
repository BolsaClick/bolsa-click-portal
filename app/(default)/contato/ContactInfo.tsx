"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin, Phone, Mail, Clock,  Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

export default function ContactInfo() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const contactDetails = [
    {
      icon: <Phone className="h-5 w-5 text-emerald-300" />,
      title: 'Telefone',
      details: [
        { label: 'Central de Atendimento', value: '(11) 4002-8922' },
        { label: 'Suporte ao Estudante', value: '(11) 4003-8933' }
      ],
      delay: 0
    },
    {
      icon: <Mail className="h-5 w-5 text-emerald-300" />,
      title: 'Email',
      details: [
        { label: 'Informações Gerais', value: 'contato@bolsaclick.com.br' },
        { label: 'Suporte Técnico', value: 'suporte@bolsaclick.com.br' },
        { label: 'Parcerias', value: 'parcerias@bolsaclick.com.br' }
      ],
      delay: 0.1
    },
    {
      icon: <MapPin className="h-5 w-5 text-emerald-300" />,
      title: 'Endereço',
      details: [
        { 
          label: 'Escritório São Paulo', 
          value: 'Av. Paulista, 1000, Bela Vista, São Paulo - SP, 01310-100' 
        },

      ],
      delay: 0.2
    },
    {
      icon: <Clock className="h-5 w-5 text-emerald-300" />,
      title: 'Horário de Atendimento',
      details: [
        { label: 'Segunda a Sexta', value: '8h às 20h' },
        { label: 'Sábados', value: '9h às 14h' }
      ],
      delay: 0.3
    }
  ];

  const socialMedia = [
    { icon: <Facebook className="h-5 w-5" />, url: '#', name: 'Facebook' },
    { icon: <Instagram className="h-5 w-5" />, url: '#', name: 'Instagram' },
    { icon: <Linkedin className="h-5 w-5" />, url: '#', name: 'LinkedIn' },
    { icon: <Twitter className="h-5 w-5" />, url: '#', name: 'Twitter' }
  ];

  return (
    <motion.div
      ref={ref}
      className="bg-white p-8 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-emerald-300 mb-2">Informações de contato</h2>
      <p className="text-gray-600 mb-8">Veja abaixo todas as formas de entrar em contato conosco.</p>
      
      <div className="space-y-8">
        {contactDetails.map((item, index) => (
          <motion.div 
            key={index}
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: item.delay, ease: "easeOut" }}
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-emerald-100/30 flex items-center justify-center">
                {item.icon}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-300">{item.title}</h3>
              <ul className="mt-2 space-y-1">
                {item.details.map((detail, idx) => (
                  <li key={idx} className="text-gray-600">
                    <span className="text-sm font-medium text-gray-700">{detail.label}: </span>
                    {detail.value}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-emerald-300 mb-4">Redes Sociais</h3>
        <div className="flex gap-4">
          {socialMedia.map((social, index) => (
            <motion.a
              key={index}
              href={social.url}
              className="w-10 h-10 rounded-full bg-emerald-text-emerald-300 hover:bg-emerald-400 flex items-center justify-center transition-colors duration-300 text-white"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: 0.4 + (index * 0.1), ease: "easeOut" }}
              aria-label={social.name}
            >
              {social.icon}
            </motion.a>
          ))}
        </div>
      </div>
    </motion.div>
  );
}