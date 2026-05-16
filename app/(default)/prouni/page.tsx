import { Metadata } from 'next'
import Link from 'next/link'
import { ProgramHub } from '../_components/ProgramHub'

const SITE_URL = 'https://www.bolsaclick.com.br'

// REVISAR ANUAL — datas, valores mínimos de nota, faixas de renda
const DATA_PUBLISHED = '2024-01-15'
const DATA_MODIFIED = '2026-05-15'

export const metadata: Metadata = {
  title: 'PROUNI 2026 - Inscrição, Notas, Renda e Bolsas | Bolsa Click',
  description:
    'Tudo sobre o PROUNI 2026: requisitos de renda, nota mínima do ENEM, inscrição, bolsas integrais e parciais, faculdades participantes e como combinar com outras formas de bolsa.',
  keywords: [
    'prouni 2026', 'prouni', 'inscrição prouni', 'bolsa integral',
    'bolsa parcial', 'prouni nota de corte', 'prouni renda',
    'prouni faculdades', 'como funciona o prouni',
  ],
  alternates: { canonical: `${SITE_URL}/prouni` },
  openGraph: {
    title: 'PROUNI 2026 - Como Conseguir Bolsa Integral ou Parcial',
    description: 'Renda, nota, inscrição e regras do Programa Universidade para Todos.',
    url: `${SITE_URL}/prouni`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'article',
  },
}

const faqItems = [
  {
    question: 'O que é o PROUNI?',
    answer: 'O PROUNI (Programa Universidade para Todos) é um programa do governo federal, criado em 2004, que oferece bolsas integrais (100%) e parciais (50%) em instituições privadas de ensino superior. As bolsas são financiadas pela isenção de impostos das faculdades participantes.',
  },
  {
    question: 'Quem pode se inscrever no PROUNI?',
    answer: 'Para bolsa integral: renda familiar bruta mensal de até 1,5 salário mínimo por pessoa. Para parcial (50%): até 3 salários mínimos por pessoa. Em ambos os casos, é preciso ter feito o ENEM com média mínima de 450 e nota maior que zero na redação — e ter cursado o ensino médio em escola pública ou como bolsista integral em escola privada.',
  },
  {
    question: 'Quando são as inscrições do PROUNI 2026?',
    answer: 'O PROUNI tem duas edições por ano: a primeira normalmente em janeiro/fevereiro (após o resultado do ENEM) e a segunda em junho/julho. As datas exatas são publicadas pelo MEC no edital — confirme em acessounico.mec.gov.br/prouni.',
  },
  {
    question: 'Quantas chamadas tem o PROUNI?',
    answer: 'O PROUNI tem geralmente 2 chamadas regulares e uma lista de espera. Se você não foi selecionado na 1ª chamada, ainda pode aparecer na 2ª ou ser convocado pela lista de espera. Acompanhe pelo Portal do Estudante (prouniportal.mec.gov.br).',
  },
  {
    question: 'PROUNI integral vs parcial: qual a diferença?',
    answer: 'Integral cobre 100% da mensalidade durante todo o curso. Parcial cobre 50% — você paga a outra metade, podendo combinar com FIES para financiar o restante. A escolha depende da sua renda familiar e da disponibilidade de vagas no curso/faculdade.',
  },
  {
    question: 'Posso combinar PROUNI com FIES?',
    answer: 'Sim. Para o PROUNI parcial (50%), é comum combinar com o FIES para financiar a outra metade. Para PROUNI integral, não há cobrança de mensalidade, então não há o que financiar.',
  },
  {
    question: 'PROUNI vs Bolsa Click: qual escolher?',
    answer: 'PROUNI tem critério rígido de renda e exige ENEM com nota mínima 450 (sem zerar redação). O Bolsa Click negocia bolsas diretamente com as faculdades parceiras (sem critério de renda, sem ENEM obrigatório em algumas), com descontos de até 80%. Em geral, se você se encaixa no PROUNI integral, vale tentar. Se não, ou se quer mais opções de curso/faculdade/cidade, o Bolsa Click é o caminho mais flexível.',
  },
  {
    question: 'Posso usar PROUNI em qualquer faculdade?',
    answer: 'Apenas em instituições privadas que aderiram ao programa. Inclui as principais redes do país (incluindo várias parceiras do Bolsa Click). A lista é publicada a cada edição no portal do MEC.',
  },
  {
    question: 'Como manter a bolsa do PROUNI?',
    answer: 'Você precisa cursar pelo menos 75% das disciplinas com aproveitamento. Reprovações repetidas podem levar à perda da bolsa. Também é preciso manter a regularidade da matrícula a cada semestre.',
  },
  {
    question: 'Não passei no PROUNI. E agora?',
    answer: 'Você ainda tem caminhos: (1) tentar a próxima edição do PROUNI; (2) entrar pelo SISU em universidade pública; (3) usar o FIES para financiar a faculdade; (4) usar o Bolsa Click para conseguir desconto de até 80% direto com as faculdades parceiras, sem critério de renda.',
  },
]

