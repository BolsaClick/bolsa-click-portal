'use client'
import React, { useEffect, useState } from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Linkedin, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Container from '../../atoms/Container';
import { useWhatsappFeatureFlag } from '@/app/lib/hooks/usePostHogFeatureFlags';

const linkClass = 'text-neutral-600 text-sm hover:text-bolsa-primary transition-colors'

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
    <footer className="bg-gradient-to-b from-slate-50 to-slate-100 border-t border-neutral-200 w-full">
      {/* Seção de links internos para SEO */}
      <Container>
        <div className="py-10 border-b border-neutral-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Cursos de Graduação */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-950 mb-4">Cursos de Graduação</h4>
              <nav aria-label="Cursos de graduação">
                <ul className="space-y-2">
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

            {/* Cursos Tecnólogos + Modalidades */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-950 mb-4">Cursos Tecnólogos</h4>
              <nav aria-label="Cursos tecnólogos">
                <ul className="space-y-2">
                  {cursosTecnologos.map((curso) => (
                    <li key={curso.slug}>
                      <Link href={`/cursos/${curso.slug}`} className={linkClass}>
                        Bolsa para {curso.nome}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-950 mb-4 mt-8">Por Nível</h4>
              <nav aria-label="Níveis de ensino">
                <ul className="space-y-2">
                  <li><Link href="/graduacao" className={linkClass}>Graduação com Bolsa</Link></li>
                  <li><Link href="/pos-graduacao" className={linkClass}>Pós-Graduação com Bolsa</Link></li>
                  <li><Link href="/cursos" className={linkClass}>Todos os Cursos</Link></li>
                </ul>
              </nav>
            </div>

            {/* Bolsas por Cidade */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-950 mb-4">Bolsas por Cidade</h4>
              <nav aria-label="Bolsas por cidade">
                <ul className="space-y-2">
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

            {/* Bolsas Curso + Cidade + Faculdades */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-950 mb-4">Faculdades Parceiras</h4>
              <nav aria-label="Faculdades parceiras">
                <ul className="space-y-2">
                  <li><Link href="/faculdades/anhanguera" className={linkClass}>Anhanguera</Link></li>
                  <li><Link href="/faculdades/unopar" className={linkClass}>Unopar</Link></li>
                  <li><Link href="/faculdades/unime" className={linkClass}>Unime</Link></li>
                  <li><Link href="/faculdades" className={linkClass}>Ver todas as faculdades</Link></li>
                </ul>
              </nav>

              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-950 mb-4 mt-8">Cursos em Destaque</h4>
              <nav aria-label="Cursos em destaque por cidade">
                <ul className="space-y-2">
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
        </div>
      </Container>

      {/* Seção principal do footer */}
      <Container>
        <div className="py-10">
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
                O maior marketplace de bolsas de estudo do Brasil. Encontre bolsas de até 95% de desconto em mais de 30.000 faculdades.
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
                </ul>
              </nav>
            </div>

            {/* Para Estudantes */}
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-950 mb-4">Para Estudantes</h4>
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
              <h4 className="font-bold text-sm uppercase tracking-wider text-blue-950 mb-4">Mais Buscados</h4>
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
