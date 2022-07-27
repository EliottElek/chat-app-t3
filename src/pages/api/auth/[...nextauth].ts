import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
// Prisma adapter for NextAuth, optional and can be removed
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { env } from "../../../server/env";
import { trpc } from "../../../utils/trpc";
import { PrismaClient } from '@prisma/client'
import { randomUUID } from "crypto";
const prisma = new PrismaClient()
export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        const user = await prisma.user.findFirst({ where: { id: token.uid } });
        if (user) session.user = user
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.uid = user.id;
      }
      return token;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [

    // ...add more providers here
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "1057630191686-9qughhtmul3hjhfr49d3dqei7ka7oajh.apps.googleusercontent.com",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "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",
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "email", placeholder: "my.email@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        // First we look for the user
        const user = await prisma.user.findFirst({ where: { email: credentials?.email } })
        if (!user) {
          return await prisma.user.create({ data: { id: randomUUID(), name: credentials?.email.split(".")[0] || "", email: credentials?.email || "", image: null } })
        }
        return user;
      }
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
};

export default NextAuth(authOptions);
function GitHubProvider(arg0: { clientId: string | undefined; clientSecret: string | undefined; }): import("next-auth/providers").Provider {
  throw new Error("Function not implemented.");
}

