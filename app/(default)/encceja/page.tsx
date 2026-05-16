import { Metadata } from 'next'
import Link from 'next/link'
import { ProgramHub } from '../_components/ProgramHub'

const SITE_URL = 'https://www.bolsaclick.com.br'

// REVISAR ANUAL — calendário, edital INEP
const DATA_PUBLISHED = '2024-01-15'
const DATA_MODIFIED = '2026-05-15'

export const metadata: Metadata = {
  title: 'ENCCEJA 2026 - Inscrição, Provas e Certificação de Ensino Médio | Bolsa Click',
  description:
    'Tudo sobre o ENCCEJA 2026: como funciona o exame para certificação do ensino fundamental e médio, quem pode fazer, datas, como se inscrever e como entrar em faculdade depois.',
  keywords: [
    'encceja 2026', 'encceja', 'certificação ensino médio',
    'inscrição encceja', 'prova encceja',
    'concluir ensino médio', 'supletivo',
  ],
  alternates: { canonical: `${SITE_URL}/encceja` },
  openGraph: {
    title: 'ENCCEJA 2026 - Como Concluir o Ensino Médio pelo Exame',
    description: 'Inscrição, regras e como usar o certificado do ENCCEJA para entrar em faculdade.',
    url: `${SITE_URL}/encceja`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'article',
  },
}

const faqItems = [
  {
    question: 'O que é o ENCCEJA?',
    answer: 'O ENCCEJA (Exame Nacional para Certificação de Competências de Jovens e Adultos) é a prova oficial do MEC para certificar a conclusão do ensino fundamental ou ensino médio para quem não concluiu na idade regular. É a forma mais reconhecida de obter o diploma equivalente fora da rede de ensino tradicional.',
  },
  {
    question: 'Quem pode fazer o ENCCEJA?',
    answer: 'Para certificação do ensino fundamental: ter pelo menos 15 anos completos na data da prova. Para certificação do ensino médio: ter pelo menos 18 anos completos. Não há limite máximo de idade. Brasileiros residentes no exterior também podem se inscrever no ENCCEJA Exterior.',
  },
  {
    question: 'O ENCCEJA é gratuito?',
    answer: 'Sim, a inscrição no ENCCEJA é totalmente gratuita. Diferente do ENEM, não tem taxa — você só precisa fazer a inscrição online no site do INEP dentro do prazo do edital.',
  },
  {
    question: 'Quais matérias caem no ENCCEJA?',
    answer: 'Para o ensino médio são 4 áreas de conhecimento + redação: (1) Linguagens, Códigos e suas Tecnologias + Redação; (2) Matemática e suas Tecnologias; (3) Ciências Humanas e suas Tecnologias; (4) Ciências da Natureza e suas Tecnologias. Cada área tem 30 questões de múltipla escolha.',
  },
  {
    question: 'Qual a nota mínima para passar?',
    answer: 'Para ser certificado, você precisa atingir pelo menos 100 pontos em cada uma das 4 áreas e nota mínima 5 (de 10) na redação. As notas são analisadas individualmente: pode acontecer de passar em algumas áreas e ter que refazer em outras na próxima edição.',
  },
  {
    question: 'Posso fazer o ENCCEJA aos poucos?',
    answer: 'Sim. Se você for aprovado só em algumas áreas, pode pedir certificação parcial. Nas próximas edições, refaz apenas as áreas em que ficou abaixo da nota mínima, até completar todas e receber o certificado integral.',
  },
  {
    question: 'Quando é o ENCCEJA 2026?',
    answer: 'O ENCCEJA costuma acontecer uma vez por ano, geralmente em agosto. Em alguns anos há também uma edição específica para pessoas privadas de liberdade (ENCCEJA PPL). As datas oficiais saem no edital do INEP em torno de abril/maio.',
  },
  {
    question: 'Posso usar o certificado do ENCCEJA para entrar em faculdade?',
    answer: 'Sim. Após receber o certificado de conclusão do ensino médio, você pode prestar ENEM, vestibular ou processo seletivo de faculdades particulares — incluindo as parceiras do Bolsa Click. O certificado tem o mesmo valor legal de um diploma do ensino médio regular.',
  },
  {
    question: 'Qual a diferença entre ENCCEJA e EJA?',
    answer: 'EJA (Educação de Jovens e Adultos) é uma modalidade de ensino — você frequenta aulas (presencial ou EAD), faz avaliações e recebe o diploma após o curso completo. ENCCEJA é uma prova única que certifica o ensino sem a necessidade de cursar formalmente. Você escolhe o caminho que cabe melhor na sua rotina.',
  },
  {
    question: 'Recebi o certificado do ENCCEJA. Como entro em faculdade com bolsa?',
    answer: 'Com o certificado em mãos, três caminhos: (1) fazer ENEM e tentar PROUNI ou SISU; (2) prestar processo seletivo da faculdade direto; (3) usar o Bolsa Click para encontrar bolsa de até 80% nas faculdades parceiras — sem precisar de ENEM em muitas ofertas.',
  },
]

