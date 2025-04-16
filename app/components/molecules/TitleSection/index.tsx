import GeoLocation from '../../atoms/Local'
import { Text } from '../../atoms/Text'
import { Title } from '../../molecules/Title'

interface TitleSectionProps {
  title: string
  subtitle?: string
  bolsa?: boolean
  subdescriptions?: string
}

const TitleSection = ({
  title,
  subtitle,
  bolsa,
  subdescriptions,
}: TitleSectionProps) => {
  return (
    <div className="mt-28 w-full flex  justify-center md:items-start flex-col items-center">
      <Title>{title}</Title>
      <Text size="xs" as="span" weight="light" className="gap-2 flex">
        {subtitle}
        {bolsa ? (
            <GeoLocation />
        ) : (
          <span className="font-semibold text-bolsa-primary">
            {subdescriptions}
          </span>
        )}
      </Text>
    </div>
  )
}

export default TitleSection
