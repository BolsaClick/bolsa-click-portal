'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react';
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
        <h3 className="text-xl mb-3 text-ink-900">{curso.fullName}</h3>
        <p className="text-ink-500 text-sm mb-5 line-clamp-2 leading-relaxed">{curso.description}</p>

        <div className="flex flex-wrap gap-2 mb-5">
          <span className="badge">
            <Monitor size={11} className="mr-1.5" />
            {getTypeLabel(curso.type)}
          </span>
          <span className="badge">
            <Clock size={11} className="mr-1.5" />
            {curso.duration}
          </span>
          <span className="badge">
            <Book size={11} className="mr-1.5" />
            Graduação
          </span>
        </div>

        <div className="price-container">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500">
              Salário médio
            </span>
            <span className="font-display num-tabular text-xl text-ink-900">
              {curso.averageSalary}
            </span>
          </div>
        </div>

        <Link
          href={`/cursos/${curso.slug}`}
          className="scholarship-button block text-center"
        >
          Ver bolsas disponíveis →
        </Link>
      </div>
    </div>
  );
};

interface ScholarshipCarouselClientProps {
  courses: CursoData[];
}

const computeItemsToShow = (): number => {
  if (typeof window === 'undefined') return 3;
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 1024) return 2;
  return 3;
};

const ScholarshipCarouselClient: React.FC<ScholarshipCarouselClientProps> = ({ courses }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Lazy initializer reads viewport once, eliminating the SSR (3) → client (1) shift on mobile.
  const [itemsToShow, setItemsToShow] = useState<number>(computeItemsToShow);
  const [isPaused, setIsPaused] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = courses.length;
  const maxIndex = Math.max(0, totalSlides - itemsToShow);

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

  useEffect(() => {
    const handleResize = () => setItemsToShow(computeItemsToShow());
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

  if (courses.length === 0) return null;

  return (
    <section
      className="scholarships-section py-24 md:py-32"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-16 md:mb-20">
          <div className="md:col-span-6">
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ink-500 flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-ink-300" />
              Top 10 cursos
            </span>
            <h2 className="font-display display-tight text-4xl md:text-5xl text-ink-900 leading-[1.05]">
              Cursos em destaque<br />
              <span className="italic text-ink-700">para começar agora.</span>
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8 md:pt-3">
            <p className="text-ink-500 leading-relaxed text-[15px]">
              Os cursos mais buscados do Brasil com bolsas de até{' '}
              <span className="text-ink-900 font-medium">80% de desconto</span>. Veja a duração,
              salário médio e demanda do mercado.
            </p>
          </div>
        </div>

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
              {courses.map((curso) => (
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

        <div className="text-center mt-12">
          <Link
            href="/cursos"
            className="group inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.22em] uppercase text-ink-900 border-b-2 border-ink-900 pb-1 hover:text-bolsa-secondary hover:border-bolsa-secondary transition-colors"
          >
            Ver todos os cursos
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ScholarshipCarouselClient;
