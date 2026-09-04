/**
 * INTERRUPTOR ÚNICO da conta pública (login/cadastro/minha-conta) na interface.
 *
 * Contexto (medido no PostHog 160050, usuários únicos/semana, 30d): /cadastro ~9,
 * /minha-conta ~7, /login ~2, favoritou ~2. Cadastro tem 4-5x mais tráfego que
 * login — as pessoas criam conta e nunca voltam. Desde que a auth saiu do
 * checkout (d7fe0df, 27/07) a conta não entrega valor nem na ida nem na volta:
 * é ruído cognitivo no caminho da matrícula.
 *
 * ESCONDER, NÃO ARRANCAR: nada foi deletado, o Firebase/AuthContext segue de pé
 * (o login do ADMIN depende dele — ver app/admin/login/page.tsx) e voltar atrás
 * é trocar as constantes abaixo pra true.
 *
 * NÃO afeta o admin: /admin/login e AdminAuthContext têm auth própria e não
 * passam por nenhuma destas flags.
 */

/**
 * Pontos de entrada de navegação pra conta (header desktop/mobile, bottom nav,
 * CTAs de "crie sua conta"). `false` = escondidos.
 *
 * Exceção deliberada: quem JÁ está logado continua vendo o menu do usuário no
 * header (Minha conta / Sair) — sem isso a pessoa fica presa numa sessão sem
 * como sair. São ~2 logins/semana; não é ponto de entrada pra ninguém novo.
 */
export const PUBLIC_AUTH_ENTRYPOINTS_ENABLED = false

/**
 * Rotas públicas de auth (/login, /cadastro, /recuperar-senha).
 * `false` = redirecionam pro destino abaixo (ver app/(auth)/layout.tsx).
 * As pastas continuam no repo — reverter é voltar pra true.
 */
export const PUBLIC_AUTH_ROUTES_ENABLED = false

/**
 * PONTO DE CONTROLE ÚNICO do /minha-conta/* (ver app/(default)/minha-conta/layout.tsx).
 *
 * Hoje `false`: a página CONTINUA FUNCIONANDO, só saiu do menu. Redirecionar
 * /minha-conta/matriculas pra home evitaria o 404 mas não resolveria nada — a
 * pessoa continua sem ver a matrícula dela e liga pro suporte do mesmo jeito.
 * Escondendo o menu e deixando a rota viva, os ~7/semana com necessidade real
 * seguem atendidos e quem está se matriculando não vê o ruído.
 *
 * Se a decisão virar "redireciona tudo", basta `true` aqui — uma linha.
 */
export const MINHA_CONTA_REDIRECT_ENABLED = false

/** Pra onde vai quem bate numa rota de conta desligada. */
export const AUTH_REDIRECT_TARGET = '/'

/**
 * Prefixos de rota que realmente precisam do Firebase inicializado no mount
 * (sessão já pode existir; a rota precisa saber sem esperar um clique).
 * Fora daqui, o SDK só carrega sob ação explícita (entrar/cadastrar — já
 * lazy via exigirAuth() em AuthContext).
 *
 * /admin entra porque AdminLayoutContent (app/admin/layout.tsx) usa
 * `useAuth()` pra decidir, no mount, se redireciona pro login — mesmo o
 * admin tendo auth PRÓPRIA pras flags de visibilidade acima, ele reusa o
 * AuthContext/Firebase, não o AdminAuthContext, pra autenticar de fato.
 */
const AUTH_REQUIRED_ROUTE_PREFIXES = [
  '/minha-conta',
  '/favoritos',
  '/admin',
  '/login',
  '/cadastro',
  '/recuperar-senha',
] as const

/**
 * Decide se o AuthProvider deve inicializar o Firebase automaticamente ao
 * montar nesta rota (ver app/contexts/AuthContext.tsx).
 *
 * Com PUBLIC_AUTH_ENTRYPOINTS_ENABLED ligado, o header volta a precisar
 * saber em QUALQUER rota se tem sessão (pra mostrar "Minha Conta" x "Entrar")
 * — nesse caso a rota deixa de importar. Enquanto os entrypoints estiverem
 * escondidos, só as rotas acima carregam automaticamente.
 */
export function precisaCarregarAuthAutomaticamente(pathname: string | null): boolean {
  if (PUBLIC_AUTH_ENTRYPOINTS_ENABLED) return true
  if (!pathname) return false
  return AUTH_REQUIRED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}
