import { Metadata } from 'next'
import Link from 'next/link'
import { ProgramHub } from '../_components/ProgramHub'

const SITE_URL = 'https://www.bolsaclick.com.br'

const DATA_PUBLISHED = '2026-05-19'
const DATA_MODIFIED = '2026-05-19'

export const metadata: Metadata = {
  title: 'Faculdade sem ENEM — Como Entrar com Bolsa de até 80%',
  description:
    'Saiba como entrar em uma faculdade reconhecida pelo MEC sem precisar da nota do ENEM. Vestibular agendado online, prova interna ou histórico do ensino médio — com bolsa de estudo de até 80% pelo Bolsa Click.',
  keywords: [
    'faculdade sem enem',
    'sem enem',
    'como entrar na faculdade sem enem',
    'vestibular sem enem',
    'graduação sem enem',
    'faculdade ead sem enem',
    'bolsa de estudo sem enem',
    'vestibular agendado',
    'prova online faculdade',
    'matrícula sem enem',
  ],
  alternates: { canonical: `${SITE_URL}/sem-enem` },
  openGraph: {
    title: 'Faculdade sem ENEM — Como Entrar com Bolsa de até 80%',
    description:
      'Vestibular agendado, prova online ou histórico do ensino médio: existe caminho pra entrar em faculdade sem ENEM.',
    url: `${SITE_URL}/sem-enem`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'article',
  },
}

