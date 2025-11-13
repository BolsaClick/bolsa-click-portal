'use client'
import React, { useEffect, useState } from 'react';
import { CheckCircle, Users, School, Award, TrendingUp } from 'lucide-react';
import './style.css';
import Image from 'next/image';
import Link from 'next/link';

const AboutSection: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState('bolsaclick')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentTheme(process.env.NEXT_PUBLIC_THEME || 'bolsaclick')
    }
  }, [])

  const benefits = [
    "Descontos de até 95% durante todo o curso",
    "Mais de 25 instituições parceiras",
    "Processo de matrícula simplificado",
    "Suporte personalizado durante todo o processo"
  ];

  const quickStats = [
    { number: "10k+", label: "Alunos matriculados", icon: <Users size={24} /> },
    { number: "25+", label: "Instituições parceiras", icon: <School size={24} /> },
    { number: "97%", label: "Desconto máximo", icon: <Award size={24} /> },
    { number: "100%", label: "Satisfação dos alunos", icon: <TrendingUp size={24} /> }
  ];

  const testimonials = [
    {
      quote: "Graças ao Bolsa Click, consegui uma bolsa de 70% em Análise e Desenvolvimento de sistemas. Um sonho que parecia impossível se tornou realidade!",
      author: "Maria Silva",
      course: "Análise e Desenvolvimento de sistemas - UNIP",
      image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      quote: "O processo foi super simples e rápido. Em menos de uma semana já estava matriculado com 60% de desconto!",
      author: "João Santos",
      course: "Engenharia Civil - Anhanguera",
      image: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    },
    {
      quote: "Excelente plataforma! Encontrei várias opções de bolsas e o suporte me ajudou a escolher a melhor para mim.",
      author: "Ana Oliveira",
      course: "Psicologia - Anhanguera",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
    }
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Bolsa Click",
    "url": "https://www.bolsaclick.com.br",
    "description": "O BolsaClick é a maior plataforma de bolsas de estudo do Brasil, com descontos de até 95% para ensino superior. Encontre bolsas em mais de 25 instituições com facilidade e suporte.",
    "sameAs": [
      "https://www.instagram.com/bolsaclick",
      "https://www.facebook.com/bolsaclick"
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "reviewCount": "3"
    },
    "review": testimonials.map((t) => ({
      "@type": "Review",
      "author": { "@type": "Person", "name": t.author },
      "reviewBody": t.quote,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      }
    }))
  };

  return (
    <section id="about" className="about-section py-16 bg-white relative">
      {/* JSON-LD SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-emerald-600">
            O que é o Bolsa<span className="text-red-500">Click</span>?
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            O BolsaClick é a maior plataforma de bolsas de estudo do Brasil, conectando estudantes a oportunidades de educação superior com descontos exclusivos. Nossa missão é democratizar o acesso à educação de qualidade, tornando o ensino superior acessível para todos.
          </p>
        </div>

        <div className="quick-stats">
          {quickStats.map((stat, index) => (
            <div key={index} className="quick-stat">
              <div className="text-red-500 mb-2">{stat.icon}</div>
              <div className="quick-stat-number">{stat.number}</div>
              <div className="quick-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="about-image">
            <Image
              src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Estudante sorridente"
              className="rounded-lg shadow-xl"
              width={1260}
              height={750}
            />
          </div>

          <div className="about-content">
            <h3 className="text-xl font-bold mb-6 text-emerald-600">
              Por que escolher o BolsaClick?
            </h3>

            <ul className="benefits-list mb-8">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start mb-3">
                  <CheckCircle className="text-red-500 mr-2 flex-shrink-0" size={20} />
                  <span className="text-gray-700">{benefit}</span>
                </li>
              ))}
            </ul>

            <Link href="/quem-somos" className="about-button">
              Saiba mais sobre nós
            </Link>
          </div>
        </div>

        <div className="testimonials-section mt-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-emerald-600">
            O que dizem nossos alunos
          </h3>
          {currentTheme === 'bolsaclick' && (
            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div className="testimonial-quote">
                    &quot;{testimonial.quote}&quot;
                  </div>
                  <div className="testimonial-author">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.author}
                      className="author-image"
                      width={70}
                      height={40}
                    />
                    <div className="author-info">
                      <h4>{testimonial.author}</h4>
                      <p>{testimonial.course}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
