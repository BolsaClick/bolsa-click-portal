import { Course } from "@/app/interface/course"
import { motion } from "framer-motion"
import { Building2, Clock, Heart, MapPin, Star } from "lucide-react"
import { useState } from "react"

interface CourseCardProps {
  course: Course
  setFormData?: (name: string, value: any) => void
  courseName: string
  triggerSubmit?: () => void
  viewMode: 'grid' | 'list';
}

type CourseInfo = {
  name: string;
  type: 'Bacharelado' | 'Tecnólogo' | 'Outro';
}


const CourseCardNew: React.FC<CourseCardProps> = ({
  course,
  viewMode,
  courseName
}) => {
  const [favorites, setFavorites] = useState<number[]>([]);



  const handleClick = () => {
    localStorage.setItem('selectedCourse', JSON.stringify(course))
    window.location.href = '/checkout'
  }
  const capitalizeFirstLetter = (text: string) => {
    if (!text) return ''
    return text
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const parseCourseName = (name?: string): CourseInfo => {
    if (!name || typeof name !== 'string') {
      return {
        name: '',
        type: 'Outro',
      };
    }

    const lower = name.toLowerCase();

    if (lower.includes(' - bacharelado')) {
      return {
        name: name.replace(/ - Bacharelado$/i, '').trim(),
        type: 'Bacharelado',
      };
    }

    if (lower.includes(' - tecnólogo') || lower.includes(' - tecnologo')) {
      return {
        name: name.replace(/ - Tecn[oó]logo$/i, '').trim(),
        type: 'Tecnólogo',
      };
    }

    return {
      name: name.trim(),
      type: 'Outro',
    };
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(fid => fid !== id)
        : [...prev, id]
    );
  };

  const courseParsed = parseCourseName(courseName);

  return (
    <>

      <motion.div
        key={course.id}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`bg-white rounded-xl shadow-card hover:shadow-hover transition-all duration-300 ${viewMode === 'list' ? 'p-6' : ''
          }`}
      >
        <div className="relative p-6">


          <div className="space-y-4">
            {/* Dados principais */}

            <div>
              <div className="w-full flex justify-between items-center">
                <div className="flex flex-col w-full justify-start ">
                  <h3 className="font-bold text-lg text-neutral-900">
                    {courseParsed.name}
                  </h3>
                  <p className="text-neutral-600 text-sm">
                    {courseParsed.type}
                  </p>
                </div>
                <div className="w-full justify-end flex">
                  <button
                    onClick={() => toggleFavorite(course.id)}
                    className="p-2 rounded-full bg-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    <Heart
                      size={20}
                      className={
                        favorites.includes(course.id)
                          ? 'text-red-500 fill-red-500'
                          : 'text-neutral-400'
                      }
                    />
                  </button>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-neutral-600 text-sm">{capitalizeFirstLetter(course.brand)}</p>
                {course.unitDistrict && (
                <p className="text-neutral-600 text-sm">Campus{capitalizeFirstLetter(course.unitDistrict)}</p>

                )}
              </div>

            </div>

            {/* Detalhes rápidos */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <Star size={18} className="text-yellow-400 mr-1" fill="#FACC15" />
                <span className="font-medium">4.8</span>
              </div>
              <div className="flex items-center text-neutral-600">
                <Building2 size={18} className="mr-1" />
                {course.modality}
              </div>
              <div className="flex items-center text-neutral-600">
                <Clock size={18} className="mr-1" />
                {course.classShift}
              </div>
            </div>

            {/* Preço */}
            <div className="border-t border-neutral-100 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-neutral-600">De:</span>
                <span className="text-sm line-through text-neutral-500">
                  {(1200).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-sm text-neutral-600">Por:</span>
                  <div className="text-emerald-500 text-2xl font-bold">
                    {course.montlyFeeToMin.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </div>
                </div>
                <span className="bg-green-500 text-white text-sm font-bold px-2 py-1 rounded">
                  70% OFF
                </span>
              </div>
            </div>

            {/* Botão e localização */}
            <button onClick={handleClick} className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
              Quero essa bolsa
            </button>

            <div className="flex items-start text-sm text-neutral-600">
              <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
              {(course.modality === 'Presencial' ||
                course.modality === 'Semipresencial') && (
                  <p>
                    {capitalizeFirstLetter(course.unitAddress)} - CEP:{' '}
                    {course.unitPostalCode}
                  </p>
                )}
              {course.modality === 'A distância' && (
                <div className="flex flex-col text-xs items-center justify-center">
                  <p>
                    {capitalizeFirstLetter(course.unitAddress)},{' '}
                    {course.unitNumber}, {course.unitCity} - {course.unitState},   {capitalizeFirstLetter(course.unitDistrict)} - <span className="text-nowrap">CEP:{' '}
                      {course.unitPostalCode}</span>
                  </p>
                  <p>

                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </motion.div>
    </>
  );
}

export default CourseCardNew;