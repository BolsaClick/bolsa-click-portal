import React from 'react'

interface ContainerProps {
  children: React.ReactNode
}

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="container mx-auto px-4 max-w-screen-2xl">{children}</div>
  )
}

export default Container
