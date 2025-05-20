import Container from '../../atoms/Container'
import { Text } from '../../atoms/Text'

const Cta = () => {
  return (
    <Container>
      <div className=" w-full pb-12 justify-between flex-col md:flex-row gap-4 flex items-center ">
        <div className="rounded-lg p-6 justify-center gap-4 flex-col text-center flex items-center w-full h-52 bg-bolsa-primary bg-cover bg-center">
          <Text size="sm" className="text-bolsa-white">
            Facil de ingressar
          </Text>
          <Text size="xs" className="text-bolsa-gray-light">
            Presencial ou online tenha a liberdade de escolhar dia e hora da sua
            prova
          </Text>
        </div>
        <div className="rounded-lg p-6 justify-center gap-4 flex-col flex text-center items-center w-full h-52 bg-bolsa-primary bg-cover bg-center">
          <Text size="sm" className="text-bolsa-white">
            Melhores ofertas
          </Text>
          <Text size="xs" className="text-bolsa-gray-light">
            Aqui você encontra as melhores ofertas para{' '}
            <span className="text-bolsa-secondary font-semibold">
              Inicio Imediato
            </span>
            .
          </Text>
        </div>
        <div className="rounded-lg p-6 justify-center gap-4 flex-col flex text-center items-center w-full h-52 bg-bolsa-primary bg-cover bg-center">
          <Text size="sm" className="text-bolsa-white">
            Bolsas de até 80%
          </Text>
          <Text size="xs" className="text-bolsa-gray-light">
            Investir no seu futuro pode ser mais leve.
          </Text>
        </div>
      </div>
    </Container>
  )
}

export default Cta
