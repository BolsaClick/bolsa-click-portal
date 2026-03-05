'use client'
import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Container from '../../atoms/Container';
import { useWhatsappFeatureFlag } from '@/app/lib/hooks/usePostHogFeatureFlags';

const linkClass = 'text-neutral-400 text-sm hover:text-white transition-colors'

const cursosGraduacao = [
  { nome: 'Administração', slug: 'administracao' },
  { nome: 'Direito', slug: 'direito' },
  { nome: 'Enfermagem', slug: 'enfermagem' },
  { nome: 'Psicologia', slug: 'psicologia' },
  { nome: 'Pedagogia', slug: 'pedagogia' },
  { nome: 'Educação Física', slug: 'educacao-fisica' },
  { nome: 'Ciências Contábeis', slug: 'ciencias-contabeis' },
  { nome: 'Arquitetura e Urbanismo', slug: 'arquitetura-e-urbanismo' },
  { nome: 'Nutrição', slug: 'nutricao' },
  { nome: 'Fisioterapia', slug: 'fisioterapia' },
  { nome: 'Engenharia Civil', slug: 'engenharia-civil' },
  { nome: 'Biomedicina', slug: 'biomedicina' },
  { nome: 'Odontologia', slug: 'odontologia' },
  { nome: 'Farmácia', slug: 'farmacia' },
]

const cursosTecnologos = [
  { nome: 'Análise e Desenv. de Sistemas', slug: 'analise-e-desenvolvimento-de-sistemas' },
  { nome: 'Gestão de Recursos Humanos', slug: 'gestao-de-recursos-humanos' },
  { nome: 'Marketing', slug: 'marketing' },
  { nome: 'Gestão Comercial', slug: 'gestao-comercial' },
]

const cidadesPopulares = [
  { nome: 'São Paulo', slug: 'sao-paulo' },
  { nome: 'Rio de Janeiro', slug: 'rio-de-janeiro' },
  { nome: 'Belo Horizonte', slug: 'belo-horizonte' },
  { nome: 'Curitiba', slug: 'curitiba' },
  { nome: 'Porto Alegre', slug: 'porto-alegre' },
  { nome: 'Brasília', slug: 'brasilia' },
  { nome: 'Salvador', slug: 'salvador' },
  { nome: 'Recife', slug: 'recife' },
  { nome: 'Fortaleza', slug: 'fortaleza' },
  { nome: 'Goiânia', slug: 'goiania' },
  { nome: 'Campinas', slug: 'campinas' },
  { nome: 'Manaus', slug: 'manaus' },
]

