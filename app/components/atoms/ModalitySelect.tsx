import React from 'react';
import { Monitor, Building2, GraduationCap } from 'lucide-react';

interface ModalityOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

interface ModalitySelectProps {
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'compact';
}

const modalities: ModalityOption[] = [
  { value: 'presencial', label: 'Presencial', icon: <Building2 size={16} /> },
  { value: 'distancia', label: 'A distancia', icon: <Monitor size={16} /> },
  { value: 'semipresencial', label: 'Semipresencial', icon: <GraduationCap size={16} /> }
];

export const ModalitySelect: React.FC<ModalitySelectProps> = ({
  value,
  onChange,
  variant = 'default'
}) => {
  if (variant === 'compact') {
    return (
      <div className="flex gap-2">
        {modalities.map((modality) => (
          <button
            key={modality.value}
            onClick={() => onChange(modality.value === value ? '' : modality.value)}
            className={`flex items-center whitespace-nowrap px-3 py-1.5 rounded-lg transition-colors ${
              value === modality.value
                ? 'bg-bolsa-primary/10 text-bolsa-pribg-bolsa-primary border-bolsa-pribg-bolsa-primary'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
            } border text-sm`}
          >
            {modality.icon}
            <span className="ml-1.5 font-medium">{modality.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Monitor className="w-5 h-5 text-gray-400" />
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg  focus:ring-bolsa-secondary focus:border-bolsa-secondary outline-none transition-colors focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red appearance-none cursor-pointer"
      >
        {modalities.map((modality) => (
          <option key={modality.value} value={modality.value}>
            {modality.label}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};