export default function EnccejaPage() {
  return (
    <ProgramHub
      slug="encceja"
      title="ENCCEJA"
      h1="ENCCEJA 2026: Conclua o Ensino Médio pelo Exame"
      lede="O ENCCEJA é a prova oficial do MEC que permite obter o certificado de conclusão do ensino fundamental ou médio sem precisar voltar para a sala de aula. Veja como funciona e o que fazer depois."
      articleSummary="Guia completo do ENCCEJA 2026: o que é, quem pode fazer, calendário, estrutura da prova, notas mínimas, certificação parcial e como entrar em faculdade depois de receber o certificado."
      datePublished={DATA_PUBLISHED}
      dateModified={DATA_MODIFIED}
      faqItems={faqItems}
    >
      <h2>O que é o ENCCEJA</h2>
      <p>
        O <strong>ENCCEJA (Exame Nacional para Certificação de Competências de Jovens e
        Adultos)</strong> é a prova oficial do MEC, aplicada pelo INEP, que certifica
        oficialmente a conclusão do ensino fundamental ou médio para pessoas que não
        concluíram na idade regular. O certificado tem exatamente o mesmo valor legal de
        um diploma de escola tradicional — é aceito em concursos públicos, faculdades,
        contratações formais e qualquer outra situação que exija comprovação de
        escolaridade.
      </p>

      <h2>Quem pode fazer o ENCCEJA</h2>
      <ul>
        <li><strong>Ensino fundamental</strong>: ter no mínimo 15 anos completos na data da prova.</li>
        <li><strong>Ensino médio</strong>: ter no mínimo 18 anos completos na data da prova.</li>
        <li><strong>Sem limite máximo de idade</strong>.</li>
        <li>Pessoas privadas de liberdade têm edição específica (ENCCEJA PPL).</li>
        <li>Brasileiros residentes no exterior podem se inscrever no ENCCEJA Exterior, com prova aplicada em embaixadas e consulados.</li>
      </ul>

      <h2>Estrutura da prova (ensino médio)</h2>
      <p>São 4 áreas de conhecimento + redação, todas aplicadas no mesmo dia:</p>
      <ol>
        <li><strong>Linguagens, Códigos e suas Tecnologias</strong> (30 questões) + <strong>Redação</strong> (dissertativa, tema atual).</li>
        <li><strong>Matemática e suas Tecnologias</strong> (30 questões).</li>
        <li><strong>Ciências Humanas e suas Tecnologias</strong> (30 questões — história, geografia, filosofia, sociologia).</li>
        <li><strong>Ciências da Natureza e suas Tecnologias</strong> (30 questões — biologia, química, física).</li>
      </ol>
      <p>
        São 120 questões objetivas no total, divididas em 2 períodos (manhã e tarde) num
        único domingo.
      </p>

      <h2>Como funciona a nota</h2>
      <p>
        Para ser certificado, você precisa atingir <strong>nota mínima 100</strong> em cada
        uma das 4 áreas e <strong>nota 5 (de 10) na redação</strong>. As notas são
        avaliadas individualmente — se você passar em 3 áreas e ficar abaixo em 1, recebe
        certificação parcial e refaz apenas a área pendente na próxima edição. Quando
        completar todas, recebe o certificado integral.
      </p>

      <h2>Calendário do ENCCEJA 2026</h2>
      <ul>
        <li><strong>Inscrições</strong>: abril/maio (gratuitas, no site enccja.inep.gov.br)</li>
        <li><strong>Local da prova</strong>: divulgado em julho</li>
        <li><strong>Aplicação</strong>: domingo de agosto</li>
        <li><strong>Resultado individual</strong>: dezembro</li>
        <li><strong>Solicitação de certificado</strong>: a partir de janeiro do ano seguinte, no órgão certificador escolhido na inscrição</li>
      </ul>

      <h2>Como pegar o certificado</h2>
      <p>
        Após a divulgação do resultado, você precisa solicitar o certificado no órgão
        certificador que escolheu durante a inscrição (Secretaria de Educação do estado ou
        Instituto Federal). Cada estado tem seu fluxo — alguns emitem online, outros
        exigem retirada presencial. O certificado é gratuito.
      </p>

      <h2>Depois do ENCCEJA: como entrar em faculdade</h2>
      <p>
        Com o certificado em mãos, você tem três caminhos principais:
      </p>
      <ol>
        <li>
          <strong>Fazer o <Link href="/enem">ENEM</Link></strong> e tentar PROUNI/SISU/FIES como
          qualquer estudante regular. Inscrição no ENEM tem taxa (cerca de R$ 85), com
          isenção possível.
        </li>
        <li>
          <strong>Prestar vestibular tradicional</strong> ou processo seletivo da
          faculdade desejada. A maioria das faculdades privadas tem provas próprias e
          processos simplificados.
        </li>
        <li>
          <strong>Buscar bolsa direta no Bolsa Click</strong>: em muitas ofertas das
          faculdades parceiras, o certificado do ENCCEJA já basta para se inscrever — sem
          ENEM, sem vestibular. Bolsas de até 80% direto pela <Link href="/bolsas-de-estudo">
          nossa plataforma</Link>.
        </li>
      </ol>
      <p>
        Importante: o certificado do ENCCEJA tem exatamente o mesmo peso de um diploma
        regular. Você não precisa justificar nada — é seu direito ingressar no ensino
        superior nas mesmas condições de qualquer outro candidato.
      </p>
    </ProgramHub>
  )
}
