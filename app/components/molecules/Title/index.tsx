import React from 'react';
import { Text } from '../../atoms/Text';

type TitleProps = {
  children: React.ReactNode;
  className?: string;
}

export const Title: React.FC<TitleProps> = ({ children, className }) => {
  return ( 
    <Text size="lg" weight="semibold" className={`text-bolsa-gray-dark ${className}`}>{children}</Text>
   );
}
 
