import { Metadata } from 'next'
import Link from 'next/link'
import { ProgramHub } from '../_components/ProgramHub'

const SITE_URL = 'https://www.bolsaclick.com.br'

// REVISAR ANUAL — datas, valor da taxa, calendário oficial INEP/MEC
const DATA_PUBLISHED = '2024-01-15'
const DATA_MODIFIED = '2026-05-15'

export const metadata: Metadata = {
  title: 'ENEM 2026 - Datas, Inscrição, Notas de Corte e Como Usar',
  description:
    'Tudo sobre o ENEM 2026: datas das provas, inscrição, estrutura, cálculo da nota TRI, redação e como usar sua nota em SISU, PROUNI, FIES e nas faculdades parceiras Bolsa Click.',
  keywords: [
    'enem 2026', 'enem', 'inscrição enem', 'nota enem',
    'redação enem', 'enem datas', 'calendário enem',
    'como usar nota enem', 'sisu', 'prouni', 'fies',
  ],
  alternates: { canonical: `${SITE_URL}/enem` },
  openGraph: {
    title: 'ENEM 2026 - Tudo o que Você Precisa Saber',
    description: 'Datas, inscrição, estrutura e como usar a nota do ENEM para entrar em faculdade.',
    url: `${SITE_URL}/enem`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'article',
  },
}

const faqItems = [
  {
    question: 'Quando é o ENEM 2026?',
    answer: 'As provas do ENEM 2026 estão previstas para os primeiros domingos de novembro (8 e 15 de novembro de 2026). As datas oficiais são publicadas pelo INEP no edital — confira sempre em gov.br/inep antes de se planejar.',
  },
  {
    question: 'Quanto custa fazer o ENEM?',
    answer: 'A taxa de inscrição do ENEM costuma ficar em torno de R$ 85. Há isenção automática para estudantes de escola pública e cidadãos de baixa renda — basta solicitar dentro do prazo do edital.',
  },
  {
    question: 'Quem pode fazer o ENEM?',
    answer: 'Qualquer pessoa pode prestar o ENEM. Para usar a nota em programas como SISU/PROUNI/FIES, você precisa ter concluído (ou estar concluindo) o ensino médio. Quem ainda está cursando pode usar a prova como treineiro — a nota sai, mas não vale para ingresso.',
  },
  {
    question: 'Como é calculada a nota do ENEM?',
    answer: 'A nota é calculada pela Teoria de Resposta ao Item (TRI), não é só a soma de acertos. A TRI premia consistência: quem acerta perguntas fáceis mas erra as muito difíceis costuma ter nota maior do que quem chuta acertos em questões pontuais. A nota máxima possível é 1000 em cada área (LC, CH, CN, MT) e na redação.',
  },
  {
    question: 'Posso usar a nota do ENEM para entrar em faculdade particular?',
    answer: 'Sim, e essa é uma das formas mais usadas. Muitas faculdades privadas (incluindo as parceiras do Bolsa Click) aceitam o ENEM no lugar do vestibular tradicional e ainda oferecem bolsa de até 80% combinando ENEM + Bolsa Click.',
  },
  {
    question: 'Qual a nota mínima do ENEM para conseguir bolsa?',
    answer: 'Para o PROUNI, a média mínima é 450 pontos (sem zerar a redação). Pelo Bolsa Click, as ofertas variam por faculdade — algumas aceitam a partir de 300 pontos, outras pedem desempenho mais alto. Consulte sua nota em cada oferta.',
  },
  {
    question: 'Posso usar a nota de uma edição antiga do ENEM?',
    answer: 'Depende do programa. PROUNI e SISU costumam aceitar somente a nota do ENEM mais recente. Já a maioria das faculdades particulares (e as parceiras do Bolsa Click) aceita notas de edições anteriores, normalmente até 2 anos.',
  },
  {
    question: 'Como me preparar para o ENEM?',
    answer: 'Estude a Base Nacional Comum Curricular (BNCC), foque em interpretação de texto (todas as áreas), pratique redação dissertativa-argumentativa com tema social, e resolva provas anteriores cronometradas — o tempo é um dos maiores desafios da prova.',
  },
  {
    question: 'O que zerar na redação significa?',
    answer: 'Zerar a redação significa nota 0 no texto, o que impede o uso da nota em PROUNI, FIES e SISU. Os motivos mais comuns são fugir do tema, escrever em forma não-dissertativa, ferir direitos humanos ou texto em branco/com menos de 7 linhas.',
  },
  {
    question: 'Quando saem os resultados do ENEM?',
    answer: 'O gabarito oficial sai em torno de 2 semanas após a prova. As notas individuais são divulgadas em janeiro do ano seguinte na Página do Participante (gov.br/inep), e é essa nota que você usa em SISU, PROUNI, FIES e processos seletivos.',
  },
]

