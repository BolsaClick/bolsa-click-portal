import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Como faço minha matrícula na faculdade? | Central de Ajuda',
  description:
    'Passo a passo completo do processo de matrícula após garantir sua bolsa, incluindo documentação, prazos e acompanhamento.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/matricula-faculdade/como-fazer-matricula',
  },
}

export default function ComoFazerMatriculaPage() {
  return (
    <ArticleLayout
      category="Matrícula e Faculdade"
      categoryHref="/central-de-ajuda/matricula-faculdade"
      title="Como faço minha matrícula na faculdade?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Após garantir a bolsa e pagar a pré-matrícula no Bolsa Click, você recebe orientações
          completas por e-mail e WhatsApp. O processo envolve enviar documentos, aguardar validação
          pela faculdade, pagar taxa de matrícula (se houver) e efetivar seu vínculo. Nossa equipe
          acompanha cada etapa até você começar a estudar.
        </p>
      </QuickAnswer>

      <h2>Passo a passo completo da matrícula</h2>

      <h3>1. Garantir a bolsa no Bolsa Click</h3>
      <p>
        Primeiro, você escolhe o curso, verifica o desconto e paga a pré-matrícula em nossa
        plataforma. Esse é o ponto de partida.
      </p>

      <h3>2. Receber orientações personalizadas</h3>
      <p>
        Logo após a confirmação do pagamento, você recebe:
      </p>
      <ul>
        <li>E-mail com instruções detalhadas</li>
        <li>Mensagem via WhatsApp de um consultor dedicado</li>
        <li>Lista de documentos necessários</li>
        <li>Prazos para cada etapa</li>
        <li>Link ou contato da faculdade para matrícula</li>
      </ul>

      <h3>3. Reunir e enviar documentos</h3>
      <p>
        Você precisará enviar documentos (detalhados em nosso artigo sobre documentação) à faculdade.
        Isso pode ser feito:
      </p>
      <ul>
        <li>Online: via portal da faculdade, e-mail ou WhatsApp</li>
        <li>Presencial: levando originais e cópias até a secretaria</li>
      </ul>
      <p>
        Nossa equipe te auxilia no processo, tira dúvidas sobre quais documentos são obrigatórios e
        como enviar corretamente.
      </p>

      <h3>4. Validação pela faculdade</h3>
      <p>
        A instituição analisa seus documentos, verifica se está tudo correto e aprova a matrícula.
        Esse processo leva de 2 a 7 dias úteis, dependendo da faculdade e época do ano.
      </p>
      <p>Se houver algum problema (documento faltando, informação incorreta), a faculdade ou o Bolsa Click entrará em contato para regularização.</p>

      <h3>5. Pagamento da taxa de matrícula (se houver)</h3>
      <p>
        Algumas faculdades cobram uma taxa de matrícula inicial (valor único, diferente da
        mensalidade). Quando aplicável:
      </p>
      <ul>
        <li>Você recebe o boleto ou link de pagamento</li>
        <li>Paga diretamente para a faculdade (não para o Bolsa Click)</li>
        <li>Essa taxa geralmente não tem desconto da bolsa</li>
      </ul>

      <h3>6. Efetivação da matrícula</h3>
      <p>
        Após validação dos documentos e pagamento (quando aplicável), a faculdade efetiva sua
        matrícula. Você recebe:
      </p>
      <ul>
        <li>Número de matrícula (RA, prontuário, código de aluno)</li>
        <li>Acesso ao portal do aluno</li>
        <li>Informações sobre início das aulas</li>
        <li>Boleto da primeira mensalidade (já com desconto aplicado)</li>
      </ul>

      <h3>7. Início das aulas</h3>
      <p>
        Pronto! Você está matriculado e pode começar a estudar conforme calendário acadêmico da
        instituição.
      </p>

      <h2>Prazos importantes</h2>
      <ul>
        <li>
          <strong>Envio de documentos:</strong> Geralmente até 7 dias após garantir a bolsa
        </li>
        <li>
          <strong>Análise pela faculdade:</strong> 2 a 7 dias úteis
        </li>
        <li>
          <strong>Pagamento de taxa de matrícula:</strong> Conforme prazo no boleto (geralmente 3 a 5
          dias)
        </li>
        <li>
          <strong>Processo completo:</strong> De 7 a 15 dias entre garantir a bolsa e estar
          matriculado
        </li>
      </ul>
      <p>
        Prazos podem variar conforme época (início de semestre tem maior volume) e particularidades
        de cada instituição.
      </p>

      <h2>Matrícula online vs presencial</h2>
      <p>
        Cada vez mais faculdades oferecem matrícula 100% online, mas algumas ainda exigem etapas
        presenciais. O Bolsa Click informa qual é o formato da instituição escolhida.
      </p>
      <p>
        Veja nosso artigo específico sobre matrícula online vs presencial para entender as diferenças
        e vantagens.
      </p>

      <h2>Acompanhamento pelo Bolsa Click</h2>
      <p>
        Durante todo o processo, nossa equipe:
      </p>
      <ul>
        <li>Monitora o andamento da sua matrícula junto à faculdade</li>
        <li>Responde dúvidas rapidamente via WhatsApp, chat ou telefone</li>
        <li>Intervém em caso de problemas ou atrasos</li>
        <li>Garante que seu desconto seja aplicado corretamente</li>
        <li>Te mantém informado sobre cada etapa</li>
      </ul>
      <p>
        Você não está sozinho nesse processo. Estamos aqui para garantir que tudo saia conforme o
        esperado.
      </p>

      <h2>O que fazer se houver problemas</h2>

      <h3>Documentos recusados ou faltando</h3>
      <p>
        Entre em contato com nosso suporte imediatamente. Ajudamos a identificar o que falta e como
        regularizar rapidamente.
      </p>

      <h3>Prazo vencido</h3>
      <p>
        Se você perdeu o prazo de envio de documentos ou pagamento, fale conosco. Muitas vezes
        conseguimos estender junto à faculdade.
      </p>

      <h3>Bolsa não aplicada corretamente</h3>
      <p>
        Se o desconto não apareceu no boleto ou valor está errado, avise imediatamente. Intermediamos
        a correção com a instituição.
      </p>

      <h3>Demora excessiva</h3>
      <p>
        Se a faculdade está demorando além do normal para analisar ou liberar a matrícula, cobramos e
        agilizamos o processo.
      </p>

      <h2>Dicas para uma matrícula sem problemas</h2>
      <ul>
        <li>
          <strong>Reúna os documentos com antecedência:</strong> Não deixe para a última hora
        </li>
        <li>
          <strong>Digitalize com qualidade:</strong> Imagens borradas podem ser recusadas
        </li>
        <li>
          <strong>Confira todas as informações:</strong> Nome, CPF, endereço devem estar corretos
        </li>
        <li>
          <strong>Responda rápido:</strong> Se a faculdade ou Bolsa Click solicitar algo, responda o
          quanto antes
        </li>
        <li>
          <strong>Guarde comprovantes:</strong> Salve todos os e-mails, boletos e confirmações
        </li>
        <li>
          <strong>Mantenha WhatsApp ativo:</strong> Muitas comunicações são feitas por lá
        </li>
      </ul>

      <h2>Matrícula em processos seletivos contínuos</h2>
      <p>
        Muitas faculdades parceiras trabalham com vestibular contínuo, ou seja, você pode se
        matricular praticamente o ano todo. Nesses casos, o processo é ainda mais rápido e você pode
        começar a estudar em poucas semanas.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Documentos necessários',
            description: 'Veja a lista completa de documentos para matrícula',
            href: '/central-de-ajuda/matricula-faculdade/documentos',
          },
          {
            title: 'Matrícula online vs presencial',
            description: 'Entenda as diferenças e qual é melhor para você',
            href: '/central-de-ajuda/matricula-faculdade/online-presencial',
          },
          {
            title: 'Quando começo a estudar?',
            description: 'Saiba quando começam as aulas após a matrícula',
            href: '/central-de-ajuda/matricula-faculdade/quando-comeco',
          },
        ]}
      />
    </ArticleLayout>
  )
}
