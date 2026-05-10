import "next-auth";

declare module "next-auth" {
  interface User {
    role?: string | null;
    name?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      role?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null;
    name?: string | null;
  }
}
