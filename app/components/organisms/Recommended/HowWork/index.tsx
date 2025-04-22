'use client'

import {
  ArrowRight,
  Book,
  GraduationCap,
  Handshake,
  UserPlus,
} from '@phosphor-icons/react'
import Image from 'next/image'
import Container from '../../../atoms/Container'

const HowWork = () => {
  return (
    <Container>
      <section className="w-full mt-28" id="como-funciona-bolsa-de-estudos">
        <div className="flex-col md:flex-row md:mt-28 items-start flex w-full">
          <h1 className="text-4xl font-bold flex items-center">
            O que é o Bolsa Click
            <span className="relative ml-2 w-32 h-10">
              <Image
                src="/assets/logo-bolsa-click-dark.png"
                alt="Logo Bolsa Click - Plataforma de bolsas de estudos"
                fill
                className="object-contain"
                sizes="100px"
              />
            </span>
          </h1>
        </div>

        <div className="mt-10 flex justify-between md:flex-row flex-col gap-10">
          <article className="w-full text-2xl leading-loose mt-10">
            <p className='text-bolsa-gray-dark'>
              O <strong className="text-bolsa-secondary">Bolsa Click</strong> é
              uma plataforma que conecta alunos a bolsas de estudo com até <strong>85% de desconto</strong> em
              <strong> faculdades, pós-graduação, cursos técnicos e educação básica</strong>. São mais de
              25 mil instituições parceiras, facilitando o acesso à educação
              superior com mensalidades acessíveis.
            </p>
            <p className="mt-4">
              Se você busca <strong>bolsa de estudos para graduação</strong>,
              deseja <strong>estudar com desconto</strong> ou está pesquisando
              como <strong>conseguir bolsa em faculdade</strong>, você está no
              lugar certo! Faça sua inscrição e encontre a bolsa ideal para
              você.
            </p>
          </article>

          <div className="w-full relative flex justify-end">
            <Image
              src="/assets/avatar-bolsa-click.png"
              alt="Representação visual de estudante Bolsa Click"
              fill
              className="md:w-5/6 w-full object-contain"
              sizes="300px"
            />
          </div>
        </div>
      </section>

      <section className="w-full mt-28" aria-labelledby="como-funciona">
        <div className="flex flex-col items-center justify-center">
          <h2 id="como-funciona" className="text-3xl font-bold">
            Como conseguir sua bolsa de estudos
          </h2>
        </div>

        <div className="mt-10 flex md:flex-row flex-col justify-center items-center w-full gap-4 px-4 py-8">
          <StepCard
            icon={<GraduationCap size={40} className="text-bolsa-primary" />}
            title="Escolha o curso e a cidade"
            description="Pesquise por cursos e cidades disponíveis para estudar com até 85% de desconto."
          />

          <ArrowIcon />

          {/* Etapa 2 */}
          <StepCard
            icon={<UserPlus size={40} className="text-bolsa-primary" />}
            title="Faça seu cadastro"
            description="Cadastre-se gratuitamente no site para garantir sua inscrição em uma das bolsas disponíveis."
          />

          <ArrowIcon />

          {/* Etapa 3 */}
          <StepCard
            icon={<Handshake size={40} className="text-bolsa-primary" />}
            title="Escolha sua bolsa ideal"
            description="Compare as opções disponíveis e escolha a bolsa que mais combina com o seu perfil."
          />

          <ArrowIcon />

          {/* Etapa 4 */}
          <StepCard
            icon={<Book size={40} className="text-bolsa-primary" />}
            title="Comece a estudar"
            description="Garanta sua vaga, finalize a inscrição e comece seus estudos com desconto especial."
          />
        </div>
      </section>
    </Container>
  )
}

const StepCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) => (
  <div className="max-w-xs w-full bg-white shadow-lg rounded-lg overflow-hidden">
    <div className="w-full bg-bolsa-secondary p-4 text-white text-center rounded-t-lg">
      <div className="flex justify-center mb-2">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="p-4">
      <p className="text-center text-sm">{description}</p>
    </div>
  </div>
)

const ArrowIcon = () => (
  <div className="md:flex hidden justify-center items-center">
    <ArrowRight size={40} className="text-bolsa-primary" />
  </div>
)

export default HowWork
