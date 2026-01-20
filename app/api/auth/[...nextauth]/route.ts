import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: "email-login",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          return null;
        }

        const email = credentials.email as string;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return null;
        }

        try {
          // Find or create user
          let user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            // Create new user
            user = await prisma.user.create({
              data: {
                email,
                name: email.split('@')[0],
                role: 'USER',
                isBanned: false,
                lastLoginAt: new Date(),
              },
            });
          } else {
            // Update last login time
            await prisma.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() },
            });
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isBanned: user.isBanned,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }: any) {
      if (session.user && token) {
        session.user.id = token.sub || "";
        session.user.email = token.email || "";
        session.user.name = token.name || "";
        session.user.image = token.image || null;
        session.user.role = token.role || "USER";
        session.user.isBanned = token.isBanned || false;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.role = user.role;
        token.isBanned = user.isBanned;
      }
      
      if (trigger === "update" && session) {
        token.name = session.name;
        token.image = session.image;
      }

      return token;
    },
  },
  session: {
    strategy: "jwt",
  },
});

export const GET = handlers.GET;
export const POST = handlers.POST;
