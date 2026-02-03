import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Posso trocar de curso, turno ou faculdade? | Central de Ajuda',
  description:
    'Descubra as possibilidades de mudança de curso, turno ou instituição, impacto na bolsa e como funciona a transferência.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/matricula-faculdade/trocar-curso',
  },
}

export default function TrocarCursoPage() {
  return (
    <ArticleLayout
      category="Matrícula e Faculdade"
      categoryHref="/central-de-ajuda/matricula-faculdade"
      title="Posso trocar de curso, turno ou faculdade?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          Sim, é possível trocar de curso, turno ou faculdade, mas as regras e impactos variam.
          Mudanças dentro da mesma faculdade (transferência interna) geralmente permitem manter a
          bolsa. Transferência para outra instituição (externa) encerra a bolsa atual, mas você pode
          buscar nova bolsa pelo Bolsa Click na faculdade de destino.
        </p>
      </QuickAnswer>

      <h2>Transferência interna (mesma faculdade)</h2>

      <h3>Mudança de curso</h3>
      <p>
        Se você quer trocar de curso dentro da mesma instituição:
      </p>
      <ul>
        <li>
          <strong>Consulte a secretaria acadêmica:</strong> Cada faculdade tem regras próprias
        </li>
        <li>
          <strong>Prazo comum:</strong> Geralmente permitido após o primeiro semestre
        </li>
        <li>
          <strong>Processo:</strong> Solicitação formal, análise de viabilidade, aproveitamento de
          disciplinas
        </li>
        <li>
          <strong>Impacto na bolsa:</strong> Muitas vezes o desconto é mantido, mas precisa ser
          renegociado
        </li>
      </ul>
      <p>
        Entre em contato com o Bolsa Click antes de solicitar a mudança. Podemos intermediar com a
        faculdade para garantir manutenção ou até melhoria da bolsa.
      </p>

      <h3>Mudança de turno</h3>
      <p>
        Trocar de matutino para noturno (ou vice-versa) costuma ser mais simples:
      </p>
      <ul>
        <li>Verificar disponibilidade de vagas no turno desejado</li>
        <li>Solicitar transferência de turno na secretaria</li>
        <li>Bolsa geralmente é mantida (mesmo percentual)</li>
        <li>Pode haver pequena diferença de valor se a mensalidade do turno for diferente</li>
      </ul>
      <p>
        Atenção: nem todos os cursos são oferecidos em todos os turnos. Verifique disponibilidade
        antes.
      </p>

      <h3>Mudança de modalidade (presencial/EAD)</h3>
      <p>
        Algumas faculdades permitem migrar entre modalidades:
      </p>
      <ul>
        <li>Presencial para EAD (mais comum)</li>
        <li>EAD para presencial (menos comum, depende de vaga)</li>
        <li>Semipresencial para qualquer outra</li>
      </ul>
      <p>
        Impacto na bolsa: valores costumam ser diferentes entre modalidades. Sua bolsa pode ser
        recalculada conforme o novo valor de mensalidade, mas o percentual pode ser mantido ou
        renegociado.
      </p>

      <h2>Transferência externa (outra faculdade)</h2>

      <h3>Como funciona</h3>
      <p>
        Se você quer mudar para uma instituição completamente diferente:
      </p>
      <ol>
        <li>
          <strong>Verifique se a faculdade de destino aceita transferência:</strong> Nem todas aceitam
          ou têm vagas
        </li>
        <li>
          <strong>Solicite histórico escolar e documentos:</strong> Na faculdade atual
        </li>
        <li>
          <strong>Inscreva-se na nova instituição:</strong> Processo seletivo de transferência
        </li>
        <li>
          <strong>Análise de aproveitamento:</strong> A nova faculdade avalia quais disciplinas você
          pode aproveitar
        </li>
        <li>
          <strong>Efetue matrícula:</strong> Conforme regras da instituição de destino
        </li>
      </ol>

      <h3>Impacto na bolsa do Bolsa Click</h3>
      <p>
        A bolsa atual <strong>não é transferida automaticamente</strong>. Ela está vinculada ao curso
        e faculdade originais. Porém:
      </p>
      <ul>
        <li>
          <strong>Busque nova bolsa pelo Bolsa Click:</strong> Verifique se temos descontos na
          faculdade de destino
        </li>
        <li>
          <strong>Desconto pode ser igual, maior ou menor:</strong> Depende das parcerias disponíveis
        </li>
        <li>
          <strong>Nossa equipe te auxilia:</strong> Facilitamos o processo de garantir nova bolsa
        </li>
      </ul>

      <h2>Quando vale a pena trocar de curso</h2>
      <p>
        Considere mudar se:
      </p>
      <ul>
        <li>Você percebeu que escolheu uma área que não combina com seus interesses</li>
        <li>Descobriu uma vocação diferente durante os primeiros semestres</li>
        <li>O mercado de trabalho mudou e outra carreira faz mais sentido</li>
        <li>Está infeliz ou desmotivado com o curso atual</li>
      </ul>
      <p>
        Mas antes de decidir:
      </p>
      <ul>
        <li>Converse com veteranos e professores sobre suas dúvidas</li>
        <li>Pesquise profundamente sobre o novo curso pretendido</li>
        <li>Avalie quantas disciplinas poderá aproveitar (para não perder muito tempo)</li>
        <li>Verifique custos e disponibilidade de bolsa no novo curso</li>
      </ul>

      <h2>Quando vale a pena trocar de turno</h2>
      <p>
        Motivos comuns:
      </p>
      <ul>
        <li>Conseguiu emprego e precisa estudar em horário diferente</li>
        <li>Dificuldades de transporte no horário atual</li>
        <li>Preferência pessoal de estudo (manhã vs noite)</li>
        <li>Turma ou corpo docente do outro turno é mais interessante</li>
      </ul>
      <p>
        Mudança de turno costuma ser tranquila e sem grandes impactos.
      </p>

      <h2>Quando vale a pena trocar de faculdade</h2>
      <p>
        Avalie transferência externa se:
      </p>
      <ul>
        <li>A qualidade de ensino da faculdade atual não atende expectativas</li>
        <li>Você mudou de cidade ou região</li>
        <li>Outra instituição oferece estrutura ou corpo docente significativamente melhor</li>
        <li>Problemas graves com a administração da faculdade atual</li>
      </ul>
      <p>
        Mas lembre-se: transferência externa é mais burocrática e pode significar perder semestres.
      </p>

      <h2>Aproveitamento de disciplinas</h2>
      <p>
        Ao mudar de curso ou faculdade, você pode aproveitar matérias já cursadas:
      </p>
      <ul>
        <li>
          <strong>Disciplinas iguais ou equivalentes:</strong> Aproveitadas integralmente
        </li>
        <li>
          <strong>Disciplinas similares:</strong> Podem ser aproveitadas parcialmente
        </li>
        <li>
          <strong>Disciplinas muito diferentes:</strong> Não aproveitadas, precisa cursar novamente
        </li>
      </ul>
      <p>
        Exemplo: se você cursou 2 semestres de Administração e quer mudar para Contabilidade,
        disciplinas como Matemática Financeira, Economia e Português podem ser aproveitadas.
      </p>

      <h2>Impacto no tempo de conclusão</h2>
      <p>
        Dependendo da mudança:
      </p>
      <ul>
        <li>
          <strong>Mudança de turno:</strong> Nenhum impacto no tempo
        </li>
        <li>
          <strong>Mudança de curso na mesma área:</strong> Pode atrasar 1 semestre
        </li>
        <li>
          <strong>Mudança para área totalmente diferente:</strong> Pode significar começar do zero
        </li>
        <li>
          <strong>Transferência externa:</strong> Depende do aproveitamento de disciplinas
        </li>
      </ul>

      <h2>Como o Bolsa Click pode ajudar</h2>
      <p>
        Nossa equipe apoia você em processos de mudança:
      </p>
      <ul>
        <li>
          <strong>Orientação sobre regras:</strong> Explicamos como funciona na sua faculdade
        </li>
        <li>
          <strong>Intermediação com a instituição:</strong> Facilitamos comunicação e negociação
        </li>
        <li>
          <strong>Manutenção ou melhoria da bolsa:</strong> Buscamos manter seu desconto ou conseguir
          algo melhor
        </li>
        <li>
          <strong>Nova bolsa em caso de transferência externa:</strong> Ajudamos a garantir desconto
          na nova faculdade
        </li>
      </ul>

      <h2>Passo a passo para solicitar mudança</h2>
      <ol>
        <li>
          <strong>Fale com o Bolsa Click:</strong> Conte sua situação e intenção de mudança
        </li>
        <li>
          <strong>Verificamos viabilidade:</strong> Junto à faculdade e condições de bolsa
        </li>
        <li>
          <strong>Você solicita formalmente à instituição:</strong> Conforme orientação
        </li>
        <li>
          <strong>Aguarda análise:</strong> Faculdade avalia possibilidade e condições
        </li>
        <li>
          <strong>Renegociamos bolsa se necessário:</strong> Garantimos melhor condição possível
        </li>
        <li>
          <strong>Mudança efetivada:</strong> Você muda de curso/turno com clareza sobre valores
        </li>
      </ol>

      <h2>Dica importante</h2>
      <p>
        Sempre converse com o Bolsa Click ANTES de solicitar qualquer mudança à faculdade. Podemos te
        orientar sobre o melhor caminho e garantir que sua bolsa seja protegida ou até melhorada no
        processo.
      </p>

      <NextSteps
        steps={[
          {
            title: 'Validade da bolsa',
            description: 'Entenda quanto tempo sua bolsa permanece ativa',
            href: '/central-de-ajuda/bolsas-descontos-regras/validade-bolsa',
          },
          {
            title: 'Buscar novos cursos',
            description: 'Veja outras opções disponíveis pelo Bolsa Click',
            href: '/cursos',
          },
          {
            title: 'Fale com o suporte',
            description: 'Tire dúvidas sobre mudanças e transferências',
            href: '/central-de-ajuda/atendimento-suporte/como-falar',
          },
        ]}
      />
    </ArticleLayout>
  )
}
