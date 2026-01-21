"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Header() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative h-[500px] md:h-[600px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 to-emerald-700 z-0">
        <div 
          className="absolute inset-0 bg-[url('https://images.pexels.com/photos/6147369/pexels-photo-6147369.jpeg?auto=compress&cs=tinysrgb&w=1920')] 
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
            Transformando o acesso à educação superior no Brasil
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Conheça a história, missão e os valores que impulsionam o Bolsa Click a democratizar o acesso à educação de qualidade para todos.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="#nossa-historia" 
              className="bg-emerald-300 hover:bg-emerald-400 text-emerald-700 font-medium px-6 py-3 rounded-md transition-all duration-300"
            >
              Nossa História
            </Link>
            <Link 
              href="#nossos-valores" 
              className="bg-transparent border-2 border-white hover:bg-white/10 text-white font-medium px-6 py-3 rounded-md transition-all duration-300"
            >
              Nossos Valores
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}