/* eslint-disable @typescript-eslint/no-explicit-any */
import { Course } from "@/app/interface/course"
import { motion } from "framer-motion"
import { Building2, Clock, Heart, MapPin, Star } from "lucide-react"
import Image from "next/image"
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
  type: 'Bacharelado' | 'Tecnólogo';
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
        type: 'Bacharelado',
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
      type: 'Bacharelado',
    };
  };

  const toggleFavorite = (id: number) => {
    setFavorites(prev =>
      prev.includes(id)
        ? prev.filter(fid => fid !== id)
        : [...prev, id]
    );
  };

  const courseParsed = parseCourseName(courseName || course.name);



  const renderUniversityImage = (universityName: string) => {
    switch (universityName.toLowerCase()) {
      case 'anhanguera':
        return '/assets/logo-anhanguera-bolsa-click.svg'
      case 'unopar':
        return '/assets/logo-unopar.svg'
      case 'ampli':
        return '/assets/ampli-logo.png'
      case 'pitagoras':
        return '/assets/logo-pitagoras.svg'

      default:
        return '/assets/logo-bolsa-click-green-dark.svg'
    }
  }

  return (
    <>

    <motion.article
      key={course.id}
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`bg-white rounded-xl shadow-card hover:shadow-hover transition-all duration-300 ${
        viewMode === "list" ? "p-6" : ""
      }`}
      itemScope
      itemType="https://schema.org/Course"
    >
      <div className="relative p-6">
        <div className="space-y-4">
          {/* Dados principais */}
          <header>
            <div className="w-full flex justify-between items-center">
              <div className="w-full justify-start flex">
                <Image
                  src={renderUniversityImage(course.brand)}
                  alt={`Logo da faculdade ${course.brand}`}
                  width={70}
                  height={30}
                  title={`Faculdade ${course.brand}`}
                  className="hover:opacity-55 transition-all duration-150"
                />
              </div>
              <div className="w-full justify-end flex">
                <button
                  title="Favoritar curso"
                  aria-label="Favoritar curso"
                  onClick={() => toggleFavorite(course.id)}
                  className="p-2 rounded-full bg-white shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Heart
                    size={20}
                    className={
                      favorites.includes(course.id)
                        ? "text-red-500 fill-red-500"
                        : "text-neutral-400"
                    }
                  />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-lg text-neutral-900" itemProp="name">
              {courseParsed.name || course.name}
            </h3>
            <p className="text-neutral-600 text-sm" itemProp="educationalCredentialAwarded">
              {courseParsed.type}
            </p>
            <p className="text-neutral-600 text-sm" itemScope itemProp="provider" itemType="https://schema.org/CollegeOrUniversity">
              <span itemProp="name">{capitalizeFirstLetter(course.brand)}</span>
            </p>
            {course.unitDistrict && (
              <p className="text-neutral-600 text-sm">
                Campus: {capitalizeFirstLetter(course.unitDistrict)}
              </p>
            )}
          </header>

          {/* Detalhes rápidos */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <Star size={18} className="text-yellow-400 mr-1" fill="#FACC15" />
              <span className="font-medium">4.8</span>
            </div>
            <div className="flex items-center text-neutral-600">
              <Building2 size={18} className="mr-1" />
              <span itemProp="courseMode">{course.modality}</span>
            </div>
            <div className="flex items-center text-neutral-600">
              <Clock size={18} className="mr-1" />
              {course.classShift}
            </div>
          </div>

          {/* Preço */}
          <div className="border-t border-neutral-100 pt-4" itemProp="hasCourseInstance" itemScope itemType="https://schema.org/CourseInstance">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-sm text-neutral-600">Por:</span>
                <div className="text-emerald-500 text-2xl font-bold" itemProp="offers" itemScope itemType="https://schema.org/Offer">
                  <span itemProp="priceCurrency" content="BRL">R$</span>
                  <span itemProp="price">{course.montlyFeeToMin}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botão */}
          <button
            onClick={handleClick}
            title="Avançar para matrícula"
            aria-label="Avançar para matrícula"
            className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-emerald-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
          >
            Quero essa bolsa
          </button>

          {/* Localização */}
          <div className="flex items-start text-sm text-neutral-600">
            <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
            <p>
              {capitalizeFirstLetter(course.unitAddress)}, {course.unitNumber} -{" "}
              {course.unitCity} - {course.unitState}
              {course.unitDistrict && `, ${capitalizeFirstLetter(course.unitDistrict)}`}
              {" - CEP: "}
              {course.unitPostalCode}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
    </>
  );
}

export default CourseCardNew;