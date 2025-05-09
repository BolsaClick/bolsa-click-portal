import React from 'react';
import { ListChecks, BookOpen, GraduationCap } from 'lucide-react';

interface EducationLevelFilterProps {
  selectedLevels: string[];
  onChange: (level: string) => void;
}

const EducationLevelFilter: React.FC<EducationLevelFilterProps> = ({ 
  selectedLevels, 
  onChange 
}) => {
  const levels = [
    { 
      id: 'undergraduated', 
      name: 'Graduação', 
      icon: <BookOpen size={18} className="mr-2" />,
      description: 'Bacharelado, Licenciatura e Tecnólogo'
    },
    { 
      id: 'graduated', 
      name: 'Pós-Graduação', 
      icon: <GraduationCap size={18} className="mr-2" />,
      description: 'Especialização e MBA'
    },
    { 
      id: 'technical', 
      name: 'Técnico', 
      icon: <ListChecks size={18} className="mr-2" />,
      description: 'Cursos técnicos e profissionalizantes',
      disabled: true
    }
  ];

  return (
    <div className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-4 min-w-max">
        {levels.map(level => (
          <div 
            key={level.id}
            onClick={() => !level.disabled && onChange(level.id)}
            className={`education-level-badge filter-option p-3 rounded-lg border transition-all hover:scale-102 w-[280px] ${
              level.disabled 
                ? 'opacity-50 cursor-not-allowed bg-gray-50'
                : selectedLevels.includes(level.id)
                  ? 'border-bright-green bg-green-50 shadow-sm cursor-pointer'
                  : 'border-gray-200 hover:border-green-300 hover:bg-gray-50 cursor-pointer'
            }`}
          >
            <div className="flex items-center text-gray-800">
              {level.icon}
              <span className="font-semibold">{level.name}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">{level.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EducationLevelFilter;