"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Header() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative h-[400px] md:h-[500px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r  from-emerald-950 to-emerald-700 z-0">
        <div 
          className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1920')] 
          mix-blend-overlay opacity-30 bg-cover bg-center"
        ></div>
      </div>
      <div className="relative container mx-auto px-4 h-full flex flex-col justify-center z-10">
        <motion.div 
          className="max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Estamos aqui para ajudar
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Entre em contato conosco para saber mais sobre o Bolsa Click, tirar dúvidas sobre bolsas de estudo ou receber suporte personalizado.
          </p>
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center text-white">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3">
                <Phone className="h-5 w-5 text-emerald-200" />
              </div>
              <span>(11) 94006-3113</span>
            </div>
            <div className="flex items-center text-white">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3">
                <Mail className="h-5 w-5 text-emerald-200" />
              </div>
              <span>contato@bolsaclick.com.br</span>
            </div>
            <div className="flex items-center text-white">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-3">
                <MapPin className="h-5 w-5 text-emerald-200" />
              </div>
              <span>São Paulo, SP</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}