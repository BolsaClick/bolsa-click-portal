import { NextRequest, NextResponse } from "next/server";
import { stripForbiddenGeoParams } from "@/app/lib/geo/brazil-location";
import { seoSite } from "@/app/lib/seo/site-config";

const IS_WARMUP =
  process.env.NEXT_PUBLIC_THEME === "bolsamais" &&
  process.env.NEXT_PUBLIC_SEO_INDEXING_ENABLED !== "true";

/**
 * Link headers de descoberta (RFC 8288).
 *
 * Agente que chega via HTTP e não renderiza HTML — crawler de IA, cliente de
 * MCP, script de terceiro — não vê nada do que está em `<head>`. O Link
 * header entrega as mesmas referências na resposta, antes do corpo, e já é
 * padrão registrado (os `rel` abaixo estão todos no registro da IANA:
 * `describedby`, `help`, `terms-of-service` e `privacy-policy` da RFC 8631,
 * `author` do HTML).
 *
 * Só entra aqui o que EXISTE de fato. Nada de `service-desc` ou de metadado
 * de OAuth: não há API pública com autenticação de terceiro neste site, e
 * anunciar capacidade inexistente em formato legível por máquina é pior do
 * que não anunciar nada — o agente tenta, falha, e aprende que o domínio
 * mente. `license` também fica fora: a licença CC BY cobre o llms.txt e os
 * estudos publicados, não o site inteiro, e o header é por recurso.
 */
const AGENT_DISCOVERY_LINKS = [
  `<${seoSite.siteUrl}/llms.txt>; rel="describedby"; type="text/plain"`,
  `<${seoSite.siteUrl}/central-de-ajuda>; rel="help"`,
  `<${seoSite.siteUrl}/central-de-ajuda/seguranca-dados-privacidade/termos-de-uso>; rel="terms-of-service"`,
  `<${seoSite.siteUrl}/central-de-ajuda/seguranca-dados-privacidade/politica-de-privacidade>; rel="privacy-policy"`,
  `<${seoSite.siteUrl}${seoSite.editorialTeamPath}>; rel="author"`,
].join(", ");

/**
 * Aplicado só na saída de documento do site principal (o último `return` do
 * middleware). Os domínios satélite — ingressa.digital e
 * pos.anhangueracursos.com.br — saem antes, e é o que queremos: as URLs
 * acima são do bolsaclick.com.br e não existem lá. `/api`, `/ingest` e
 * `/utm` também ficam de fora: são respostas de máquina, não de navegação,
 * e o header só somaria bytes em cada chamada de analytics.
 */
function withAgentDiscoveryLinks(
  response: NextResponse,
  pathname: string,
): NextResponse {
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/ingest") ||
    pathname.startsWith("/utm")
  ) {
    return response;
  }
  response.headers.set("Link", AGENT_DISCOVERY_LINKS);
  return response;
}

function seoResponse(response: NextResponse): NextResponse {
  if (IS_WARMUP) {
    response.headers.set("X-Robots-Tag", "noindex, follow");
  }
  return response;
}

/**
 * Constrói uma URL pública limpa para os redirects.
 *
 * Atrás de um proxy (Railway), `request.url` carrega o host e a porta INTERNOS
 * do container (ex.: `internal-host:8080`). Redirecionar com essa URL vaza
 * `:8080` pro usuário final (ex.: `https://www.bolsaclick.com.br:8080/`).
 *
 * Aqui normalizamos usando os headers de proxy: host vem de `x-forwarded-host`
 * (ou `host`), protocolo de `x-forwarded-proto`, e a porta interna é removida.
 * Só normaliza quando há `x-forwarded-proto` (i.e. atrás de proxy) — em dev
 * local `request.url` (`http://localhost:3000`) é preservado intacto.
 */