export default function EnemPage() {
  return (
    <ProgramHub
      slug="enem"
      title="ENEM"
      h1="ENEM 2026: Datas, Inscrição e Como Usar Sua Nota"
      lede="O Exame Nacional do Ensino Médio é a principal porta de entrada para universidades públicas e privadas no Brasil. Veja como funciona, quando acontece e como transformar sua nota em bolsa de até 80%."
      articleSummary="Guia completo do ENEM 2026: datas, inscrição, estrutura da prova, cálculo da nota TRI, redação e como usar a nota em SISU, PROUNI, FIES e nas faculdades parceiras Bolsa Click."
      datePublished={DATA_PUBLISHED}
      dateModified={DATA_MODIFIED}
      faqItems={faqItems}
    >
      <h2>O que é o ENEM</h2>
      <p>
        Criado em 1998 pelo MEC, o Exame Nacional do Ensino Médio (ENEM) começou como uma
        avaliação do desempenho do ensino médio brasileiro e virou, a partir de 2009, o
        principal mecanismo de seleção para o ensino superior do país. Hoje a nota do ENEM
        é usada pelo SISU (universidades públicas), PROUNI (bolsas em particulares), FIES
        (financiamento estudantil) e por mais de 1.500 instituições privadas — incluindo
        todas as faculdades parceiras do Bolsa Click.
      </p>

      <h2>Quando é o ENEM 2026</h2>
      <p>
        A previsão é que as provas aconteçam nos dois primeiros domingos de novembro de
        2026. As inscrições normalmente abrem em maio/junho, com prazo de 8 a 10 dias.
        Como as datas exatas só são fechadas no edital oficial do INEP, vale checar em
        gov.br/inep antes de fazer qualquer planejamento de viagem ou estudo.
      </p>
      <p>
        Em geral, o calendário segue este padrão:
      </p>
      <ul>
        <li><strong>Inscrições</strong>: maio ou junho</li>
        <li><strong>Pagamento da taxa</strong>: junho (cerca de R$ 85; isentos automáticos não pagam)</li>
        <li><strong>Cartão de confirmação</strong>: setembro/outubro</li>
        <li><strong>Provas</strong>: dois domingos consecutivos em novembro</li>
        <li><strong>Resultado</strong>: janeiro do ano seguinte</li>
      </ul>

      <h2>Estrutura da prova</h2>
      <p>
        O ENEM tem dois domingos de prova, com 4 áreas + redação, totalizando 180 questões
        objetivas e uma redação dissertativa-argumentativa.
      </p>
      <h3>1º domingo (5h30 de prova)</h3>
      <ul>
        <li><strong>Linguagens, Códigos e suas Tecnologias</strong> (45 questões): português, literatura, língua estrangeira (inglês ou espanhol — você escolhe), artes, educação física e tecnologia.</li>
        <li><strong>Ciências Humanas e suas Tecnologias</strong> (45 questões): história, geografia, filosofia e sociologia.</li>
        <li><strong>Redação</strong>: dissertativa-argumentativa, tema atual, mínimo 7 e máximo 30 linhas.</li>
      </ul>
      <h3>2º domingo (5h de prova)</h3>
      <ul>
        <li><strong>Ciências da Natureza e suas Tecnologias</strong> (45 questões): biologia, química e física.</li>
        <li><strong>Matemática e suas Tecnologias</strong> (45 questões).</li>
      </ul>

      <h2>Como funciona a nota TRI</h2>
      <p>
        O ENEM não soma acertos como uma prova tradicional. A nota é calculada pela
        <strong> Teoria de Resposta ao Item (TRI)</strong>, que considera três fatores por
        questão: dificuldade, poder de discriminação e probabilidade de acerto ao acaso. O
        efeito prático é que <strong>consistência vale mais que sorte</strong>: quem acerta
        as fáceis e médias mas erra as muito difíceis tende a tirar nota maior do que quem
        acerta umas difíceis sozinhas chutando o resto. Por isso, foque em dominar o que é
        seguro antes de tentar as questões mais complexas.
      </p>
      <p>
        A nota vai de 0 a 1000 em cada uma das 4 áreas e na redação. A média das 5 notas é
        o que normalmente é usada como referência (no PROUNI, por exemplo, mínimo de 450).
      </p>

      <h2>Como usar a nota do ENEM para entrar em faculdade</h2>
      <p>
        Existem quatro caminhos principais para transformar a nota em vaga:
      </p>
      <ol>
        <li>
          <strong>SISU</strong> (universidades públicas): inscrição em janeiro e julho, vaga
          definida por nota de corte por curso/universidade. <Link href="/sisu">Veja o guia
          completo do SISU</Link>.
        </li>
        <li>
          <strong>PROUNI</strong> (bolsas integrais e parciais em faculdades particulares):
          renda familiar até 3 salários mínimos por pessoa para bolsa parcial, até 1,5 para
          integral, nota mínima 450 sem zerar redação. <Link href="/prouni">Veja o guia do
          PROUNI</Link>.
        </li>
        <li>
          <strong>FIES</strong> (financiamento estudantil): financia parte ou total da
          mensalidade com juros baixos e pagamento começa após formado. <Link href="/fies">Veja
          o guia do FIES</Link>.
        </li>
        <li>
          <strong>Faculdades particulares via Bolsa Click</strong>: a maioria das parceiras
          aceita ENEM no lugar de vestibular e ainda dá bolsa de até 80% combinando a nota
          com nossas ofertas exclusivas. <Link href="/bolsas-de-estudo">Veja as bolsas
          disponíveis</Link>.
        </li>
      </ol>

      <h2>Dicas finais</h2>
      <p>
        O ENEM é uma maratona — administre energia e tempo durante a prova. Treine com
        provas anteriores cronometradas para sentir o ritmo (cerca de 4 minutos por
        questão na média). Para a redação, escolha repertórios sociais reais (dados,
        leis, autores) ao invés de citações genéricas. E não pule o domingo 1: a nota
        pondera todas as áreas.
      </p>
    </ProgramHub>
  )
}
