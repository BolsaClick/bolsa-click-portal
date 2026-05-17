import { Metadata } from 'next'
import Link from 'next/link'
import { ProgramHub } from '../_components/ProgramHub'

const SITE_URL = 'https://www.bolsaclick.com.br'

// REVISAR ANUAL — juros, datas, valores oficiais do FNDE
const DATA_PUBLISHED = '2024-01-15'
const DATA_MODIFIED = '2026-05-15'

export const metadata: Metadata = {
  title: 'FIES 2026 - Como Funciona, Inscrição, Juros e Quem Pode',
  description:
    'Tudo sobre o FIES 2026: requisitos, valores financiados, juros, prazo de pagamento, P-FIES e como combinar com PROUNI ou bolsa do Bolsa Click.',
  keywords: [
    'fies 2026', 'fies', 'financiamento estudantil',
    'inscrição fies', 'juros fies', 'p-fies',
    'como funciona o fies', 'fies renda',
  ],
  alternates: { canonical: `${SITE_URL}/fies` },
  openGraph: {
    title: 'FIES 2026 - Financiamento Estudantil do Governo Federal',
    description: 'Como funciona, requisitos, valores e prazo de pagamento do FIES.',
    url: `${SITE_URL}/fies`,
    siteName: 'Bolsa Click',
    locale: 'pt_BR',
    type: 'article',
  },
}

const faqItems = [
  {
    question: 'O que é o FIES?',
    answer: 'O FIES (Fundo de Financiamento Estudantil) é o programa do governo federal que financia parcial ou totalmente a mensalidade de cursos de graduação em faculdades particulares. Os juros são baixos (ou zerados para baixa renda) e o pagamento só começa após você se formar, com prazo longo para quitar.',
  },
  {
    question: 'Qual a diferença entre FIES e PROUNI?',
    answer: 'PROUNI é bolsa — você não paga nada (integral) ou metade (parcial), e o desconto vem da isenção fiscal da faculdade. FIES é financiamento — a mensalidade é paga pelo governo durante o curso, e você devolve depois de formado. PROUNI exige renda menor; FIES tem teto maior. Os dois podem ser combinados (PROUNI parcial + FIES para o resto).',
  },
  {
    question: 'Quem pode fazer o FIES?',
    answer: 'Para o FIES tradicional: ter feito o ENEM (de 2010 em diante) com média mínima 450 nas 4 áreas e nota da redação acima de zero, renda familiar bruta de até 3 salários mínimos por pessoa, e não ter diploma de graduação. Para o P-FIES, os critérios variam por banco operador.',
  },
  {
    question: 'Quando são as inscrições do FIES 2026?',
    answer: 'O FIES tem inscrições normalmente em fevereiro/março (1º semestre) e julho/agosto (2º semestre). As datas exatas são publicadas no edital do MEC, disponível em acessounico.mec.gov.br/fies.',
  },
  {
    question: 'Quanto o FIES financia?',
    answer: 'O FIES tradicional pode financiar de 50% a 100% da mensalidade, dependendo da sua renda. Quanto menor a renda familiar per capita, maior a parcela financiada. O valor máximo financiado por semestre é definido pelo MEC e varia conforme o curso.',
  },
  {
    question: 'Qual o juros do FIES?',
    answer: 'O FIES tradicional tem juros baixos — frequentemente 0% para famílias com renda per capita até 1,5 salário mínimo, e taxas baixas pra renda maior. Os juros são reajustados anualmente pelo IPCA. P-FIES tem taxas definidas pelos bancos operadores (mais altas que o FIES tradicional).',
  },
  {
    question: 'Quando começo a pagar o FIES?',
    answer: 'Durante o curso você não paga as parcelas do financiamento — só uma coparticipação simbólica trimestral. Após a formatura, há um período de carência de cerca de 18 meses para você se estabilizar profissionalmente. Depois, começa a fase de amortização, que pode durar até 3 vezes a duração do curso (ex.: 5 anos de curso = até 15 anos pra quitar).',
  },
  {
    question: 'Posso usar FIES junto com Bolsa Click?',
    answer: 'Em algumas faculdades parceiras sim — o FIES financia parte da mensalidade e a bolsa do Bolsa Click é aplicada antes do financiamento, reduzindo o valor base. Combinar funciona bem quando o Bolsa Click oferece uma boa porcentagem de bolsa: você financia só o que sobrou. Consulte na hora da inscrição.',
  },
  {
    question: 'O que acontece se eu não pagar o FIES?',
    answer: 'Inadimplência no FIES leva a inscrição no Cadin/Serasa, restrição de crédito e, em casos extremos, ação de cobrança judicial. Em casos de dificuldade, é possível renegociar — o programa tem instrumentos como a Lei nº 13.530/2017 e programas de renegociação periódicos.',
  },
  {
    question: 'Posso desistir do FIES no meio do curso?',
    answer: 'Sim, mas o financiamento contratado até aquele ponto continua devendo. Você precisa formalizar o encerramento junto ao banco operador e à faculdade, e a fase de amortização começa após a carência normal.',
  },
]

