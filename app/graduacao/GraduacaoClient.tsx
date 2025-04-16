// app/graduacao/App.tsx
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  GraduationCap, BookOpen, Clock, Award, Building2,
  FileSpreadsheet, Globe, Users, Brain, Target, Laptop,
  CheckCircle, TrendingUp, Calendar, BookMarked,
  ArrowRight, Mail, Star, Sparkles, MapPin
} from 'lucide-react'
import Image from 'next/image'

export default function GraduacaoClient() {
  const [activeTab, setActiveTab] = useState('vantagens')

  return (
   <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
       
        <header className="relative bg-gradient-to-r from-bolsa-secondary to-bolsa-primary text-white py-32 overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/50 to-bolsa-secondary/50" />
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
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-green-200">
              Cursos de Graduação
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto leading-relaxed">
              Descubra o caminho para sua formação superior e transforme seu futuro profissional
            </p>
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-green-700 px-8 py-4 rounded-full font-semibold hover:bg-green-50 transition-colors flex items-center gap-2 justify-center group"
              >
                <Target className="w-5 h-5" />
                <span>Começar Agora</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button 
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
                { icon: Users, title: '+1000', subtitle: 'Alunos Formados', color: 'from-green-500 to-bolsa-primary' },
                { icon: BookMarked, title: '+100', subtitle: 'Cursos Disponíveis', color: 'from-purple-500 to-purple-600' },
                { icon: Award, title: '+50', subtitle: 'Prêmios Recebidos', color: 'from-pink-500 to-pink-600' },
                { icon: TrendingUp, title: '95%', subtitle: 'Taxa de Empregabilidade', color: 'from-green-500 to-green-600' }
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
  
        {/* What is Graduation Section with 3D Card Effect */}
        <section className="py-20 container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent">
                O que é curso de graduação?
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                A graduação é o primeiro nível da formação superior no Brasil. São cursos que oferecem diploma de bacharel, licenciatura ou 
                tecnólogo, permitindo que o profissional atue de forma legal no mercado de trabalho.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-green-50 rounded-xl p-6 border-2 border-green-100"
                >
                  <Star className="w-8 h-8 text-bolsa-primary mb-3" />
                  <h3 className="font-semibold text-green-700">Diploma Reconhecido</h3>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="bg-green-50 rounded-xl p-6 border-2 border-green-100"
                >
                  <Sparkles className="w-8 h-8 text-bolsa-primary mb-3" />
                  <h3 className="font-semibold text-green-700">Carreira Profissional</h3>
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
                fill 
                  src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" 
                  alt="Estudantes em sala de aula"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <Calendar className="w-8 h-8 mb-2" />
                  <p className="text-2xl font-bold">2024</p>
                  <p>Inscrições Abertas</p>
                </div>
              </div>
              <motion.div
                animate={{ 
                  rotate: [0, 5, 0, -5, 0],
                  scale: [1, 1.02, 1, 1.02, 1]
                }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-gradient-to-r from-bolsa-primary to-green-400 text-white p-6 rounded-xl shadow-lg"
              >
                <MapPin className="w-8 h-8 mb-2" />
                <p className="text-2xl font-bold">+50</p>
                <p>Cidades</p>
              </motion.div>
            </motion.div>
          </div>
        </section>
  
        {/* Types of Graduation with Interactive Cards */}
        <section className="py-20 bg-gradient-to-b from-white to-green-50">
          <div className="container mx-auto px-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-center mb-16"
            >
              Tipos de Graduação
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Bacharelado',
                  icon: BookOpen,
                  color: 'from-green-500 to-bolsa-primary',
                  items: [
                    { icon: Clock, text: 'Duração: 4-5 anos' },
                    { icon: Brain, text: 'Formação ampla e profunda' },
                    { icon: FileSpreadsheet, text: 'Foco em pesquisa' }
                  ]
                },
                {
                  title: 'Licenciatura',
                  icon: Building2,
                  color: 'from-purple-500 to-purple-600',
                  items: [
                    { icon: Clock, text: 'Duração: 4 anos' },
                    { icon: Users, text: 'Foco em ensino' },
                    { icon: BookMarked, text: 'Prática pedagógica' }
                  ]
                },
                {
                  title: 'Tecnólogo',
                  icon: Laptop,
                  color: 'from-pink-500 to-pink-600',
                  items: [
                    { icon: Clock, text: 'Duração: 2-3 anos' },
                    { icon: Target, text: 'Formação específica' },
                    { icon: TrendingUp, text: 'Foco prático' }
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
        <section className="py-20 bg-green-50">
          <div className="container mx-auto px-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-center mb-16"
            >
              Áreas de Conhecimento
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: 'Ciências Exatas',
                  image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                  courses: ['Engenharias', 'Matemática', 'Física', 'Computação'],
                  color: 'from-bolsa-primary to-green-400'
                },
                {
                  title: 'Ciências Humanas',
                  image: 'https://images.unsplash.com/photo-1513128034602-7814ccaddd4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                  courses: ['Direito', 'Psicologia', 'Pedagogia', 'História'],
                  color: 'from-purple-600 to-purple-400'
                },
                {
                  title: 'Ciências Biológicas',
                  image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                  courses: ['Medicina', 'Enfermagem', 'Nutrição', 'Biologia'],
                  color: 'from-green-600 to-green-400'
                },
                {
                  title: 'Ciências Sociais',
                  image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                  courses: ['Administração', 'Economia', 'Contabilidade', 'Marketing'],
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
                      width="100"
                      height="100"
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
                <h2 className="text-4xl font-bold mb-6">Graduação à Distância (EAD)</h2>
                <p className="text-gray-600 text-lg mb-8">
                  A graduação EAD é uma modalidade que permite estudar de forma flexível, com aulas online e 
                  algumas atividades presenciais.
                </p>
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setActiveTab('vantagens')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                      activeTab === 'vantagens' 
                        ? 'bg-bolsa-primary text-white' 
                        : 'bg-green-50 text-bolsa-primary hover:bg-green-100'
                    }`}
                  >
                    Vantagens
                  </button>
                  <button
                    onClick={() => setActiveTab('requisitos')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-colors ${
                      activeTab === 'requisitos' 
                        ? 'bg-bolsa-primary text-white' 
                        : 'bg-green-50 text-bolsa-primary hover:bg-green-100'
                    }`}
                  >
                    Requisitos
                  </button>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="bg-green-50 rounded-xl p-6"
                >
                  {activeTab === 'vantagens' ? (
                    <ul className="space-y-4">
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <Clock className="w-5 h-5 text-bolsa-primary" />
                        <span>Flexibilidade de horários</span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <TrendingUp className="w-5 h-5 text-bolsa-primary" />
                        <span>Menor custo</span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <Target className="w-5 h-5 text-bolsa-primary" />
                        <span>Estudo no seu ritmo</span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <Award className="w-5 h-5 text-bolsa-primary" />
                        <span>Mesmo valor do diploma</span>
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
                        <span>Autodisciplina</span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <Laptop className="w-5 h-5 text-bolsa-primary" />
                        <span>Computador com internet</span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <Calendar className="w-5 h-5 text-bolsa-primary" />
                        <span>Organização do tempo</span>
                      </motion.li>
                      <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center gap-3 text-gray-600"
                      >
                        <CheckCircle className="w-5 h-5 text-bolsa-primary" />
                        <span>Comprometimento</span>
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
                    alt="Estudante EAD"
                    className="w-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-900/50 to-transparent" />
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
  
        {/* Newsletter Section with Animation */}
        <section className="pt-20 bg-gradient-to-r from-green-950 to-bolsa-primary text-white relative overflow-hidden">
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
              <p className="text-xl mb-12 text-green-100">Fique por dentro das melhores oportunidades de graduação.</p>
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
                      className="w-full px-12 py-4 rounded-xl text-gray-900 text-lg focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </motion.div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white text-green-700 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-colors text-lg flex items-center gap-2"
                  >
                    <span>Cadastrar</span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </div>
                <p className="text-sm text-green-200">
                  Ao se cadastrar, você concorda em receber nossas comunicações
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
  )
}
