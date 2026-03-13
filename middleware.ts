import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // Redirect non-www → www (301 permanent)
  if (host === "bolsaclick.com.br") {
    const url = new URL(request.url);
    url.host = "www.bolsaclick.com.br";
    return NextResponse.redirect(url, 301);
  }

  // Fix: Facebook campaign URLs missing "?" before UTM params
  // e.g. /utm_source=FB&utm_campaign=... → /?utm_source=FB&utm_campaign=...
  if (pathname.startsWith("/utm_")) {
    const correctedUrl = new URL(request.url);
    const utmParams = pathname.slice(1) + (search || ""); // remove leading "/"
    correctedUrl.pathname = "/";
    correctedUrl.search = "?" + utmParams;
    return NextResponse.redirect(correctedUrl, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
};
