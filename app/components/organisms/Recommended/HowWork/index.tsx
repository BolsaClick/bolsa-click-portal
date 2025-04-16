'use client'
import {
  ArrowRight,
  Book,
  GraduationCap,
  Handshake,
  UserPlus,
} from '@phosphor-icons/react'

import Container from '../../../atoms/Container'
import { Title } from '../../../molecules/Title'
import Image from 'next/image'

const HowWork = () => {
  return (
    <Container>
      <div className="w-full">
        <div className="mt-28 w-full">
          <div className="mt-12 flex-col md:flex-row  md:mt-28 items-start flex w-full">
            <Title>O que é o </Title>{' '}
            {/* <Image
            fill
              src="/assets/logo-bolsa-click-dark.png"
              className="ml-2"
              alt="Logo bolsa Click"
            /> */}
          </div>
          <div
            className="mt-10 flex justify-between md:flex-row flex-col gap-10 "
            id="como-funciona"
          >
            <p className="w-full text-2xl leading-loose mt-10">
              O <span className="text-bolsa-secondary"> Bolsa Click</span> foi
              criado para ajudar milhares de brasileiros a darem o primeiro
              passo em direção à educação de qualidade. O programa oferece
              bolsas com até 85% de desconto para graduação, pós-graduação,
              educação básica e cursos técnicos. Com mais de 25 mil instituições
              de ensino parceiras, fica muito mais fácil pagar a mensalidade e
              iniciar os estudos com tranquilidade. Faça sua inscrição e
              encontre a bolsa de estudos perfeita para você!
            </p>

            <div className="w-full relative justify-end flex">
              <Image 
                fill
                src="/assets/avatar-bolsa-click.png"
                className="md:w-5/6	w-full"
                alt="Avatar do Bolsa Click"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="mt-12 flex-col md:flex-row  md:mt-28 justify-center flex items-center w-full">
          <Title>Como funciona </Title>
        </div>

        <div className="mt-10 flex md:flex-row flex-col justify-center items-center w-full gap-4 px-4 py-8">
          <div className="max-w-xs w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="w-full bg-bolsa-secondary p-4 text-white text-center rounded-t-lg">
              <h3 className="text-3xl flex justify-center font-semibold">
                <GraduationCap size={40} className="text-bolsa-primary" />
              </h3>
              <p className="text-lg font-semibold">
                Escolha o seu curso e a cidade onde deseja estudar
              </p>
            </div>
            <div className="p-4">
              <p className="text-center">
                Escolha o curso ideal e a cidade onde você quer estudar para
                começar sua jornada.
              </p>
            </div>
          </div>

          <div className="md:flex hidden  justify-center items-center">
            <ArrowRight size={40} className="text-bolsa-primary" />
          </div>

          <div className="max-w-xs w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="w-full bg-bolsa-secondary p-4 text-white text-center rounded-t-lg">
              <h3 className="text-3xl flex justify-center font-semibold">
                <UserPlus size={40} className="text-bolsa-primary" />
              </h3>
              <p className="text-lg font-semibold">
                Faça seu cadastro em nosso site
              </p>
            </div>
            <div className="p-4">
              <p className="text-center">
                Preencha seus dados no nosso site para garantir sua inscrição na
                bolsa de estudo desejada.
              </p>
            </div>
          </div>

          <div className="md:flex hidden  justify-center items-center">
            <ArrowRight size={40} className="text-bolsa-primary" />
          </div>

          <div className="max-w-xs w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="w-full bg-bolsa-secondary p-4 text-white text-center rounded-t-lg">
              <h3 className="text-3xl flex justify-center font-semibold">
                <Handshake size={40} className="text-bolsa-primary" />
              </h3>
              <p className="text-lg font-semibold">
                Escolha a modalidade de bolsa que deseja
              </p>
            </div>
            <div className="p-4">
              <p className="text-center">
                Escolha a modalidade de bolsa que melhor se encaixa com o seu
                perfil e necessidades.
              </p>
            </div>
          </div>

          <div className="md:flex hidden  justify-center items-center">
            <ArrowRight size={40} className="text-bolsa-primary" />
          </div>

          <div className="max-w-xs w-full bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="w-full bg-bolsa-secondary p-4 text-white text-center rounded-t-lg">
              <h3 className="text-3xl flex justify-center font-semibold">
                <Book size={40} className="text-bolsa-primary" />
              </h3>
              <p className="text-lg font-semibold">
                Comece a estudar com desconto
              </p>
            </div>
            <div className="p-4">
              <p className="text-center">
                Inicie seus estudos com o desconto da bolsa e aproveite todos os
                benefícios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default HowWork
