import { NextRequest, NextResponse } from "next/server";

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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
};