function publicRedirectUrl(request: NextRequest): URL {
  const url = new URL(request.url);
  const fwdProto = request.headers.get("x-forwarded-proto");
  if (fwdProto) {
    const fwdHost =
      request.headers.get("x-forwarded-host") || request.headers.get("host");
    url.protocol = fwdProto + ":";
    if (fwdHost) url.hostname = fwdHost.split(":")[0];
    url.port = "";
  }
  return url;
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = (request.headers.get("host") || "").split(":")[0];

  // ─── Proxy multimarca do admin, caminho da marca LOCAL ──────────────────
  // `/api/admin/brand/x` vira `/api/admin/x` por REESCRITA, sem sair do
  // processo. A marca remota não entra aqui: cai no route handler, que faz a
  // única chamada HTTP que faz sentido (bolsamais.com.br).
  //
  // Por que reescrita e não auto-chamada: a versão anterior fazia o servidor
  // buscar a si mesmo por HTTP. Medido em produção, 04/09 — a requisição
  // interna CHEGAVA (o log mostrava as duas, externa e interna, autorizadas)
  // mas a externa nunca respondia, e o edge devolvia 502 em 0,37s. Havia um
  // `unhandledRejection` de Better Auth derrubando o processo no meio.
  //
  // Não interessa qual das duas coisas é a causa raiz: uma requisição que não
  // precisa existir não pode falhar. Reescrita não abre socket, não depende de
  // saber a porta (a app escuta na 8080, não na 3000) e não duplica a passagem
  // pelo middleware.
  if (pathname.startsWith("/api/admin/brand/")) {
    const brand = request.cookies.get("bc_admin_brand")?.value;
    if (!brand || brand === "bolsaclick") {
      const url = request.nextUrl.clone();
      url.pathname = pathname.replace("/api/admin/brand/", "/api/admin/");
      return NextResponse.rewrite(url);
    }
  }

  // ─── Domínio ingressa.digital (landings de conversão / mídia paga) ───────────
  // ingressa.digital/{parceiro} → reescreve (URL limpa) pra /lp/{parceiro}.
  // /api, /_next e assets passam intactos; raiz vai pra uma landing default.
  if (host === "ingressa.digital" || host === "www.ingressa.digital") {
    const passthrough =
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/lp") ||
      // Proxy do PostHog (analytics) e do UTMify (pixel) — ver rewrites() em
      // next.config.ts. Sem isto, "/ingest/flags" (sem ponto no path) cai no
      // ramo de rewrite pra "/lp/ingest/flags" logo abaixo e nunca chega no
      // PostHog: analytics e feature flags saem 500 neste domínio.
      pathname.startsWith("/ingest") ||
      pathname.startsWith("/utm") ||
      pathname.includes(".");
    if (!passthrough) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === "/" ? "/lp/anhanguera" : `/lp${pathname}`;
      return NextResponse.rewrite(url);
    }
    return seoResponse(NextResponse.next());
  }

  // ─── Domínio pos.anhangueracursos.com.br (captação de PÓS Anhanguera) ─────
  // Site dedicado a UMA marca/nível só (Anhanguera pós) — diferente do
  // ingressa.digital (multi-parceiro, partner no 1º segmento da URL), aqui
  // TODA a árvore de path pertence ao partner fixo `anhanguera-pos`:
  // / → /lp/anhanguera-pos, /checkout → /lp/anhanguera-pos/checkout, etc.
  if (
    host === "pos.anhangueracursos.com.br" ||
    host === "www.pos.anhangueracursos.com.br"
  ) {
    const passthrough =
      pathname.startsWith("/api") ||
      pathname.startsWith("/_next") ||
      pathname.startsWith("/lp") ||
      // Mesmo motivo do bloco ingressa.digital acima: sem isto o proxy do
      // PostHog (/ingest) e do UTMify (/utm) quebra neste domínio também.
      pathname.startsWith("/ingest") ||
      pathname.startsWith("/utm") ||
      pathname.includes(".");
    if (!passthrough) {
      const url = request.nextUrl.clone();
      url.pathname =
        pathname === "/" ? "/lp/anhanguera-pos" : `/lp/anhanguera-pos${pathname}`;
      return NextResponse.rewrite(url);
    }
    return seoResponse(NextResponse.next());
  }

  // No bolsaclick.com.br, /lp/* não deve ser acessível (é do ingressa) → manda
  // pra página de marca equivalente.
  if (
    (host === "www.bolsaclick.com.br" || host === "bolsaclick.com.br") &&
    pathname.startsWith("/lp/")
  ) {
    const url = publicRedirectUrl(request);
    url.hostname = "www.bolsaclick.com.br";
    url.pathname = pathname.replace(/^\/lp\//, "/faculdades/");
    return NextResponse.redirect(url, 302);
  }

  // Redirect non-www → www (301 permanent)
  if (host === "bolsaclick.com.br") {
    const url = publicRedirectUrl(request);
    url.hostname = "www.bolsaclick.com.br";
    return NextResponse.redirect(url, 301);
  }

  // Fix: Facebook campaign URLs missing "?" before UTM params
  // e.g. /utm_source=FB&utm_campaign=... → /?utm_source=FB&utm_campaign=...
  if (pathname.startsWith("/utm_")) {
    const correctedUrl = publicRedirectUrl(request);
    const utmParams = pathname.slice(1) + (search || ""); // remove leading "/"
    correctedUrl.pathname = "/";
    correctedUrl.search = "?" + utmParams;
    return NextResponse.redirect(correctedUrl, 301);
  }

  // Sitelink Search Box: /cursos?q=... → /curso/resultado?q=...
  // O SearchAction do schema.org aponta pra /cursos?q={search_term_string}
  // (rota indexável) e redireciona pro motor de busca real.
  if (pathname === "/cursos" && request.nextUrl.searchParams.has("q")) {
    const target = publicRedirectUrl(request);
    target.pathname = "/curso/resultado";
    target.search = "";
    target.searchParams.set("q", request.nextUrl.searchParams.get("q") || "");
    return NextResponse.redirect(target, 301);
  }

  // Datacenter geo leak (Washington/DC) must never reach the search API.
  // 302 — not a 301 — so we don't freeze a stripped URL in crawler caches.
  // Pedagogia + BH without UF is left intact (not a forbidden city/UF).
  if (pathname === "/curso/resultado") {
    const clean = publicRedirectUrl(request);
    if (stripForbiddenGeoParams(clean.searchParams)) {
      return seoResponse(NextResponse.redirect(clean, 302));
    }
  }

  return withAgentDiscoveryLinks(seoResponse(NextResponse.next()), pathname);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
};
