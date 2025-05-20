'use client'

import * as Slider from '@radix-ui/react-slider';
import React from 'react';

interface PriceRangeSliderProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min?: number;
  max?: number;
}

const PriceRangeSlider: React.FC<PriceRangeSliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 2000,
}) => {
  return (
    <div className="w-full space-y-3">
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5 group"
        min={min}
        max={max}
        step={1}
        value={value}
        onValueChange={(v) => onChange([v[0], v[1]])}
      >
        <Slider.Track className="bg-neutral-200 relative grow rounded-full h-2">
          <Slider.Range className="absolute bg-emerald-500 rounded-full h-full transition-all duration-300" />
        </Slider.Track>

        <Slider.Thumb
          className="block w-5 h-5 bg-white border-2 border-emerald-500 rounded-full shadow-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          aria-label="Minimum price"
        />
        <Slider.Thumb
          className="block w-5 h-5 bg-white border-2 border-emerald-500 rounded-full shadow-md transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          aria-label="Maximum price"
        />
      </Slider.Root>

      <div className="flex justify-between text-sm text-neutral-600">
        <span>R$ {value[0].toLocaleString('pt-BR')}</span>
        <span>R$ {value[1].toLocaleString('pt-BR')}</span>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
