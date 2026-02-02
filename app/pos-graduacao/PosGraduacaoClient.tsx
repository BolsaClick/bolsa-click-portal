// app/pos-graduacao/PosGraduacaoClient.tsx
'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  GraduationCap, BookOpen, Clock, Award, Building2,
  FileSpreadsheet, Globe, Users, Brain, Target, Laptop,
  CheckCircle, TrendingUp, Calendar, BookMarked,
  ArrowRight, Mail, Star, Sparkles, MapPin, ChevronDown
} from 'lucide-react'
import Image from 'next/image'

export default function PosGraduacaoClient() {
  const [activeTab, setActiveTab] = useState('vantagens')
  const router = useRouter()
  const infoSectionRef = useRef<HTMLElement>(null)

  const handleComecarAgora = () => {
    router.push('/curso/resultado?nivel=POS_GRADUACAO')
  }

  const handleSaibaMais = () => {
    infoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
   <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
       
        <header className="relative bg-gradient-to-r  from-emerald-950 to-emerald-700 text-white py-32 overflow-hidden">
          <motion.div 
            className="absolute inset-0 z-0 opacity-20"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b  from-emerald-950 to-emerald-700/50" />
          <motion.div 
            className="container mx-auto px-4 text-center relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <GraduationCap className="w-24 h-24 mx-auto mb-8" />
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-200">
              Cursos de Pós-graduação
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 max-w-3xl mx-auto leading-relaxed">
              Especialize-se e alcance novos patamares na sua carreira profissional
            </p>
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
              <motion.button 
                onClick={handleComecarAgora}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-emerald-700 px-8 py-4 rounded-full font-semibold hover:bg-emerald-50 transition-colors flex items-center gap-2 justify-center group"
              >
                <Target className="w-5 h-5" />
                <span>Começar Agora</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button 
                onClick={handleSaibaMais}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-colors flex items-center gap-2 justify-center"
              >
                <Brain className="w-5 h-5" />
                <span>Saiba Mais</span>
              </motion.button>
            </div>
          </motion.div>
        </header>
  
        {/* Floating Stats Cards */}
        <section className="py-12 -mt-24 relative z-10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { icon: Users, title: '+500', subtitle: 'Especialistas Formados', color: 'from-emerald-500 to-bolsa-primary' },
                { icon: BookMarked, title: '+200', subtitle: 'Cursos Disponíveis', color: 'from-purple-500 to-purple-600' },
                { icon: Award, title: '+80%', subtitle: 'Desconto em Bolsas', color: 'from-pink-500 to-pink-600' },
                { icon: TrendingUp, title: '98%', subtitle: 'Satisfação dos Alunos', color: 'from-emerald-500 to-emerald-600' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className={`rounded-xl p-4 bg-gradient-to-r ${stat.color} text-white mb-4`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-800 mb-2">{stat.title}</h3>
                  <p className="text-gray-600">{stat.subtitle}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
  
        {/* What is Post-Graduation Section with 3D Card Effect */}
        <section ref={infoSectionRef} className="py-20 container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
                O que é pós-graduação?
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                A pós-graduação é uma formação especializada que permite aprofundar conhecimentos em uma área específica após a graduação. 
                Inclui especializações, MBAs, mestrados e doutorados, oferecendo oportunidades de crescimento profissional e acadêmico.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-emerald-50 rounded-xl p-6 border-2 border-emerald-100"
                >
                  <Star className="w-8 h-8 text-bolsa-primary mb-3" />
                  <h3 className="font-semibold text-emerald-700">Especialização Profissional</h3>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-emerald-50 rounded-xl p-6 border-2 border-emerald-100"
                >
                  <Sparkles className="w-8 h-8 text-bolsa-primary mb-3" />
                  <h3 className="font-semibold text-emerald-700">Diferencial no Mercado</h3>
                </motion.div>
              </div>
            </motion.div>
            <motion.div 
              className="relative perspective-1000"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:rotate-y-10 transition-transform duration-500">
                <Image
                  width={1000}
                  height={1000}
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                  alt="Profissionais em pós-graduação"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <Calendar className="w-8 h-8 mb-2" />
                  <p className="text-2xl font-bold">2025</p>
                  <p>Inscrições Abertas</p>
                </div>
              </div>
              <motion.div
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.02, 1, 1.02, 1]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-gradient-to-r from-bolsa-primary to-emerald-400 text-white p-6 rounded-xl shadow-lg"
              >
                <MapPin className="w-8 h-8 mb-2" />
                <p className="text-2xl font-bold">+50</p>
                <p>Cidades</p>
              </motion.div>
            </motion.div>
          </div>
        </section>
  
        {/* Types of Post-Graduation with Interactive Cards */}
        <section className="py-20 bg-gradient-to-b from-white to-emerald-50">
          <div className="container mx-auto px-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-center mb-16"
            >
              Tipos de Pós-graduação
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Especialização',
                  icon: BookOpen,
                  color: 'from-emerald-500 to-bolsa-primary',
                  items: [
                    { icon: Clock, text: 'Duração: 1-2 anos' },
                    { icon: Brain, text: 'Aprofundamento em área específica' },
                    { icon: FileSpreadsheet, text: 'Foco prático e profissional' }
                  ]
                },
                {
                  title: 'MBA',
                  icon: Building2,
                  color: 'from-purple-500 to-purple-600',
                  items: [
                    { icon: Clock, text: 'Duração: 1-2 anos' },
                    { icon: Users, text: 'Foco em gestão e negócios' },
                    { icon: BookMarked, text: 'Networking e cases reais' }
                  ]
                },
                {
                  title: 'Mestrado',
                  icon: Laptop,
                  color: 'from-pink-500 to-pink-600',
                  items: [
                    { icon: Clock, text: 'Duração: 2 anos' },
                    { icon: Target, text: 'Formação acadêmica avançada' },
                    { icon: TrendingUp, text: 'Pesquisa e produção científica' }
                  ]
                }
              ].map((type, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-8 shadow-xl relative overflow-hidden group"
                >
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${type.color} opacity-10 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-150`} />
                  <div className={`inline-block rounded-xl p-4 bg-gradient-to-r ${type.color} text-white mb-6`}>
                    <type.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold mb-6">{type.title}</h3>
                  <ul className="space-y-4">
                    {type.items.map((item, itemIndex) => (
                      <motion.li 
                        key={itemIndex}
                        className="flex items-center gap-3 text-gray-600"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: (index * 0.2) + (itemIndex * 0.1) }}
                      >
                        <item.icon className="w-5 h-5 text-bolsa-primary" />
                        <span>{item.text}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
  
        {/* Areas of Knowledge with Hover Effects */}
        <section className="py-20 bg-emerald-50">
          <div className="container mx-auto px-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-center mb-16"
            >
              Áreas de Especialização
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: 'Gestão e Negócios',
                  image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                  courses: ['MBA em Gestão', 'Administração', 'Marketing', 'Finanças'],
                  color: 'from-bolsa-primary to-emerald-400'
                },
                {
                  title: 'Saúde e Bem-estar',
                  image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                  courses: ['Enfermagem', 'Nutrição', 'Psicologia', 'Fisioterapia'],
                  color: 'from-emerald-600 to-emerald-400'
                },
                {
                  title: 'Tecnologia e Inovação',
                  image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                  courses: ['TI e Sistemas', 'Data Science', 'Segurança', 'Desenvolvimento'],
                  color: 'from-purple-600 to-purple-400'
                },
                {
                  title: 'Educação e Pedagogia',
                  image: 'https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                  courses: ['Pedagogia', 'Gestão Escolar', 'Educação Inclusiva', 'Metodologias'],
                  color: 'from-pink-600 to-pink-400'
                }
              ].map((area, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <div className={`absolute inset-0 bg-gradient-to-b ${area.color} mix-blend-multiply opacity-60`} />
                    <Image 
                      width={1000}
                      height={1000}
                      src={area.image} 
                      alt={area.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-2xl font-bold text-white text-center px-4">{area.title}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-2">
                      {area.courses.map((course, courseIndex) => (
                        <motion.li 
                          key={course}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: (index * 0.1) + (courseIndex * 0.1) }}
                          className="flex items-center gap-2 text-gray-600"
                        >
                          <CheckCircle className="w-4 h-4 text-bolsa-primary" />
                          {course}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
  
        {/* EAD Section with Interactive Tabs */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-4xl font-bold mb-6">Pós-graduação à Distância (EAD)</h2>
                <p className="text-gray-600 text-lg mb-8">
                  A pós-graduação EAD oferece flexibilidade total para profissionais que buscam especialização sem 
                  comprometer a rotina de trabalho.
                </p>
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setActiveTab('vantagens')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                      activeTab === 'vantagens' 
                        ? 'bg-bolsa-primary text-white' 
                        : 'bg-emerald-50 text-bolsa-primary hover:bg-emerald-100'
                    }`}
                  >
                    Vantagens
                  </button>
                  <button
                    onClick={() => setActiveTab('requisitos')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                      activeTab === 'requisitos' 
                        ? 'bg-bolsa-primary text-white' 
                        : 'bg-emerald-50 text-bolsa-primary hover:bg-emerald-100'
                    }`}
                  >
                    Requisitos
                  </button>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-emerald-50 rounded-xl p-6"
                >
                  {activeTab === 'vantagens' ? (
                    <ul className="space-y-4">
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <Clock className="w-5 h-5 text-bolsa-primary" />
                        <span>Estude no seu ritmo e horário</span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <TrendingUp className="w-5 h-5 text-bolsa-primary" />
                        <span>Investimento mais acessível</span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <Target className="w-5 h-5 text-bolsa-primary" />
                        <span>Conteúdo atualizado e relevante</span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <Award className="w-5 h-5 text-bolsa-primary" />
                        <span>Certificado reconhecido pelo MEC</span>
                      </motion.li>
                    </ul>
                  ) : (
                    <ul className="space-y-4">
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <Brain className="w-5 h-5 text-bolsa-primary" />
                        <span>Diploma de graduação</span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <Laptop className="w-5 h-5 text-bolsa-primary" />
                        <span>Acesso à internet estável</span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <Calendar className="w-5 h-5 text-bolsa-primary" />
                        <span>Dedicação e comprometimento</span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <CheckCircle className="w-5 h-5 text-bolsa-primary" />
                        <span>Experiência profissional (recomendado)</span>
                      </motion.li>
                    </ul>
                  )}
                </motion.div>
              </motion.div>
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  <Image 
                    width={100}
                    height={100}
                    src="https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
                    alt="Profissional em pós-graduação EAD"
                    className="w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/50 to-transparent" />
                </div>
                <motion.div 
                  className="absolute -bottom-6 -left-6 bg-gradient-to-r from-bolsa-primary to-bolsa-primary text-white p-6 rounded-xl"
                  animate={{ 
                    rotate: [0, 5, 0, -5, 0],
                    scale: [1, 1.02, 1, 1.02, 1]
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  <Globe className="w-8 h-8 mb-2" />
                  <p className="text-2xl font-bold">100%</p>
                  <p>Online</p>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Seção: Por que fazer uma Pós-Graduação? */}
        <section className="py-20 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-center mb-12 text-emerald-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Por que fazer uma Pós-Graduação?
            </motion.h2>

            <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                A pós-graduação é essencial para quem busca se destacar no mercado de trabalho e
                alcançar posições de liderança. Com uma especialização, MBA ou mestrado, você
                aprofunda seus conhecimentos em áreas específicas, aumenta sua competitividade
                profissional e pode conquistar salários até 120% maiores.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
              >
                Profissionais com pós-graduação têm maior reconhecimento no mercado, acesso a cargos
                de gestão e consultoria, além de desenvolverem uma rede de contatos valiosa (networking)
                com outros especialistas da área. É o diferencial que pode alavancar sua carreira.
              </motion.p>

              <motion.h3
                className="text-2xl font-bold text-emerald-800 mt-8 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                Tipos de Pós-Graduação Disponíveis
              </motion.h3>

              <ul className="space-y-3">
                <motion.li
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                >
                  <CheckCircle className="w-6 h-6 text-emerald-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong>Especialização (Lato Sensu):</strong> Aprofundamento em área específica
                    do conhecimento. Duração de 12 a 24 meses. Ideal para aplicação prática.
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                >
                  <CheckCircle className="w-6 h-6 text-emerald-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong>MBA (Master in Business Administration):</strong> Focado em gestão e
                    administração de negócios. Voltado para líderes e executivos.
                  </div>
                </motion.li>
                <motion.li
                  className="flex items-start"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <CheckCircle className="w-6 h-6 text-emerald-600 mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <strong>Mestrado (Stricto Sensu):</strong> Formação acadêmica avançada com foco
                    em pesquisa. Duração de 2 a 3 anos. Requisito para carreira docente.
                  </div>
                </motion.li>
              </ul>

              <motion.h3
                className="text-2xl font-bold text-emerald-800 mt-8 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                Modalidades de Ensino
              </motion.h3>

              <div className="grid md:grid-cols-3 gap-6 mt-6">
                <motion.div
                  className="bg-emerald-50 p-6 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 }}
                >
                  <h4 className="font-bold text-lg text-emerald-900 mb-3">EAD (Ensino a Distância)</h4>
                  <p className="text-sm text-gray-600">
                    Flexibilidade total para conciliar estudos com trabalho. Conteúdo de qualidade
                    com tutoria especializada e aulas gravadas.
                  </p>
                </motion.div>
                <motion.div
                  className="bg-emerald-50 p-6 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                >
                  <h4 className="font-bold text-lg text-emerald-900 mb-3">Presencial</h4>
                  <p className="text-sm text-gray-600">
                    Networking presencial com professores doutores e colegas da área. Discussões
                    aprofundadas e troca de experiências.
                  </p>
                </motion.div>
                <motion.div
                  className="bg-emerald-50 p-6 rounded-xl"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.9 }}
                >
                  <h4 className="font-bold text-lg text-emerald-900 mb-3">Semipresencial</h4>
                  <p className="text-sm text-gray-600">
                    Equilibra flexibilidade do EAD com encontros presenciais estratégicos para
                    workshops, estudos de caso e networking.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Seção de FAQ */}
        <section className="py-20 bg-gradient-to-b from-white to-emerald-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.h2
              className="text-4xl md:text-5xl font-bold text-center mb-12 text-emerald-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Perguntas Frequentes sobre Pós-Graduação
            </motion.h2>

            <div className="space-y-4">
              {[
                {
                  question: "Qual a diferença entre Especialização e MBA?",
                  answer: "A Especialização é focada em aprofundamento técnico em uma área específica, enquanto o MBA é voltado para gestão e liderança empresarial, focado em formar executivos e gestores."
                },
                {
                  question: "Preciso ter graduação para fazer pós-graduação?",
                  answer: "Sim! A pós-graduação (lato sensu ou stricto sensu) exige diploma de graduação reconhecido pelo MEC como pré-requisito para ingresso."
                },
                {
                  question: "Quanto tempo dura uma pós-graduação?",
                  answer: "Especializações e MBAs geralmente duram de 12 a 24 meses. Mestrados levam de 2 a 3 anos, e Doutorados de 3 a 5 anos."
                },
                {
                  question: "Pós-graduação EAD tem o mesmo valor no mercado?",
                  answer: "Sim! Cursos de pós-graduação EAD reconhecidos pelo MEC têm a mesma validade que os presenciais. O diploma não faz distinção entre modalidades."
                },
                {
                  question: "Como funciona a bolsa de estudos para pós-graduação?",
                  answer: "No Bolsa Click você encontra descontos de até 80% em pós-graduações. Basta escolher o curso, comparar preços e se cadastrar gratuitamente para garantir sua bolsa."
                },
                {
                  question: "Posso fazer pós-graduação em área diferente da minha graduação?",
                  answer: "Sim! Muitas especializações e MBAs aceitam profissionais de diferentes áreas. Alguns cursos podem solicitar conhecimentos prévios ou cursos complementares."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <details className="group">
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <h3 className="text-lg font-semibold text-emerald-900 pr-4">
                        {faq.question}
                      </h3>
                      <ChevronDown className="w-6 h-6 text-emerald-600 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="px-6 pb-6 text-gray-600">
                      <p>{faq.answer}</p>
                    </div>
                  </details>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section with Animation */}
        <section className="pt-20 bg-gradient-to-r from-emerald-950 to-bolsa-primary text-white relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 opacity-10"
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
            }}
          />
          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Receba alertas sobre vagas!</h2>
              <p className="text-xl mb-12 text-emerald-100">Fique por dentro das melhores oportunidades de pós-graduação.</p>
              <div className="max-w-md mx-auto">
                <div className="flex gap-4 mb-4">
                  <motion.div 
                    className="flex-1 relative"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="Seu e-mail"
                      className="w-full px-12 py-4 rounded-xl text-gray-900 text-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </motion.div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-emerald-700 px-8 py-4 rounded-xl font-semibold hover:bg-emerald-50 transition-colors text-lg flex items-center gap-2"
                  >
                    <span>Cadastrar</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
                <p className="text-sm text-emerald-200">
                  Ao se cadastrar, você concorda em receber nossas comunicações
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
  )
}
