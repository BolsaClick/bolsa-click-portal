import Image from 'next/image'
import Container from '../../atoms/Container'
import { Text } from '../../atoms/Text'
import Filter from '../../molecules/Filter'

const HeroSection = () => {
  return (
    <div className="bg-bolsa-primary w-full h-5/6 relative">
      <Container>
        <div className="justify-between items-center mt-8 flex lg:flex-row flex-col w-full relative ">
          <div className="px-10 text-center lg:text-start w-full flex flex-col items-center justify-center gap-2">
            <Text
              size="2xl"
              weight="semibold"
              className="text-bolsa-white gap-1 flex leading-normal  "
            >
              Temos descontos exclusivos para
            </Text>
            <div className="flex  w-full text-center lg:text-start lg:justify-start justify-center items-center gap-4">
              <Text size="2xl" weight="semibold" className="text-bolsa-white  ">
                você
              </Text>
              <div className="p-4 rounded-lg items-center justify-center bg-bolsa-white/20">
                <Image alt="Bolsa Click"  src="/assets/icons/pen.png" width="36" height="36" />
              </div>
              <Text className="text-bolsa-white">+</Text>
              <div className="p-4 rounded-lg items-center justify-center bg-bolsa-white/20">
                <Image alt="Bolsa Click - Economize dinheiro"  src="/assets/icons/money.png" width="36" height="36" />
              </div>
            </div>
          </div>
          <div className="w-full hidden justify-end lg:flex">
            <Image alt="Avatar Bolsa Click" width={491} height={421} src="/assets/avatar-logo.png" className="z-1" />
          </div>
        </div>
        <Filter />
      </Container>
    </div>
  )
}

export default HeroSection
