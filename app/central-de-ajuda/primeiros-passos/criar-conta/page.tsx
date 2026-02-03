import { Metadata } from 'next'
import { ArticleLayout } from '@/app/components/help/ArticleLayout'
import { QuickAnswer } from '@/app/components/help/QuickAnswer'
import { NextSteps } from '@/app/components/help/NextSteps'

export const metadata: Metadata = {
  title: 'Como criar uma conta no Bolsa Click? | Central de Ajuda',
  description: 'Passo a passo simples e rápido para criar sua conta no Bolsa Click e começar a buscar bolsas de estudo.',
  robots: 'index, follow',
  alternates: { canonical: 'https://www.bolsaclick.com.br/central-de-ajuda/primeiros-passos/criar-conta' },
}

export default function CriarContaPage() {
  return (
    <ArticleLayout
      category="Primeiros Passos"
      categoryHref="/central-de-ajuda/primeiros-passos"
      title="Como criar uma conta no Bolsa Click?"
      lastUpdated="02 de fevereiro de 2026"
    >
      <QuickAnswer>
        <p>Criar conta é rápido e gratuito: basta acessar a página de cadastro, informar nome, e-mail, telefone e criar uma senha. Em menos de 2 minutos você está pronto para buscar e garantir bolsas de estudo.</p>
      </QuickAnswer>

      <h2>Passo a passo para criar sua conta</h2>
      <ol>
        <li><strong>Acesse a página inicial do Bolsa Click</strong></li>
        <li>Clique em &quot;Criar conta&quot; ou &quot;Cadastre-se&quot; no canto superior direito</li>
        <li>Preencha o formulário com:
          <ul>
            <li>Nome completo</li>
            <li>E-mail válido (você receberá confirmações neste endereço)</li>
            <li>Telefone com DDD (para contato via WhatsApp)</li>
            <li>Senha segura (mínimo 6 caracteres)</li>
          </ul>
        </li>
        <li>Aceite os Termos de Uso e Política de Privacidade</li>
        <li>Clique em &quot;Cadastrar&quot; ou &quot;Criar conta&quot;</li>
      </ol>

      <h2>Por que preciso criar uma conta?</h2>
      <p>A conta no Bolsa Click permite:</p>
      <ul>
        <li><strong>Salvar cursos favoritos:</strong> Marque opções interessantes e compare depois</li>
        <li><strong>Acompanhar solicitações:</strong> Veja o status da sua pré-matrícula em tempo real</li>
        <li><strong>Receber alertas personalizados:</strong> Notificações de novos descontos e vagas</li>
        <li><strong>Garantir bolsas com agilidade:</strong> Dados já preenchidos na hora de fechar negócio</li>
        <li><strong>Histórico completo:</strong> Acesse informações de bolsas garantidas anteriormente</li>
      </ul>

      <h2>É seguro criar uma conta?</h2>
      <p>Sim! Seus dados são protegidos por:</p>
      <ul>
        <li>Criptografia SSL em todas as transações</li>
        <li>Conformidade total com a LGPD</li>
        <li>Uso exclusivo para intermediar sua matrícula com faculdades</li>
        <li>Possibilidade de excluir dados a qualquer momento</li>
      </ul>

      <h2>Posso buscar bolsas sem criar conta?</h2>
      <p>Sim, você pode navegar e pesquisar cursos livremente. Porém, para <strong>garantir uma bolsa</strong>, será necessário ter uma conta criada.</p>

      <h2>Esqueci minha senha, e agora?</h2>
      <ol>
        <li>Na página de login, clique em &quot;Esqueci minha senha&quot;</li>
        <li>Digite o e-mail cadastrado</li>
        <li>Receba um link de recuperação no e-mail</li>
        <li>Crie uma nova senha</li>
      </ol>

      <h2>Posso alterar meus dados depois?</h2>
      <p>Sim! Acesse &quot;Minha Conta&quot; ou &quot;Perfil&quot; e edite:</p>
      <ul>
        <li>Nome</li>
        <li>E-mail (será necessário confirmar o novo endereço)</li>
        <li>Telefone</li>
        <li>Senha</li>
      </ul>

      <NextSteps
        steps={[
          { title: 'Encontre sua bolsa ideal', description: 'Use filtros inteligentes para buscar o curso perfeito', href: '/central-de-ajuda/primeiros-passos/encontrar-bolsa' },
          { title: 'Comece a buscar agora', description: 'Explore milhares de cursos disponíveis', href: '/cursos' },
        ]}
      />
    </ArticleLayout>
  )
}
