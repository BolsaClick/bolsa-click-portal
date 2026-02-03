import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Como o Bolsa Click funciona? | Central de Ajuda',
  description:
    'Entenda o passo a passo de como funciona o Bolsa Click, desde a busca pela bolsa ideal até o início das aulas na faculdade.',
  robots: 'index, follow',
  alternates: {
    canonical:
      'https://www.bolsaclick.com.br/central-de-ajuda/sobre-o-bolsa-click/como-funciona',
  },
}

export default function ComoFuncionaPage() {
  return (
    <ArticleLayout
      category="Sobre o Bolsa Click"
      categoryHref="/central-de-ajuda/sobre-o-bolsa-click"
      title="Como o Bolsa Click funciona?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>
          O processo é simples: você busca cursos na nossa plataforma, escolhe a melhor opção,
          garante sua bolsa com pagamento online, recebe orientações da faculdade e finaliza a
          matrícula diretamente na instituição. Acompanhamos você em cada etapa até o início das
          aulas.
        </p>
      </QuickAnswer>

      <h2>Passo a passo completo</h2>

      <h3>1. Busque cursos na plataforma</h3>
      <p>Na página inicial do Bolsa Click, você pode:</p>
      <ul>
        <li>Pesquisar por nome do curso (exemplo: &quot;Administração&quot;, &quot;Enfermagem&quot;)</li>
        <li>Filtrar por cidade, modalidade (EAD, presencial, semipresencial) e área de interesse</li>
        <li>Comparar preços, descontos e faculdades lado a lado</li>
        <li>Ver informações detalhadas de cada curso: duração, grade curricular e diferenciais</li>
      </ul>
      <p>
        <strong>Dica:</strong> Use nossos filtros para encontrar exatamente o que você precisa.
        Quer estudar à noite? Prefere EAD? Tudo isso pode ser personalizado.
      </p>

      <h3>2. Escolha a bolsa ideal</h3>
      <p>Ao clicar em um curso, você encontra:</p>
      <ul>
        <li>
          <strong>Valor original vs. valor com desconto:</strong> Transparência total sobre
          economia
        </li>
        <li>
          <strong>Detalhes da faculdade:</strong> Reconhecimento MEC, estrutura, diferenciais
        </li>
        <li>
          <strong>Informações do curso:</strong> Duração, turnos disponíveis, formato das aulas
        </li>
        <li>
          <strong>Condições da bolsa:</strong> Percentual de desconto e validade
        </li>
      </ul>

      <h3>3. Garanta sua bolsa</h3>
      <p>Para garantir a bolsa, você precisa:</p>
      <ul>
        <li>Criar uma conta no Bolsa Click (rápido e gratuito)</li>
        <li>Preencher seus dados pessoais básicos</li>
        <li>Realizar o pagamento da pré-matrícula (valor simbólico que reserva sua vaga)</li>
        <li>Aguardar confirmação por e-mail e WhatsApp</li>
      </ul>
      <p>
        <strong>Importante:</strong> A pré-matrícula garante sua bolsa e seu lugar no curso. Esse
        valor pode ser abatido da primeira mensalidade ou devolvido em casos específicos de
        desistência.
      </p>

      <h3>4. Receba orientações da faculdade</h3>
      <p>Após garantir sua bolsa:</p>
      <ul>
        <li>A faculdade entra em contato em até 2 dias úteis</li>
        <li>Você recebe a lista de documentos necessários para matrícula</li>
        <li>Agendamos a melhor data para você finalizar o processo</li>
        <li>Nossa equipe fica disponível para esclarecer qualquer dúvida</li>
      </ul>

      <h3>5. Finalize a matrícula</h3>
      <p>A matrícula pode ser feita:</p>
      <ul>
        <li>
          <strong>Online:</strong> Envio de documentos digitalizados (RG, CPF, comprovante de
          residência, histórico escolar)
        </li>
        <li>
          <strong>Presencial:</strong> Visita à unidade da faculdade para entrega de documentos
        </li>
      </ul>
      <p>Após a matrícula, você está oficialmente matriculado com seu desconto garantido!</p>

      <h3>6. Comece a estudar</h3>
      <p>Com a matrícula finalizada:</p>
      <ul>
        <li>Você recebe login e senha para acessar o sistema da faculdade</li>
        <li>Conhece o calendário de aulas e cronograma do semestre</li>
        <li>Participa de aulas de integração (se disponível)</li>
        <li>Inicia suas aulas com desconto aplicado em todas as mensalidades</li>
      </ul>

      <h2>Quanto tempo leva todo o processo?</h2>
      <p>O tempo médio varia, mas em geral:</p>
      <ul>
        <li>
          <strong>Garantir a bolsa:</strong> Alguns minutos (pagamento online instantâneo)
        </li>
        <li>
          <strong>Contato da faculdade:</strong> Até 2 dias úteis
        </li>
        <li>
          <strong>Finalização da matrícula:</strong> 3 a 7 dias (depende da documentação)
        </li>
        <li>
          <strong>Início das aulas:</strong> Conforme calendário acadêmico da instituição
        </li>
      </ul>

      <h2>E se eu tiver dúvidas durante o processo?</h2>
      <p>Estamos sempre disponíveis! Você pode:</p>
      <ul>
        <li>Falar com nossa equipe pelo WhatsApp (resposta rápida)</li>
        <li>Enviar mensagem pelo chat do site</li>
        <li>Entrar em contato pelo formulário de atendimento</li>
        <li>Consultar esta Central de Ajuda a qualquer momento</li>
      </ul>

      <NextSteps
        steps={[
          {
            title: 'Entenda nossa confiabilidade',
            description: 'Saiba por que milhares de alunos confiam no Bolsa Click',
            href: '/central-de-ajuda/sobre-o-bolsa-click/e-confiavel',
          },
          {
            title: 'Comece sua busca agora',
            description: 'Explore cursos e encontre a bolsa perfeita para você',
            href: '/cursos',
          },
        ]}
      />
    </ArticleLayout>
  )
}
