import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'O Bolsa Click é confiável? | Central de Ajuda',
  description:
    'Descubra por que milhares de estudantes confiam no Bolsa Click para garantir bolsas de estudo com segurança e transparência.',
  robots: 'index, follow',
  alternates: {
    canonical:
      'https://www.bolsaclick.com.br/central-de-ajuda/sobre-o-bolsa-click/e-confiavel',
  },
}

export default function EConfiavelPage() {
  return (
    <ArticleLayout
      category="Sobre o Bolsa Click"
      categoryHref="/central-de-ajuda/sobre-o-bolsa-click"
      title="O Bolsa Click é confiável?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Sim, o Bolsa Click é uma plataforma 100% confiável. Somos parceiros oficiais de
          faculdades reconhecidas pelo MEC, temos milhares de alunos matriculados com sucesso,
          operamos com transparência total e seguimos todas as normas de proteção de dados (LGPD).
          Seu investimento e suas informações estão seguros conosco.
        </p>
      </QuickAnswer>

      <h2>Por que você pode confiar no Bolsa Click</h2>

      <h3>1. Parcerias oficiais com faculdades reconhecidas</h3>
      <p>
        Todas as instituições que aparecem em nossa plataforma são oficialmente reconhecidas pelo
        MEC (Ministério da Educação). Não trabalhamos com faculdades sem credenciamento ou com
        reputação duvidosa.
      </p>
      <ul>
        <li>Contratos formais com cada instituição de ensino</li>
        <li>Validação do reconhecimento MEC de todos os cursos</li>
        <li>Garantia de que seu diploma terá validade nacional</li>
      </ul>

      <h3>2. Milhares de alunos matriculados com sucesso</h3>
      <p>
        Não somos novos no mercado. Já ajudamos milhares de estudantes a realizarem o sonho de
        estudar, com histórias reais de transformação através da educação.
      </p>
      <p>
        <strong>Dados concretos:</strong>
      </p>
      <ul>
        <li>Mais de 30.000 faculdades parceiras em todo o Brasil</li>
        <li>100.000+ cursos disponíveis</li>
        <li>Milhares de alunos estudando com bolsas garantidas</li>
        <li>Taxa de satisfação superior a 95%</li>
      </ul>

      <h3>3. Transparência em todo o processo</h3>
      <p>Não temos nada a esconder. Tudo fica claro desde o primeiro contato:</p>
      <ul>
        <li>
          <strong>Valores transparentes:</strong> Mostramos preço original e com desconto
        </li>
        <li>
          <strong>Sem taxas ocultas:</strong> Todos os custos são apresentados antecipadamente
        </li>
        <li>
          <strong>Condições da bolsa:</strong> Percentual, validade e regras explicadas claramente
        </li>
        <li>
          <strong>Política de reembolso:</strong> Situações e prazos definidos no contrato
        </li>
      </ul>

      <h3>4. Proteção dos seus dados pessoais</h3>
      <p>
        Levamos segurança a sério. Seguimos rigorosamente a LGPD (Lei Geral de Proteção de Dados)
        e adotamos as melhores práticas de mercado:
      </p>
      <ul>
        <li>Criptografia em todas as transações</li>
        <li>Armazenamento seguro de informações pessoais</li>
        <li>Compartilhamento de dados apenas com as faculdades escolhidas por você</li>
        <li>Você pode solicitar exclusão dos seus dados a qualquer momento</li>
      </ul>

      <h3>5. Pagamento seguro e protegido</h3>
      <p>Processamos pagamentos através de gateways confiáveis e reconhecidos:</p>
      <ul>
        <li>Certificado SSL para proteção de dados bancários</li>
        <li>Integração com meios de pagamento seguros (cartão, Pix, boleto)</li>
        <li>Comprovante de transação enviado por e-mail</li>
        <li>Garantia de reembolso em casos específicos</li>
      </ul>

      <h2>Como validar nossa confiabilidade</h2>
      <p>Você pode verificar por conta própria:</p>
      <ul>
        <li>
          <strong>Consulte o Reclame Aqui:</strong> Veja nossa reputação e como tratamos eventuais
          problemas
        </li>
        <li>
          <strong>Pesquise nossa marca no Google:</strong> Leia avaliações de outros estudantes
        </li>
        <li>
          <strong>Entre em contato conosco:</strong> Teste nossa equipe antes de fechar negócio
        </li>
        <li>
          <strong>Verifique as faculdades no site do MEC:</strong> Confirme o credenciamento das
          instituições
        </li>
      </ul>

      <h2>E se algo der errado?</h2>
      <p>
        Imprevistos podem acontecer, mas estamos preparados para resolver:
      </p>
      <ul>
        <li>
          <strong>Atendimento rápido:</strong> Equipe disponível por WhatsApp, chat e e-mail
        </li>
        <li>
          <strong>Intermediação com a faculdade:</strong> Caso haja qualquer problema com a
          instituição
        </li>
        <li>
          <strong>Política de reembolso clara:</strong> Devolução do valor em situações previstas
          em contrato
        </li>
        <li>
          <strong>Ouvidoria disponível:</strong> Canal direto para resolver casos não solucionados
        </li>
      </ul>

      <h2>Sinais de que o Bolsa Click é confiável</h2>
      <p>Alguns indicadores práticos de confiabilidade:</p>
      <ul>
        <li>
          <strong>Site seguro (HTTPS):</strong> Criptografia de dados em todas as páginas
        </li>
        <li>
          <strong>CNPJ e endereço divulgados:</strong> Empresa registrada e localizada
        </li>
        <li>
          <strong>Canais oficiais de atendimento:</strong> WhatsApp, e-mail e telefone verificados
        </li>
        <li>
          <strong>Presença digital consolidada:</strong> Redes sociais ativas e atualizadas
        </li>
        <li>
          <strong>Termos de uso e privacidade públicos:</strong> Contratos claros e acessíveis
        </li>
      </ul>

      <h2>Depoimentos de quem já confiou</h2>
      <p>
        Milhares de estudantes já transformaram suas vidas através do Bolsa Click. Eles confiaram,
        garantiram suas bolsas e hoje estão realizando seus sonhos acadêmicos e profissionais.
      </p>
      <p>
        <em>
          &quot;No início, fiquei com medo de ser golpe. Mas depois de pesquisar, falar com o
          atendimento e ver tudo explicado, percebi que era sério. Hoje estou no 3º semestre de
          Administração com 70% de desconto!&quot; - Maria S., aluna
        </em>
      </p>

      <h2>Nossa promessa de confiança</h2>
      <p>Comprometemo-nos a:</p>
      <ul>
        <li>Jamais cobrar taxas não informadas previamente</li>
        <li>Garantir o desconto prometido durante todo o curso</li>
        <li>Manter seus dados seguros e privados</li>
        <li>Oferecer atendimento humanizado e próximo</li>
        <li>Resolver qualquer problema com agilidade e transparência</li>
      </ul>

      <NextSteps
        steps={[
          {
            title: 'Conheça nossas faculdades parceiras',
            description: 'Veja as instituições reconhecidas pelo MEC disponíveis',
            href: '/central-de-ajuda/sobre-o-bolsa-click/faculdades-parceiras',
          },
          {
            title: 'Saiba como protegemos seus dados',
            description: 'Entenda nossa política de segurança e privacidade',
            href: '/central-de-ajuda/seguranca-dados-privacidade',
          },
          {
            title: 'Comece sua busca agora',
            description: 'Encontre a bolsa ideal com total segurança',
            href: '/cursos',
          },
        ]}
      />
    </ArticleLayout>
  )
}
