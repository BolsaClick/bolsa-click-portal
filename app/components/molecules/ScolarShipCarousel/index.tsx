'use client'

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Book, Monitor } from 'lucide-react';
import './style.css';
import Image from 'next/image';
import { useGeoLocation } from '@/app/context/GeoLocationContext';
import { useRouter } from 'next/navigation';

interface ScholarshipProps {
  id: number;
  courseId: string;
  course: string;
  college: string;
  modality: string;
  location?: string;
  city?: string;
  state?: string;
  originalPrice: number;
  discountPrice: number;
  discount: number;
  image: string;
}

const scholarships: ScholarshipProps[] = [
  {
    id: 1,
    courseId: '05ea2de4-cf8c-4b2d-a3eb-9ab3bb8b94cf',
    course: "Psicologia - Bacharelado",
    college: "Anhanguera",
    modality: "presencial",
    city: "",
    state: "",
    location: "",
    originalPrice: 1200,
    discountPrice: 599,
    discount: 50,
    image: "https://images.pexels.com/photos/3938022/pexels-photo-3938022.jpeg"
  },
  {
    id: 2,
    courseId: '01d29fc8-6e92-4a6e-8edc-848dab59da24',
    course: "Direito - Bacharelado",
    college: "Unopar",
    modality: "presencial",
    city: "",
    state: "",
    location: "",
    originalPrice: 900,
    discountPrice: 400,
    discount: 55,
    image: "https://images.pexels.com/photos/5668859/pexels-photo-5668859.jpeg"
  },
    {
    id: 3,
    courseId: '99150620-8fd6-4ba7-8c3e-bf24ac3a7cd6',
    course: "Análise e Desenvolvimento de Sistemas - Tecnólogo",
    college: "Anhanguera",
    modality: "distancia",
    city: "",
    state: "",
    location: "",
    originalPrice: 900,
    discountPrice: 400,
    discount: 23,
    image: "https://images.pexels.com/photos/270557/pexels-photo-270557.jpeg"
  },
    {
    id: 4,
    courseId: 'a7405dcb-f22b-4e3f-a1e2-3492d3ba77fa',
    course: "Cibersegurança - Tecnólogo",
    college: "Unopar",
    modality: "presencial",
    city: "",
    state: "",
    location: "",
    originalPrice: 900,
    discountPrice: 400,
    discount: 90,
    image: "https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg"
  },
    {
    id: 5,
    courseId: 'fe868eb2-6050-45df-b0c6-6565155f690f',
    course: "Odontologia - Bacharelado",
    college: "Unopar",
    modality: "presencial",
    city: "",
    state: "",
    location: "",
    originalPrice: 900,
    discountPrice: 400,
    discount: 86,
    image: "https://images.pexels.com/photos/3845653/pexels-photo-3845653.jpeg"
  },
      {
    id: 6,
    courseId: 'aaa8f97d-40dc-40c6-b772-2c3068288534',
    course: "Administração - Bacharelado",
    college: "Unopar",
    modality: "presencial",
    city: "",
    state: "",
    location: "",
    originalPrice: 900,
    discountPrice: 400,
    discount: 44,
    image: "https://images.pexels.com/photos/3760072/pexels-photo-3760072.jpeg"
  },
];

const ScholarshipCard: React.FC<{ scholarship: ScholarshipProps; onClick: () => void }> = ({ scholarship, onClick }) => {
  const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const capitalizeSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .replace(/(^\w|\b\w)/g, (match) => match.toUpperCase());
  };

  return (
    <div className="scholarship-card">
      <div className="scholarship-image">
        <Image src={scholarship.image} alt={scholarship.course} width={100} height={100} />
        <div className="discount-badge">-{scholarship.discount}%</div>
      </div>
      <div className="scholarship-content">
        <h3 className="text-xl font-bold mb-2 text-blue-950">{scholarship.course}</h3>
        <p className="text-gray-700 mb-2">{scholarship.college}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="badge"><Monitor size={14} className="mr-1" />{capitalizeSlug(scholarship.modality)}</span>
          <span className="badge"><MapPin size={14} className="mr-1" />{scholarship.location}</span>
          <span className="badge"><Book size={14} className="mr-1" />{scholarship.course}</span>
        </div>
        <div className="price-container">
          <div className="original-price">De: <span className="line-through">{formatCurrency(scholarship.originalPrice)}</span></div>
          <div className="discount-price">Por: <span className="font-bold text-red-500">{formatCurrency(scholarship.discountPrice)}</span></div>
        </div>
        <button onClick={onClick} className="scholarship-button">Ver detalhes</button>
      </div>
    </div>
  );
};

const ScholarshipCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(3);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { state, town } = useGeoLocation();
  const router = useRouter();

  const slugify = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleNavigate = (scholarship: ScholarshipProps) => {
    const courseSlug = slugify(scholarship.course.replace(/ - (Bacharelado|Tecn[oó]logo)$/i, ''));
    const city = scholarship.city || town || 'São Paulo';
    const stateFinal = scholarship.state || state || 'SP';
    const citySlug = slugify(city);

    localStorage.setItem('searchParams', JSON.stringify({
      courseId: scholarship.courseId,
      courseName: scholarship.course,
      city,
      state: stateFinal,
      modalidade: scholarship.modality
    }));

    document.cookie = `courseName=${encodeURIComponent(courseSlug)}; path=/`;
    document.cookie = `modalidade=${encodeURIComponent(scholarship.modality)}; path=/`;
    document.cookie = `city=${encodeURIComponent(city)}; path=/`;
    document.cookie = `state=${encodeURIComponent(stateFinal)}; path=/`;

    router.push(`/cursos/resultado/${scholarship.modality}/${courseSlug}/${citySlug}`);
  };

  const overrideLocationScholarships = scholarships.map((s) => {
    const city = s.city || town || 'São Paulo';
    const stateFinal = s.state || state || 'SP';
    return {
      ...s,
      city,
      state: stateFinal,
      location: `${city} - ${stateFinal}`
    };
  });

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

  const totalSlides = overrideLocationScholarships.length;
  const maxIndex = Math.max(0, totalSlides - itemsToShow);

  return (
    <section className="scholarships-section py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-blue-950">
          Bolsas em Destaque
        </h2>

        <div className="carousel-container">
          <button className="carousel-control prev" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
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
              {overrideLocationScholarships.map((scholarship) => (
                <div key={scholarship.id} className="carousel-item">
                  <ScholarshipCard scholarship={scholarship} onClick={() => handleNavigate(scholarship)} />
                </div>
              ))}
            </div>
          </div>

          <button className="carousel-control next" onClick={() => setCurrentIndex(Math.min(maxIndex, currentIndex + 1))} disabled={currentIndex >= maxIndex}>
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="flex justify-center mt-8">
          <div className="carousel-dots">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScholarshipCarousel;
