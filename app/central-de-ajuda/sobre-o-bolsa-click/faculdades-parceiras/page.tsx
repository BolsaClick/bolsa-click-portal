import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Faculdades parceiras e reconhecimento MEC | Central de Ajuda',
  description:
    'Conheça as faculdades parceiras do Bolsa Click e entenda a importância do reconhecimento do MEC para a validade do seu diploma.',
  robots: 'index, follow',
  alternates: {
    canonical:
      'https://www.bolsaclick.com.br/central-de-ajuda/sobre-o-bolsa-click/faculdades-parceiras',
  },
}

export default function FaculdadesPage() {
  return (
    <ArticleLayout
      category="Sobre o Bolsa Click"
      categoryHref="/central-de-ajuda/sobre-o-bolsa-click"
      title="Faculdades parceiras e reconhecimento MEC"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          O Bolsa Click tem parceria com mais de 30.000 faculdades reconhecidas pelo MEC em todo o
          Brasil. Todas as instituições disponíveis na plataforma são credenciadas e oferecem
          cursos autorizados pelo Ministério da Educação, garantindo a validade nacional do seu
          diploma.
        </p>
      </QuickAnswer>

      <h2>Quem são nossas faculdades parceiras</h2>
      <p>
        Trabalhamos com instituições de ensino de todos os portes, desde grandes universidades até
        faculdades regionais, mas todas têm algo em comum: credenciamento oficial do MEC.
      </p>
      <p>Entre nossas parceiras, você encontra:</p>
      <ul>
        <li>
          <strong>Universidades privadas de grande porte:</strong> Reconhecidas nacionalmente com
          estrutura completa
        </li>
        <li>
          <strong>Faculdades especializadas:</strong> Focadas em áreas específicas como saúde,
          tecnologia ou gestão
        </li>
        <li>
          <strong>Centros universitários:</strong> Com autonomia acadêmica e diversidade de cursos
        </li>
        <li>
          <strong>Instituições regionais:</strong> Presença forte em determinadas cidades e
          estados
        </li>
      </ul>

      <h2>O que é reconhecimento do MEC e por que importa</h2>
      <p>
        O MEC (Ministério da Educação) é o órgão responsável por regular e fiscalizar a educação
        superior no Brasil. O reconhecimento garante que:
      </p>
      <ul>
        <li>
          <strong>Seu diploma tem validade nacional:</strong> Será aceito em concursos públicos,
          empresas e pós-graduações
        </li>
        <li>
          <strong>A instituição atende padrões de qualidade:</strong> Infraestrutura, corpo
          docente e projeto pedagógico foram avaliados
        </li>
        <li>
          <strong>O curso oferece formação adequada:</strong> Grade curricular alinhada às
          diretrizes nacionais
        </li>
        <li>
          <strong>Você está protegido legalmente:</strong> A instituição segue as normas
          educacionais brasileiras
        </li>
      </ul>

      <h2>Como verificar se uma faculdade é reconhecida</h2>
      <p>Você pode consultar diretamente no site do MEC:</p>
      <ol>
        <li>
          Acesse o portal <strong>e-MEC</strong> (
          <a
            href="https://emec.mec.gov.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--bolsa-primary)] hover:underline"
          >
            emec.mec.gov.br
          </a>
          )
        </li>
        <li>Pesquise pelo nome da instituição ou do curso</li>
        <li>Verifique o status: &quot;Em atividade&quot; e &quot;Credenciada&quot;</li>
        <li>Confira a situação do curso específico: &quot;Autorizado&quot; ou &quot;Reconhecido&quot;</li>
      </ol>
      <p>
        <strong>Atenção:</strong> Cursos muito novos podem estar &quot;Autorizados&quot; (podem funcionar) e
        ainda não &quot;Reconhecidos&quot; (passaram pela avaliação completa). Ambos os status são válidos,
        mas &quot;Reconhecido&quot; indica avaliação finalizada.
      </p>

      <h2>Todas as faculdades do Bolsa Click são reconhecidas?</h2>
      <p>
        <strong>Sim, sem exceção.</strong> Antes de fechar parceria com qualquer instituição,
        nossa equipe:
      </p>
      <ul>
        <li>Verifica o credenciamento no portal e-MEC</li>
        <li>Confirma a situação regular dos cursos oferecidos</li>
        <li>Valida a reputação da instituição no mercado</li>
        <li>Assegura que não há pendências legais ou regulatórias</li>
      </ul>
      <p>
        Se uma faculdade aparecer na nossa plataforma, você pode ter certeza de que ela é
        legalmente autorizada a funcionar.
      </p>

      <h2>Diferenças entre Universidade, Centro Universitário e Faculdade</h2>
      <p>
        Você pode encontrar diferentes tipos de instituições no Bolsa Click. Entenda as diferenças:
      </p>

      <h3>Universidade</h3>
      <ul>
        <li>Autonomia para criar cursos sem autorização prévia do MEC</li>
        <li>Obrigação de realizar pesquisa e extensão além do ensino</li>
        <li>Exigência de professores mestres e doutores</li>
        <li>Diversidade de áreas de conhecimento</li>
      </ul>

      <h3>Centro Universitário</h3>
      <ul>
        <li>Autonomia para criar cursos em áreas já autorizadas</li>
        <li>Foco no ensino, sem obrigatoriedade de pesquisa</li>
        <li>Pode atuar em uma ou mais áreas de conhecimento</li>
        <li>Excelência em ensino de graduação</li>
      </ul>

      <h3>Faculdade</h3>
      <ul>
        <li>Precisa de autorização do MEC para cada novo curso</li>
        <li>Geralmente especializada em áreas específicas</li>
        <li>Focada em ensino de graduação</li>
        <li>Atendimento mais regional</li>
      </ul>
      <p>
        <strong>Importante:</strong> Todas as três categorias emitem diplomas com validade
        nacional. A diferença está na autonomia administrativa, não na qualidade ou reconhecimento
        do diploma.
      </p>

      <h2>Posso confiar em faculdades menores ou menos conhecidas?</h2>
      <p>Sim! O que importa é o reconhecimento do MEC, não o tamanho da instituição.</p>
      <p>Faculdades menores ou regionais muitas vezes oferecem:</p>
      <ul>
        <li>Atendimento mais personalizado e próximo</li>
        <li>Turmas menores com maior interação com professores</li>
        <li>Descontos mais agressivos</li>
        <li>Flexibilidade de horários e formatos</li>
      </ul>
      <p>
        Desde que o MEC reconheça a instituição e o curso, seu diploma terá o mesmo valor legal de
        uma grande universidade.
      </p>

      <h2>Como saber qual faculdade escolher</h2>
      <p>Além do reconhecimento MEC, considere:</p>
      <ul>
        <li>
          <strong>Localização:</strong> Se presencial, escolha uma unidade próxima a você
        </li>
        <li>
          <strong>Infraestrutura:</strong> Bibliotecas, laboratórios e recursos tecnológicos
        </li>
        <li>
          <strong>Corpo docente:</strong> Formação e experiência dos professores
        </li>
        <li>
          <strong>Modalidade:</strong> EAD, presencial ou semipresencial conforme sua rotina
        </li>
        <li>
          <strong>Reputação no mercado:</strong> Como a instituição é vista por empregadores
        </li>
        <li>
          <strong>Custo-benefício:</strong> Desconto oferecido vs. qualidade do ensino
        </li>
      </ul>

      <h2>Onde encontrar a lista completa de parceiros</h2>
      <p>
        No Bolsa Click, você pode explorar todas as faculdades parceiras ao:
      </p>
      <ul>
        <li>Buscar por curso e ver quais instituições oferecem aquela graduação</li>
        <li>Filtrar por cidade para encontrar opções próximas a você</li>
        <li>Comparar instituições lado a lado na mesma busca</li>
        <li>Acessar a página de cada curso para detalhes da faculdade</li>
      </ul>
      <p>
        Além disso, nossa equipe de atendimento pode te ajudar a escolher a melhor instituição
        conforme seu perfil e objetivos.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Busque cursos disponíveis',
            description: 'Explore cursos em faculdades reconhecidas pelo MEC',
            href: '/cursos',
          },
          {
            title: 'Entenda como funciona',
            description: 'Veja o passo a passo para garantir sua bolsa',
            href: '/central-de-ajuda/sobre-o-bolsa-click/como-funciona',
          },
          {
            title: 'Fale com um especialista',
            description: 'Tire dúvidas sobre faculdades e cursos pelo WhatsApp',
            href: 'https://wa.me/5511999999999',
          },
        ]}
      />
    </ArticleLayout>
  )
}
