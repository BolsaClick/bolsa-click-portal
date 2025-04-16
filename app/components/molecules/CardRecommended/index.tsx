'use client'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

interface CardRecommendedProps {
  logo: string
  curso: string
  modalidade: string
  local: React.ReactNode
  valor: string
  bolsa: string
  link: string
}

const CardRecommended = ({
  bolsa,
  curso,
  local,
  logo,
  modalidade,
  valor,
  link,
}: CardRecommendedProps) => {
  return (
    <>
      <Link href={link} className="w-full">
        <div className="w-full border-2 flex flex-col border-gray-300 rounded-lg py-4 px-6 bg-white h-72">
          <div className="flex justify-between items-center mb-4">
          <div className="relative w-24 h-8 hover:opacity-60 transition-all delay-100">
            <Image
              src={logo}
              alt={`Logo da ${curso}`}
              fill
              className="object-contain"
            />
          </div>
          </div>
          <div className="text-start mb-10">
            <p className="font-semibold text-lg">{curso}</p>
          </div>

          <div className="text-start w-full flex items-center justify-between mt-auto">
            <div className="w-1/2 flex flex-col justify-start space-y-1">
              <p className="text-sm bg-bolsa-blue text-black rounded-lg hover:bg-bolsa-blue-dark transition-colors">
                {modalidade}
              </p>
              <span className="text-sm bg-bolsa-blue text-black rounded-lg hover:bg-bolsa-blue-dark transition-colors">
                {local}
              </span>
            </div>

            <div className="text-end w-1/2 flex flex-col justify-end items-end space-y-1">
              <p className="line-through text-sm bg-bolsa-blue font-light text-black rounded-lg hover:bg-bolsa-blue-dark transition-colors w-full text-right">
                {valor}
              </p>
              <span className="font-semibold text-sm bg-bolsa-blue text-black rounded-lg hover:bg-bolsa-blue-dark transition-colors w-full text-right">
                {bolsa}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </>
  )
}

export default CardRecommended