// FAQ com respostas de 134-167 palavras (target de citação ideal pra LLMs)
const faqItems = [
  {
    question: 'Como entrar na faculdade sem ENEM?',
    answer:
      'É possível ingressar em uma faculdade brasileira sem fazer o ENEM por quatro caminhos principais. O primeiro é o vestibular agendado, oferecido por boa parte das instituições privadas — o estudante escolhe a data, faz a prova (geralmente online) e recebe o resultado em horas. O segundo é o vestibular tradicional da própria faculdade, com edital, calendário fechado e provas múltiplas. O terceiro é o uso do histórico do ensino médio, válido em algumas faculdades EAD que dispensam prova quando o aluno apresenta certificado de conclusão. O quarto é a transferência de curso, quando o estudante já cursou ao menos um semestre em outra instituição. Em todos os casos, a faculdade deve ser reconhecida pelo MEC e o diploma final tem a mesma validade legal de qualquer outra graduação. Pelo Bolsa Click, você compara faculdades parceiras com ingresso sem ENEM e garante bolsa de até 80%.',
  },
  {
    question: 'Quais faculdades aceitam matrícula sem ENEM?',
    answer:
      'A maioria das faculdades particulares brasileiras aceita ingresso sem ENEM, especialmente nas modalidades EAD e semipresencial. Entre as instituições parceiras do Bolsa Click, Anhanguera, Unopar, Pitágoras, Ampli e Unime oferecem vestibular agendado online em praticamente todos os cursos de graduação, com matrícula em até 48 horas após a aprovação. Cursos de tecnólogo (2 a 2,5 anos) costumam ser ainda mais acessíveis nesse formato, já que o foco é prático e a seleção valoriza o histórico escolar. Faculdades presenciais de grande porte mantêm vestibular tradicional, mas também aceitam vestibular agendado em datas específicas. Para confirmar quais cursos da faculdade desejada estão disponíveis sem ENEM, basta buscar pelo curso na plataforma Bolsa Click e filtrar pelas ofertas que indicam "vestibular online" ou "ingresso simplificado".',
  },
  {
    question: 'Faculdades EAD precisam de ENEM?',
    answer:
      'Não. Praticamente todas as faculdades EAD brasileiras aceitam ingresso sem ENEM. O processo seletivo padrão da modalidade a distância é o vestibular agendado online, com prova realizada pelo próprio aluno em casa via plataforma da faculdade. Algumas instituições dispensam totalmente a prova quando o estudante apresenta certificado de conclusão do ensino médio — basta enviar o histórico digitalizado durante a inscrição. O ENEM continua valendo como diferencial pra quem busca bolsa via PROUNI (programa do governo federal), mas pra contratar bolsa diretamente com a faculdade pelo Bolsa Click, o ENEM é totalmente opcional. As principais redes parceiras (Anhanguera EAD, Unopar EAD, Pitágoras EAD) têm hoje mais de 100 polos físicos em todo o país, oferecendo o melhor dos dois mundos: flexibilidade de estudar de casa e suporte presencial pra encontros e atividades.',
  },
  {
    question: 'É possível conseguir bolsa de estudo sem ENEM?',
    answer:
      'Sim. As bolsas oferecidas pelo Bolsa Click são totalmente independentes do ENEM — descontos negociados diretamente com faculdades parceiras chegam a 80% das mensalidades, sem exigência de nota ou pontuação mínima. O modelo é simples: o estudante busca o curso desejado, compara ofertas (mensalidade com e sem bolsa, modalidade, polos disponíveis), faz inscrição gratuita e recebe o link de matrícula direto da faculdade. Diferente do PROUNI (que exige nota mínima de 450 no ENEM e renda familiar comprovada de até 1,5 salário mínimo per capita), as bolsas do Bolsa Click são abertas pra qualquer pessoa, sem critério de renda ou desempenho prévio. Quem tem nota de ENEM pode usar como diferencial em algumas faculdades, mas a maioria das ofertas no Bolsa Click depende apenas da disponibilidade de vagas com bolsa.',
  },
  {
    question: 'Faculdades sem ENEM têm reconhecimento do MEC?',
    answer:
      'Sim. Todas as faculdades parceiras do Bolsa Click são instituições de ensino superior credenciadas pelo Ministério da Educação (MEC), com cursos avaliados pelo Sistema Nacional de Avaliação da Educação Superior (Sinaes) — que mede qualidade via IGC (Índice Geral de Cursos) e ENADE (Exame Nacional de Desempenho dos Estudantes). O fato de a instituição dispensar a nota do ENEM no processo seletivo não afeta a validade do diploma: tanto faculdades particulares quanto universidades públicas formam profissionais com mesmo registro legal, válido pra concurso público, conselhos profissionais (CRA, CREA, CRM, CRO, CRP, etc) e pós-graduação. A regulamentação do MEC determina que toda graduação reconhecida garanta as mesmas competências mínimas, independentemente da forma de ingresso. Pesquise o IGC da instituição em emec.mec.gov.br antes de matricular.',
  },
  {
    question: 'Como funciona o vestibular agendado online?',
    answer:
      'O vestibular agendado online é o caminho mais rápido pra entrar em uma faculdade sem ENEM. Funciona em quatro etapas: 1) inscrição gratuita no site da faculdade ou via Bolsa Click, escolhendo curso, modalidade e polo; 2) agendamento da prova em data e horário convenientes (geralmente disponível em todos os dias da semana, com janelas de manhã, tarde e noite); 3) realização da prova de forma online (computador com webcam, ambiente silencioso, prazo de 1h30 a 2h dependendo da faculdade) — costuma ter redação dissertativa-argumentativa e questões objetivas de conhecimentos gerais; 4) divulgação do resultado em até 24-48 horas, com link direto pra matrícula. O custo da prova varia: muitas faculdades parceiras do Bolsa Click oferecem o vestibular agendado totalmente grátis, e a matrícula com bolsa pode ser feita imediatamente após a aprovação.',
  },
]

