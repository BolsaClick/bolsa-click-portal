'use client'
import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Container from '../../atoms/Container';
import { useWhatsappFeatureFlag } from '@/app/lib/hooks/usePostHogFeatureFlags';

const Footer: React.FC = () => {
  const showWhatsapp = useWhatsappFeatureFlag()
  const [currentTheme, setCurrentTheme] = useState('bolsaclick')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentTheme(process.env.NEXT_PUBLIC_THEME || 'bolsaclick')
    }
  }, [])

  const logoColor =
    currentTheme === 'anhanguera'
      ? '/assets/logo-anhanguera-bolsa-click.svg'
      : '/assets/logo-bolsa-click-rosa.png'

  // Cursos populares para o footer
  const cursosPopulares = [
    { nome: 'Administração', slug: 'administracao' },
    { nome: 'Direito', slug: 'direito' },
    { nome: 'Enfermagem', slug: 'enfermagem' },
    { nome: 'Psicologia', slug: 'psicologia' },
    { nome: 'Pedagogia', slug: 'pedagogia' },
    { nome: 'Análise e Desenvolvimento de Sistemas', slug: 'analise-e-desenvolvimento-de-sistemas' },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-50 to-slate-100 border-t border-neutral-200 w-full">
      <Container>
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
            {/* Logo e Descrição */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <Image
                src={logoColor}
                alt="Logo do Bolsa Click - Marketplace de bolsas de estudo"
                width={100}
                height={37}
                priority
              />
              <p className="text-neutral-600 text-sm leading-relaxed">
                O maior marketplace de bolsas de estudo do Brasil. Seu futuro com mais desconto começa aqui.
              </p>
              <div className="flex space-x-3 pt-2">
                <a
                  href="https://facebook.com/bolsaclickbrasil"
                  className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-500 hover:text-bolsa-primary hover:shadow-md transition-all duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <Facebook size={18} />
                </a>
                <a
                  href="https://instagram.com/bolsaclick"
                  className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-500 hover:text-bolsa-primary hover:shadow-md transition-all duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="https://linkedin.com/company/bolsaclick"
                  className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-500 hover:text-bolsa-primary hover:shadow-md transition-all duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={18} />
                </a>
                {showWhatsapp && (
                  <a
                    href="https://wa.me/5511936200198"
                    className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center text-neutral-500 hover:text-green-500 hover:shadow-md transition-all duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* Institucional */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-950 mb-4">Institucional</h4>
              <nav aria-label="Links institucionais">
                <ul className="space-y-2.5">
                  <li>
                    <Link href="/quem-somos" className="text-neutral-600 text-sm hover:text-bolsa-primary transition-colors">
                      Quem Somos
                    </Link>
                  </li>
                  <li>
                    <Link href="/central-de-ajuda/sobre-o-bolsa-click/como-funciona" className="text-neutral-600 text-sm hover:text-bolsa-primary transition-colors">
                      Como Funciona
                    </Link>
                  </li>
                  <li>
                    <Link href="/central-de-ajuda" className="text-neutral-600 text-sm hover:text-bolsa-primary transition-colors">
                      Central de Ajuda
                    </Link>
                  </li>
                  <li>
                    <Link href="/contato" className="text-neutral-600 text-sm hover:text-bolsa-primary transition-colors">
                      Fale Conosco
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Para Estudantes */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-950 mb-4">Para Estudantes</h4>
              <nav aria-label="Links para estudantes">
                <ul className="space-y-2.5">
                  <li>
                    <Link href="/cursos" className="text-neutral-600 text-sm hover:text-bolsa-primary transition-colors">
                      Buscar Cursos
                    </Link>
                  </li>
                  <li>
                    <Link href="/pos-graduacao" className="text-neutral-600 text-sm hover:text-bolsa-primary transition-colors">
                      Pós-Graduação
                    </Link>
                  </li>
                  <li>
                    <Link href="/central-de-ajuda/primeiros-passos" className="text-neutral-600 text-sm hover:text-bolsa-primary transition-colors">
                      Primeiros Passos
                    </Link>
                  </li>
                  <li>
                    <Link href="/central-de-ajuda/bolsas-descontos-regras" className="text-neutral-600 text-sm hover:text-bolsa-primary transition-colors">
                      Regras das Bolsas
                    </Link>
                  </li>
                  <li>
                    <Link href="/central-de-ajuda/pagamento-taxas-reembolso" className="text-neutral-600 text-sm hover:text-bolsa-primary transition-colors">
                      Pagamento e Reembolso
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Cursos Populares */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-950 mb-4">Cursos Populares</h4>
              <nav aria-label="Cursos populares">
                <ul className="space-y-2.5">
                  {cursosPopulares.map((curso) => (
                    <li key={curso.slug}>
                      <Link
                        href={`/cursos/${curso.slug}`}
                        className="text-neutral-600 text-sm hover:text-bolsa-primary transition-colors"
                      >
                        {curso.nome}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Contato */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-950 mb-4">Contato</h4>
              <address className="not-italic space-y-3">
                {showWhatsapp && (
                  <a
                    href="https://wa.me/5511936200198"
                    className="flex items-center text-neutral-600 text-sm hover:text-green-500 transition-colors"
                  >
                    <Phone size={16} className="text-bolsa-primary mr-2 flex-shrink-0" />
                    (11) 93620-0198
                  </a>
                )}
                <a
                  href="mailto:contato@bolsaclick.com.br"
                  className="flex items-center text-neutral-600 text-sm hover:text-bolsa-primary transition-colors"
                >
                  <Mail size={16} className="text-bolsa-primary mr-2 flex-shrink-0" />
                  contato@bolsaclick.com.br
                </a>
                <div className="flex items-start text-neutral-600 text-sm">
                  <MapPin size={16} className="text-bolsa-primary mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    Av. Paulista, 1106<br />
                    São Paulo - SP<br />
                    CEP 01310-914
                  </span>
                </div>
              </address>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-neutral-200 bg-white">
        <Container>
          <div className="py-5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-500 text-sm">
              © {new Date().getFullYear()} Bolsa Click. Todos os direitos reservados.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link href="/central-de-ajuda/seguranca-dados-privacidade/termos-de-uso" className="text-neutral-500 text-sm hover:text-bolsa-primary transition-colors">
                Termos de Uso
              </Link>
              <Link href="/central-de-ajuda/seguranca-dados-privacidade/politica-de-privacidade" className="text-neutral-500 text-sm hover:text-bolsa-primary transition-colors">
                Privacidade
              </Link>
              <Link href="/central-de-ajuda/seguranca-dados-privacidade/politica-de-cookies" className="text-neutral-500 text-sm hover:text-bolsa-primary transition-colors">
                Cookies
              </Link>
              <Link href="/central-de-ajuda/seguranca-dados-privacidade/lgpd" className="text-neutral-500 text-sm hover:text-bolsa-primary transition-colors">
                LGPD
              </Link>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
