import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Não encontrei a bolsa que quero — o que fazer? | Central de Ajuda',
  description:
    'Descubra alternativas e soluções caso não encontre a bolsa de estudo ideal na primeira busca pelo Bolsa Click.',
  robots: 'index, follow',
  alternates: {
    canonical:
      'https://www.bolsaclick.com.br/central-de-ajuda/primeiros-passos/nao-encontrei-bolsa',
  },
}

export default function NaoEncontreBolsaPage() {
  return (
    <ArticleLayout
      category="Primeiros Passos"
      categoryHref="/central-de-ajuda/primeiros-passos"
      title="Não encontrei a bolsa que quero — o que fazer?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Se você não encontrou a bolsa desejada, entre em contato com nossa equipe pelo WhatsApp.
          Podemos buscar opções personalizadas, avisar quando novas bolsas ficarem disponíveis e
          sugerir cursos similares com ótimos descontos. Trabalhamos constantemente para expandir
          nossas parcerias.
        </p>
      </QuickAnswer>

      <h2>Por que não encontrei o curso que quero?</h2>
      <p>Existem algumas razões comuns:</p>
      <ul>
        <li>
          <strong>O curso não está disponível na sua cidade:</strong> Algumas faculdades não têm
          parcerias em todas as regiões
        </li>
        <li>
          <strong>Vagas esgotadas temporariamente:</strong> Cursos muito procurados podem ter vagas
          limitadas
        </li>
        <li>
          <strong>Modalidade específica indisponível:</strong> O curso pode existir em EAD mas não
          presencial, ou vice-versa
        </li>
        <li>
          <strong>Ainda estamos negociando:</strong> Constantemente firmamos novas parcerias, e o
          curso pode estar em processo de inclusão
        </li>
      </ul>

      <h2>O que você pode fazer</h2>

      <h3>1. Fale com nossa equipe de atendimento</h3>
      <p>
        Entre em contato pelo WhatsApp, chat ou telefone e informe qual curso você procura. Nossa
        equipe pode:
      </p>
      <ul>
        <li>Verificar se o curso está disponível em cidades próximas</li>
        <li>Buscar opções similares com descontos equivalentes</li>
        <li>Consultar previsão de abertura de novas turmas</li>
        <li>Cadastrar seu interesse para avisar quando houver disponibilidade</li>
      </ul>

      <h3>2. Amplie os critérios de busca</h3>
      <p>Pequenos ajustes podem revelar ótimas oportunidades:</p>
      <ul>
        <li>
          <strong>Considere modalidade EAD:</strong> Cursos online têm mais disponibilidade e
          mensalidades menores
        </li>
        <li>
          <strong>Explore cidades vizinhas:</strong> Pode haver vagas em municípios próximos com
          deslocamento viável
        </li>
        <li>
          <strong>Avalie cursos similares:</strong> Administração e Gestão Comercial, por exemplo,
          têm áreas de atuação parecidas
        </li>
        <li>
          <strong>Flexibilize o turno:</strong> Se você procurava noturno, veja se há vagas no
          período da manhã ou tarde
        </li>
      </ul>

      <h3>3. Cadastre alerta de novas bolsas</h3>
      <p>
        Ao criar uma conta no Bolsa Click, você pode salvar suas preferências e receber
        notificações por e-mail ou WhatsApp quando:
      </p>
      <ul>
        <li>Novas bolsas do seu curso de interesse forem publicadas</li>
        <li>Vagas forem reabertas em instituições específicas</li>
        <li>Descontos especiais forem lançados na sua região</li>
      </ul>

      <h3>4. Considere alternativas estratégicas</h3>
      <p>Se o curso desejado não está disponível agora, você pode:</p>
      <ul>
        <li>
          <strong>Começar um curso similar:</strong> Aproveite para estudar enquanto espera pela
          vaga ideal
        </li>
        <li>
          <strong>Fazer curso técnico ou tecnólogo primeiro:</strong> Mais curtos, permitem entrar
          rápido no mercado
        </li>
        <li>
          <strong>Iniciar EAD e transferir depois:</strong> Algumas faculdades permitem migração
          entre modalidades
        </li>
      </ul>

      <h2>Como sugerir novos cursos ou instituições</h2>
      <p>
        Valorizamos o feedback dos nossos usuários! Se você gostaria de ver uma faculdade ou curso
        específico no Bolsa Click:
      </p>
      <ol>
        <li>Entre em contato com nossa equipe</li>
        <li>Informe qual curso e instituição você procura</li>
        <li>Caso haja demanda suficiente, priorizamos a negociação com essa parceria</li>
      </ol>

      <h2>Estamos sempre expandindo</h2>
      <p>
        O Bolsa Click cresce constantemente. A cada mês, firmamos novas parcerias com instituições
        de ensino de todo o Brasil. O que não está disponível hoje pode estar na próxima semana.
      </p>
      <p>
        <strong>Dica:</strong> Siga nossas redes sociais e ative as notificações para ser o
        primeiro a saber sobre novos cursos e bolsas.
      </p>

      <h2>Outras formas de conseguir desconto</h2>
      <p>Além do Bolsa Click, você pode explorar:</p>
      <ul>
        <li>
          <strong>ProUni:</strong> Programa do governo federal para bolsas integrais e parciais
          (exige Enem)
        </li>
        <li>
          <strong>FIES:</strong> Financiamento estudantil com juros baixos
        </li>
        <li>
          <strong>Programas da própria faculdade:</strong> Algumas instituições têm descontos para
          ex-alunos, grupos ou convênios
        </li>
      </ul>
      <p>
        Nossa equipe pode orientar sobre essas alternativas e ajudar você a tomar a melhor decisão.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Fale com um especialista',
            description: 'Nossa equipe pode buscar opções personalizadas para você',
            href: 'https://wa.me/5511999999999',
          },
          {
            title: 'Explore todos os cursos',
            description: 'Veja a lista completa de bolsas disponíveis',
            href: '/cursos',
          },
          {
            title: 'Aprenda a buscar melhor',
            description: 'Dicas para encontrar a bolsa ideal usando nossos filtros',
            href: '/central-de-ajuda/primeiros-passos/encontrar-bolsa',
          },
        ]}
      />
    </ArticleLayout>
  )
}