const bolsasPorCidade = [
  { nome: 'Administração em São Paulo', curso: 'administracao', cidade: 'sao-paulo' },
  { nome: 'Direito em São Paulo', curso: 'direito', cidade: 'sao-paulo' },
  { nome: 'Enfermagem em Rio de Janeiro', curso: 'enfermagem', cidade: 'rio-de-janeiro' },
  { nome: 'Psicologia em Belo Horizonte', curso: 'psicologia', cidade: 'belo-horizonte' },
  { nome: 'Pedagogia em Curitiba', curso: 'pedagogia', cidade: 'curitiba' },
  { nome: 'Direito em Brasília', curso: 'direito', cidade: 'brasilia' },
  { nome: 'Enfermagem em Salvador', curso: 'enfermagem', cidade: 'salvador' },
  { nome: 'Administração em Recife', curso: 'administracao', cidade: 'recife' },
  { nome: 'ADS em Fortaleza', curso: 'analise-e-desenvolvimento-de-sistemas', cidade: 'fortaleza' },
  { nome: 'Pedagogia em Goiânia', curso: 'pedagogia', cidade: 'goiania' },
]

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

  return (
    <footer className="bg-[#0c111d] w-full">
      <Container>
        {/* Links SEO — grid de 5 colunas */}
        <div className="pt-16 pb-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-10">
          {/* Cursos de Graduação */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">Cursos de Graduação</h4>
            <nav aria-label="Cursos de graduação">
              <ul className="space-y-2.5">
                {cursosGraduacao.map((curso) => (
                  <li key={curso.slug}>
                    <Link href={`/cursos/${curso.slug}`} className={linkClass}>
                      Bolsa para {curso.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Cursos Tecnólogos + Por Nível */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">Cursos Tecnólogos</h4>
            <nav aria-label="Cursos tecnólogos">
              <ul className="space-y-2.5">
                {cursosTecnologos.map((curso) => (
                  <li key={curso.slug}>
                    <Link href={`/cursos/${curso.slug}`} className={linkClass}>
                      Bolsa para {curso.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <h4 className="text-white font-medium text-sm mb-4 mt-8">Por Nível</h4>
            <nav aria-label="Níveis de ensino">
              <ul className="space-y-2.5">
                <li><Link href="/graduacao" className={linkClass}>Graduação com Bolsa</Link></li>
                <li><Link href="/pos-graduacao" className={linkClass}>Pós-Graduação com Bolsa</Link></li>
                <li><Link href="/cursos" className={linkClass}>Todos os Cursos</Link></li>
              </ul>
            </nav>
          </div>

          {/* Bolsas por Cidade */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">Bolsas por Cidade</h4>
            <nav aria-label="Bolsas por cidade">
              <ul className="space-y-2.5">
                {cidadesPopulares.map((cidade) => (
                  <li key={cidade.slug}>
                    <Link
                      href={`/curso/resultado?cidade=${encodeURIComponent(cidade.nome)}&estado=${cidade.slug === 'brasilia' ? 'DF' : cidade.slug === 'sao-paulo' || cidade.slug === 'campinas' ? 'SP' : cidade.slug === 'rio-de-janeiro' ? 'RJ' : cidade.slug === 'belo-horizonte' ? 'MG' : cidade.slug === 'curitiba' ? 'PR' : cidade.slug === 'porto-alegre' ? 'RS' : cidade.slug === 'salvador' ? 'BA' : cidade.slug === 'recife' ? 'PE' : cidade.slug === 'fortaleza' ? 'CE' : cidade.slug === 'goiania' ? 'GO' : cidade.slug === 'manaus' ? 'AM' : ''}&nivel=GRADUACAO`}
                      className={linkClass}
                    >
                      Bolsas em {cidade.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Faculdades Parceiras */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">Faculdades Parceiras</h4>
            <nav aria-label="Faculdades parceiras">
              <ul className="space-y-2.5">
                <li><Link href="/faculdades/anhanguera" className={linkClass}>Anhanguera</Link></li>
                <li><Link href="/faculdades/unopar" className={linkClass}>Unopar</Link></li>
                <li><Link href="/faculdades/unime" className={linkClass}>Unime</Link></li>
                <li><Link href="/faculdades" className={linkClass}>Ver todas as faculdades</Link></li>
              </ul>
            </nav>
          </div>

          {/* Cursos em Destaque */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">Cursos em Destaque</h4>
            <nav aria-label="Cursos em destaque por cidade">
              <ul className="space-y-2.5">
                {bolsasPorCidade.map((item) => (
                  <li key={`${item.curso}-${item.cidade}`}>
                    <Link
                      href={`/cursos/${item.curso}/${item.cidade}`}
                      className={linkClass}
                    >
                      {item.nome}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-white/10" />

        {/* Footer principal — Logo + colunas institucionais */}
        <div className="py-12 grid grid-cols-2 md:grid-cols-5 gap-x-8 gap-y-10 lg:gap-x-12">
          {/* Logo e Descrição */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Image
              src={logoColor}
              alt="Logo do Bolsa Click - Marketplace de bolsas de estudo"
              width={100}
              height={37}
              priority
              className="brightness-0 invert"
            />
            <p className="text-neutral-500 text-sm leading-relaxed">
              O maior marketplace de bolsas de estudo do Brasil. Encontre bolsas de até 95% de desconto em mais de 30.000 faculdades.
            </p>
            <div className="flex space-x-4 pt-2">
              <a
                href="https://facebook.com/bolsaclickbrasil"
                className="text-neutral-500 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://instagram.com/bolsaclick"
                className="text-neutral-500 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://linkedin.com/company/bolsaclick"
                className="text-neutral-500 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              {showWhatsapp && (
                <a
                  href="https://wa.me/5511936200198"
                  className="text-neutral-500 hover:text-white transition-colors"
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
            <h4 className="text-white font-medium text-sm mb-4">Institucional</h4>
            <nav aria-label="Links institucionais">
              <ul className="space-y-2.5">
                <li>
                  <Link href="/quem-somos" className={linkClass}>
                    Quem Somos
                  </Link>
                </li>
                <li>
                  <Link href="/central-de-ajuda/sobre-o-bolsa-click/como-funciona" className={linkClass}>
                    Como Funciona
                  </Link>
                </li>
                <li>
                  <Link href="/central-de-ajuda" className={linkClass}>
                    Central de Ajuda
                  </Link>
                </li>
                <li>
                  <Link href="/contato" className={linkClass}>
                    Fale Conosco
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className={linkClass}>
                    Blog
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Para Estudantes */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">Para Estudantes</h4>
            <nav aria-label="Links para estudantes">
              <ul className="space-y-2.5">
                <li>
                  <Link href="/cursos" className={linkClass}>
                    Buscar Bolsas de Estudo
                  </Link>
                </li>
                <li>
                  <Link href="/graduacao" className={linkClass}>
                    Bolsa para Graduação
                  </Link>
                </li>
                <li>
                  <Link href="/pos-graduacao" className={linkClass}>
                    Bolsa para Pós-Graduação
                  </Link>
                </li>
                <li>
                  <Link href="/central-de-ajuda/primeiros-passos" className={linkClass}>
                    Primeiros Passos
                  </Link>
                </li>
                <li>
                  <Link href="/central-de-ajuda/bolsas-descontos-regras" className={linkClass}>
                    Regras das Bolsas
                  </Link>
                </li>
                <li>
                  <Link href="/central-de-ajuda/pagamento-taxas-reembolso" className={linkClass}>
                    Pagamento e Reembolso
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Cursos Mais Buscados */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">Mais Buscados</h4>
            <nav aria-label="Cursos mais buscados">
              <ul className="space-y-2.5">
                <li><Link href="/cursos/administracao" className={linkClass}>Administração</Link></li>
                <li><Link href="/cursos/direito" className={linkClass}>Direito</Link></li>
                <li><Link href="/cursos/enfermagem" className={linkClass}>Enfermagem</Link></li>
                <li><Link href="/cursos/psicologia" className={linkClass}>Psicologia</Link></li>
                <li><Link href="/cursos/pedagogia" className={linkClass}>Pedagogia</Link></li>
                <li><Link href="/cursos/analise-e-desenvolvimento-de-sistemas" className={linkClass}>ADS</Link></li>
              </ul>
            </nav>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-medium text-sm mb-4">Contato</h4>
            <address className="not-italic space-y-3">
              {showWhatsapp && (
                <a
                  href="https://wa.me/5511936200198"
                  className="flex items-center text-neutral-400 text-sm hover:text-white transition-colors"
                >
                  <Phone size={16} className="text-neutral-500 mr-2 flex-shrink-0" />
                  (11) 93620-0198
                </a>
              )}
              <a
                href="mailto:contato@bolsaclick.com.br"
                className="flex items-center text-neutral-400 text-sm hover:text-white transition-colors"
              >
                <Mail size={16} className="text-neutral-500 mr-2 flex-shrink-0" />
                contato@bolsaclick.com.br
              </a>
              <div className="flex items-start text-neutral-400 text-sm">
                <MapPin size={16} className="text-neutral-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  Av. Paulista, 1106<br />
                  São Paulo - SP<br />
                  CEP 01310-914
                </span>
              </div>
            </address>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-[#080b14]">
        <Container>
          <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-neutral-600 text-xs">
              © {new Date().getFullYear()} Bolsa Click. Todos os direitos reservados.
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              <Link href="/central-de-ajuda/seguranca-dados-privacidade/termos-de-uso" className="text-neutral-600 text-xs hover:text-neutral-400 transition-colors">
                Termos de Uso
              </Link>
              <Link href="/central-de-ajuda/seguranca-dados-privacidade/politica-de-privacidade" className="text-neutral-600 text-xs hover:text-neutral-400 transition-colors">
                Privacidade
              </Link>
              <Link href="/central-de-ajuda/seguranca-dados-privacidade/politica-de-cookies" className="text-neutral-600 text-xs hover:text-neutral-400 transition-colors">
                Cookies
              </Link>
              <Link href="/central-de-ajuda/seguranca-dados-privacidade/lgpd" className="text-neutral-600 text-xs hover:text-neutral-400 transition-colors">
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
