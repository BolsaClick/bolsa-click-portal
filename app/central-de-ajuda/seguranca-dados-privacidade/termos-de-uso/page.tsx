import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Termos de Uso | Central de Ajuda - Bolsa Click',
  description:
    'Confira os termos e condições para utilização da plataforma Bolsa Click. Entenda seus direitos e obrigações ao usar nossos serviços.',
  robots: 'index, follow',
  alternates: {
    canonical:
      'https://www.bolsaclick.com.br/central-de-ajuda/seguranca-dados-privacidade/termos-de-uso',
  },
}

export default function TermosDeUsoPage() {
  return (
    <ArticleLayout
      category="Segurança, Dados e Privacidade"
      categoryHref="/central-de-ajuda/seguranca-dados-privacidade"
      title="Termos de Uso"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Ao usar o Bolsa Click, você concorda com nossos termos: somos uma plataforma que conecta
          estudantes a bolsas de estudo em instituições parceiras. Você é responsável por manter
          seus dados atualizados e usar a plataforma de forma ética. Não garantimos aprovação em
          bolsas, pois isso depende das instituições parceiras.
        </p>
      </QuickAnswer>

      <h2>1. Objeto</h2>
      <p>
        O Bolsa Click é uma plataforma digital criada pela Inovit Digital Publicidade (CNPJ
        57.554.723/0001-50) para conectar estudantes a oportunidades de bolsas de estudo em diversas
        modalidades educacionais, incluindo graduação, pós-graduação, educação básica e cursos
        técnicos, oferecendo descontos de até 85% nas mensalidades.
      </p>
      <p>
        As condições, valores e exigências das bolsas de estudo estão sujeitas às regras específicas
        de cada instituição de ensino parceira e podem variar de acordo com o curso e a modalidade
        escolhida.
      </p>

      <h2>2. Usuários e Conta de Acesso</h2>
      <p>
        Para utilizar o Bolsa Click, o usuário deve realizar um cadastro com informações pessoais
        precisas e atualizadas. O cadastro é necessário para garantir a personalização dos serviços
        e a análise de elegibilidade para as bolsas oferecidas.
      </p>
      <p>
        <strong>Suas responsabilidades:</strong>
      </p>
      <ul>
        <li>Manter a confidencialidade de sua conta e senha de acesso</li>
        <li>Notificar imediatamente sobre qualquer uso não autorizado de sua conta</li>
        <li>Fornecer informações verídicas, completas e atualizadas</li>
        <li>Utilizar os serviços de forma responsável e ética</li>
      </ul>
      <p>
        Reservamo-nos o direito de suspender ou cancelar a conta de qualquer usuário que violar
        estes Termos de Uso ou adotar práticas fraudulentas.
      </p>

      <h2>3. Direitos e Obrigações do Bolsa Click</h2>
      <p>
        <strong>Nossos compromissos:</strong>
      </p>
      <ul>
        <li>Disponibilizar acesso a oportunidades de bolsas conforme acordado com as instituições parceiras</li>
        <li>Facilitar o contato entre candidatos e instituições de ensino</li>
        <li>Manter a plataforma funcionando de forma segura e estável</li>
      </ul>
      <p>
        <strong>Limitações:</strong>
      </p>
      <ul>
        <li>
          Não garantimos a obtenção de bolsas de estudo, pois as oportunidades estão sujeitas à
          disponibilidade de vagas e aos critérios de cada instituição
        </li>
        <li>
          Reservamo-nos o direito de modificar, suspender ou descontinuar serviços sem aviso prévio
        </li>
      </ul>

      <h2>4. Processo de Seleção e Concessão de Bolsas</h2>
      <p>
        O processo de seleção para obtenção de uma bolsa ocorre de acordo com os critérios de cada
        instituição parceira, incluindo:
      </p>
      <ul>
        <li>Análise de desempenho acadêmico</li>
        <li>Perfil do candidato</li>
        <li>Disponibilidade de vagas</li>
        <li>Documentação exigida</li>
      </ul>
      <p>
        <strong>Importante:</strong> A responsabilidade final pela aprovação ou não de uma bolsa é
        da instituição parceira, que tem o direito de negar ou conceder a bolsa conforme seus
        próprios critérios internos.
      </p>

      <h2>5. Isenção de Responsabilidade</h2>
      <p>O Bolsa Click não se responsabiliza por:</p>
      <ul>
        <li>
          Alterações nas condições de bolsas, preços, descontos ou termos impostos pelas
          instituições após a solicitação
        </li>
        <li>
          Problemas técnicos ou falhas de acesso devido a fatores externos (conexão com a internet,
          falhas em servidores, etc.)
        </li>
        <li>
          Danos indiretos, incidentais ou consequentes decorrentes do uso ou incapacidade de usar a
          plataforma
        </li>
        <li>Falsificação de documentos ou informações pelo usuário</li>
      </ul>

      <h2>6. Propriedade Intelectual</h2>
      <p>
        Todos os direitos de propriedade intelectual sobre a plataforma Bolsa Click, incluindo
        marcas registradas, logotipos, textos, imagens, vídeos, software e demais conteúdos, são de
        titularidade exclusiva da Inovit ou de seus licenciadores.
      </p>
      <p>
        O usuário se compromete a não utilizar, reproduzir, modificar, distribuir ou criar trabalhos
        derivados de qualquer conteúdo da plataforma sem autorização prévia por escrito.
      </p>

      <h2>7. Privacidade e Proteção de Dados</h2>
      <p>
        Coletamos e processamos dados pessoais conforme descrito em nossa{' '}
        <a href="/central-de-ajuda/seguranca-dados-privacidade/politica-de-privacidade">
          Política de Privacidade
        </a>
        . Ao utilizar a plataforma, você consente com a coleta, uso e armazenamento de seus dados.
      </p>
      <p>
        Você tem direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento,
        conforme os direitos garantidos pela LGPD (Lei nº 13.709/2018).
      </p>

      <h2>8. Modificações nos Termos de Uso</h2>
      <p>
        Reservamo-nos o direito de alterar estes Termos a qualquer momento. As modificações terão
        efeito imediato após publicação, exceto quando estipulado prazo específico.
      </p>
      <p>
        O uso contínuo da plataforma após qualquer modificação implicará a aceitação das novas
        condições. Recomendamos revisar periodicamente esta página.
      </p>

      <h2>9. Disposições Gerais</h2>
      <p>
        Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer
        disputa será resolvida pelos tribunais competentes da cidade de São Paulo, Estado de São
        Paulo.
      </p>
      <p>
        Caso qualquer disposição seja considerada inválida ou inaplicável, as demais permanecerão em
        pleno vigor e efeito.
      </p>

      <h2>Contato</h2>
      <p>
        Para dúvidas ou informações adicionais, entre em contato através do e-mail:{' '}
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
            title: 'Política de Cookies',
            description: 'Saiba como usamos cookies em nosso site',
            href: '/central-de-ajuda/seguranca-dados-privacidade/politica-de-cookies',
          },
        ]}
      />
    </ArticleLayout>
  )
}
