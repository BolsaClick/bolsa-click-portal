import React from 'react'

// Definindo as propriedades do Skeleton
interface SkeletonProps {
  width?: string | number
  height?: string | number
  round?: boolean
  className?: string
}

const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%', // Modificado para porcentagem por padrão
  height = '1.5rem', // Altura padrão modificada
  round = false,
  className,
}) => {
  const borderRadiusClass = round ? 'rounded-full' : 'rounded-md'

  return (
    <div
      className={`bg-gray-300 animate-pulse ${borderRadiusClass} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    ></div>
  )
}

export default Skeleton
