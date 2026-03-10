import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

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
  matcher: ["/utm_:path*"],
};
