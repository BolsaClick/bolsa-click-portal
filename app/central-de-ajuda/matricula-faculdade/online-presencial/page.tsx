import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Matrícula online vs presencial | Central de Ajuda',
  description:
    'Entenda as diferenças entre matrícula online e presencial, vantagens de cada formato, segurança e como escolher a melhor opção.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/matricula-faculdade/online-presencial',
  },
}

export default function OnlinePresencialPage() {
  return (
    <ArticleLayout
      category="Matrícula e Faculdade"
      categoryHref="/central-de-ajuda/matricula-faculdade"
      title="Matrícula online vs presencial"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          A matrícula online permite fazer todo o processo pela internet (enviar documentos, assinar
          contrato digitalmente, pagar taxas), sem ir até a faculdade. A presencial exige visita à
          secretaria para entrega física de documentos e assinatura. Ambas têm a mesma validade legal,
          mas a online é mais rápida e prática.
        </p>
      </QuickAnswer>

      <h2>O que é matrícula online</h2>
      <p>
        Na matrícula 100% online, todo o processo acontece digitalmente:
      </p>
      <ul>
        <li>Você acessa o portal da faculdade ou sistema indicado</li>
        <li>Faz upload dos documentos escaneados ou fotografados</li>
        <li>Preenche formulários e cadastros online</li>
        <li>Assina o contrato de prestação de serviços educacionais digitalmente</li>
        <li>Recebe confirmação por e-mail</li>
        <li>Não precisa ir até a instituição em momento algum</li>
      </ul>

      <h2>O que é matrícula presencial</h2>
      <p>
        Na matrícula presencial, você precisa comparecer à faculdade:
      </p>
      <ul>
        <li>Agendar horário na secretaria (algumas instituições)</li>
        <li>Levar documentos originais e cópias</li>
        <li>Preencher formulários em papel ou digitalmente na hora</li>
        <li>Assinar contrato fisicamente</li>
        <li>Fazer foto para carteirinha de estudante (quando aplicável)</li>
        <li>Receber protocolo de matrícula</li>
      </ul>

      <h2>Vantagens da matrícula online</h2>
      <ul>
        <li>
          <strong>Conveniência:</strong> Faça de casa, no horário que preferir (sem filas ou
          deslocamento)
        </li>
        <li>
          <strong>Rapidez:</strong> Processo geralmente mais ágil, com validação automática de alguns
          documentos
        </li>
        <li>
          <strong>Economia:</strong> Sem gastos com transporte ou autenticação de documentos (na
          maioria dos casos)
        </li>
        <li>
          <strong>Acessibilidade:</strong> Ideal para quem mora longe da faculdade ou tem dificuldade
          de locomoção
        </li>
        <li>
          <strong>Segurança sanitária:</strong> Menos contato físico, importante em contextos de saúde
          pública
        </li>
        <li>
          <strong>Disponibilidade 24/7:</strong> Muitos portais permitem envio de documentos a
          qualquer hora
        </li>
      </ul>

      <h2>Vantagens da matrícula presencial</h2>
      <ul>
        <li>
          <strong>Contato humano:</strong> Tira dúvidas pessoalmente com a secretaria
        </li>
        <li>
          <strong>Conferência imediata:</strong> Documentos são validados na hora, evitando
          devoluções
        </li>
        <li>
          <strong>Menos problemas técnicos:</strong> Não depende de internet ou sistemas online
        </li>
        <li>
          <strong>Conhecer a estrutura:</strong> Oportunidade de visitar a faculdade, salas,
          biblioteca
        </li>
        <li>
          <strong>Suporte presencial:</strong> Funcionários ajudam a preencher formulários e
          esclarecem dúvidas complexas
        </li>
      </ul>

      <h2>Segurança da matrícula online</h2>
      <p>
        Muitas pessoas têm receio de enviar documentos pela internet. Saiba que:
      </p>
      <ul>
        <li>
          <strong>Portais das faculdades são certificados:</strong> Usam criptografia SSL/TLS (cadeado
          na barra de endereço)
        </li>
        <li>
          <strong>Assinatura digital é legalmente válida:</strong> Conforme MP 2.200-2/2001 e Lei
          14.063/2020
        </li>
        <li>
          <strong>Documentos ficam em servidores protegidos:</strong> Acessados apenas por
          funcionários autorizados
        </li>
        <li>
          <strong>Conformidade com LGPD:</strong> Instituições seguem normas de proteção de dados
        </li>
      </ul>
      <p>
        Dica: sempre verifique se o site é oficial da faculdade (URL correta) e evite enviar
        documentos por e-mails não solicitados.
      </p>

      <h2>Como funciona a assinatura digital</h2>
      <p>
        Na matrícula online, você assina o contrato eletronicamente por meio de:
      </p>
      <ul>
        <li>
          <strong>Assinatura eletrônica simples:</strong> Aceite de termos via clique, SMS ou e-mail
        </li>
        <li>
          <strong>Assinatura eletrônica avançada:</strong> Com verificação de identidade (selfie,
          código SMS)
        </li>
        <li>
          <strong>Assinatura digital qualificada:</strong> Usando certificado digital (e-CPF, token)
        </li>
      </ul>
      <p>
        A maioria das faculdades usa assinatura eletrônica avançada, que tem validade jurídica plena.
      </p>

      <h2>Qual formato sua faculdade oferece?</h2>
      <p>
        Isso depende da instituição. Após garantir a bolsa, o Bolsa Click informa:
      </p>
      <ul>
        <li>Se a faculdade aceita matrícula 100% online</li>
        <li>Se exige alguma etapa presencial (mesmo que a maioria seja online)</li>
        <li>Se é totalmente presencial</li>
      </ul>
      <p>
        Tendência atual: cada vez mais faculdades estão adotando matrícula online total, especialmente
        para cursos EAD e semipresenciais.
      </p>

      <h2>Matrícula híbrida</h2>
      <p>
        Algumas instituições adotam modelo híbrido:
      </p>
      <ul>
        <li>Documentos enviados online</li>
        <li>Assinatura de contrato online</li>
        <li>Mas foto e carteirinha feitas presencialmente no primeiro dia de aula</li>
      </ul>
      <p>
        Ou o contrário: documentos entregues presencialmente, mas acompanhamento e pagamentos feitos
        online.
      </p>

      <h2>Como escolher entre online e presencial</h2>

      <h3>Escolha online se:</h3>
      <ul>
        <li>Você mora longe da faculdade</li>
        <li>Tem agenda apertada e prefere flexibilidade</li>
        <li>Está familiarizado com tecnologia e tem boa internet</li>
        <li>Quer agilidade máxima no processo</li>
      </ul>

      <h3>Escolha presencial se:</h3>
      <ul>
        <li>Prefere atendimento cara a cara</li>
        <li>Tem dúvidas complexas que quer esclarecer pessoalmente</li>
        <li>Não se sente seguro enviando documentos online</li>
        <li>Quer conhecer a estrutura física da instituição antes de começar</li>
      </ul>

      <h3>Mas lembre-se:</h3>
      <p>
        Muitas vezes você não escolhe, mas sim a faculdade define qual formato oferece. O Bolsa Click
        te orienta sobre qual é o processo da instituição escolhida.
      </p>

      <h2>Documentos necessários são os mesmos</h2>
      <p>
        Independente do formato (online ou presencial), os documentos exigidos são os mesmos:
      </p>
      <ul>
        <li>RG, CPF, comprovante de residência</li>
        <li>Certificado e histórico escolar</li>
        <li>Foto 3x4, certidões, etc.</li>
      </ul>
      <p>
        A diferença é apenas a forma de entrega: digital ou física.
      </p>

      <h2>E se eu tiver problemas técnicos na matrícula online?</h2>
      <p>
        Caso enfrente dificuldades com o sistema online:
      </p>
      <ul>
        <li>Entre em contato com o suporte técnico da faculdade</li>
        <li>Fale com o Bolsa Click (intermediamos com a instituição)</li>
        <li>Tente usar outro navegador ou dispositivo</li>
        <li>Perifique sua conexão de internet</li>
        <li>Em último caso, a faculdade pode oferecer atendimento presencial como alternativa</li>
      </ul>

      <NextSteps
        steps={[
          {
            title: 'Documentos necessários',
            description: 'Veja lista completa e como preparar para envio',
            href: '/central-de-ajuda/matricula-faculdade/documentos',
          },
          {
            title: 'Como fazer matrícula',
            description: 'Passo a passo completo do processo',
            href: '/central-de-ajuda/matricula-faculdade/como-fazer-matricula',
          },
          {
            title: 'Quando começo a estudar',
            description: 'Saiba quando as aulas começam após matrícula',
            href: '/central-de-ajuda/matricula-faculdade/quando-comeco',
          },
        ]}
      />
    </ArticleLayout>
  )
}
