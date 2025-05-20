'use client'
import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';
import Image from 'next/image';
import Container from '../../atoms/Container';

const Footer: React.FC = () => {
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

  return (
    <footer className="bg-white border-t border-neutral-200 w-full flex justify-center flex-col items-center">
      <Container>
        <div className="container py-12">
          <div className="grid md:grid-cols-4 gap-8 text-center md:text-left">
            <div className="space-y-4">
              <Image
                src={logoColor}
                alt="Logo do Bolsa Click - Marketplace de bolsas de estudo"
                width={90}
                height={33}
                priority
              />
              <p className="text-neutral-600">
                O maior marketplace de bolsas de estudo do Brasil. Seu futuro com mais desconto começa aqui.
              </p>
              <div className="flex justify-start  space-x-4">
                <a href="https://facebook.com" className='text-bolsa-secondary hover:text-bolsa-primary transition-all duration-200' target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                  <Facebook size={20} />
                </a>
                <a href="https://instagram.com/bolsaclick" className='text-bolsa-secondary hover:text-bolsa-primary transition-all duration-200'  target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                  <Instagram size={20} />
                </a>
                <a href="https://linkedin.com" target="_blank" className='text-bolsa-secondary hover:text-bolsa-primary transition-all duration-200'  rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin size={20} />
                </a>
                <a href="https://twitter.com" target="_blank" className='text-bolsa-secondary hover:text-bolsa-primary transition-all duration-200'  rel="noopener noreferrer" aria-label="Twitter">
                  <Twitter size={20} />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4 text-emerald-600">Bolsa Click</h4>
              <nav aria-label="Links úteis para Bolsa Click">
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-neutral-600 hover:text-emerald-500 transition-colors">
                      Quem Somos
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-neutral-600 hover:text-emerald-500 transition-colors">
                      Como Funciona
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-neutral-600 hover:text-emerald-500 transition-colors">
                      Imprensa
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-neutral-600 hover:text-emerald-500 transition-colors">
                      Trabalhe Conosco
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-neutral-600 hover:text-emerald-500 transition-colors">
                      Seja uma Instituição Parceira
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4  text-emerald-600">Para Estudantes</h4>
              <nav aria-label="Links úteis para estudantes">
                <ul className="space-y-3">
                  <li>
                    <a href="#" className="text-neutral-600 hover:text-emerald-500 transition-colors">
                      Cadastre-se
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-neutral-600 hover:text-emerald-500 transition-colors">
                      Buscar Graduação
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-neutral-600 hover:text-emerald-500 transition-colors">
                      Buscar Pós-graduação
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-neutral-600 hover:text-emerald-500 transition-colors">
                      Buscar Cursos Técnicos
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-neutral-600 hover:text-emerald-500 transition-colors">
                      Dúvidas Frequentes
                    </a>
                  </li>
                </ul>
              </nav>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4  text-emerald-600">Contato</h4>
              <address className="space-y-3">
                <ul className="space-y-3">
                  <li className="flex items-center justify-center md:justify-start">
                    <Phone size={18} className="text-emerald-500 mr-2" />
                    <span className="text-neutral-600">0800 123 4567</span>
                  </li>
                  <li className="flex items-center justify-center md:justify-start">
                    <Mail size={18} className="text-emerald-500 mr-2" />
                    <span className="text-neutral-600">contato@bolsaclick.com.br</span>
                  </li>
                  <li className="flex items-start justify-center md:justify-start">
                    <MapPin size={18} className="text-emerald-500 mr-2 mt-1" />
                    <span className="text-neutral-600">
                      Av. Paulista, 1106 , São Paulo - SP, 01310-914
                    </span>
                  </li>
                </ul>
              </address>
            </div>
          </div>
        </div>

      </Container>
      <div className="border-t border-neutral-200 py-6 w-full">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-600 text-sm">
              © {new Date().getFullYear()} Bolsa Click. Todos os direitos reservados.
            </p>
            <div className="flex justify-center space-x-4 mt-4 md:mt-0">
              <a href="/ajuda/politica-de-cookies" className="text-neutral-600 text-sm hover:text-emerald-500 transition-colors">
                Política de Cookies
              </a>
              <a href="/ajuda/politica-de-privacidade" className="text-neutral-600 text-sm hover:text-emerald-500 transition-colors">
                Política de Privacidade
              </a>
              <a href="/ajuda/termos-de-uso" className="text-neutral-600 text-sm hover:text-emerald-500 transition-colors">
                Termos de Uso
              </a>
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
