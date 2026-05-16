import { Metadata } from 'next'
import Link from 'next/link'
import { ProgramHub } from '../_components/ProgramHub'

const SITE_URL = 'https://www.bolsaclick.com.br'

// REVISAR ANUAL — calendário, notas de corte de referência
const DATA_PUBLISHED = '2024-01-15'
const DATA_MODIFIED = '2026-05-15'

export const metadata: Metadata = {
  title: 'SISU 2026 - Inscrição, Notas de Corte e Como Funciona | Bolsa Click',
  description:
    'Tudo sobre o SISU 2026: como funciona, calendário de inscrição, notas de corte por curso, lista de espera, segunda chamada e diferença para PROUNI e Bolsa Click.',
  keywords: [
    'sisu 2026', 'sisu', 'sistema de seleção unificada',
    'inscrição sisu', 'nota de corte sisu', 'universidade pública',
    'sisu lista de espera', 'sisu segunda chamada',
  ],
  alternates: { canonical: `${SITE_URL}/sisu` },
  openGraph: {
    title: 'SISU 2026 - Como Entrar em Universidade Pública com a Nota do ENEM',
    description: 'Inscrição, calendário, nota de corte e lista de espera do SISU.',
    url: `${SITE_URL}/sisu`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'article',
  },
}

const faqItems = [
  {
    question: 'O que é o SISU?',
    answer: 'O SISU (Sistema de Seleção Unificada) é a plataforma do MEC que reúne as vagas das universidades públicas (federais, estaduais e institutos federais) que usam a nota do ENEM como critério de ingresso. Você se inscreve uma vez e concorre a vagas em todo o Brasil.',
  },
  {
    question: 'Quando são as inscrições do SISU 2026?',
    answer: 'O SISU tem duas edições por ano: a 1ª em janeiro/fevereiro (após a divulgação da nota do ENEM) e a 2ª em junho/julho (com a mesma nota). As datas exatas saem no edital do MEC. As inscrições duram cerca de 4 dias.',
  },
  {
    question: 'Como funciona a nota de corte?',
    answer: 'A nota de corte é a menor nota necessária para ser selecionado em um curso/universidade. Ela é dinâmica: durante a inscrição, você vê uma nota de corte parcial que sobe ou desce conforme outros candidatos se inscrevem. A nota final só é fechada no resultado.',
  },
  {
    question: 'Posso me inscrever em quantos cursos no SISU?',
    answer: 'Você pode escolher até 2 opções de curso por edição (sua 1ª e 2ª opção). Recomenda-se usar a 1ª opção no curso/universidade dos sonhos e a 2ª como segurança (curso com nota de corte menor).',
  },
  {
    question: 'O que é a lista de espera do SISU?',
    answer: 'Se você não for selecionado na chamada regular, pode se inscrever na lista de espera da sua 1ª opção. As universidades vão chamando candidatos da lista conforme houver desistências, durante o início do semestre letivo.',
  },
  {
    question: 'Posso usar o SISU em qualquer universidade?',
    answer: 'Só em instituições públicas que aderiram ao programa — a grande maioria das federais e várias estaduais e institutos federais. Universidades como USP, Unicamp e Unesp têm vestibular próprio e não participam do SISU.',
  },
  {
    question: 'O que acontece se eu for selecionado mas não fizer a matrícula?',
    answer: 'A vaga vai para a lista de espera. Não é possível "guardar" a vaga: se você não comparecer ao período de matrícula da universidade no prazo, perde o direito automaticamente.',
  },
  {
    question: 'SISU é gratuito?',
    answer: 'Sim. A inscrição no SISU é totalmente gratuita. E as universidades públicas brasileiras são gratuitas (não cobram mensalidade) — você só precisa arcar com material, transporte e moradia se for estudar em outra cidade.',
  },
  {
    question: 'Não passei no SISU. Quais opções tenho?',
    answer: 'Você pode: (1) entrar na lista de espera da 1ª opção; (2) tentar a 2ª edição do SISU no meio do ano; (3) ir pelo PROUNI ou FIES em faculdade particular; (4) usar o Bolsa Click pra conseguir bolsa de até 80% direto com faculdades parceiras, sem critério de renda.',
  },
  {
    question: 'Posso usar uma nota antiga do ENEM no SISU?',
    answer: 'Não. O SISU exige a nota do ENEM mais recente. Se você fez o ENEM de 2 anos atrás, vai precisar fazer o exame novamente para participar do SISU deste ano.',
  },
]