export default function ProuniPage() {
  return (
    <ProgramHub
      slug="prouni"
      title="PROUNI"
      h1="PROUNI 2026: Como Conseguir Bolsa Integral ou Parcial"
      lede="O Programa Universidade para Todos oferece bolsas de 50% ou 100% em faculdades particulares para quem fez o ENEM e atende ao critério de renda. Veja regras, datas e como se inscrever."
      articleSummary="Guia completo do PROUNI 2026: requisitos de renda e nota do ENEM, calendário de inscrição, diferença entre bolsa integral e parcial, faculdades participantes, e comparação com outras formas de bolsa."
      datePublished={DATA_PUBLISHED}
      dateModified={DATA_MODIFIED}
      faqItems={faqItems}
    >
      <h2>O que é o PROUNI</h2>
      <p>
        Criado em 2004, o <strong>PROUNI (Programa Universidade para Todos)</strong> é o
        principal programa do governo federal para democratizar o acesso ao ensino superior
        em faculdades privadas. As instituições participantes recebem isenção de impostos
        federais (PIS, COFINS, CSLL e IRPJ) em troca de oferecerem bolsas integrais e
        parciais para estudantes selecionados pelo MEC.
      </p>
      <p>
        Desde a criação, o programa já distribuiu mais de 3 milhões de bolsas, sendo cerca
        de 70% integrais. Para o PROUNI, a renda familiar e a nota do ENEM são os critérios
        decisivos.
      </p>

      <h2>Quem pode se inscrever no PROUNI</h2>
      <p>Você precisa atender simultaneamente a quatro requisitos:</p>
      <ol>
        <li>
          <strong>Ter feito o ENEM mais recente</strong> com média mínima de 450 nas notas
          das 4 áreas e nota da redação maior que zero. Treineiro não vale.
        </li>
        <li>
          <strong>Critério de renda</strong>: até 1,5 salário mínimo por pessoa da família
          (bolsa integral) ou até 3 salários mínimos (bolsa parcial 50%).
        </li>
        <li>
          <strong>Critério de escolaridade</strong>: ter cursado o ensino médio
          inteiramente em escola pública OU em escola privada com bolsa integral; OU ser
          professor da rede pública pleiteando licenciatura, pedagogia ou normal superior;
          OU ser pessoa com deficiência.
        </li>
        <li>
          <strong>Não ter diploma de graduação</strong> anterior.
        </li>
      </ol>

      <h2>Calendário do PROUNI 2026</h2>
      <p>
        O programa tem duas edições por ano, sempre após a publicação dos resultados do
        ENEM mais recente:
      </p>
      <ul>
        <li><strong>1ª edição</strong>: inscrições em janeiro/fevereiro</li>
        <li><strong>1ª chamada</strong>: resultado em fevereiro</li>
        <li><strong>2ª chamada</strong>: cerca de 15 dias depois</li>
        <li><strong>Lista de espera</strong>: ativada em março</li>
        <li><strong>2ª edição</strong>: inscrições em junho/julho (com nota do ENEM anterior)</li>
      </ul>
      <p>
        As datas exatas saem no edital do MEC e podem ser conferidas em
        acessounico.mec.gov.br/prouni.
      </p>

      <h2>Bolsa integral vs parcial: qual escolher</h2>
      <p>
        Na inscrição, você escolhe até duas opções de curso/faculdade/turno e indica se quer
        ser candidato a integral, parcial ou ambas. A escolha depende da sua renda:
      </p>
      <ul>
        <li>
          <strong>Bolsa integral (100%)</strong>: para famílias com renda per capita até
          1,5 salário mínimo. Cobre toda a mensalidade durante todo o curso.
        </li>
        <li>
          <strong>Bolsa parcial (50%)</strong>: para famílias com renda per capita até 3
          salários mínimos. Você paga 50% da mensalidade — e pode complementar com FIES para
          financiar essa parte.
        </li>
      </ul>

      <h2>Como manter a bolsa</h2>
      <p>
        Conseguir a bolsa é só o começo. Para mantê-la, você precisa cursar pelo menos 75%
        das disciplinas com aproveitamento a cada semestre. Reprovações sucessivas levam à
        perda da bolsa, e existe um limite máximo de reprovações por semestre. A matrícula
        deve ser renovada a cada semestre dentro do prazo da instituição.
      </p>

      <h2>PROUNI, FIES, SISU e Bolsa Click — quando usar cada</h2>
      <p>
        Não são caminhos excludentes; cada um faz mais sentido em um cenário:
      </p>
      <ul>
        <li>
          <strong>PROUNI</strong>: melhor opção se você se encaixa no critério de renda e
          tirou nota mínima. Bolsa pode ser integral, e cobre todo o curso.
        </li>
        <li>
          <strong>SISU</strong>: para entrar em <Link href="/sisu">universidades públicas</Link>
          {' '}(gratuitas), com seleção via nota do ENEM.
        </li>
        <li>
          <strong>FIES</strong>: financia parte ou total da mensalidade com juros baixos e
          pagamento após formado. <Link href="/fies">Veja como funciona</Link>.
        </li>
        <li>
          <strong>Bolsa Click</strong>: sem critério de renda, sem ENEM obrigatório em
          muitas ofertas, com descontos negociados diretamente com as faculdades parceiras
          (até 80% na mensalidade). <Link href="/bolsas-de-estudo">Confira as ofertas
          disponíveis</Link>.
        </li>
      </ul>
      <p>
        Se você se qualifica para PROUNI integral, faça a inscrição — é o caminho mais
        vantajoso. Se sua renda é maior ou você quer mais flexibilidade de curso/faculdade,
        o Bolsa Click costuma ser a alternativa com melhor custo-benefício.
      </p>
    </ProgramHub>
  )
}
