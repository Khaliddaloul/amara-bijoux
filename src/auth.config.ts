import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (no DB / bcrypt). Used by middleware.
 * Full providers + authorize live in `auth.ts`.
 */
export const authConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" as const, maxAge: 60 * 60 * 24 * 7 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
