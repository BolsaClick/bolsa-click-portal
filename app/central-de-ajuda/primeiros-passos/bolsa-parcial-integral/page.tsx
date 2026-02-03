import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Diferença entre bolsa parcial e integral | Central de Ajuda',
  description:
    'Entenda a diferença entre bolsa de estudo parcial e integral e descubra qual opção se encaixa melhor no seu orçamento e objetivos.',
  robots: 'index, follow',
  alternates: {
    canonical:
      'https://www.bolsaclick.com.br/central-de-ajuda/primeiros-passos/bolsa-parcial-integral',
  },
}

export default function BolsaParcialIntegralPage() {
  return (
    <ArticleLayout
      category="Primeiros Passos"
      categoryHref="/central-de-ajuda/primeiros-passos"
      title="Diferença entre bolsa parcial e integral"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Bolsa integral oferece 100% de desconto na mensalidade (você não paga nada). Bolsa
          parcial oferece desconto de até 99%, e você paga a mensalidade reduzida. Ambas são
          válidas durante todo o curso, desde que você mantenha as condições contratuais.
        </p>
      </QuickAnswer>

      <h2>O que é bolsa integral</h2>
      <p>
        Na bolsa integral, você tem desconto de <strong>100% na mensalidade</strong>. Isso
        significa que você não paga nada mensalmente para estudar. Importante: alguns cursos podem
        ter taxas adicionais (material, rematrícula, eventos), mas a mensalidade em si é gratuita.
      </p>

      <h3>Características da bolsa integral:</h3>
      <ul>
        <li>Desconto de 100% na mensalidade</li>
        <li>Mensalidade zero durante todo o curso</li>
        <li>Disponível principalmente em cursos EAD e algumas graduações presenciais</li>
        <li>Sujeita à disponibilidade de vagas específicas</li>
      </ul>

      <h2>O que é bolsa parcial</h2>
      <p>
        Na bolsa parcial, você tem desconto na mensalidade que pode variar de{' '}
        <strong>10% até 99%</strong>. Você paga o valor reduzido todos os meses. Por exemplo: se a
        mensalidade é R$ 1.000 e você tem bolsa de 50%, pagará R$ 500 por mês.
      </p>

      <h3>Características da bolsa parcial:</h3>
      <ul>
        <li>Desconto de 10% a 99% na mensalidade</li>
        <li>Você paga mensalidade reduzida</li>
        <li>Maior variedade de cursos e instituições disponíveis</li>
        <li>Diferentes percentuais de desconto conforme a negociação</li>
      </ul>

      <h2>Como escolher entre parcial e integral</h2>
      <p>Considere os seguintes fatores:</p>

      <h3>Escolha bolsa integral se:</h3>
      <ul>
        <li>Seu orçamento é muito limitado</li>
        <li>Você precisa de mensalidade zero</li>
        <li>Está disposto a cursar modalidade EAD ou semipresencial</li>
        <li>Tem flexibilidade na escolha da instituição</li>
      </ul>

      <h3>Escolha bolsa parcial se:</h3>
      <ul>
        <li>Você pode arcar com mensalidade reduzida</li>
        <li>Quer mais opções de cursos e faculdades</li>
        <li>Prefere ensino presencial</li>
        <li>Busca instituição específica ou curso com reconhecimento elevado</li>
      </ul>

      <h2>Posso perder a bolsa durante o curso?</h2>
      <p>
        As bolsas são garantidas durante toda a duração do curso, desde que você cumpra as regras
        da instituição:
      </p>
      <ul>
        <li>Manter pagamentos em dia (no caso de bolsa parcial)</li>
        <li>Cumprir requisitos acadêmicos mínimos</li>
        <li>Seguir o código de conduta da faculdade</li>
      </ul>
      <p>
        Se você trancar o curso ou solicitar transferência, as condições podem mudar. Consulte
        sempre a faculdade sobre regras específicas.
      </p>

      <h2>O desconto se aplica a outras taxas?</h2>
      <p>
        Geralmente, <strong>o desconto é apenas na mensalidade</strong>. Outras taxas como material
        didático, rematrícula, diplomas e eventos podem ter valores separados. Sempre confirme com
        a instituição quais são os custos adicionais antes de efetivar a matrícula.
      </p>

      <h2>Como saber qual percentual de bolsa posso conseguir?</h2>
      <p>
        No Bolsa Click, cada curso mostra claramente o percentual de desconto disponível. Você pode
        filtrar os resultados por faixa de desconto e comparar as opções. Caso tenha dúvidas, nossa
        equipe pode ajudar a encontrar a melhor bolsa para o seu perfil.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Busque bolsas disponíveis',
            description: 'Veja opções de bolsas integrais e parciais nos cursos disponíveis',
            href: '/cursos',
          },
          {
            title: 'Saiba o que fazer depois',
            description: 'Entenda o que acontece depois de garantir sua bolsa',
            href: '/central-de-ajuda/primeiros-passos/depois-de-garantir',
          },
          {
            title: 'Fale com um especialista',
            description: 'Tire dúvidas sobre percentuais e condições pelo WhatsApp',
            href: 'https://wa.me/5511999999999',
          },
        ]}
      />
    </ArticleLayout>
  )
}
