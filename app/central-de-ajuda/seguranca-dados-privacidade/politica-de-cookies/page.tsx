import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Política de Cookies | Central de Ajuda - Bolsa Click',
  description:
    'Saiba como o Bolsa Click utiliza cookies e tecnologias semelhantes para melhorar sua experiência de navegação.',
  robots: 'index, follow',
  alternates: {
    canonical:
      'https://www.bolsaclick.com.br/central-de-ajuda/seguranca-dados-privacidade/politica-de-cookies',
  },
}

export default function PoliticaDeCookiesPage() {
  return (
    <ArticleLayout
      category="Segurança, Dados e Privacidade"
      categoryHref="/central-de-ajuda/seguranca-dados-privacidade"
      title="Política de Cookies"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Usamos cookies para melhorar sua navegação, lembrar preferências e analisar como o site é
          utilizado. Você pode aceitar, recusar ou gerenciar cookies nas configurações do seu
          navegador. Cookies essenciais são necessários para o funcionamento básico do site.
        </p>
      </QuickAnswer>

      <h2>O que são Cookies?</h2>
      <p>
        Cookies são pequenos arquivos de texto armazenados no seu dispositivo (computador,
        smartphone ou tablet) enquanto você navega em um site. Eles são amplamente utilizados para
        garantir o funcionamento adequado de sites, melhorar a experiência do usuário e fornecer
        funcionalidades adicionais.
      </p>

      <h2>Tipos de Cookies que Utilizamos</h2>

      <h3>Cookies Essenciais</h3>
      <p>
        São necessários para o funcionamento básico do site, como gerenciamento de sessões e
        navegação entre páginas. Sem esses cookies, o site não funcionaria corretamente.
      </p>
      <ul>
        <li>Manter você logado durante a navegação</li>
        <li>Lembrar itens em formulários</li>
        <li>Garantir a segurança da conexão</li>
      </ul>

      <h3>Cookies de Desempenho</h3>
      <p>
        Coletam informações sobre como você utiliza o site, como páginas mais visitadas e erros que
        ocorrem. Ajudam a melhorar a performance e funcionalidade.
      </p>
      <ul>
        <li>Análise de tráfego e comportamento</li>
        <li>Identificação de problemas técnicos</li>
        <li>Otimização de carregamento de páginas</li>
      </ul>

      <h3>Cookies Funcionais</h3>
      <p>
        Permitem que o site lembre suas preferências e escolhas, como idioma ou configurações de
        exibição, melhorando sua experiência de navegação.
      </p>
      <ul>
        <li>Preferências de idioma e região</li>
        <li>Configurações de acessibilidade</li>
        <li>Personalização de interface</li>
      </ul>

      <h3>Cookies de Publicidade</h3>
      <p>
        Utilizados para exibir anúncios relevantes com base nos seus interesses e para limitar a
        quantidade de vezes que um anúncio é mostrado. Também ajudam a medir a eficácia das
        campanhas publicitárias.
      </p>
      <ul>
        <li>Anúncios personalizados</li>
        <li>Remarketing</li>
        <li>Medição de conversões</li>
      </ul>

      <h2>Como os Cookies são Utilizados</h2>
      <p>Usamos cookies para:</p>
      <ul>
        <li>
          <strong>Facilitar a navegação:</strong> Cookies essenciais garantem que você consiga
          navegar pelo site e acessar áreas protegidas
        </li>
        <li>
          <strong>Melhorar a personalização:</strong> Cookies funcionais permitem lembrar
          preferências e configurações
        </li>
        <li>
          <strong>Análise e desempenho:</strong> Cookies de desempenho nos ajudam a entender como o
          site está sendo utilizado
        </li>
        <li>
          <strong>Publicidade direcionada:</strong> Cookies de publicidade mostram anúncios
          relevantes para você
        </li>
      </ul>

      <h2>Como Gerenciar os Cookies</h2>
      <p>
        Você pode optar por aceitar ou recusar cookies a qualquer momento. A maioria dos navegadores
        permite que você:
      </p>
      <ul>
        <li>Bloqueie cookies específicos ou todos os cookies</li>
        <li>Seja notificado sempre que um cookie for enviado</li>
        <li>Exclua cookies já armazenados no seu dispositivo</li>
      </ul>

      <h3>Como configurar em cada navegador:</h3>
      <ul>
        <li>
          <strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies
        </li>
        <li>
          <strong>Firefox:</strong> Opções → Privacidade e Segurança → Cookies
        </li>
        <li>
          <strong>Safari:</strong> Preferências → Privacidade → Cookies
        </li>
        <li>
          <strong>Edge:</strong> Configurações → Cookies e permissões de site
        </li>
      </ul>
      <p>
        <strong>Atenção:</strong> Se você desabilitar cookies, algumas funcionalidades do nosso site
        podem não funcionar corretamente, e você pode não conseguir acessar áreas restritas ou
        personalizar sua experiência.
      </p>

      <h2>Cookies de Terceiros</h2>
      <p>
        Utilizamos cookies de terceiros para análise e publicidade:
      </p>
      <ul>
        <li>
          <strong>Google Analytics:</strong> Análise de tráfego e comportamento do usuário
        </li>
        <li>
          <strong>Google Ads:</strong> Publicidade e remarketing
        </li>
        <li>
          <strong>Facebook Pixel:</strong> Análise de conversões e remarketing
        </li>
        <li>
          <strong>Hotjar:</strong> Mapas de calor e gravações de sessão (anonimizados)
        </li>
      </ul>
      <p>
        As políticas de cookies desses terceiros podem variar. Recomendamos consultar suas
        respectivas políticas de privacidade.
      </p>

      <h2>Tempo de Armazenamento</h2>
      <ul>
        <li>
          <strong>Cookies de sessão:</strong> Expiram quando você fecha o navegador
        </li>
        <li>
          <strong>Cookies persistentes:</strong> Permanecem por um período definido (geralmente de
          30 dias a 2 anos, dependendo da finalidade)
        </li>
      </ul>

      <h2>Alterações nesta Política</h2>
      <p>
        Podemos alterar esta Política de Cookies a qualquer momento. Modificações serão publicadas
        nesta página com a data de atualização indicada. Recomendamos revisar periodicamente para se
        manter informado.
      </p>

      <h2>Contato</h2>
      <p>
        Para dúvidas sobre nossa Política de Cookies, entre em contato através do e-mail:{' '}
        <a href="mailto:contato@bolsaclick.com.br">contato@bolsaclick.com.br</a>
      </p>
      <p className="text-sm text-gray-500 mt-6">
        Inovit Digital Publicidade © {new Date().getFullYear()} - CNPJ 57.554.723/0001-50
      </p>

      <NextSteps
        steps={[
          {
            title: 'Política de Privacidade',
            description: 'Entenda como coletamos e usamos seus dados',
            href: '/central-de-ajuda/seguranca-dados-privacidade/politica-de-privacidade',
          },
          {
            title: 'LGPD e seus direitos',
            description: 'Conheça seus direitos sobre seus dados pessoais',
            href: '/central-de-ajuda/seguranca-dados-privacidade/lgpd',
          },
          {
            title: 'Termos de Uso',
            description: 'Confira as condições de uso da plataforma',
            href: '/central-de-ajuda/seguranca-dados-privacidade/termos-de-uso',
          },
        ]}
      />
    </ArticleLayout>
  )
}
