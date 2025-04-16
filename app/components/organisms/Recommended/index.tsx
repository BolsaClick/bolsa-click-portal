'use client'
import 'swiper/css'
import 'swiper/css/pagination'
import './styles.css'

import { useEffect, useState } from 'react'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { useGeoLocation } from '../../../context/GeoLocationContext'
import Container from '../../atoms/Container'
import CardRecommended from '../../molecules/CardRecommended'
import TitleSection from '../../molecules/TitleSection'
import Image from 'next/image'
const Recommended = () => {
  const { state, town } = useGeoLocation()

  const [userLocation, setUserLocation] = useState<{
    state: string
    town: string
  } | null>(null)

  useEffect(() => {
    if (state && town) {
      setUserLocation({ state, town })
    }
  }, [state, town])
  const bolsas = [
    {
      id: 1,
      logo: '/assets/logo-anhanguera.svg',
      curso: 'Direito',
      modalidade: 'Presencial - Noite',
      local: 'São Paulo - SP',
      valor: 'R$ 2.329,00',
      bolsa: 'R$ 549,00',
      link: '/cursos?modalidade=presencial&course=01d29fc8-6e92-4a6e-8edc-848dab59da24&courseName=Direito%20-%20Bacharelado&city=&state=',
    },
    {
      id: 2,
      logo: '/assets/logo-unopar.svg',
      curso: 'Engenharia de Produção',
      modalidade: 'Presencial - Tarde',
      local: 'Rio de Janeiro - RJ',
      valor: 'R$ 3.200,00',
      bolsa: 'R$ 298,99',
      link: '/cursos?modalidade=distancia&course=0154d7a5-f9f2-408e-bd70-8b220d54657e&courseName=Engenharia%20de%20Produ%C3%A7%C3%A3o%20-%20Bacharelado&city=&state=',
    },
    {
      id: 3,
      logo: '/assets/unopar-anhanguera.png',
      curso: 'Biomedicina',
      modalidade: 'Online',
      local: 'Fortaleza - CE',
      valor: 'R$ 6.500,00',
      bolsa: 'R$ 599,00',
      link: '/cursos?modalidade=presencial&course=d15f70e7-7492-48c8-b90c-42c1891f95bb&courseName=Biomedicina%20-%20Bacharelado&city=&state=',
    },
    {
      id: 4,
      logo: '/assets/ampli-logo.png',
      curso: 'Psicologia',
      modalidade: 'Presencial - Manhã',
      local: 'Belo Horizonte - MG',
      valor: 'R$ 2.800,00',
      bolsa: 'R$ 579,00',
      link: '/cursos?modalidade=presencial&course=05ea2de4-cf8c-4b2d-a3eb-9ab3bb8b94cf&courseName=Psicologia%20-%20Bacharelado&city=&state=',
    },
    {
      id: 5,
      logo: '/assets/logo-pitagoras.svg',
      curso: 'Enfermagem',
      modalidade: 'Presencial - Manhã',
      local: 'Belo Horizonte - MG',
      valor: 'R$ 2.800,00',
      bolsa: 'R$ 589,00',
      link: '/cursos?modalidade=presencial&course=9fd0c921-93b8-400c-82c6-f1a0166402d7&courseName=Enfermagem%20-%20Bacharelado&city=&state=',
    },
    {
      id: 6,
      logo: '/assets/logo-anhanguera.svg',
      curso: 'Análise e Desenvolvimento de Sistemas',
      modalidade: 'Presencial - Manhã',
      local: 'Belo Horizonte - MG',
      valor: 'R$ 2.800,00',
      bolsa: 'R$ 99,99',
      link: '/cursos?modalidade=distancia&course=99150620-8fd6-4ba7-8c3e-bf24ac3a7cd6&courseName=An%C3%A1lise%20e%20Desenvolvimento%20de%20Sistemas%20-%20Tecn%C3%B3logo&city=&state=',
    },
  ]

  const cursos = [
    {
      id: 1,
      logo: '/assets/images/analise-e-desenvolvimento-de-sistemas.jpeg',
      curso: 'Análise e Desenvolvimento de Sistemas',
      bolsa: 'R$ 34,63',
    },
    {
      id: 2,
      logo: '/assets/images/psicologia.webp',
      curso: 'Psicologia',
      bolsa: 'R$ 34,63',
    },
    {
      id: 3,
      logo: '/assets/images/direito.webp',
      curso: 'Direito',
      bolsa: 'R$ 34,63',
    },
    {
      id: 4,
      logo: '/assets/images/adm.jpg',
      curso: 'Administração',
      bolsa: 'R$ 34,63',
    },
  ]
  return (
    <Container>
      <div className="mt-28 w-full">
        <TitleSection
          subtitle="Bolsas de estudo em"
          title="Bolsas interessantes para você"
          bolsa
        />

        <div className="mt-10 mb-10">
          <Swiper
            slidesPerView={3}
            spaceBetween={30}
            grabCursor={true}
            pagination={{
              el: '.swiper-pagination-custom',
              clickable: true,
            }}
            modules={[Pagination]}
            className="mySwiper"
            breakpoints={{
              320: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
            }}
          >
            {bolsas.map((bolsa) => (
              <SwiperSlide key={bolsa.id}>
                <CardRecommended
                  link={bolsa.link}
                  bolsa={bolsa.bolsa}
                  curso={bolsa.curso}
                  local={
                    userLocation
                      ? `${userLocation.town} - ${userLocation.state}`
                      : 'São Paulo, SP'
                  }
                  logo={bolsa.logo}
                  modalidade={bolsa.modalidade}
                  valor={bolsa.valor}
                />
              </SwiperSlide>
            ))}
          </Swiper>
          <div className="swiper-pagination-custom mt-4 text-center"></div>
        </div>
      </div>

      <div className="mt-28 w-full">
        <TitleSection
          subtitle="Bolsas de estudo em "
          subdescriptions="2000 cursos"
          title="Cursos com bolsa de estudo"
        />
      </div>

      <div className="flex justify-start md:justify-between overflow-x-auto items-center gap-4 px-4 py-4">
        {cursos.map((curso) => (
          <div
            key={curso.id}
            className="mt-10 max-w-xs flex-shrink-0 w-full h-96 bg-white shadow-lg rounded-lg overflow-hidden"
          >
          <div className="relative w-full h-36">
              <Image
                src={curso.logo}
                alt={`${curso.curso} com até 80% de desconto | Bolsa Click`}
                fill
                className="object-cover rounded-t-lg md:grayscale hover:grayscale-0 transition-all duration-300 hover:opacity-80 hover:scale-125"
              />
            </div>

            <div className="p-4 h-36">
              <h2 className="text-xl font-semibold text-center">
                {curso.curso}
              </h2>
            </div>

            <div className="flex flex-col justify-end space-y-2 p-4">
              <p className="text-center">A partir de:</p>
              <span className="text-bolsa-primary text-xl font-semibold text-center">
                {curso.bolsa}/mês
              </span>
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}

export default Recommended