export default function SisuPage() {
  return (
    <ProgramHub
      slug="sisu"
      title="SISU"
      h1="SISU 2026: Como Entrar em Universidade Pública pelo ENEM"
      lede="O Sistema de Seleção Unificada reúne as vagas das universidades públicas que usam a nota do ENEM. Veja como funciona, quando se inscrever e o que olhar nas notas de corte."
      articleSummary="Guia completo do SISU 2026: o que é, calendário, como funciona a inscrição, nota de corte, lista de espera e o que fazer se não passar."
      datePublished={DATA_PUBLISHED}
      dateModified={DATA_MODIFIED}
      faqItems={faqItems}
    >
      <h2>O que é o SISU</h2>
      <p>
        O <strong>Sistema de Seleção Unificada (SISU)</strong> é a plataforma do MEC que
        unifica o processo seletivo das universidades públicas que usam o ENEM como
        critério único de ingresso. Em vez de prestar vestibular em cada universidade
        separadamente, você se inscreve uma única vez no SISU e concorre a vagas em todo
        o Brasil — basta ter feito o ENEM mais recente com nota maior que zero na redação.
      </p>
      <p>
        São cerca de 60 universidades federais, várias estaduais e institutos federais
        participantes, totalizando mais de 200 mil vagas por edição.
      </p>

      <h2>Calendário do SISU 2026</h2>
      <p>O programa tem duas edições por ano:</p>
      <ul>
        <li><strong>1ª edição</strong>: inscrição em janeiro/fevereiro, vagas para o 1º semestre letivo.</li>
        <li><strong>2ª edição</strong>: inscrição em junho/julho, vagas para o 2º semestre.</li>
      </ul>
      <p>
        O prazo de inscrição costuma ser de 4 a 5 dias. Resultado da chamada regular sai
        em cerca de 1 semana após o encerramento. A lista de espera fica ativa nos
        meses seguintes, conforme cada universidade for liberando vagas.
      </p>

      <h2>Como funciona a inscrição</h2>
      <p>
        A inscrição é feita em acessounico.mec.gov.br/sisu com seu login Gov.br. Você
        escolhe <strong>até 2 cursos</strong>, em qualquer universidade pública
        participante. Durante o prazo de inscrição, pode trocar suas opções quantas
        vezes quiser — vale a última escolha confirmada.
      </p>
      <p>
        Cada universidade define seu peso por área do ENEM (Linguagens, Humanas, Natureza,
        Matemática e Redação). Por exemplo: um curso de Engenharia normalmente dá peso
        maior a Matemática e Ciências da Natureza, enquanto Direito pondera mais Humanas
        e Linguagens. Sua nota final é a média ponderada considerando esses pesos.
      </p>

      <h2>Notas de corte: como interpretar</h2>
      <p>
        A nota de corte é a menor nota necessária para entrar em um curso/universidade.
        Durante a inscrição, o sistema mostra uma <strong>nota de corte parcial</strong>{' '}
        atualizada a cada dia. Ela é estimativa — sobe se mais candidatos com nota alta
        se inscrevem, desce se desistem.
      </p>
      <p>
        Estratégia comum: use a 1ª opção no curso ambicioso (mesmo que a parcial pareça
        alta — pode cair) e a 2ª como segurança (curso com nota de corte historicamente
        mais baixa, em alguma universidade de interior ou turno noturno). A nota de
        corte final só sai junto com o resultado.
      </p>

      <h2>Sistema de cotas no SISU</h2>
      <p>
        A Lei de Cotas (Lei nº 12.711/2012) reserva 50% das vagas das universidades
        federais para estudantes vindos integralmente da rede pública, com subdivisões
        por renda e cor/raça. Na inscrição você escolhe a modalidade de concorrência
        — ampla concorrência ou uma das cotas a que tem direito. As notas de corte de
        cotas geralmente são menores que as de ampla.
      </p>

      <h2>Lista de espera e 2ª chamada</h2>
      <p>
        Se você não for selecionado na chamada regular, ainda há duas chances:
      </p>
      <ol>
        <li>
          <strong>Lista de espera</strong>: você confirma interesse na sua 1ª opção e
          aguarda. Conforme outros candidatos desistem ou não fazem matrícula, a
          universidade vai chamando da lista. Essa convocação pode acontecer durante
          todo o início do semestre letivo.
        </li>
        <li>
          <strong>2ª edição do SISU</strong>: meio do ano, com a mesma nota do ENEM. As
          vagas remanescentes da 1ª edição entram aqui, mais novas vagas para o 2º
          semestre.
        </li>
      </ol>

      <h2>Não passei no SISU: e agora?</h2>
      <p>
        Vagas em universidade pública são limitadas, e nem todos passam. Caminhos
        alternativos imediatos:
      </p>
      <ul>
        <li>
          Tentar o <Link href="/prouni">PROUNI</Link> (bolsa em faculdade particular,
          critério de renda + nota mínima).
        </li>
        <li>
          Financiar pelo <Link href="/fies">FIES</Link> (pagamento começa após formado).
        </li>
        <li>
          Procurar bolsa direta no <Link href="/bolsas-de-estudo">Bolsa Click</Link> — sem
          critério de renda, com descontos de até 80% nas mensalidades em faculdades
          parceiras. É o caminho mais flexível pra quem não conseguiu vaga pública e
          não se encaixa nas regras do PROUNI.
        </li>
      </ul>
    </ProgramHub>
  )
}
