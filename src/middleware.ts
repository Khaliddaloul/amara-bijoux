import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { authConfig } from "@/auth.config";

/** Edge-safe auth (no Prisma/bcrypt). Session JWT is still decoded here. */
const { auth } = NextAuth(authConfig);

const intlMiddleware = createIntlMiddleware(routing);

export default auth((req) => {
  const path = req.nextUrl.pathname;

  // Skip API & next internals (matcher already excludes them, this is a safety net).
  if (
    path.startsWith("/api") ||
    path.startsWith("/_next") ||
    path.includes(".")
  ) {
    return NextResponse.next();
  }

  // Detect locale-prefixed admin path: /ar/admin/... or /en/admin/...
  const adminMatch = path.match(/^\/(ar|en)\/admin(\/(.*))?$/);
  if (adminMatch) {
    const locale = adminMatch[1];
    const sub = adminMatch[2] ?? "";
    const isLogin = sub.startsWith("/login");

    if (!isLogin && !req.auth) {
      const loginUrl = new URL(`/${locale}/admin/login`, req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Hand off to next-intl for locale routing
  return intlMiddleware(req);
});

export const config = {
  // Match all routes except api, _next, static assets, etc.
  matcher: [
    "/((?!api|_next|_vercel|sitemap.xml|robots.txt|manifest.webmanifest|feed.xml|llms.txt|llms-full.txt|ai.txt|.*\\.).*)",
  ],
};
