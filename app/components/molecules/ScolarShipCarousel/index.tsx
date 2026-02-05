'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Book, Monitor, Clock, TrendingUp } from 'lucide-react';
import './style.css';
import Image from 'next/image';
import Link from 'next/link';

interface CursoData {
  id: string;
  slug: string;
  name: string;
  fullName: string;
  type: string;
  description: string;
  duration: string;
  averageSalary: string;
  marketDemand: string;
  imageUrl: string;
}

interface ScholarshipCardProps {
  curso: CursoData;
}

const ScholarshipCard: React.FC<ScholarshipCardProps> = ({ curso }) => {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'BACHARELADO': return 'Bacharelado';
      case 'LICENCIATURA': return 'Licenciatura';
      case 'TECNOLOGO': return 'Tecnólogo';
      default: return type;
    }
  };

  const getMarketDemandConfig = (demand: string) => {
    switch (demand) {
      case 'ALTA': return { label: 'Alta demanda', color: 'bg-emerald-500' };
      case 'MEDIA': return { label: 'Média demanda', color: 'bg-amber-500' };
      case 'BAIXA': return { label: 'Baixa demanda', color: 'bg-gray-500' };
      default: return { label: demand, color: 'bg-gray-500' };
    }
  };

  const demandConfig = getMarketDemandConfig(curso.marketDemand);

  return (
    <div className="scholarship-card">
      <div className="scholarship-image">
        <Image
          src={curso.imageUrl}
          alt={curso.name}
          width={400}
          height={250}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
        />
        <div className="discount-badge">
          <TrendingUp size={12} className="inline mr-1" />
          {demandConfig.label}
        </div>
      </div>
      <div className="scholarship-content">
        <h3 className="text-lg font-bold mb-2 text-blue-950">{curso.fullName}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{curso.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge">
            <Monitor size={12} className="mr-1" />
            {getTypeLabel(curso.type)}
          </span>
          <span className="badge">
            <Clock size={12} className="mr-1" />
            {curso.duration}
          </span>
          <span className="badge">
            <Book size={12} className="mr-1" />
            Graduação
          </span>
        </div>

        <div className="price-container">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wide">Salário médio</div>
              <div className="font-bold text-bolsa-primary text-lg">{curso.averageSalary}</div>
            </div>
          </div>
        </div>

        <Link
          href={`/cursos/${curso.slug}`}
          className="scholarship-button block text-center"
        >
          Ver bolsas disponíveis
        </Link>
      </div>
    </div>
  );
};

const ScholarshipCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const [cursosDestaque, setCursosDestaque] = useState<CursoData[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Buscar cursos da API
  useEffect(() => {
    fetch('/api/cursos?limit=10')
      .then((res) => res.json())
      .then((data) => {
        if (data.courses) {
          setCursosDestaque(data.courses);
        }
      })
      .catch(console.error);
  }, []);

  const totalSlides = cursosDestaque.length;
  const maxIndex = Math.max(0, totalSlides - itemsToShow);

  // Auto-play
  const startAutoPlay = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (!isPaused) {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
      }
    }, 5000);
  }, [isPaused, maxIndex]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startAutoPlay]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setItemsToShow(1);
      else if (window.innerWidth < 1024) setItemsToShow(2);
      else setItemsToShow(3);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const goToPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    startAutoPlay();
  };

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    startAutoPlay();
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    startAutoPlay();
  };

  return (
    <section
      className="scholarships-section py-16"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-blue-50 text-bolsa-primary text-sm font-semibold rounded-full mb-4">
            TOP 10 CURSOS
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-blue-950 mb-4">
            Cursos em Destaque
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Encontre bolsas de estudo com até <span className="text-bolsa-primary font-semibold">80% de desconto</span> para os cursos mais procurados do Brasil
          </p>
        </div>

        {/* Carousel */}
        <div className="carousel-container">
          <button
            className="carousel-control prev"
            onClick={goToPrev}
            disabled={currentIndex === 0}
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="carousel-viewport">
            <div
              ref={carouselRef}
              className="carousel-track"
              style={{
                transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
                gridTemplateColumns: `repeat(${totalSlides}, ${100 / itemsToShow}%)`
              }}
            >
              {cursosDestaque.map((curso) => (
                <div key={curso.slug} className="carousel-item">
                  <ScholarshipCard curso={curso} />
                </div>
              ))}
            </div>
          </div>

          <button
            className="carousel-control next"
            onClick={goToNext}
            disabled={currentIndex >= maxIndex}
            aria-label="Próximo"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Dots Navigation */}
        <div className="flex justify-center mt-8">
          <div className="carousel-dots">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Link
            href="/cursos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-950 text-blue-950 font-semibold rounded-xl hover:bg-blue-950 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md"
          >
            Ver todos os cursos
            <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ScholarshipCarousel;
