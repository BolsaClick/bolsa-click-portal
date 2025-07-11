'use client'

import Container from '../../atoms/Container'
import { Text } from '../../atoms/Text'

const cards = [
  {
    title: 'Fácil de ingressar',
    description: 'Presencial ou online, tenha a liberdade de escolher dia e hora da sua prova.'
  },
  {
    title: 'Melhores ofertas',
    description: (
      <>
        Aqui você encontra as melhores ofertas para{' '}
        <span className="text-bolsa-secondary font-semibold">Início Imediato</span>.
      </>
    )
  },
  {
    title: 'Bolsas de até 80%',
    description: 'Investir no seu futuro pode ser mais leve.'
  }
]

const Cta = () => {
  return (
    <section aria-labelledby="cta-title" className="py-12 bg-[#f8f8f8]">
      <Container>
        <h2 id="cta-title" className="sr-only">Vantagens do Bolsa Click</h2>

        <div className="w-full flex flex-col md:flex-row justify-between gap-4">
          {cards.map((card, index) => (
            <div
              key={index}
              className="rounded-lg p-6 text-center flex flex-col justify-center items-center w-full h-52 bg-bolsa-primary bg-cover bg-center"
              aria-label={`Vantagem ${index + 1}: ${typeof card.title === 'string' ? card.title : ''}`}
            >
              <Text size="sm" className="text-bolsa-white">
                {card.title}
              </Text>
              <Text size="xs" className="text-bolsa-gray-light">
                {card.description}
              </Text>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}

export default Cta