export default function SemEnemPage() {
  return (
    <ProgramHub
      slug="sem-enem"
      title="Sem ENEM"
      h1="Faculdade sem ENEM: como entrar com bolsa de até 80%"
      lede="Não fez o ENEM ou tirou nota baixa? Existe caminho. Veja como entrar em faculdade reconhecida pelo MEC via vestibular agendado, prova online ou histórico do ensino médio — com bolsa Bolsa Click."
      articleSummary="Guia completo pra entrar na faculdade sem ENEM em 2026: vestibular agendado online, prova interna, histórico do ensino médio, transferência. Inclui lista de faculdades parceiras com ingresso simplificado e bolsa de até 80%."
      datePublished={DATA_PUBLISHED}
      dateModified={DATA_MODIFIED}
      faqItems={faqItems}
    >
      <h2>É possível entrar na faculdade sem ENEM?</h2>
      <p>
        Sim — e muito mais comum do que parece. Cerca de 85% das faculdades privadas brasileiras
        aceitam ingresso sem a nota do ENEM em pelo menos um dos seus processos seletivos. O caminho
        mais usado hoje é o <strong>vestibular agendado online</strong>, no qual o estudante escolhe
        a data, realiza a prova pela internet e recebe o resultado em 24 a 48 horas. Em muitos cursos
        de tecnólogo e EAD, basta apresentar o certificado de conclusão do ensino médio pra garantir
        a matrícula.
      </p>

      <h2>Os 4 caminhos pra entrar sem ENEM</h2>
      <h3>1. Vestibular agendado (mais usado)</h3>
      <p>
        Prova realizada online ou presencialmente, agendada pelo próprio estudante. Disponível em
        praticamente todas as faculdades particulares. Costuma ter redação + questões objetivas, com
        duração de 1h30 a 2h. Resultado em até 48h e matrícula imediata.
      </p>

      <h3>2. Histórico do ensino médio</h3>
      <p>
        Algumas faculdades EAD dispensam totalmente a prova quando o estudante apresenta certificado
        de conclusão do ensino médio com média mínima (geralmente 6,0). É o caminho mais rápido —
        sem prova nem espera.
      </p>

      <h3>3. Vestibular tradicional</h3>
      <p>
        Edital fechado, prova em data específica, concorrência por número de vagas. Comum em
        faculdades de medicina, direito presencial e cursos com alta demanda.
      </p>

      <h3>4. Transferência</h3>
      <p>
        Quem já cursou ao menos um semestre em outra faculdade pode pedir transferência aproveitando
        as disciplinas concluídas, sem novo processo seletivo. Útil pra quem mudou de cidade ou de
        instituição.
      </p>

      <h2>Faculdades parceiras com ingresso sem ENEM</h2>
      <p>
        Pelo Bolsa Click, as redes <strong>Anhanguera</strong>, <strong>Unopar</strong>,{' '}
        <strong>Pitágoras</strong>, <strong>Ampli</strong> e <strong>Unime</strong> oferecem
        vestibular agendado online em praticamente todos os cursos de graduação, com matrícula em
        até 48h após a aprovação. Todas são reconhecidas pelo MEC e oferecem polos físicos em
        centenas de cidades brasileiras.
      </p>

      <p>
        <Link href="/cursos" className="text-bolsa-secondary underline font-medium">
          Ver todos os cursos com bolsa →
        </Link>
      </p>

      <h2>Vale a pena fazer faculdade sem ENEM?</h2>
      <p>
        Sim. O diploma de uma faculdade reconhecida pelo MEC tem o mesmo valor legal,
        independentemente da forma de ingresso. O que importa pra mercado de trabalho, concurso
        público, conselho profissional (CRA, CREA, CRM, CRP, etc) ou pós-graduação é o reconhecimento
        do curso pelo MEC + a qualidade da instituição (medida via IGC e ENADE). Pesquise a nota da
        faculdade em <a href="https://emec.mec.gov.br" target="_blank" rel="noopener noreferrer" className="text-bolsa-secondary underline">emec.mec.gov.br</a>{' '}
        antes de matricular.
      </p>

      <h2>E se eu quiser tentar o ENEM no futuro?</h2>
      <p>
        Nada impede. Quem começa a graduação via vestibular agendado pode prestar o ENEM nos anos
        seguintes pra trocar de curso, transferir pra outra faculdade ou tentar uma vaga em
        universidade pública via SISU. A nota do ENEM continua valendo por até 2 anos pra processos
        seletivos.
      </p>
    </ProgramHub>
  )
}