export default function FiesPage() {
  return (
    <ProgramHub
      slug="fies"
      title="FIES"
      h1="FIES 2026: Como Financiar a Faculdade com o Governo"
      lede="O Fundo de Financiamento Estudantil financia até 100% da mensalidade de cursos de graduação em faculdades privadas, com juros baixos e pagamento que só começa depois de formado."
      articleSummary="Guia completo do FIES 2026: o que é, quem pode, calendário de inscrição, juros, valores financiados, P-FIES, prazo de pagamento e como combinar com PROUNI e Bolsa Click."
      datePublished={DATA_PUBLISHED}
      dateModified={DATA_MODIFIED}
      faqItems={faqItems}
    >
      <h2>O que é o FIES</h2>
      <p>
        O <strong>FIES (Fundo de Financiamento Estudantil)</strong> é o programa do governo
        federal que financia a graduação em faculdades privadas. Diferente do PROUNI (que
        é bolsa), o FIES é um empréstimo: o governo paga a faculdade durante o curso, e
        você devolve o valor depois de formado, em parcelas longas e com juros baixos.
      </p>
      <p>
        Em vigor desde 1999 (e ampliado fortemente entre 2010 e 2014), o programa já
        atendeu mais de 3 milhões de estudantes. A modalidade tradicional convive hoje
        com o <strong>P-FIES</strong> (operado por bancos privados, com regras próprias) e
        tem se mantido como uma das principais portas de entrada para estudantes de classe
        média que não se encaixam no PROUNI.
      </p>

      <h2>FIES Tradicional vs P-FIES</h2>
      <p>
        Há duas modalidades disponíveis hoje:
      </p>
      <ul>
        <li>
          <strong>FIES Tradicional</strong>: operado pelo Fundo Nacional de Desenvolvimento
          da Educação (FNDE). Juros baixíssimos (frequentemente 0% para renda per capita
          até 1,5 salário mínimo). Tem teto de vagas anuais e seleção via nota do ENEM +
          critério socioeconômico.
        </li>
        <li>
          <strong>P-FIES</strong>: operado por bancos privados (Caixa, Santander, etc.) com
          aporte parcial do governo. Juros mais altos que o tradicional, mas vagas
          maiores. Pode financiar cursos não cobertos pelo FIES tradicional.
        </li>
      </ul>

      <h2>Quem pode contratar</h2>
      <p>Para o FIES tradicional, você precisa cumprir:</p>
      <ol>
        <li>Ter feito o ENEM a partir de 2010 com média mínima 450 nas 4 áreas e nota da redação maior que zero.</li>
        <li>Renda familiar bruta mensal de até 3 salários mínimos por pessoa.</li>
        <li>Não ter diploma de graduação prévio.</li>
        <li>Ter cadastro regular no Sisfies (sistema de inscrição).</li>
      </ol>
      <p>
        Para o P-FIES, cada banco operador define seus critérios — em geral, mais flexíveis
        em renda, mas com avaliação de crédito do estudante ou fiador.
      </p>

      <h2>Calendário do FIES 2026</h2>
      <ul>
        <li><strong>1ª edição</strong>: inscrições em fevereiro/março</li>
        <li><strong>1ª chamada</strong>: cerca de 5 dias após o encerramento</li>
        <li><strong>Lista de espera</strong>: ativada após a 1ª chamada</li>
        <li><strong>2ª edição</strong>: inscrições em julho/agosto, vagas remanescentes para o 2º semestre</li>
      </ul>

      <h2>Quanto o FIES financia</h2>
      <p>
        O percentual financiado depende da sua renda per capita:
      </p>
      <ul>
        <li>Renda per capita até 0,5 salário mínimo: até 100%</li>
        <li>Renda per capita até 1 salário mínimo: até 75%</li>
        <li>Renda per capita até 1,5 salário mínimo: até 50%</li>
        <li>Renda per capita até 3 salários mínimos: até 50% (com avaliação)</li>
      </ul>
      <p>
        Existe também um teto absoluto por curso, definido pelo MEC. Cursos como Medicina
        têm tetos maiores que cursos como Pedagogia. O valor não financiado é por sua
        conta.
      </p>

      <h2>Como funciona o pagamento</h2>
      <p>
        O grande diferencial do FIES é a estrutura de pagamento, dividida em 3 fases:
      </p>
      <ol>
        <li>
          <strong>Utilização (durante o curso)</strong>: você paga só uma coparticipação
          trimestral pequena (geralmente menos de R$ 200) para cobrir o seguro
          obrigatório.
        </li>
        <li>
          <strong>Carência (18 meses após a formatura)</strong>: tempo para você se
          estabilizar profissionalmente. Continua pagando só a coparticipação.
        </li>
        <li>
          <strong>Amortização</strong>: parcelas mensais por até 3 vezes a duração do
          curso. Os juros são baixos no FIES tradicional, mais altos no P-FIES.
        </li>
      </ol>

      <h2>Combinando FIES com outras formas de bolsa</h2>
      <p>
        FIES e PROUNI podem ser combinados quando você tem PROUNI parcial (50%) — usa o
        FIES para financiar o restante, ficando sem mensalidade para pagar do bolso
        durante o curso. <Link href="/prouni">Veja as regras do PROUNI</Link>.
      </p>
      <p>
        Combinar FIES com bolsa do <Link href="/bolsas-de-estudo">Bolsa Click</Link> também é
        possível em algumas faculdades parceiras: a bolsa reduz a mensalidade base e o
        FIES financia o que sobrar. Resultado prático: mensalidade quitada na maior parte,
        sem pagar do bolso durante o curso. Consulte a oferta antes de fechar.
      </p>

      <h2>FIES vale a pena?</h2>
      <p>
        Depende do seu cenário: se você consegue PROUNI integral, é melhor que FIES (não
        precisa devolver). Se não, e o curso/faculdade que você quer está disponível pelo
        FIES tradicional com juros baixos, é uma boa alternativa — você se forma com
        diploma e começa a pagar depois de empregado. Se a renda não se encaixa e você
        quer flexibilidade total, a <Link href="/bolsas-de-estudo">bolsa direta do Bolsa
        Click</Link> (sem dívida no fim) costuma ser melhor caminho.
      </p>
    </ProgramHub>
  )
}
