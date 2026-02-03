import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'A bolsa pode mudar de valor? | Central de Ajuda',
  description:
    'Descubra se o percentual da sua bolsa pode ser alterado, como funcionam os reajustes de mensalidade e as garantias contratuais.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/bolsas-descontos-regras/bolsa-pode-mudar',
  },
}

export default function BolsaPodeMudarPage() {
  return (
    <ArticleLayout
      category="Bolsas, Descontos e Regras"
      categoryHref="/central-de-ajuda/bolsas-descontos-regras"
      title="A bolsa pode mudar de valor?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Não. O percentual de desconto da sua bolsa é fixo e garantido durante todo o curso. Se você
          garantiu 60% de desconto, esse percentual será mantido até a conclusão. O que pode mudar é
          o valor da mensalidade integral (devido a reajustes anuais), mas seu desconto percentual
          permanece o mesmo.
        </p>
      </QuickAnswer>

      <h2>Percentual de desconto é fixo</h2>
      <p>
        Quando você garante uma bolsa de 50%, 70% ou qualquer outro percentual, esse desconto está
        garantido contratualmente. A faculdade não pode reduzir ou cancelar seu desconto sem motivo
        justificado (como inadimplência grave ou descumprimento de regras acadêmicas).
      </p>
      <p>Isso significa que:</p>
      <ul>
        <li>Uma bolsa de 70% continuará sendo 70% em todos os semestres</li>
        <li>Se a mensalidade integral aumentar, você continua pagando apenas 30%</li>
        <li>O benefício está garantido no contrato de prestação de serviços educacionais</li>
      </ul>

      <h2>Como funciona o reajuste de mensalidade</h2>
      <p>
        Assim como qualquer serviço, as faculdades aplicam reajustes anuais nas mensalidades,
        geralmente baseados em índices como IPCA ou INPC. Esse reajuste impacta o valor integral da
        mensalidade, mas não o percentual da sua bolsa.
      </p>
      <p>Veja um exemplo prático:</p>
      <ul>
        <li>Mensalidade integral em 2026: R$ 1.000,00</li>
        <li>Sua bolsa: 60% de desconto</li>
        <li>Você paga: R$ 400,00</li>
      </ul>
      <p>Se em 2027 houver reajuste de 5%:</p>
      <ul>
        <li>Mensalidade integral: R$ 1.050,00 (aumento de 5%)</li>
        <li>Sua bolsa continua: 60% de desconto</li>
        <li>Você paga: R$ 420,00</li>
      </ul>
      <p>
        Perceba que o valor que você paga aumentou (de R$ 400 para R$ 420), mas seu desconto
        percentual permaneceu fixo em 60%.
      </p>

      <h2>Garantia contratual</h2>
      <p>
        Sua bolsa está protegida por dois documentos principais:
      </p>
      <ul>
        <li>
          <strong>Termo de adesão do Bolsa Click:</strong> Garante o percentual de desconto negociado
        </li>
        <li>
          <strong>Contrato da faculdade:</strong> Formaliza as condições da bolsa junto à instituição
          de ensino
        </li>
      </ul>
      <p>
        Ambos os documentos protegem seu direito ao desconto enquanto você cumprir as obrigações
        acadêmicas e financeiras.
      </p>

      <h2>Transparência total</h2>
      <p>No Bolsa Click, trabalhamos com total transparência:</p>
      <ul>
        <li>O percentual de desconto é informado antes da pré-matrícula</li>
        <li>Não existem taxas ocultas ou condições surpresa</li>
        <li>Você recebe orientação clara sobre reajustes anuais</li>
        <li>Todas as condições estão descritas no termo de adesão</li>
      </ul>

      <h2>Situações excepcionais</h2>
      <p>
        Embora raras, existem situações específicas que podem impactar a bolsa:
      </p>
      <ul>
        <li>
          <strong>Inadimplência prolongada:</strong> Pode resultar em suspensão do desconto conforme
          contrato
        </li>
        <li>
          <strong>Mudança de curso:</strong> Pode exigir renegociação de condições
        </li>
        <li>
          <strong>Transferência de instituição:</strong> A bolsa não é transferida automaticamente
        </li>
        <li>
          <strong>Descumprimento do regulamento acadêmico:</strong> Em casos graves, conforme regras
          da faculdade
        </li>
      </ul>
      <p>
        Em qualquer dessas situações, nossa equipe está disponível para ajudar a encontrar soluções e
        alternativas.
      </p>

      <h2>E se a faculdade tentar alterar meu desconto?</h2>
      <p>
        Se você sentir que seu desconto foi alterado indevidamente, entre em contato imediatamente com
        o Bolsa Click. Nossa equipe:
      </p>
      <ul>
        <li>Verificará os termos contratuais</li>
        <li>Intermediará o diálogo com a faculdade</li>
        <li>Buscará resolver a situação o mais rápido possível</li>
        <li>Garantirá seus direitos conforme acordado</li>
      </ul>

      <NextSteps
        steps={[
          {
            title: 'Validade da bolsa',
            description: 'Saiba por quanto tempo sua bolsa permanece ativa',
            href: '/central-de-ajuda/bolsas-descontos-regras/validade-bolsa',
          },
          {
            title: 'Identificar desconto no boleto',
            description: 'Veja como conferir se o desconto está aplicado corretamente',
            href: '/central-de-ajuda/bolsas-descontos-regras/desconto-boleto',
          },
          {
            title: 'Fale conosco',
            description: 'Tire dúvidas sobre sua bolsa diretamente com nosso time',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
        ]}
      />
    </ArticleLayout>
  )
}
