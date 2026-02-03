import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Documentos necessários para matrícula | Central de Ajuda',
  description:
    'Lista completa de documentos exigidos para matrícula na faculdade, como digitalizá-los corretamente e processo de validação.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/matricula-faculdade/documentos',
  },
}

export default function DocumentosPage() {
  return (
    <ArticleLayout
      category="Matrícula e Faculdade"
      categoryHref="/central-de-ajuda/matricula-faculdade"
      title="Documentos necessários"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Para matrícula você precisa: RG e CPF, comprovante de residência, certificado de conclusão
          do ensino médio ou superior (conforme o curso), histórico escolar, certidão de nascimento ou
          casamento, foto 3x4 e comprovante de quitação eleitoral (para maiores de 18 anos). Todos
          podem ser enviados digitalizados ou por foto de celular com boa qualidade.
        </p>
      </QuickAnswer>

      <h2>Lista completa de documentos</h2>

      <h3>Documentos pessoais obrigatórios</h3>
      <ul>
        <li>
          <strong>RG (Carteira de Identidade):</strong> Cópia legível de ambos os lados. CNH também é
          aceita
        </li>
        <li>
          <strong>CPF:</strong> Cópia ou print do comprovante de situação cadastral da Receita Federal
        </li>
        <li>
          <strong>Certidão de nascimento ou casamento:</strong> Versão atualizada (emitida há menos de
          1 ano, se possível)
        </li>
        <li>
          <strong>Foto 3x4 recente:</strong> Fundo branco, colorida, sem óculos escuros ou boné
        </li>
      </ul>

      <h3>Comprovante de residência</h3>
      <p>Aceitos (com data dos últimos 3 meses):</p>
      <ul>
        <li>Conta de luz, água, gás, telefone ou internet</li>
        <li>Boleto de condomínio</li>
        <li>Contrato de aluguel registrado</li>
        <li>Extrato bancário com endereço</li>
      </ul>
      <p>
        <strong>Importante:</strong> Pode estar em nome de terceiros (pai, mãe, cônjuge), mas nesse
        caso pode ser necessária declaração de residência.
      </p>

      <h3>Documentos escolares (Graduação)</h3>
      <ul>
        <li>
          <strong>Certificado de conclusão do ensino médio:</strong> Original ou cópia autenticada
        </li>
        <li>
          <strong>Histórico escolar do ensino médio:</strong> Com notas e datas de conclusão
        </li>
      </ul>
      <p>
        Se você ainda não recebeu o certificado (formou recentemente), pode apresentar declaração de
        conclusão provisória, mas precisará entregar o certificado definitivo depois.
      </p>

      <h3>Documentos escolares (Pós-graduação)</h3>
      <ul>
        <li>
          <strong>Diploma de graduação:</strong> Original ou cópia autenticada
        </li>
        <li>
          <strong>Histórico da graduação:</strong> Com todas as disciplinas cursadas
        </li>
      </ul>
      <p>
        Para cursos de especialização, o diploma precisa ser de graduação reconhecida pelo MEC.
      </p>

      <h3>Outros documentos (quando aplicável)</h3>
      <ul>
        <li>
          <strong>Título de eleitor e comprovante de quitação:</strong> Para maiores de 18 anos
        </li>
        <li>
          <strong>Certificado de reservista:</strong> Para homens entre 18 e 45 anos
        </li>
        <li>
          <strong>Certificado de proficiência em línguas:</strong> Para alguns cursos específicos
        </li>
        <li>
          <strong>Documentos de transferência:</strong> Se você vem de outra instituição
        </li>
      </ul>

      <h2>Como enviar os documentos</h2>

      <h3>Digitalização e fotografia</h3>
      <p>Dicas para garantir que seus documentos sejam aceitos:</p>
      <ul>
        <li>
          <strong>Use boa iluminação:</strong> Evite sombras e reflexos
        </li>
        <li>
          <strong>Capture o documento inteiro:</strong> Sem cortes nas bordas
        </li>
        <li>
          <strong>Foco nítido:</strong> Todos os textos devem estar legíveis
        </li>
        <li>
          <strong>Fundo contrastante:</strong> Coloque o documento sobre superfície lisa e de cor
          diferente
        </li>
        <li>
          <strong>Formato aceito:</strong> PDF, JPG ou PNG (até 5MB cada arquivo)
        </li>
        <li>
          <strong>Organize os arquivos:</strong> Nomeie claramente (ex: &quot;RG_JoaoSilva.jpg&quot;)
        </li>
      </ul>

      <h3>Canais de envio</h3>
      <p>Dependendo da faculdade, você pode enviar por:</p>
      <ul>
        <li>Portal online da instituição (upload de arquivos)</li>
        <li>E-mail específico da secretaria</li>
        <li>WhatsApp da faculdade</li>
        <li>Sistema do Bolsa Click (que encaminha para a faculdade)</li>
      </ul>
      <p>
        Nossa equipe informa exatamente qual canal usar e como proceder.
      </p>

      <h3>Envio presencial</h3>
      <p>
        Se a faculdade exigir documentos originais ou autenticados, você precisará:
      </p>
      <ul>
        <li>Levar originais e cópias até a secretaria</li>
        <li>Conferência será feita na hora</li>
        <li>Originais são devolvidos após conferência (ficam apenas as cópias)</li>
      </ul>

      <h2>Validação e análise pela faculdade</h2>
      <p>
        Após receber seus documentos, a instituição verifica:
      </p>
      <ul>
        <li>Se todos os documentos foram enviados</li>
        <li>Se estão legíveis e dentro do prazo de validade</li>
        <li>Se as informações conferem com o cadastro</li>
        <li>Se atendem aos requisitos do curso</li>
      </ul>
      <p>
        Esse processo leva de 2 a 7 dias úteis. Se houver pendências, você é avisado para
        regularizar.
      </p>

      <h2>Documentos faltando ou vencidos</h2>

      <h3>Não tenho algum documento</h3>
      <p>Soluções possíveis:</p>
      <ul>
        <li>
          <strong>RG ou CPF:</strong> Solicite segunda via nos órgãos emissores (Poupatempo, Correios,
          etc.)
        </li>
        <li>
          <strong>Histórico escolar:</strong> Solicite na escola ou secretaria de educação
        </li>
        <li>
          <strong>Certidões:</strong> Emita online no site do cartório ou Registro Civil
        </li>
        <li>
          <strong>Comprovante de residência:</strong> Peça a alguém da casa ou faça declaração de
          residência
        </li>
      </ul>

      <h3>Documento com nome desatualizado</h3>
      <p>
        Se você mudou de nome (casamento, divórcio, retificação), apresente:
      </p>
      <ul>
        <li>Certidão de casamento atualizada, ou</li>
        <li>Certidão de averbação da sentença judicial</li>
      </ul>
      <p>
        Isso evita divergências entre documentos antigos (histórico escolar) e novos (RG).
      </p>

      <h2>Autenticação de documentos</h2>
      <p>
        Algumas faculdades exigem cópias autenticadas (reconhecimento de que a cópia é fiel ao
        original). Você pode autenticar em:
      </p>
      <ul>
        <li>Cartórios (pago, valor varia por estado)</li>
        <li>Secretaria da própria faculdade (alguns casos, gratuito)</li>
        <li>Aplicativos e plataformas de autenticação digital (e-Notariado, Notarize, etc.)</li>
      </ul>
      <p>
        Verifique com a faculdade se autenticação digital é aceita antes de pagar por serviços físicos.
      </p>

      <h2>Documentos estrangeiros</h2>
      <p>
        Se você tem documentos emitidos em outros países:
      </p>
      <ul>
        <li>Precisam ser traduzidos por tradutor juramentado</li>
        <li>Podem exigir apostilamento de Haia (certificação internacional)</li>
        <li>Diplomas estrangeiros precisam de revalidação no Brasil (para pós-graduação)</li>
      </ul>
      <p>
        Entre em contato conosco se essa for sua situação. Orientamos sobre os trâmites específicos.
      </p>

      <h2>Segurança e privacidade dos documentos</h2>
      <p>
        Seus documentos são tratados com total confidencialidade:
      </p>
      <ul>
        <li>Usados exclusivamente para processo de matrícula</li>
        <li>Compartilhados apenas com a faculdade escolhida</li>
        <li>Armazenados em sistemas criptografados</li>
        <li>Conforme LGPD e boas práticas de segurança</li>
      </ul>

      <h2>Checklist de documentação</h2>
      <p>Para facilitar, use este checklist antes de enviar:</p>
      <ul>
        <li>☐ RG (frente e verso) legível</li>
        <li>☐ CPF (documento ou comprovante Receita)</li>
        <li>☐ Certidão de nascimento ou casamento</li>
        <li>☐ Comprovante de residência (máx. 3 meses)</li>
        <li>☐ Foto 3x4 recente</li>
        <li>☐ Certificado de conclusão ensino médio/superior</li>
        <li>☐ Histórico escolar</li>
        <li>☐ Título de eleitor (se maior de 18)</li>
        <li>☐ Certificado de reservista (se homem entre 18-45)</li>
        <li>☐ Outros documentos específicos do curso</li>
      </ul>

      <NextSteps
        steps={[
          {
            title: 'Como fazer matrícula',
            description: 'Veja o passo a passo completo do processo',
            href: '/central-de-ajuda/matricula-faculdade/como-fazer-matricula',
          },
          {
            title: 'Matrícula online vs presencial',
            description: 'Entenda as diferenças e facilidades de cada formato',
            href: '/central-de-ajuda/matricula-faculdade/online-presencial',
          },
          {
            title: 'Tire suas dúvidas',
            description: 'Fale com nosso suporte sobre documentação',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
        ]}
      />
    </ArticleLayout>
  )
}
