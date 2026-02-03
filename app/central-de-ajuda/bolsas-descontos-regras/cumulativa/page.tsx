import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Bolsa é cumulativa com ENEM, PROUNI ou FIES? | Central de Ajuda',
  description:
    'Descubra se você pode combinar a bolsa do Bolsa Click com PROUNI, FIES, nota do ENEM ou outros programas de financiamento estudantil.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/bolsas-descontos-regras/cumulativa',
  },
}

export default function CumulativaPage() {
  return (
    <ArticleLayout
      category="Bolsas, Descontos e Regras"
      categoryHref="/central-de-ajuda/bolsas-descontos-regras"
      title="Bolsa é cumulativa com ENEM, PROUNI ou FIES?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Não. Geralmente, as bolsas do Bolsa Click não são cumulativas com PROUNI, FIES ou descontos
          por nota do ENEM. Você precisará escolher entre usar a bolsa comercial do Bolsa Click ou
          aderir a programas governamentais/institucionais. Cada opção tem vantagens específicas que
          explicamos abaixo.
        </p>
      </QuickAnswer>

      <h2>Por que não é cumulativo?</h2>
      <p>
        As faculdades trabalham com políticas de desconto distintas para cada modalidade. Quando você
        utiliza um programa como PROUNI ou FIES, a instituição segue regras específicas desses
        programas, que geralmente impedem a combinação com outros descontos comerciais.
      </p>
      <p>Da mesma forma, bolsas negociadas comercialmente (como as do Bolsa Click) normalmente não podem ser somadas a benefícios governamentais ou descontos por desempenho no ENEM.</p>

      <h2>Comparando as opções</h2>

      <h3>PROUNI (Programa Universidade para Todos)</h3>
      <ul>
        <li><strong>Vantagem:</strong> Bolsa integral (100%) ou parcial (50%) totalmente gratuita</li>
        <li><strong>Requisitos:</strong> Renda familiar, nota mínima no ENEM, escola pública ou bolsista integral em escola particular</li>
        <li><strong>Processo:</strong> Inscrição pelo site do MEC, concorrência por nota</li>
        <li><strong>Limitações:</strong> Poucas vagas, alta concorrência, apenas duas chances por ano</li>
      </ul>

      <h3>FIES (Fundo de Financiamento Estudantil)</h3>
      <ul>
        <li><strong>Vantagem:</strong> Financia até 100% da mensalidade para pagar depois de formado</li>
        <li><strong>Requisitos:</strong> Renda familiar, nota mínima no ENEM, apresentar fiador ou garantia</li>
        <li><strong>Processo:</strong> Inscrição pelo site do MEC, análise de crédito</li>
        <li><strong>Limitações:</strong> É empréstimo (precisa pagar depois), juros, burocracia, poucas vagas</li>
      </ul>

      <h3>Desconto por nota do ENEM (direto na faculdade)</h3>
      <ul>
        <li><strong>Vantagem:</strong> Desconto imediato baseado em sua pontuação</li>
        <li><strong>Requisitos:</strong> Ter feito ENEM, nota mínima varia por instituição</li>
        <li><strong>Processo:</strong> Apresentar boletim do ENEM na matrícula</li>
        <li><strong>Limitações:</strong> Percentual geralmente menor que bolsas comerciais, nem todas faculdades oferecem</li>
      </ul>

      <h3>Bolsa Click (bolsa comercial)</h3>
      <ul>
        <li><strong>Vantagem:</strong> Descontos de até 100%, sem burocracia, processo rápido, milhares de opções</li>
        <li><strong>Requisitos:</strong> Nenhum requisito de renda, nota ou desempenho</li>
        <li><strong>Processo:</strong> Busca online, pré-matrícula simples, matrícula direto na faculdade</li>
        <li><strong>Limitações:</strong> Pré-matrícula tem custo (valor simbólico), bolsa não é 100% gratuita como PROUNI</li>
      </ul>

      <h2>Como escolher a melhor opção para você</h2>

      <p><strong>Escolha PROUNI se:</strong></p>
      <ul>
        <li>Você atende todos os requisitos de renda e nota</li>
        <li>Conseguiu uma vaga na seleção (processo competitivo)</li>
        <li>Prefere não pagar nada durante o curso</li>
      </ul>

      <p><strong>Escolha FIES se:</strong></p>
      <ul>
        <li>Quer começar a pagar só depois de formado</li>
        <li>Tem como apresentar fiador ou garantia</li>
        <li>Não se importa com a burocracia do processo</li>
      </ul>

      <p><strong>Escolha Bolsa Click se:</strong></p>
      <ul>
        <li>Quer começar a estudar rapidamente, sem esperar seleção</li>
        <li>Não atende requisitos de PROUNI ou FIES</li>
        <li>Prefere processo simples, sem burocracia ou análise de renda</li>
        <li>Quer ter milhares de opções de cursos e faculdades</li>
        <li>Valoriza atendimento próximo e suporte constante</li>
      </ul>

      <h2>Posso tentar PROUNI/FIES e usar Bolsa Click como plano B?</h2>
      <p>
        Sim! Muitos estudantes fazem exatamente isso. Você pode:
      </p>
      <ol>
        <li>Tentar PROUNI ou FIES nos períodos de inscrição</li>
        <li>Simultaneamente, buscar e garantir uma bolsa pelo Bolsa Click</li>
        <li>Se conseguir PROUNI/FIES, cancelar a pré-matrícula do Bolsa Click (conforme política de reembolso)</li>
        <li>Se não conseguir PROUNI/FIES, seguir com a bolsa comercial já garantida</li>
      </ol>

      <h2>E o Pravaler ou Credies?</h2>
      <p>
        Pravaler e Credies são empresas de crédito estudantil privado. A compatibilidade com bolsas do Bolsa Click varia por faculdade. Algumas instituições permitem usar bolsa comercial + parcelamento privado, outras não.
      </p>
      <p>
        Se você precisa de financiamento adicional, consulte nossa equipe para verificar as opções disponíveis na faculdade escolhida.
      </p>

      <h2>Nosso compromisso com transparência</h2>
      <p>
        No Bolsa Click, orientamos você a escolher sempre a melhor opção para seu bolso e situação. Se PROUNI for melhor, vamos te incentivar a tentar. Nossa missão é democratizar o acesso ao ensino superior, não importa qual caminho você escolha.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Como funciona o Bolsa Click',
            description: 'Entenda todo o processo de garantir sua bolsa conosco',
            href: '/central-de-ajuda/sobre-o-bolsa-click/como-funciona',
          },
          {
            title: 'Buscar cursos disponíveis',
            description: 'Veja milhares de opções com descontos de até 100%',
            href: '/cursos',
          },
          {
            title: 'Fale com especialista',
            description: 'Tire dúvidas e receba orientação personalizada',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
        ]}
      />
    </ArticleLayout>
  )
}
