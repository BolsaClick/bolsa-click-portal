"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { MapPin } from 'lucide-react';

export default function Map() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const locations = [
    {
      city: 'São Paulo',
      address: 'Av. Paulista, 1000, Bela Vista',
      postal: 'São Paulo - SP, 01310-100',
      active: true
    }

  ];

  return (
    <section className="py-20 bg-[#f5f9f5]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-300 mb-4">
            Nossos Escritórios
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Estamos presentes em diversas localidades para melhor atender nossos alunos e parceiros.
          </p>
          <div className="w-24 h-1 bg-bolsa-secondary mx-auto mt-4"></div>
        </div>

        <motion.div
          ref={ref}
          className="grid md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {locations.map((location, index) => (
            <div 
              key={index}
              className={`bg-white p-6 rounded-xl shadow-md border-2 ${
                location.active ? 'border-bolsa-secondary' : 'border-transparent'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className={`w-8 h-8 rounded-full ${
                  location.active ? 'bg-emerald-200/30' : 'bg-gray-100'
                } flex items-center justify-center mr-3`}>
                  <MapPin className={`h-4 w-4 ${
                    location.active ? 'text-emerald-300' : 'text-gray-400'
                  }`} />
                </div>
                <h3 className={`text-lg font-bold ${
                  location.active ? 'text-emerald-300' : 'text-gray-500'
                }`}>
                  {location.city}
                </h3>
                {location.active && (
                  <span className="ml-auto px-2 py-1 text-xs font-medium bg-emerald-200/20 text-emerald-300 rounded-full">
                    Sede Principal
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-1">{location.address}</p>
              <p className="text-gray-600">{location.postal}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          className="rounded-xl overflow-hidden shadow-lg h-[400px] md:h-[500px]"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
        >
          {/* Using iframe for Google Maps embed */}
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3657.0976455833773!2d-46.65499372594177!3d-23.564611178850855!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce59c7f481fd9f%3A0x9982bfde4df54830!2sAv.%20Paulista%2C%201000%20-%20Bela%20Vista%2C%20S%C3%A3o%20Paulo%20-%20SP%2C%2001310-100!5e0!3m2!1spt-BR!2sbr!4v1702336250689!5m2!1spt-BR!2sbr" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa do escritório Bolsa Click"
          ></iframe>
        </motion.div>
      </div>
    </section>
  );
}