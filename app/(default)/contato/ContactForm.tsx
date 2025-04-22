"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Send } from 'lucide-react';

export default function ContactForm() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };
    
    if (!formData.name.trim()) {
      newErrors.name = 'Por favor, informe seu nome';
      valid = false;
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Por favor, informe seu email';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Por favor, informe um email válido';
      valid = false;
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Por favor, escreva sua mensagem';
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      
      // Simulate form submission
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        
        // Reset submitted state after 5 seconds
        setTimeout(() => {
          setSubmitted(false);
        }, 5000);
      }, 1500);
    }
  };

  const inputClasses = "w-full px-4 py-3 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-[#00361f]/30 transition-all duration-200";
  const errorClasses = "text-red-500 text-sm mt-1";

  return (
    <motion.div
      ref={ref}
      className="bg-white p-8 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-[#00361f] mb-2">Entre em contato</h2>
      <p className="text-gray-600 mb-8">Preencha o formulário abaixo para nos enviar uma mensagem.</p>
      
      {submitted ? (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-md p-4 mb-6">
          <p className="font-medium">Mensagem enviada com sucesso!</p>
          <p className="mt-1">Agradecemos seu contato. Retornaremos em breve.</p>
        </div>
      ) : null}
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="relative">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome completo *
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${inputClasses} ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Seu nome completo"
                />
              </div>
              {errors.name && <p className={errorClasses}>{errors.name}</p>}
            </div>
          </div>
          
          <div>
            <div className="relative">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`${inputClasses} ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="seu.email@exemplo.com"
                />
              </div>
              {errors.email && <p className={errorClasses}>{errors.email}</p>}
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <div className="relative">
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`${inputClasses} border-gray-300`}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Assunto
            </label>
            <div className="relative">
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`${inputClasses} border-gray-300`}
              >
                <option value="">Selecione uma opção</option>
                <option value="Dúvidas sobre bolsas">Dúvidas sobre bolsas</option>
                <option value="Parceria institucional">Parceria institucional</option>
                <option value="Problemas na plataforma">Problemas na plataforma</option>
                <option value="Outros assuntos">Outros assuntos</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Mensagem *
            </label>
            <div className="relative">
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className={`${inputClasses} ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="Escreva sua mensagem aqui"
              ></textarea>
            </div>
            {errors.message && <p className={errorClasses}>{errors.message}</p>}
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-[#00361f] hover:bg-[#00482a] text-white font-medium py-3 px-6 rounded-md transition-all duration-300 flex items-center justify-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              <>
                Enviar mensagem
                <Send className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 mt-2">* Campos obrigatórios</p>
        </div>
      </form>
    </motion.div>
  );
}