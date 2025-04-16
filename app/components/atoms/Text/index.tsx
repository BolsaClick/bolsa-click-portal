import React, { ElementType, ReactNode  } from 'react';

type TextProps = {
  as?: ElementType
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl';
  weight?: 'light' | 'medium' | 'semibold' | 'bold';
  children: ReactNode;
  className?: string;
};

export const Text: React.FC<TextProps> = ({ size = 'base', weight = 'medium',  as: Component = 'p', children, className }) => {
  // Mapeamento de tamanhos de texto para classes do Tailwind


  // Mapeamento de pesos de texto para classes do Tailwind
  const textWeightClasses = {
    light: 'font-light',       // Peso leve
    medium: 'font-medium',     // Peso médio (padrão)
    semibold: 'font-semibold', // Peso semi-negrito
    bold: 'font-bold',         // Peso negrito
  };

  // Aplicando classes responsivas para o tamanho de texto
  const responsiveSizeClasses = {
    xs: 'text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl',
    sm: 'text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl',
    base: 'text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl',
    lg: 'text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl',
    xl: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl',
    '2xl': 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl',
    '3xl': 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl',
    '4xl': 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl',
    '5xl': 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl',
    '6xl': 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-10xl',
  };

  return (
    <Component className={` ${textWeightClasses[weight]} ${responsiveSizeClasses[size]} ${className}`}>
      {children}
    </Component>
  );
};
