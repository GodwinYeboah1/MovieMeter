import type { NextAuthConfig } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/db/prisma";

export const authOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/login/verify-email",
  },
  callbacks: {
    async session({ session, token }: any) {
      if (session.user && token) {
        session.user.id = token.sub || "";
        session.user.role = token.role || "USER";
        session.user.isBanned = token.isBanned || false;
      }
      return session;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isBanned = user.isBanned;
      }
      return token;
    },
    async signIn({ user }: any) {
      // Update last login time
      if (user?.email) {
        await prisma.user.update({
          where: { email: user.email },
          data: { lastLoginAt: new Date() },
        }).catch(() => {
          // User might not exist yet, ignore error
        });
      }
      return true;
    },
  },
  session: {
    strategy: "jwt" as const,
  },
};
